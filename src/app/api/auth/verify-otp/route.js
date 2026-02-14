import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import AdminOTP from "@/models/AdminOTP"
import User from "@/models/User"

function parseAllowedAdmins() {
  const raw = process.env.ADMIN_USERNAME || ""
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
}

async function ensureAllowedAndFetch({ role, email }) {
  if (role === "admin") {
    const allowed = parseAllowedAdmins()
    return { allowed: allowed.includes(email.toLowerCase()), user: null }
  }
  await connectDB()
  const user = await User.findOne({ email, role }).lean()
  return { allowed: !!user, user }
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { email, role, otp } = await request.json()
    if (!email || !role || !otp || !["admin", "teacher", "student"].includes(role)) {
      return NextResponse.json({ message: "Email, role and OTP are required" }, { status: 400 })
    }

    await connectDB()

    const { allowed, user } = await ensureAllowedAndFetch({ role, email })
    if (!allowed) {
      return NextResponse.json({ message: "Email not authorized for this role" }, { status: 403 })
    }

    const record = await AdminOTP.findOne({ email }).lean()
    if (!record) {
      return NextResponse.json({ message: "Code not found or expired" }, { status: 400 })
    }
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await AdminOTP.deleteMany({ email })
      return NextResponse.json({ message: "Code expired" }, { status: 400 })
    }
    if (record.code !== String(otp).trim()) {
      return NextResponse.json({ message: "Invalid code" }, { status: 400 })
    }

    await AdminOTP.deleteMany({ email })

    let safeUser
    if (role === "admin") {
      if (user && user.role !== "admin") {
        return NextResponse.json({ message: "Unauthorized role" }, { status: 403 })
      }
      if (user) {
        safeUser = {
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: "admin",
          email: user.email
        }
      } else {
        safeUser = {
          id: `admin:${email}`,
          username: email,
          name: "Admin",
          role: "admin",
          email
        }
      }
    } else {
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }
      safeUser = {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    }

    return NextResponse.json({ user: safeUser }, { status: 200 })
  } catch (error) {
    console.error("verify-otp error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
