import mongoose from "mongoose"

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true }
  },
  { timestamps: true }
)

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema)
