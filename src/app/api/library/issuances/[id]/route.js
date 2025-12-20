import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Book from "@/models/Book"
import BookIssuance from "@/models/BookIssuance"

export async function PUT(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()
    const { status } = body
    const issuance = await BookIssuance.findById(params.id)
    if (!issuance) return NextResponse.json({ message: "Issuance not found" }, { status: 404 })

    if (status === "returned" && issuance.status !== "returned") {
      issuance.status = "returned"
      await issuance.save()

      const book = await Book.findById(issuance.bookId)
      if (book) {
        book.status = "available"
        book.issuedTo = undefined
        book.dueDate = undefined
        await book.save()
      }
      return NextResponse.json(issuance, { status: 200 })
    }

    return NextResponse.json({ message: "Unsupported update" }, { status: 400 })
  } catch (error) {
    console.error("Error updating issuance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

