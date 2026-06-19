import { MongoClient } from "mongodb"

export default async function handler(req, res) {
  try {
    let body = req.body
    if (typeof body === "string") body = JSON.parse(body)

    const query = body?.query
    if (!query) return res.status(400).json({ error: "Query missing" })

    /* STEP 1 — EMBEDDING */
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text: query }] } })
      }
    )

    const embedData = await embedRes.json()
    if (!embedData.embedding) return res.status(500).json({ error: "Embedding failed" })

    const queryVector = embedData.embedding.values

    /* STEP 2 — CONNECT DATABASE */
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db("ragDB")

    /* STEP 3 — VECTOR SEARCH */
    const candidates = await db.collection("products").aggregate([
      {
        $vectorSearch: {
          index: "product_vector",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 200,
          limit: 15
        }
      },
      {
        $project: { embedding: 0 }
      }
    ]).toArray()

    if (candidates.length === 0) {
      return res.json({ query, products: [], reasoning: "No products found matching your query." })
    }

    /* STEP 4 — GEMINI FILTERING + REASONING */
    const llmRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `User query: "${query}"

Below is a list of products from our store.
Select ONLY products relevant to the query.
For EACH selected product, add a field called "reason" explaining in 1-2 sentences why this product matches the user's query.
Also provide an overall "reasoning" summary (2-3 sentences) of your recommendations.

Products:
${JSON.stringify(candidates)}

Return ONLY valid JSON in this exact format:
{
  "products": [...products with reason field added...],
  "reasoning": "Overall summary..."
}`
            }]
          }]
        })
      }
    )

    const llmData = await llmRes.json()
    let text = llmData.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    text = text.replace(/```json|```/g, "").trim()

    let result = { products: [], reasoning: "" }

    try {
      result = JSON.parse(text)
    } catch {
      result = {
        products: candidates.slice(0, 5).map(p => ({
          ...p,
          reason: "This product matches your search criteria."
        })),
        reasoning: "Here are the most relevant products from our catalog."
      }
    }

    if (!Array.isArray(result.products) || result.products.length === 0) {
      result.products = candidates.slice(0, 5).map(p => ({
        ...p,
        reason: "This product matches your search criteria."
      }))
      result.reasoning = result.reasoning || "Here are the most relevant products from our catalog."
    }

    res.json({ query, products: result.products, reasoning: result.reasoning })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}