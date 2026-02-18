import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Attendance from "@/models/Attendance"
import Student from "@/models/Student"
import Holiday from "@/models/Holiday"
import nodemailer from "nodemailer"
import { attendanceAbsentEmailTemplate } from "@/lib/emailTemplates"

function getMonthRange(monthKey) {
  // monthKey format: YYYY-MM
  const [yearStr, monthStr] = monthKey.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export async function GET(request) {
  try {
    const headerKey = request.headers.get("x-api-key")
    const expectedKey = process.env.API_KEY

    if (!expectedKey || headerKey !== expectedKey) {
      return NextResponse.json({ message: "Invalid API key" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthKey = searchParams.get("month")
    const dateParam = searchParams.get("date")
    const classFilter = searchParams.get("class")

    const query = {}

    if (monthKey) {
      const { start, end } = getMonthRange(monthKey)
      query.date = { $gte: start, $lte: end }
    } else if (dateParam) {
      const date = new Date(dateParam)
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }

    if (classFilter) {
      query.class = classFilter
    }

    await connectDB()
    const records = await Attendance.find(query).sort({ date: -1 })
    return NextResponse.json(records, { status: 200 })
  } catch (error) {
    console.error("Error fetching attendance:", error)
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

    const { date, class: className, records } = body

    // Support both single record and batch payloads

    async function getAbsentStreakDays(studentId, date) {
      const base = new Date(date)
      base.setHours(0, 0, 0, 0)
      const dates = []
      for (let i = 0; i < 3; i += 1) {
        const d = new Date(base)
        d.setDate(base.getDate() - i)
        d.setHours(0, 0, 0, 0)
        dates.push(d)
      }
      const records = await Attendance.find({
        studentId,
        date: { $gte: dates[2], $lte: dates[0] }
      }).lean()
      let streak = 0
      for (let i = 0; i < 3; i += 1) {
        const targetTime = dates[i].getTime()
        const record = records.find((r) => {
          const d = new Date(r.date)
          d.setHours(0, 0, 0, 0)
          return d.getTime() === targetTime
        })
        if (record && record.status === "absent") {
          streak += 1
        } else {
          break
        }
      }
      return streak
    }

    async function sendAbsentEmail({ student, date, className, remarks }) {
      if (!student?.parentEmail && !student?.email) return
      const streak = await getAbsentStreakDays(student._id, date)
      if (streak !== 3) return
      if (process.env.NODE_ENV !== "production") {
        console.log("[ATTENDANCE-ABSENT-NOTIFY-DEV]", {
          parentEmail: student.parentEmail,
          studentEmail: student.email,
          date,
          className,
          remarks,
          streak
        })
        return
      }
      const user = process.env.EMAIL_USER
      const pass = process.env.EMAIL_PASS
      if (!user || !pass) {
        console.warn("Email credentials not configured; skipping absent email")
        return
      }
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
      const recipients = [student.parentEmail, student.email].filter(Boolean)
      const html = attendanceAbsentEmailTemplate({
        studentName: student.name,
        className,
        date,
        remarks,
        appName: "School Portal"
      })
      const text = `Absence Notification: ${student.name}${className ? ` (Class ${className})` : ""} was absent on ${new Date(date).toDateString()}` + (remarks ? `\nRemarks: ${remarks}` : "")
      await transporter.sendMail({
        from: `"School Portal" <${user}>`,
        to: recipients.join(","),
        subject: "Absence Notification",
        text,
        html
      })
    }

    if (Array.isArray(records) && date) {
      const baseDate = new Date(date)
      baseDate.setHours(0, 0, 0, 0)

      const holiday = await Holiday.findOne({ date: baseDate }).lean()
      if (holiday) {
        return NextResponse.json(
          { message: "Attendance cannot be marked on a holiday" },
          { status: 400 }
        )
      }

      const operations = records.map((record) => ({
        updateOne: {
          filter: { studentId: record.studentId, date: baseDate },
          update: {
            $set: {
              status: record.status,
              class: className || record.class,
              remarks: record.remarks || "",
              date: baseDate,
            },
          },
          upsert: true,
        },
      }))

      if (operations.length > 0) {
        await Attendance.bulkWrite(operations)
      }

      const absentIds = records.filter(r => r.status === "absent").map(r => r.studentId).filter(Boolean)
      if (absentIds.length > 0) {
        const students = await Student.find({ _id: { $in: absentIds } }).lean()
        const studentMap = new Map(students.map(s => [String(s._id), s]))
        for (const r of records) {
          if (r.status === "absent") {
            const s = studentMap.get(String(r.studentId))
            if (s) {
              await sendAbsentEmail({ student: s, date: baseDate, className: r.class || className, remarks: r.remarks || "" })
            }
          }
        }
      }

      return NextResponse.json({ message: "Attendance saved" }, { status: 200 })
    }

    // Single record fallback
    const normalizedDate = new Date(body.date)
    normalizedDate.setHours(0, 0, 0, 0)

    const holiday = await Holiday.findOne({ date: normalizedDate }).lean()
    if (holiday) {
      return NextResponse.json(
        { message: "Attendance cannot be marked on a holiday" },
        { status: 400 }
      )
    }

    const saved = await Attendance.findOneAndUpdate(
      { studentId: body.studentId, date: normalizedDate },
      {
        $set: {
          status: body.status,
          class: body.class,
          remarks: body.remarks || "",
          date: normalizedDate,
        },
      },
      { upsert: true, new: true, runValidators: true }
    )

    if (body.status === "absent" && body.studentId) {
      const student = await Student.findById(body.studentId).lean()
      if (student) {
        await sendAbsentEmail({ student, date: normalizedDate, className: body.class, remarks: body.remarks || "" })
      }
    }

    return NextResponse.json(saved, { status: 200 })
  } catch (error) {
    console.error("Error saving attendance:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
