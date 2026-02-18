import mongoose from "mongoose"

const FeeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentEmail: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidDate: { type: String },
    transactionId: { type: String },
    paymentMode: {
      type: String,
      enum: ["cash", "cheque", "online"],
    },
    paymentDetails: { type: String },
    adminApproved: { type: Boolean, default: false },
    adminApprovedAt: { type: String },
    receiptNumber: { type: String },
  },
  { timestamps: true }
)

FeeSchema.index({ studentId: 1, type: 1, dueDate: 1 })

export default mongoose.models.Fee || mongoose.model("Fee", FeeSchema)
