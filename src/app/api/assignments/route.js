import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Assignment from "@/models/Assignment"
import AssignmentSubmission from "@/models/AssignmentSubmission"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const withCounts = searchParams.get("withCounts") === "true"
    const classFilter = searchParams.get("class")

    const query = {}
    if (studentId) query.assignedTo = studentId
    if (classFilter) query.class = classFilter

    await connectDB()
    const assignments = await Assignment.find(query).sort({ createdAt: -1 }).lean()

    if (withCounts && assignments.length > 0) {
      const ids = assignments.map(a => a._id)
      const counts = await AssignmentSubmission.aggregate([
        { $match: { assignmentId: { $in: ids } } },
        { $group: { _id: "$assignmentId", count: { $sum: 1 } } },
      ])
      const countMap = counts.reduce((acc, c) => { acc[c._id.toString()] = c.count; return acc }, {})
      const withSubmitted = assignments.map(a => ({
        ...a,
        submittedCount: countMap[a._id.toString()] || 0,
      }))
      return NextResponse.json(withSubmitted, { status: 200 })
    }

    return NextResponse.json(assignments, { status: 200 })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const body = await request.json()
    const assignment = await Assignment.create(body)
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

