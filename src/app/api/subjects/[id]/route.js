import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Subject from "@/models/Subject"

export async function DELETE(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    await connectDB()
    await Subject.findByIdAndDelete(id)
    return NextResponse.json({ message: "Deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

