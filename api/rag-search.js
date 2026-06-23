import { getDB } from "./_db.js"

// AI search using ONLY Gemini chat + MongoDB text search
// NO embeddings needed â€” works with any Gemini API key

async function textSearch(db, query) {
  // Smart keyword extraction â€” search across name, description, category, brand
  const words = query.toLowerCase().replace(/[â‚¹<>]/g, "").split(/\s+/).filter(w => w.length > 2)
  const orClauses = words.flatMap(w => [
    { name: { $regex: w, $options: "i" } },
    { description: { $regex: w, $options: "i" } },
    { category: { $regex: w, $options: "i" } },
    { brand: { $regex: w, $options: "i" } },
  ])

  // Also try the full query as a phrase
  orClauses.push({ name: { $regex: query, $options: "i" } })
  orClauses.push({ description: { $regex: query, $options: "i" } })

  const results = await db.collection("products")
    .find({ $or: orClauses }, { projection: { embedding: 0 } })
    .limit(20)
    .toArray()

  return results
}

async function askGemini(query, candidates) {
  if (!process.env.GEMINI_API_KEY) return null

  const productList = candidates.slice(0, 12).map(p => ({
    name: p.name,
    description: p.description,
    category: p.category,
    brand: p.brand,
    price: p.price,
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful shopping assistant for LuxCart, an Indian e-commerce store.

User query: "${query}"

Products available:
${JSON.stringify(productList)}

Pick the best matching products (up to 6). For each, add a "reason" field (one sentence) explaining why it matches.
Also write a short "reasoning" summary (1-2 sentences).

Return ONLY valid JSON, no markdown:
{"products": [...with reason field...], "reasoning": "..."}`,
          }],
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    }
  )

  if (!res.ok) return null
  const data = await res.json()
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
  text = text.replace(/```json|```/g, "").trim()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  try {
    let body = req.body
    if (typeof body === "string") body = JSON.parse(body)

    const query = body?.query
    if (!query) return res.status(400).json({ error: "Query is required" })

    const db = await getDB()

    // Step 1: Text search in MongoDB
    const candidates = await textSearch(db, query)

    if (candidates.length === 0) {
      return res.json({
        query,
        products: [],
        reasoning: "No products found for your query. Try different keywords!",
      })
    }

    // Step 2: Ask Gemini to pick best matches + add reasoning
    let result = null
    try {
      result = await askGemini(query, candidates)
    } catch (e) {
      console.warn("Gemini failed, using raw results:", e.message)
    }

    if (!result || !Array.isArray(result.products) || result.products.length === 0) {
      // Fallback: just return top candidates without AI reasoning
      const candidateMap = Object.fromEntries(candidates.map(p => [p.name, p]))
      return res.json({
        query,
        products: candidates.slice(0, 6).map(p => ({ ...p, reason: "Matches your search." })),
        reasoning: `Found ${candidates.length} products matching your query.`,
      })
    }

    // Merge full product data (image, _id, price) back
    const candidateMap = Object.fromEntries(candidates.map(p => [p.name, p]))
    result.products = result.products.map(p => ({
      ...(candidateMap[p.name] || {}),
      ...p,
    }))

    return res.json({ query, products: result.products, reasoning: result.reasoning })
  } catch (err) {
    console.error("rag-search error:", err)
    res.status(500).json({ error: err.message })
  }
}

