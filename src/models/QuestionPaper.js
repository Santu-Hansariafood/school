import mongoose from "mongoose"

const QuestionPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    year: { type: String, required: true },
    textContent: { type: String, required: true },
    fileUrl: { type: String },
    addedByRole: { type: String, enum: ["admin", "teacher"], required: true },
    addedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

QuestionPaperSchema.index({ class: 1, subjectId: 1, year: 1 })

export default mongoose.models.QuestionPaper || mongoose.model("QuestionPaper", QuestionPaperSchema)
