import mongoose from "mongoose"

const HolidaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

HolidaySchema.index({ date: 1 })

export default mongoose.models.Holiday || mongoose.model("Holiday", HolidaySchema)

