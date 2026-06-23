import { getDB } from "./_db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export default async function handler(req, res) {
  try {
    const db = await getDB()
    const action = req.query.action

    if (action === "signup") {
      const { name, email, password } = req.body
      if (!name || !email || !password) return res.json({ error: "Missing fields" })
      const existing = await db.collection("users").findOne({ email })
      if (existing) return res.json({ error: "User already exists" })
      const hash = await bcrypt.hash(password, 10)
      const result = await db.collection("users").insertOne({ name, email, password: hash, createdAt: new Date() })
      const token = jwt.sign({ userId: result.insertedId.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" })
      return res.json({ token, name })
    }

    if (action === "login") {
      const { email, password } = req.body
      if (!email || !password) return res.json({ error: "Missing fields" })
      const user = await db.collection("users").findOne({ email })
      if (!user) return res.json({ error: "User not found" })
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) return res.json({ error: "Wrong password" })
      const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" })
      return res.json({ token, name: user.name })
    }

    if (action === "products") {
      const productList = await db
        .collection("products")
        .find({}, { projection: { embedding: 0 } })
        .toArray()
      return res.json(productList)
    }

    res.json({ error: "Invalid action" })
  } catch (err) {
    console.error("server.js error:", err)
    res.status(500).json({ error: err.message })
  }
}
