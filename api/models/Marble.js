import mongoose from "mongoose";
const { Schema } = mongoose;

const MarbleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Marble || mongoose.model("Marble", MarbleSchema);
