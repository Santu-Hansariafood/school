import mongoose from "mongoose"

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: String, required: true },
    description: { type: String },
    class: { type: String },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
)

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema)

