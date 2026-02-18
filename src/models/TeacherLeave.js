import mongoose from "mongoose"

const TeacherLeaveSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
)

TeacherLeaveSchema.index({ teacherId: 1, fromDate: 1, toDate: 1 })

export default mongoose.models.TeacherLeave || mongoose.model("TeacherLeave", TeacherLeaveSchema)

