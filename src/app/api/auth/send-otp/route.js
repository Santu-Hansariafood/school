import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import AdminOTP from "@/models/AdminOTP"
import User from "@/models/User"
import nodemailer from "nodemailer"
import { otpEmailTemplate } from "@/lib/emailTemplates"

function genOTP() {
  if (process.env.NODE_ENV === "production") {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
  return "123456"
}

function parseAllowedAdmins() {
  const raw = process.env.ADMIN_USERNAME || ""
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
}

async function ensureAllowed({ role, email }) {
  const normalizedEmail = (email || "").toLowerCase()

  if (role === "admin") {
    const allowed = parseAllowedAdmins()
    return allowed.includes(normalizedEmail)
  }

  await connectDB()
  const user = await User.findOne({ email: normalizedEmail, role }).lean()
  return !!user
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { email, role } = await request.json()
    if (!email || !role || !["admin", "teacher", "student"].includes(role)) {
      return NextResponse.json({ message: "Email and valid role are required" }, { status: 400 })
    }

    const allowed = await ensureAllowed({ role, email })
    if (!allowed) {
      return NextResponse.json({ message: "Email not authorized for this role" }, { status: 403 })
    }

    await connectDB()
    await AdminOTP.deleteMany({ email })

    const code = genOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await AdminOTP.create({ email, code, expiresAt })
    console.log("[OTP]", role, email, code)

    if (process.env.NODE_ENV === "production") {
      const user = process.env.EMAIL_USER
      const pass = process.env.EMAIL_PASS
      if (!user || !pass) {
        return NextResponse.json({ message: "Email credentials not configured" }, { status: 500 })
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      })

      const html = otpEmailTemplate({ code, role, appName: "School Portal" })
      const text = `Your ${role} verification code is ${code}. It expires in 10 minutes.`
      await transporter.sendMail({ from: `"School Portal" <${user}>`, to: email, subject: `Your ${role} OTP Code`, text, html })
    }

    return NextResponse.json({ message: "OTP sent" }, { status: 200 })
  } catch (error) {
    console.error("send-otp error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
