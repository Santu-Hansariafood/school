import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Teacher from "@/models/Teacher"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    await connectDB()
    const teacher = await Teacher.findById(id)

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(teacher, { status: 200 })
  } catch (error) {
    console.error("Error fetching teacher:", error)
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

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedTeacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTeacher, { status: 200 })
  } catch (error) {
    console.error("Error updating teacher:", error)
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
    const deletedTeacher = await Teacher.findByIdAndDelete(id)

    if (!deletedTeacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Teacher deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting teacher:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
