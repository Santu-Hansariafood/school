import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Book from "@/models/Book"
import BookIssuance from "@/models/BookIssuance"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const bookId = searchParams.get("bookId")
    const status = searchParams.get("status")

    const query = {}
    if (studentId) query.studentId = studentId
    if (bookId) query.bookId = bookId
    if (status) query.status = status

    await connectDB()
    const issuances = await BookIssuance.find(query).sort({ createdAt: -1 })
    return NextResponse.json(issuances, { status: 200 })
  } catch (error) {
    console.error("Error fetching issuances:", error)
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
    const { bookId, studentId, dueDate } = body
    if (!bookId || !studentId || !dueDate) {
      return NextResponse.json({ message: "bookId, studentId and dueDate are required" }, { status: 400 })
    }

    await connectDB()
    const book = await Book.findById(bookId)
    if (!book) return NextResponse.json({ message: "Book not found" }, { status: 404 })
    if (book.status === "issued") {
      return NextResponse.json({ message: "Book already issued" }, { status: 400 })
    }

    book.status = "issued"
    book.issuedTo = studentId
    book.dueDate = dueDate
    await book.save()

    const issuance = await BookIssuance.create({ bookId, studentId, dueDate, status: "issued" })
    return NextResponse.json(issuance, { status: 201 })
  } catch (error) {
    console.error("Error issuing book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

