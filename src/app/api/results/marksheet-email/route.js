import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Result from "@/models/Result"
import Student from "@/models/Student"
import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"
import { marksheetEmailTemplate } from "@/lib/emailTemplates"

function gradeForMarks(marks) {
  if (marks >= 90) return "A+"
  if (marks >= 80) return "A"
  if (marks >= 70) return "B+"
  if (marks >= 60) return "B"
  if (marks >= 50) return "C"
  return "F"
}

function createMarksheetPdfBuffer({ student, results, average, overallGrade }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", (err) => reject(err))

    doc.fontSize(20).text("School Portal", { align: "center" })
    doc.moveDown(0.5)
    doc.fontSize(14).text("Provisional Marksheet", { align: "center" })
    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Student Name: ${student.name}`)
    if (student.class) {
      doc.text(`Class: ${student.class}`)
    }
    doc.text(`Average: ${average}%`)
    doc.text(`Overall Grade: ${overallGrade}`)

    doc.moveDown()
    doc.fontSize(12).text("Subject-wise Details")
    doc.moveDown(0.5)

    const startY = doc.y
    const subjectX = 50
    const totalX = 260
    const marksX = 320
    const percentX = 380
    const gradeX = 440

    doc.fontSize(11).font("Helvetica-Bold")
    doc.text("Subject", subjectX, startY)
    doc.text("Total", totalX, startY)
    doc.text("Marks", marksX, startY)
    doc.text("%", percentX, startY)
    doc.text("Grade", gradeX, startY)

    let y = startY + 18
    doc.font("Helvetica")

    results.forEach((r) => {
      const marks = typeof r.marks === "number" ? r.marks : 0
      const grade = r.grade || gradeForMarks(marks)
      const percent = marks

      doc.text(r.subject || "-", subjectX, y)
      doc.text("100", totalX, y)
      doc.text(String(marks), marksX, y)
      doc.text(String(percent), percentX, y)
      doc.text(grade, gradeX, y)

      y += 18
      if (y > 760) {
        doc.addPage()
        y = 60
      }
    })

    doc.end()
  })
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

    const recipients = [student.parentEmail, student.email].filter(Boolean)
    if (!recipients.length) {
      return NextResponse.json({ message: "Student has no registered email addresses" }, { status: 400 })
    }

    const results = await Result.find({ studentId }).sort({ subject: 1 }).lean()
    if (!results.length) {
      return NextResponse.json({ message: "No results available" }, { status: 404 })
    }

    const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0)
    const average = results.length > 0 ? Number((totalMarks / results.length).toFixed(1)) : 0
    const overallGrade = gradeForMarks(average)

    if (process.env.NODE_ENV !== "production") {
      console.log("[MARKSHEET-EMAIL-DEV]", recipients, {
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

    const pdfBuffer = await createMarksheetPdfBuffer({
      student,
      results,
      average,
      overallGrade
    })

    await transporter.sendMail({
      from: `"School Portal" <${user}>`,
      to: recipients.join(","),
      subject: "Your Academic Marksheet",
      text,
      html,
      attachments: [
        {
          filename: `Marksheet-${student.name}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    })

    return NextResponse.json({ message: "Marksheet emailed" }, { status: 200 })
  } catch (error) {
    console.error("marksheet-email error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
