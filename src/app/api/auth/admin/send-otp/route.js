import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import AdminOTP from "@/models/AdminOTP"
import nodemailer from "nodemailer"
import { otpEmailTemplate } from "@/lib/emailTemplates"

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ message: "Email not allowed" }, { status: 403 })
    }

    await connectDB()

    await AdminOTP.deleteMany({ email })

    const code = genOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await AdminOTP.create({ email, code, expiresAt })

    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS
    if (!user || !pass) {
      return NextResponse.json({ message: "Email credentials not configured" }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    })

    const html = otpEmailTemplate({ code, role: "admin", appName: "School Portal" })
    const text = `Your admin verification code is ${code}. It expires in 10 minutes.`
    await transporter.sendMail({ from: `"School Admin" <${user}>`, to: email, subject: "Your Admin OTP Code", text, html })

    return NextResponse.json({ message: "OTP sent" }, { status: 200 })
  } catch (error) {
    console.error("Send OTP error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
