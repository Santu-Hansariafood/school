import mongoose from "mongoose"

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    class: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
)

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true })

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema)

