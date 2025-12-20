import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Student from "@/models/Student"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")

    const query = {}
    if (classFilter) {
      query.class = classFilter
    }

    await connectDB()
    const students = await Student.find(query).sort({ createdAt: -1 })
    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    console.error("Error fetching students:", error)
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
    const student = await Student.create(body)
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
