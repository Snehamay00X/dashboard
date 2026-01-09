import mongoose from "mongoose"

if (!process.env.MONGODB_URI) {
    throw new Error("Please provide MONGODB_URI in the environment variables")
}

/// if connection exists return it
let cached = global.mongoose

/// if connection doesn't exist
if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    }
}
// connection function
export async function dbConnect() {

    if (cached.conn) {
        return cached.conn
    }
    if (!cached.promise) {
        const opts = {
            maxPoolSize: 10,
        }
        cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts)
            .then(() => {
                return mongoose.connection
            })
    }
    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        throw new Error("Failed to connect to MongoDB", { cause: error })
    }
    return cached.conn
}