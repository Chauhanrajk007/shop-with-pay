import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

let client

async function getDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
  }
  return client.db("ragDB")
}

function verifyToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer ")) return null
  try {
    return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
}

async function generateEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text }] } })
    }
  )
  const data = await response.json()
  if (!data.embedding || !data.embedding.values) {
    throw new Error("Embedding generation failed")
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
      const products = await db.collection("products")
        .find({}, { projection: { embedding: 0 } })
        .toArray()
      return res.json(products)
    }

    if (action === "add") {
      const { name, description, category, brand, price, image } = req.body
      if (!name || !description || !price) {
        return res.json({ error: "Name, description and price are required" })
      }
      const embedding = await generateEmbedding(name + " " + description)
      const result = await db.collection("products").insertOne({
        name,
        description,
        category: category || "general",
        brand: brand || "Generic",
        price: Number(price),
        image: image || "",
        rating: 4.5,
        reviews: 0,
        embedding
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
        const product = await db.collection("products").findOne({ _id: new ObjectId(id) })
        const embText = (name || product.name) + " " + (description || product.description)
        updates.embedding = await generateEmbedding(embText)
      }

      await db.collection("products").updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      )
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
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
