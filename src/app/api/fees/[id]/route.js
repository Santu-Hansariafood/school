import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Fee from "@/models/Fee"

export async function PUT(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    await connectDB()
    const updated = await Fee.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      return NextResponse.json({ message: "Fee not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating fee:", error)
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

    const { id } = params
    await connectDB()
    const deleted = await Fee.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ message: "Fee not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Fee deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting fee:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

