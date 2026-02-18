import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Fee from "@/models/Fee"
import Student from "@/models/Student"
import nodemailer from "nodemailer"
import { feeReceiptEmailTemplate } from "@/lib/emailTemplates"

export async function POST(request, { params }) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY
    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json().catch(() => ({}))
    const ensurePaid = body && typeof body.ensurePaid === "boolean" ? body.ensurePaid : true

    await connectDB()

    const fee = await Fee.findById(id)
    if (!fee) {
      return NextResponse.json({ message: "Fee not found" }, { status: 404 })
    }

    const student = await Student.findById(fee.studentId).lean()
    if (!student) {
      return NextResponse.json({ message: "Student not found for this fee" }, { status: 404 })
    }

    if (ensurePaid && fee.status !== "paid") {
      fee.status = "paid"
      if (!fee.paidDate) {
        fee.paidDate = new Date().toISOString()
      }
    }

    fee.adminApproved = true
    fee.adminApprovedAt = new Date().toISOString()
    if (!fee.receiptNumber) {
      fee.receiptNumber = `REC-${Date.now()}`
    }

    await fee.save()

    const parentEmail = student.parentEmail
    if (!parentEmail) {
      return NextResponse.json(
        { message: "Payment approved but student has no registered parent email", fee },
        { status: 200 }
      )
    }

    const appName = "School Portal"

    if (process.env.NODE_ENV !== "production") {
      console.log("[FEE-APPROVAL-DEV]", {
        to: parentEmail,
        studentName: student.name,
        className: student.class,
        feeType: fee.type,
        amount: fee.amount,
        paymentMode: fee.paymentMode,
        status: fee.status,
        receiptNumber: fee.receiptNumber,
      })
      return NextResponse.json(
        { message: "Payment approved and fee receipt email simulated (dev mode)", fee },
        { status: 200 }
      )
    }

    const user = process.env.EMAIL_USER
    const pass = process.env.EMAIL_PASS
    if (!user || !pass) {
      return NextResponse.json({ message: "Email credentials not configured" }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    })

    const html = feeReceiptEmailTemplate({
      studentName: student.name,
      className: student.class,
      parentName: student.parentName,
      feeType: fee.type,
      amount: fee.amount,
      dueDate: fee.dueDate,
      status: fee.status,
      paymentMode: fee.paymentMode || "online",
      receiptNumber: fee.receiptNumber || "",
      paidDate: fee.paidDate || fee.updatedAt?.toISOString?.() || "",
      appName,
    })

    const text =
      `Dear Parent,\n\n` +
      `Payment for ${student.name} (${student.class || "Class"}) has been approved.\n` +
      `Fee type: ${fee.type}\n` +
      `Amount: ${fee.amount}\n` +
      `Payment mode: ${fee.paymentMode || "online"}\n` +
      `Receipt number: ${fee.receiptNumber || ""}\n` +
      `Status: ${fee.status}\n\n` +
      `Thank you.\n${appName}`

    await transporter.sendMail({
      from: `"${appName}" <${user}>`,
      to: parentEmail,
      subject: "Fee Payment Receipt",
      text,
      html,
    })

    return NextResponse.json(
      { message: "Payment approved and fee receipt emailed to parent", fee },
      { status: 200 }
    )
  } catch (error) {
    console.error("fee-approve error", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

