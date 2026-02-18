import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Student from "@/models/Student"
import User from "@/models/User"
import nodemailer from "nodemailer"
import { studentRegistrationEmailTemplate } from "@/lib/emailTemplates"

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const classFilter = searchParams.get("class")
    const email = searchParams.get("email")
    const q = searchParams.get("q")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

    const query = {}
    if (classFilter) {
      query.class = classFilter
    }
    if (email) {
      query.email = email
    }
    if (q) {
      const regex = new RegExp(q, "i")
      query.$or = [
        { name: regex },
        { email: regex },
        { class: regex },
        { parentName: regex },
        { parentEmail: regex },
      ]
    }

    const page = pageParam ? parseInt(pageParam, 10) : null
    const limit = limitParam ? parseInt(limitParam, 10) : null
    const usePagination = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0

    await connectDB()

    if (usePagination) {
      const [students, total] = await Promise.all([
        Student.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Student.countDocuments(query),
      ])

      const totalPages = total > 0 ? Math.ceil(total / limit) : 1

      return NextResponse.json(
        {
          data: students,
          total,
          page,
          limit,
          totalPages,
        },
        { status: 200 }
      )
    }

    const students = await Student.find(query).sort({ createdAt: -1 })
    return NextResponse.json(students, { status: 200 })
  } catch (error) {
    console.error("Error fetching students:", error)
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

    const { email, name } = body || {}
    if (!email || !name) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser && existingUser.role !== "student") {
      return NextResponse.json({ message: "Email already registered with another role" }, { status: 400 })
    }

    const student = await Student.create(body)

    await User.updateOne(
      { email },
      { $setOnInsert: { username: email }, $set: { name, role: "student", email } },
      { upsert: true }
    )

    try {
      if (student.parentEmail) {
        if (process.env.NODE_ENV !== "production") {
          console.log("[STUDENT-REGISTER-EMAIL-DEV]", {
            parentEmail: student.parentEmail,
            studentEmail: student.email,
            studentName: student.name,
            className: student.class
          })
        } else {
          const userEmail = process.env.EMAIL_USER
          const userPass = process.env.EMAIL_PASS
          if (userEmail && userPass) {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: userEmail, pass: userPass }
            })

            const html = studentRegistrationEmailTemplate({
              studentName: student.name,
              className: student.class,
              studentEmail: student.email,
              parentName: student.parentName,
              parentEmail: student.parentEmail,
              admissionDate: student.admissionDate,
              appName: "School Portal"
            })

            const textLines = [
              `Student Name: ${student.name}`,
              `Class: ${student.class || "-"}`,
              `Student Login Email: ${student.email}`,
              `Parent/Guardian Email: ${student.parentEmail}`,
              `Admission Date: ${student.admissionDate || "-"}`
            ]

            await transporter.sendMail({
              from: `"School Portal" <${userEmail}>`,
              to: student.parentEmail,
              cc: student.email,
              subject: "Student Registration Confirmation",
              text: textLines.join("\n"),
              html
            })
          } else {
            console.warn("Email credentials not configured; skipping student registration email")
          }
        }
      }
    } catch (emailError) {
      console.error("Error sending student registration email:", emailError)
    }

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
