// Shared MongoDB connection — works correctly in Vercel serverless
// Uses a cached global client so each warm invocation reuses the connection
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
  w: "majority",
}

// Global is used here to maintain a cached connection across hot reloads in dev
// and across warm invocations in Vercel serverless
let cached = global._mongoClientPromise

if (!cached) {
  if (!uri) throw new Error("Missing MONGODB_URI environment variable")
  const client = new MongoClient(uri, options)
  cached = global._mongoClientPromise = client.connect()
}

export async function getDB(dbName = "ragDB") {
  const client = await cached
  return client.db(dbName)
}
