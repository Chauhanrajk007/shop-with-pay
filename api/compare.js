export default async function handler(req, res) {
  try {
    const { products } = req.body

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ error: "At least 2 products required for comparison" })
    }

    const cleanProducts = products.map(p => ({
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      reviews: p.reviews,
    }))

    const llmRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful product comparison assistant for ShopWithPay (an Indian e-commerce store).
Compare these products for a buyer. All prices are in ₹ (INR).

Products:
${JSON.stringify(cleanProducts, null, 2)}

Return ONLY valid JSON (no markdown, no backticks):
{
  "features": ["Price", "Category", "Brand", "Rating", "Best For", "Key Strength", "Value for Money"],
  "comparison": {
    "Price": { "<ProductName1>": "₹value", "<ProductName2>": "₹value" },
    "Category": { "<ProductName1>": "value", "<ProductName2>": "value" },
    "Brand": { "<ProductName1>": "value", "<ProductName2>": "value" },
    "Rating": { "<ProductName1>": "4.5/5", "<ProductName2>": "4.2/5" },
    "Best For": { "<ProductName1>": "...", "<ProductName2>": "..." },
    "Key Strength": { "<ProductName1>": "...", "<ProductName2>": "..." },
    "Value for Money": { "<ProductName1>": "Excellent/Good/Fair", "<ProductName2>": "Excellent/Good/Fair" }
  },
  "verdict": "2-3 sentence recommendation on which product to buy and why"
}

Use the actual product names as keys. Include every feature listed above.`,
            }],
          }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    )

    const llmData = await llmRes.json()
    let text = llmData.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    text = text.replace(/```json|```/g, "").trim()

    let comparison = null

    try {
      comparison = JSON.parse(text)
    } catch {
      // Fallback: build table from raw data
      const features = ["Price", "Category", "Brand", "Rating", "Description"]
      const comp = {}
      features.forEach(feature => {
        comp[feature] = {}
        cleanProducts.forEach(p => {
          if (feature === "Price") comp[feature][p.name] = `₹${p.price?.toLocaleString("en-IN")}`
          else if (feature === "Category") comp[feature][p.name] = p.category
          else if (feature === "Brand") comp[feature][p.name] = p.brand
          else if (feature === "Rating") comp[feature][p.name] = `${p.rating}/5`
          else if (feature === "Description") comp[feature][p.name] = p.description?.slice(0, 80) + "..."
        })
      })
      comparison = {
        features,
        comparison: comp,
        verdict: "All selected products are solid choices. Consider your budget and specific use case when deciding.",
      }
    }

    res.json(comparison)
  } catch (err) {
    console.error("compare.js error:", err)
    res.status(500).json({ error: err.message })
  }
}
