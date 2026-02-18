import mongoose from "mongoose"

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    class: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    parentEmail: { type: String, required: true },
    previousSchool: { type: String },
    admissionDate: { type: String, required: true },
  },
  { timestamps: true }
)

StudentSchema.index({ class: 1, createdAt: -1 })
StudentSchema.index({ email: 1 })
StudentSchema.index({ parentEmail: 1 })

export default mongoose.models.Student || mongoose.model("Student", StudentSchema)
