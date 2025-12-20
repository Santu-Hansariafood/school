import mongoose from "mongoose"

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["submitted"], default: "submitted" },
    submittedAt: { type: Date, default: Date.now },
    fileUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true })

export default mongoose.models.AssignmentSubmission || mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema)

