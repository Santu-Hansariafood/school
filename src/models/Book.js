import mongoose from "mongoose"

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ["available", "issued"], default: "available" },
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    dueDate: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.Book || mongoose.model("Book", BookSchema)

