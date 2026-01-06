import mongoose from "mongoose"

const ClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  { timestamps: true }
)

export default mongoose.models.Class || mongoose.model("Class", ClassSchema)
