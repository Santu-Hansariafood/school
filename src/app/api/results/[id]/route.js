import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Result from "@/models/Result"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const result = await Result.findById(params.id)
    if (!result) return NextResponse.json({ message: "Result not found" }, { status: 404 })
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const updated = await Result.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!updated) return NextResponse.json({ message: "Result not found" }, { status: 404 })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating result:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const deleted = await Result.findByIdAndDelete(params.id)
    if (!deleted) return NextResponse.json({ message: "Result not found" }, { status: 404 })
    return NextResponse.json({ message: "Result deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting result:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

