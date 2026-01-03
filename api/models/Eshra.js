import mongoose from "mongoose";
const { Schema } = mongoose;

const EshraSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Eshra || mongoose.model("Eshra", EshraSchema);
