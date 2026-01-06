import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import ClassModel from "@/models/Class"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const classes = await ClassModel.find({}).sort({ name: 1 })
    return NextResponse.json(classes, { status: 200 })
  } catch (error) {
    console.error("Error fetching classes:", error)
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
    const created = await ClassModel.create({ name: body.name })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating class:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Class already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
