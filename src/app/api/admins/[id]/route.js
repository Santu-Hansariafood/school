import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Admin from "@/models/Admin"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    await connectDB()
    const admin = await Admin.findById(id)
    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 })
    }
    return NextResponse.json(admin, { status: 200 })
  } catch (error) {
    console.error("Error fetching admin:", error)
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
    const updatedAdmin = await Admin.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })
    if (!updatedAdmin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 })
    }
    return NextResponse.json(updatedAdmin, { status: 200 })
  } catch (error) {
    console.error("Error updating admin:", error)
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
    const deleted = await Admin.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Admin deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
