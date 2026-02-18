import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/Admin"
import User from "@/models/User"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const gender = searchParams.get("gender")

    const query = {}
    if (gender) query.gender = gender

    await connectDB()
    const admins = await Admin.find(query).sort({ createdAt: -1 })
    return NextResponse.json(admins, { status: 200 })
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()

    const rawEmail = (body?.email || "").trim()
    const email = rawEmail.toLowerCase()
    const { name } = body || {}

    if (!email || !name) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    await connectDB()

    body.email = email

    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.role !== "admin") {
      return NextResponse.json({ message: "Email already registered with another role" }, { status: 400 })
    }

    const admin = await Admin.create(body)

    await User.updateOne(
      { email },
      { $setOnInsert: { username: email }, $set: { name, role: "admin", email } },
      { upsert: true }
    )

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error("Error creating admin:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
