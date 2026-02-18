import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import QuestionPaper from "@/models/QuestionPaper"
import Subject from "@/models/Subject"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const subjectId = searchParams.get("subjectId")
    const year = searchParams.get("year")

    const query = {}
    if (classFilter) query.class = classFilter
    if (subjectId) query.subjectId = subjectId
    if (year) query.year = year

    await connectDB()
    const list = await QuestionPaper.find(query).sort({ year: -1, createdAt: -1 }).lean()

    let subjectMap = {}
    if (list.length) {
      const subjectIds = Array.from(new Set(list.map((q) => String(q.subjectId))))
      const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean()
      subjectMap = subjects.reduce((acc, s) => {
        acc[String(s._id)] = s
        return acc
      }, {})
    }

    const withSubjects = list.map((q) => {
      const s = subjectMap[String(q.subjectId)]
      return {
        ...q,
        subjectName: s?.name || "",
        subjectClass: s?.class || "",
      }
    })

    return NextResponse.json(withSubjects, { status: 200 })
  } catch (error) {
    console.error("Error fetching question papers:", error)
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
    const created = await QuestionPaper.create(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating question paper:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

