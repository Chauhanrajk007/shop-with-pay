import { getDB } from "./_db.js"

// Correct Gemini API model names (June 2025):
// Embedding: text-embedding-004
// LLM:       gemini-1.5-flash  (gemini-2.0-flash also works if available in your region)

async function getEmbedding(query) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: query }] },
      }),
    }
  )
  const data = await res.json()
  if (!data.embedding?.values) {
    const msg = data.error?.message || "Unknown embedding error"
    console.error("Embedding failed:", msg, JSON.stringify(data))
    throw new Error("Embedding failed: " + msg)
  }
  return data.embedding.values
}

async function getLLMReasoning(query, candidates) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful shopping assistant for ShopWithPay.

User query: "${query}"

Below are products from our store. Select ONLY the most relevant ones (max 6).
For EACH selected product, add a "reason" field (1-2 sentences) explaining why it matches the query.
Also provide a brief "reasoning" summary (2-3 sentences) of your overall recommendations.

Products:
${JSON.stringify(candidates.map(p => ({ name: p.name, description: p.description, category: p.category, brand: p.brand, price: p.price })))}

Return ONLY valid JSON — no markdown:
{
  "products": [...selected products with reason field added...],
  "reasoning": "Overall summary..."
}`,
          }],
        }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  )
  const data = await res.json()
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
  text = text.replace(/```json|```/g, "").trim()
  return JSON.parse(text)
}

export default async function handler(req, res) {
  try {
    let body = req.body
    if (typeof body === "string") body = JSON.parse(body)

    const query = body?.query
    if (!query) return res.status(400).json({ error: "Query is missing" })

    /* STEP 1 — Get embedding for the user query */
    let queryVector
    try {
      queryVector = await getEmbedding(query)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }

    /* STEP 2 — Vector search in MongoDB Atlas */
    const db = await getDB()
    let candidates = []
    try {
      candidates = await db.collection("products").aggregate([
        {
          $vectorSearch: {
            index: "product_vector",
            path: "embedding",
            queryVector,
            numCandidates: 200,
            limit: 15,
          },
        },
        { $project: { embedding: 0 } },
      ]).toArray()
    } catch (e) {
      // Vector search index may not exist yet — fall back to text search
      console.warn("Vector search failed, falling back to text search:", e.message)
      candidates = await db.collection("products")
        .find(
          { $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
          ]},
          { projection: { embedding: 0 } }
        )
        .limit(15)
        .toArray()
    }

    if (candidates.length === 0) {
      return res.json({ query, products: [], reasoning: "No products found matching your query. Try different keywords!" })
    }

    /* STEP 3 — Gemini LLM to filter + add reasoning */
    let result = { products: [], reasoning: "" }
    try {
      result = await getLLMReasoning(query, candidates)
    } catch (e) {
      console.warn("LLM reasoning failed, using raw candidates:", e.message)
      result = {
        products: candidates.slice(0, 6).map(p => ({ ...p, reason: "This product matches your search." })),
        reasoning: "Here are the most relevant products from our catalog.",
      }
    }

    if (!Array.isArray(result.products) || result.products.length === 0) {
      result.products = candidates.slice(0, 6).map(p => ({ ...p, reason: "Highly relevant to your query." }))
      result.reasoning = result.reasoning || "Here are the top matching products."
    }

    // Merge back full product data (price, image, _id) from candidates
    const candidateMap = Object.fromEntries(candidates.map(p => [p.name, p]))
    result.products = result.products.map(p => ({
      ...(candidateMap[p.name] || {}),
      ...p,
    }))

    res.json({ query, products: result.products, reasoning: result.reasoning })
  } catch (err) {
    console.error("rag-search.js error:", err)
    res.status(500).json({ error: err.message })
  }
}