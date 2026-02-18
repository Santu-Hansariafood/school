import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Holiday from "@/models/Holiday"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const query = {}

    if (fromParam || toParam) {
      const range = {}
      if (fromParam) {
        const from = new Date(fromParam)
        from.setHours(0, 0, 0, 0)
        range.$gte = from
      }
      if (toParam) {
        const to = new Date(toParam)
        to.setHours(23, 59, 59, 999)
        range.$lte = to
      }
      query.date = range
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query.date = { $gte: today }
    }

    await connectDB()
    const holidays = await Holiday.find(query).sort({ date: 1 }).lean()
    return NextResponse.json(holidays, { status: 200 })
  } catch (error) {
    console.error("Error fetching holidays:", error)
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
    const { date, name, description } = body || {}

    if (!date || !name) {
      return NextResponse.json({ message: "date and name are required" }, { status: 400 })
    }

    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)

    const holiday = await Holiday.findOneAndUpdate(
      { date: normalized },
      { $set: { name, description: description || "", date: normalized } },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json(holiday, { status: 201 })
  } catch (error) {
    console.error("Error saving holiday:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

