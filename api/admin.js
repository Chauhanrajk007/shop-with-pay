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

// Admin API — no embeddings, just CRUD for products
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
      const result = await db.collection("products").insertOne({
        name,
        description,
        category: category || "general",
        brand: brand || "Generic",
        price: Number(price),
        image: image || "",
        rating: 4.5,
        reviews: 0,
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
