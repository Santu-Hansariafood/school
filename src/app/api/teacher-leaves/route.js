import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import TeacherLeave from "@/models/TeacherLeave"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")

    const query = {}
    if (teacherId) query.teacherId = teacherId

    await connectDB()
    const leaves = await TeacherLeave.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json(leaves, { status: 200 })
  } catch (error) {
    console.error("Error fetching teacher leaves:", error)
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
    const { teacherId, fromDate, toDate, reason } = body || {}

    if (!teacherId || !fromDate || !toDate) {
      return NextResponse.json({ message: "teacherId, fromDate and toDate are required" }, { status: 400 })
    }

    const leave = await TeacherLeave.create({
      teacherId,
      fromDate,
      toDate,
      reason: reason || "",
    })

    return NextResponse.json(leave, { status: 201 })
  } catch (error) {
    console.error("Error creating teacher leave:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

