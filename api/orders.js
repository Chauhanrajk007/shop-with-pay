import { getDB } from "./_db.js"
import jwt from "jsonwebtoken"

function verifyToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith("Bearer ")) return null
  try {
    return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  try {
    const user = verifyToken(req)
    if (!user) return res.status(401).json({ error: "Unauthorized" })

    const db = await getDB()
    const action = req.query.action

    if (action === "create") {
      const { items, amount, razorpayOrderId, razorpayPaymentId } = req.body
      const order = await db.collection("orders").insertOne({
        userId: user.userId,
        items,
        amount,
        razorpayOrderId,
        razorpayPaymentId,
        status: "completed",
        createdAt: new Date(),
      })
      return res.json({ success: true, orderId: order.insertedId })
    }

    if (action === "list") {
      const orders = await db
        .collection("orders")
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray()
      return res.json(orders)
    }

    res.json({ error: "Invalid action" })
  } catch (err) {
    console.error("orders.js error:", err)
    res.status(500).json({ error: err.message })
  }
}
