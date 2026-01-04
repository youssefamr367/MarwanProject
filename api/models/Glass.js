import mongoose from "mongoose";
const { Schema } = mongoose;

const GlassSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Glass || mongoose.model("Glass", GlassSchema);
