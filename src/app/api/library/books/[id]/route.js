import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Book from "@/models/Book"

export async function GET(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }
    await connectDB()
    const book = await Book.findById(params.id)
    if (!book) return NextResponse.json({ message: "Book not found" }, { status: 404 })
    return NextResponse.json(book, { status: 200 })
  } catch (error) {
    console.error("Error fetching book:", error)
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
    const updated = await Book.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!updated) return NextResponse.json({ message: "Book not found" }, { status: 404 })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating book:", error)
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
    const deleted = await Book.findByIdAndDelete(params.id)
    if (!deleted) return NextResponse.json({ message: "Book not found" }, { status: 404 })
    return NextResponse.json({ message: "Book deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

