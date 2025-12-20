import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Result from "@/models/Result"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const subject = searchParams.get("subject")
    const term = searchParams.get("term")

    const query = {}
    if (studentId) query.studentId = studentId
    if (subject) query.subject = subject
    if (term) query.term = term

    await connectDB()
    const results = await Result.find(query).sort({ createdAt: -1 })
    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error("Error fetching results:", error)
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

    const body = await request.json()
    await connectDB()

    if (Array.isArray(body.records) && body.studentId) {
      const { studentId, term } = body
      const operations = body.records.map((r) => ({
        updateOne: {
          filter: { studentId, subject: r.subject, ...(term ? { term } : {}) },
          update: { $set: { marks: r.marks, grade: undefined, term } },
          upsert: true,
        },
      }))
      if (operations.length > 0) {
        await Result.bulkWrite(operations)
      }
      const updated = await Result.find({ studentId, ...(term ? { term } : {}) })
      return NextResponse.json(updated, { status: 200 })
    }

    const saved = await Result.findOneAndUpdate(
      { studentId: body.studentId, subject: body.subject, ...(body.term ? { term: body.term } : {}) },
      { $set: { marks: body.marks, grade: undefined, term: body.term } },
      { upsert: true, new: true, runValidators: true }
    )
    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error("Error saving results:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

