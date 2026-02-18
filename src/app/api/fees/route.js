import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Fee from "@/models/Fee"
import Student from "@/models/Student"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    const query = {}
    if (studentId) query.studentId = studentId
    if (status) query.status = status

    const page = pageParam ? parseInt(pageParam, 10) : null
    const limit = limitParam ? parseInt(limitParam, 10) : null
    const usePagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0

    await connectDB()

    if (usePagination) {
      const [fees, total] = await Promise.all([
        Fee.find(query)
          .sort({ dueDate: 1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Fee.countDocuments(query),
      ])

      const totalPages = total > 0 ? Math.ceil(total / limit) : 1

      return NextResponse.json(
        {
          data: fees,
          total,
          page,
          limit,
          totalPages,
        },
        { status: 200 }
      )
    }

    const fees = await Fee.find(query).sort({ dueDate: 1 })
    return NextResponse.json(fees, { status: 200 })
  } catch (error) {
    console.error("Error fetching fees:", error)
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

    const {
      studentId,
      studentEmail,
      type,
      amount,
      dueDate,
      className,
      applyToClass,
    } = body || {}

    if (applyToClass && className) {
      if (!type || !amount || !dueDate) {
        return NextResponse.json({ message: "Missing required fee fields" }, { status: 400 })
      }

      const students = await Student.find({ class: className }).select("_id email")
      if (!students.length) {
        return NextResponse.json({ message: "No students found for this class" }, { status: 400 })
      }

      const docs = students.map((s) => ({
        studentId: s._id,
        studentEmail: s.email,
        type,
        amount,
        dueDate,
        status: "pending",
      }))

      const createdMany = await Fee.insertMany(docs)

      return NextResponse.json(
        {
          message: "Fees assigned to class students successfully",
          createdCount: createdMany.length,
        },
        { status: 201 }
      )
    }

    if (!studentId || !studentEmail || !type || !amount || !dueDate) {
      return NextResponse.json({ message: "Missing required fee fields" }, { status: 400 })
    }

    const created = await Fee.create({
      studentId,
      studentEmail,
      type,
      amount,
      dueDate,
      status: body.status || "pending",
      paidDate: body.paidDate,
      transactionId: body.transactionId,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating fee:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
