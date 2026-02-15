import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Result from "@/models/Result"
import Student from "@/models/Student"
import nodemailer from "nodemailer"
import { marksheetEmailTemplate } from "@/lib/emailTemplates"

function gradeForMarks(marks) {
  if (marks >= 90) return "A+"
  if (marks >= 80) return "A"
  if (marks >= 70) return "B+"
  if (marks >= 60) return "B"
  if (marks >= 50) return "C"
  return "F"
}

export async function POST(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { studentId } = await request.json()
    if (!studentId) {
      return NextResponse.json({ message: "studentId is required" }, { status: 400 })
    }

    await connectDB()
    const student = await Student.findById(studentId).lean()
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 })
    }
    if (!student.email) {
      return NextResponse.json({ message: "Student has no registered email" }, { status: 400 })
    }

    const results = await Result.find({ studentId }).sort({ subject: 1 }).lean()
    if (!results.length) {
      return NextResponse.json({ message: "No results available" }, { status: 404 })
    }

    const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0)
    const average = results.length > 0 ? Number((totalMarks / results.length).toFixed(1)) : 0
    const overallGrade = gradeForMarks(average)

    if (process.env.NODE_ENV !== "production") {
      console.log("[MARKSHEET-EMAIL-DEV]", student.email, {
        studentName: student.name,
        className: student.class,
        average,
        overallGrade
      })
      return NextResponse.json({ message: "Marksheet email simulated (dev mode)" }, { status: 200 })
    }

    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS
    if (!user || !pass) {
      return NextResponse.json({ message: "Email credentials not configured" }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    })

    const html = marksheetEmailTemplate({
      studentName: student.name,
      className: student.class,
      term: "",
      results,
      average,
      overallGrade,
      appName: "School Portal"
    })

    const lines = results
      .map((r) => `${r.subject}: ${r.marks}/100 (${r.grade || ""})`)
      .join("\n")
    const text =
      `Marksheet for ${student.name}${student.class ? ` (Class ${student.class})` : ""}\n` +
      `Average: ${average}%  Grade: ${overallGrade}\n\n` +
      lines

    await transporter.sendMail({
      from: `"School Portal" <${user}>`,
      to: student.email,
      subject: "Your Academic Marksheet",
      text,
      html
    })

    return NextResponse.json({ message: "Marksheet emailed" }, { status: 200 })
  } catch (error) {
    console.error("marksheet-email error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

