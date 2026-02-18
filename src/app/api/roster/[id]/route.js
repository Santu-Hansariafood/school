import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Roster from "@/models/Roster"

export async function DELETE(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    await connectDB()
    const deleted = await Roster.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json({ message: "Roster entry not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Roster entry deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting roster entry:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

