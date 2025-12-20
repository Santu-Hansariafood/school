import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Attendance from "@/models/Attendance"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    await connectDB()
    const record = await Attendance.findById(id)

    if (!record) {
      return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json(record, { status: 200 })
  } catch (error) {
    console.error("Error fetching attendance record:", error)
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

    const { id } = params
    const body = await request.json()
    await connectDB()

    const updated = await Attendance.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating attendance record:", error)
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

    const deleted = await Attendance.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Attendance record deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting attendance record:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

