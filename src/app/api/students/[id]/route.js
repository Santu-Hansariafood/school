import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Student from "@/models/Student"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    await connectDB()
    const student = await Student.findById(id)

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student, { status: 200 })
  } catch (error) {
    console.error("Error fetching student:", error)
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

    const updatedStudent = await Student.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(updatedStudent, { status: 200 })
  } catch (error) {
    console.error("Error updating student:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }
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
    const deletedStudent = await Student.findByIdAndDelete(id)

    if (!deletedStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting student:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
