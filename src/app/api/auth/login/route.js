import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ username }).lean()
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    if (!["admin", "teacher", "student"].includes(user.role)) {
      return NextResponse.json({ message: "Unauthorized role" }, { status: 403 })
    }

    const safeUser = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }

    return NextResponse.json({ user: safeUser }, { status: 200 })
  } catch (error) {
    console.error("Login API error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
