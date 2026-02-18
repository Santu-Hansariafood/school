import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Roster from "@/models/Roster"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")
    const className = searchParams.get("class")
    const dayOfWeek = searchParams.get("dayOfWeek")

    const query = {}
    if (teacherId) query.teacherId = teacherId
    if (className) query.className = className
    if (dayOfWeek) query.dayOfWeek = dayOfWeek

    await connectDB()
    const entries = await Roster.find(query)
      .populate("teacherId", "name subject email")
      .sort({ dayOfWeek: 1, startTime: 1 })
      .lean()

    return NextResponse.json(entries, { status: 200 })
  } catch (error) {
    console.error("Error fetching roster:", error)
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
    const { teacherId, className, dayOfWeek, startTime, endTime, subject } = body || {}

    if (!teacherId || !className || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { message: "teacherId, className, dayOfWeek, startTime and endTime are required" },
        { status: 400 }
      )
    }

    const entry = await Roster.create({
      teacherId,
      className,
      dayOfWeek,
      startTime,
      endTime,
      subject: subject || "",
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Error creating roster entry:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

