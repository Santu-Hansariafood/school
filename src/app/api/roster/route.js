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
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    const query = {}
    if (teacherId) query.teacherId = teacherId
    if (className) query.className = className
    if (dayOfWeek) query.dayOfWeek = dayOfWeek
    if (monthParam) {
      const m = parseInt(monthParam, 10)
      if (!Number.isNaN(m)) query.month = m
    }
    if (yearParam) {
      const y = parseInt(yearParam, 10)
      if (!Number.isNaN(y)) query.year = y
    }

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
    const { teacherId, className, dayOfWeek, startTime, endTime, subject, month, year } = body || {}

    if (!teacherId || !className || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { message: "teacherId, className, dayOfWeek, startTime and endTime are required" },
        { status: 400 }
      )
    }

    const monthNumber =
      typeof month === "number"
        ? month
        : typeof month === "string" && month.trim()
        ? parseInt(month, 10)
        : undefined
    const yearNumber =
      typeof year === "number"
        ? year
        : typeof year === "string" && year.trim()
        ? parseInt(year, 10)
        : undefined

    const entry = await Roster.create({
      teacherId,
      className,
      dayOfWeek,
      startTime,
      endTime,
      subject: subject || "",
      month: monthNumber,
      year: yearNumber,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Error creating roster entry:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
