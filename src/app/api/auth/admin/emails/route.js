import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const raw = process.env.ADMIN_USERNAME || ""
    const emails = raw
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    return NextResponse.json({ emails }, { status: 200 })
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
