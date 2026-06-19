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
      reviews: p.reviews
    }))

    const llmRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Compare these products for a buyer. Create a detailed comparison.

Products:
${JSON.stringify(cleanProducts, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "features": ["Price", "Category", "Brand", "Rating", "Best For", "Pros", "Cons", "Value for Money"],
  "comparison": {
    "Price": { "ProductName1": "₹value", "ProductName2": "₹value" },
    "Category": { "ProductName1": "value", "ProductName2": "value" },
    ... (for each feature)
  },
  "verdict": "2-3 sentence recommendation on which to buy and why"
}

Use actual product names as keys. Include all features listed. Prices in ₹ (INR).`
            }]
          }]
        })
      }
    )

    const llmData = await llmRes.json()
    let text = llmData.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    text = text.replace(/```json|```/g, "").trim()

    let comparison = null

    try {
      comparison = JSON.parse(text)
    } catch {
      const features = ["Price", "Category", "Brand", "Rating", "Description"]
      const comp = {}

      features.forEach(feature => {
        comp[feature] = {}
        cleanProducts.forEach(p => {
          const key = p.name
          if (feature === "Price") comp[feature][key] = `₹${p.price}`
          else if (feature === "Category") comp[feature][key] = p.category
          else if (feature === "Brand") comp[feature][key] = p.brand
          else if (feature === "Rating") comp[feature][key] = `${p.rating}/5`
          else if (feature === "Description") comp[feature][key] = p.description
        })
      })

      comparison = {
        features,
        comparison: comp,
        verdict: "All products are great choices. Consider your specific needs and budget when making a decision."
      }
    }

    res.json(comparison)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
