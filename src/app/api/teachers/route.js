import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Teacher from "@/models/Teacher"
import User from "@/models/User"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const emailParam = searchParams.get("email")
    const email = emailParam ? emailParam.toLowerCase() : null
    const q = searchParams.get("q")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    const query = {}
    if (email) query.email = email
    if (q) {
      const regex = new RegExp(q, "i")
      query.$or = [
        { name: regex },
        { email: regex },
        { subject: regex },
      ]
    }

    const page = pageParam ? parseInt(pageParam, 10) : null
    const limit = limitParam ? parseInt(limitParam, 10) : null
    const usePagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0

    await connectDB()

    if (usePagination) {
      const [teachers, total] = await Promise.all([
        Teacher.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Teacher.countDocuments(query),
      ])

      const totalPages = total > 0 ? Math.ceil(total / limit) : 1

      return NextResponse.json(
        {
          data: teachers,
          total,
          page,
          limit,
          totalPages,
        },
        { status: 200 }
      )
    }

    const teachers = await Teacher.find(query).sort({ createdAt: -1 })
    return NextResponse.json(teachers, { status: 200 })
  } catch (error) {
    console.error("Error fetching teachers:", error)
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

    await connectDB()
    const body = await request.json()

    const rawEmail = (body?.email || "").trim()
    const email = rawEmail.toLowerCase()
    const { name } = body || {}

    if (!email || !name) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    body.email = email

    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.role !== "teacher") {
      return NextResponse.json({ message: "Email already registered with another role" }, { status: 400 })
    }

    const teacher = await Teacher.create(body)

    await User.updateOne(
      { email },
      { $setOnInsert: { username: email }, $set: { name, role: "teacher", email } },
      { upsert: true }
    )

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error("Error creating teacher:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
