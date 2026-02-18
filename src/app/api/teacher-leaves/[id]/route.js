import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import TeacherLeave from "@/models/TeacherLeave"

export async function PATCH(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body || {}

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    await connectDB()
    const updated = await TeacherLeave.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: "Leave not found" }, { status: 404 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating teacher leave:", error)
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
    const deleted = await TeacherLeave.findByIdAndDelete(id).lean()

    if (!deleted) {
      return NextResponse.json({ message: "Leave not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Leave deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting teacher leave:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

