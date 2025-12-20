import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Assignment from "@/models/Assignment"
import AssignmentSubmission from "@/models/AssignmentSubmission"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const assignment = await Assignment.findById(params.id)
    if (!assignment) return NextResponse.json({ message: "Assignment not found" }, { status: 404 })
    return NextResponse.json(assignment, { status: 200 })
  } catch (error) {
    console.error("Error fetching assignment:", error)
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
    const updated = await Assignment.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!updated) return NextResponse.json({ message: "Assignment not found" }, { status: 404 })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating assignment:", error)
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
    const deleted = await Assignment.findByIdAndDelete(params.id)
    if (!deleted) return NextResponse.json({ message: "Assignment not found" }, { status: 404 })
    await AssignmentSubmission.deleteMany({ assignmentId: params.id })
    return NextResponse.json({ message: "Assignment deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

