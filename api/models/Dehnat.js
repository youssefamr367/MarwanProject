import mongoose from "mongoose";
const { Schema } = mongoose;

const DehnatSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Dehnat || mongoose.model("Dehnat", DehnatSchema);
