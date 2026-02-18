import mongoose from "mongoose"

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String },
    class: { type: String },
    createdByRole: { type: String, enum: ["admin", "teacher"], default: "admin" },
  },
  { timestamps: true }
)

SubjectSchema.index({ name: 1, class: 1 }, { unique: true, partialFilterExpression: { name: { $type: "string" } } })

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema)

