import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Subject from "@/models/Subject"

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
    const subjects = await Subject.find(query).sort({ class: 1, name: 1 })
    return NextResponse.json(subjects, { status: 200 })
  } catch (error) {
    console.error("Error fetching subjects:", error)
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
    const subject = await Subject.create(body)
    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    console.error("Error creating subject:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Subject already exists for this class" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

