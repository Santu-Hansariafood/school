import mongoose from "mongoose"

const AdminOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
)

AdminOTPSchema.index({ email: 1, code: 1 })
AdminOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.AdminOTP || mongoose.model("AdminOTP", AdminOTPSchema)
