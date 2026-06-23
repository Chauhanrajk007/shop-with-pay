import { getDB } from "./_db.js"

// RAG Search — Vector Search with text fallback + Gemini LLM reasoning

async function getEmbedding(query) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: query }] },
      }),
    }
  )
  const data = await res.json()
  if (!data.embedding?.values) {
    throw new Error(data.error?.message || "Embedding failed")
  }
  return data.embedding.values
}

async function textSearch(db, query) {
  const words = query.toLowerCase().replace(/[₹<>]/g, "").split(/\s+/).filter(w => w.length > 2)
  const orClauses = words.flatMap(w => [
    { name: { $regex: w, $options: "i" } },
    { description: { $regex: w, $options: "i" } },
    { category: { $regex: w, $options: "i" } },
    { brand: { $regex: w, $options: "i" } },
  ])
  orClauses.push({ name: { $regex: query, $options: "i" } })
  orClauses.push({ description: { $regex: query, $options: "i" } })

  return db.collection("products")
    .find({ $or: orClauses }, { projection: { embedding: 0 } })
    .limit(15)
    .toArray()
}

async function askGemini(query, candidates) {
  if (!process.env.GEMINI_API_KEY) return null

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a shopping assistant for LuxCart (Indian e-commerce).
User query: "${query}"
Products: ${JSON.stringify(candidates.slice(0, 12).map(p => ({ name: p.name, description: p.description, category: p.category, brand: p.brand, price: p.price })))}
Pick up to 6 best matches. For each add a "reason" field (1 sentence). Also write a "reasoning" summary.
Return ONLY valid JSON: {"products": [...with reason...], "reasoning": "..."}`,
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
  try { return JSON.parse(text) } catch { return null }
}

export default async function handler(req, res) {
  try {
    let body = req.body
    if (typeof body === "string") body = JSON.parse(body)
    const query = body?.query
    if (!query) return res.status(400).json({ error: "Query is required" })

    const db = await getDB()
    let candidates = []

    // Try vector search first
    try {
      const queryVector = await getEmbedding(query)
      candidates = await db.collection("products").aggregate([
        {
          $vectorSearch: {
            index: "product_vector",
            path: "embedding",
            queryVector,
            numCandidates: 100,
            limit: 15,
          },
        },
        { $project: { embedding: 0 } },
      ]).toArray()
    } catch (e) {
      console.warn("Vector search failed, falling back to text:", e.message)
    }

    // Fallback to text search
    if (candidates.length === 0) {
      candidates = await textSearch(db, query)
    }

    if (candidates.length === 0) {
      return res.json({ query, products: [], reasoning: "No products found. Try different keywords!" })
    }

    // Ask Gemini to rank + reason
    let result = null
    try { result = await askGemini(query, candidates) } catch (e) { console.warn("LLM failed:", e.message) }

    if (!result || !Array.isArray(result.products) || result.products.length === 0) {
      return res.json({
        query,
        products: candidates.slice(0, 6).map(p => ({ ...p, reason: "Matches your search." })),
        reasoning: `Found ${candidates.length} products matching your query.`,
      })
    }

    // Merge full data back
    const map = Object.fromEntries(candidates.map(p => [p.name, p]))
    result.products = result.products.map(p => ({ ...(map[p.name] || {}), ...p }))
    return res.json({ query, products: result.products, reasoning: result.reasoning })
  } catch (err) {
    console.error("rag-search error:", err)
    res.status(500).json({ error: err.message })
  }
}
