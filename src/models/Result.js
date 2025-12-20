import mongoose from "mongoose"

function gradeForMarks(marks) {
  if (marks >= 90) return "A+"
  if (marks >= 80) return "A"
  if (marks >= 70) return "B+"
  if (marks >= 60) return "B"
  if (marks >= 50) return "C"
  return "F"
}

const ResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: String, required: true },
    marks: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String },
    term: { type: String },
  },
  { timestamps: true }
)

ResultSchema.index({ studentId: 1, subject: 1, term: 1 }, { unique: true, sparse: true })

ResultSchema.pre("save", function (next) {
  if (typeof this.marks === "number") {
    this.grade = gradeForMarks(this.marks)
  }
  next()
})

export default mongoose.models.Result || mongoose.model("Result", ResultSchema)

