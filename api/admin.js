import { getDB } from "./_db.js"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

function verifyToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer ")) return null
  try {
    return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// Uses text-embedding-004 — works with Gemini API key (no Cloud Console setup needed)
async function generateEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text }] },
      }),
    }
  )
  const data = await response.json()
  if (!data.embedding || !data.embedding.values) {
    console.error("Embedding error:", JSON.stringify(data))
    throw new Error("Embedding generation failed: " + (data.error?.message || "Unknown"))
  }
  return data.embedding.values
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)
    if (!user) return res.status(401).json({ error: "Unauthorized" })

    const db = await getDB()
    const action = req.query.action

    if (action === "list") {
      const products = await db
        .collection("products")
        .find({}, { projection: { embedding: 0 } })
        .toArray()
      return res.json(products)
    }

    if (action === "add") {
      const { name, description, category, brand, price, image } = req.body
      if (!name || !description || !price) {
        return res.json({ error: "Name, description and price are required" })
      }
      let embedding = []
      try {
        embedding = await generateEmbedding(name + " " + description)
      } catch (e) {
        console.warn("Embedding skipped:", e.message)
      }
      const result = await db.collection("products").insertOne({
        name,
        description,
        category: category || "general",
        brand: brand || "Generic",
        price: Number(price),
        image: image || "",
        rating: 4.5,
        reviews: 0,
        embedding,
        createdAt: new Date(),
      })
      return res.json({ success: true, id: result.insertedId })
    }

    if (action === "update") {
      const { id, name, description, category, brand, price, image } = req.body
      if (!id) return res.json({ error: "Product ID required" })
      const updates = {}
      if (name) updates.name = name
      if (description) updates.description = description
      if (category) updates.category = category
      if (brand) updates.brand = brand
      if (price) updates.price = Number(price)
      if (image) updates.image = image

      if (name || description) {
        try {
          const product = await db.collection("products").findOne({ _id: new ObjectId(id) })
          const embText = (name || product?.name || "") + " " + (description || product?.description || "")
          updates.embedding = await generateEmbedding(embText)
        } catch (e) {
          console.warn("Embedding update skipped:", e.message)
        }
      }
      await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updates })
      return res.json({ success: true })
    }

    if (action === "delete") {
      const { id } = req.body
      if (!id) return res.json({ error: "Product ID required" })
      await db.collection("products").deleteOne({ _id: new ObjectId(id) })
      return res.json({ success: true })
    }

    res.json({ error: "Invalid action" })
  } catch (err) {
    console.error("admin.js error:", err)
    res.status(500).json({ error: err.message })
  }
}
