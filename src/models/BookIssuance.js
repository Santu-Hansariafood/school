import mongoose from "mongoose"

const BookIssuanceSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    issuedDate: { type: Date, default: Date.now },
    dueDate: { type: String },
    status: { type: String, enum: ["issued", "returned"], default: "issued" },
  },
  { timestamps: true }
)

BookIssuanceSchema.index(
  { bookId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "issued" } }
)

export default mongoose.models.BookIssuance || mongoose.model("BookIssuance", BookIssuanceSchema)

