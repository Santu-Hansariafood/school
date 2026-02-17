import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Book from "@/models/Book"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    const query = {}
    if (status) query.status = status

    const page = pageParam ? parseInt(pageParam, 10) : null
    const limit = limitParam ? parseInt(limitParam, 10) : null
    const usePagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0

    await connectDB()

    if (usePagination) {
      const [books, total] = await Promise.all([
        Book.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Book.countDocuments(query),
      ])

      const totalPages = total > 0 ? Math.ceil(total / limit) : 1

      return NextResponse.json(
        {
          data: books,
          total,
          page,
          limit,
          totalPages,
        },
        { status: 200 }
      )
    }

    const books = await Book.find(query).sort({ createdAt: -1 })
    return NextResponse.json(books, { status: 200 })
  } catch (error) {
    console.error("Error fetching books:", error)
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
    const book = await Book.create(body)
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
