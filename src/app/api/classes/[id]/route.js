import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import ClassModel from "@/models/Class"

export async function PUT(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const updated = await ClassModel.findByIdAndUpdate(params.id, { name: body.name }, { new: true, runValidators: true })
    if (!updated) return NextResponse.json({ message: "Class not found" }, { status: 404 })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating class:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Class already exists" }, { status: 400 })
    }
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
    const deleted = await ClassModel.findByIdAndDelete(params.id)
    if (!deleted) return NextResponse.json({ message: "Class not found" }, { status: 404 })
    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
