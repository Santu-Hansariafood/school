import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    return NextResponse.json({ message: "Password login disabled. Use email OTP." }, { status: 405 })

  } catch (error) {
    console.error("Login API error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
