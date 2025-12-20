import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import AssignmentSubmission from "@/models/AssignmentSubmission"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    await connectDB()
    const query = { assignmentId: params.id }
    if (studentId) query.studentId = studentId
    const submissions = await AssignmentSubmission.find(query).sort({ submittedAt: -1 })
    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const saved = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: params.id, studentId: body.studentId },
      { $set: { status: "submitted", fileUrl: body.fileUrl || "", notes: body.notes || "" } },
      { upsert: true, new: true, runValidators: true }
    )
    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error("Error saving submission:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

