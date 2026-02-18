import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Holiday from "@/models/Holiday"

export async function DELETE(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    await connectDB()
    const deleted = await Holiday.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json({ message: "Holiday not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Holiday deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting holiday:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

