import mongoose from "mongoose"

const RosterSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    className: { type: String, required: true },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
  },
  { timestamps: true }
)

RosterSchema.index({ teacherId: 1, className: 1, dayOfWeek: 1, startTime: 1 })

export default mongoose.models.Roster || mongoose.model("Roster", RosterSchema)
