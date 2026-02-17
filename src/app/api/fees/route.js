import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Fee from "@/models/Fee"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")

    const query = {}
    if (studentId) query.studentId = studentId
    if (status) query.status = status

    await connectDB()
    const fees = await Fee.find(query).sort({ dueDate: 1 })
    return NextResponse.json(fees, { status: 200 })
  } catch (error) {
    console.error("Error fetching fees:", error)
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
    await connectDB()

    const { studentId, studentEmail, type, amount, dueDate } = body || {}
    if (!studentId || !studentEmail || !type || !amount || !dueDate) {
      return NextResponse.json({ message: "Missing required fee fields" }, { status: 400 })
    }

    const created = await Fee.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating fee:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

