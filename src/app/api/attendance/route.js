import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Attendance from "@/models/Attendance"

function getMonthRange(monthKey) {
  // monthKey format: YYYY-MM
  const [yearStr, monthStr] = monthKey.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthKey = searchParams.get("month")
    const dateParam = searchParams.get("date")
    const classFilter = searchParams.get("class")

    const query = {}

    if (monthKey) {
      const { start, end } = getMonthRange(monthKey)
      query.date = { $gte: start, $lte: end }
    } else if (dateParam) {
      const date = new Date(dateParam)
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }

    if (classFilter) {
      query.class = classFilter
    }

    await connectDB()
    const records = await Attendance.find(query).sort({ date: -1 })
    return NextResponse.json(records, { status: 200 })
  } catch (error) {
    console.error("Error fetching attendance:", error)
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

    // Support both single record and batch payloads
    const { date, class: className, records } = body

    await connectDB()

    if (Array.isArray(records) && date) {
      const baseDate = new Date(date)
      baseDate.setHours(0, 0, 0, 0)

      const operations = records.map((record) => ({
        updateOne: {
          filter: { studentId: record.studentId, date: baseDate },
          update: {
            $set: {
              status: record.status,
              class: className || record.class,
              remarks: record.remarks || "",
              date: baseDate,
            },
          },
          upsert: true,
        },
      }))

      if (operations.length > 0) {
        await Attendance.bulkWrite(operations)
      }

      return NextResponse.json({ message: "Attendance saved" }, { status: 200 })
    }

    // Single record fallback
    const normalizedDate = new Date(body.date)
    normalizedDate.setHours(0, 0, 0, 0)

    const saved = await Attendance.findOneAndUpdate(
      { studentId: body.studentId, date: normalizedDate },
      {
        $set: {
          status: body.status,
          class: body.class,
          remarks: body.remarks || "",
          date: normalizedDate,
        },
      },
      { upsert: true, new: true, runValidators: true }
    )

    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

