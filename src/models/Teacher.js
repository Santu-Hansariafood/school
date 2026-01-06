import mongoose from "mongoose"

const QualificationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: String, required: true }
  },
  { _id: false }
)

const TeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    experience: { type: String, required: true },
    assignedClasses: { type: [String], default: [] },
    qualifications: { type: [QualificationSchema], default: [] }
  },
  { timestamps: true }
)

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema)
