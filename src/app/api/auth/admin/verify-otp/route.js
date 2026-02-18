import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import AdminOTP from "@/models/AdminOTP"
import User from "@/models/User"

function isAllowedEmail(email) {
  const raw = process.env.ADMIN_USERNAME || ""
  const allowed = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  return allowed.includes((email || "").toLowerCase())
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const email = (body?.email || "").trim()
    const code = (body?.otp || body?.code || "").trim()
    if (!email || !code) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 })
    }
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ message: "Email not allowed" }, { status: 403 })
    }

    await connectDB()

    const record = await AdminOTP.findOne({ email }).lean()
    if (!record) {
      return NextResponse.json({ message: "Code not found or expired" }, { status: 400 })
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await AdminOTP.deleteMany({ email })
      return NextResponse.json({ message: "Code expired" }, { status: 400 })
    }

    if (record.code !== code) {
      await AdminOTP.updateOne({ _id: record._id }, { $inc: { attempts: 1 } })
      return NextResponse.json({ message: "Invalid code" }, { status: 400 })
    }

    await AdminOTP.deleteMany({ email })

    const normalizedEmail = email.toLowerCase()
    const safeUser = {
      id: `admin:${normalizedEmail}`,
      username: normalizedEmail,
      name: "Admin",
      role: "admin",
      email: normalizedEmail
    }

    return NextResponse.json({ user: safeUser }, { status: 200 })
  } catch (error) {
    console.error("Verify OTP error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
