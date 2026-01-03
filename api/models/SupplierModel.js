import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true, match: /^\d{11}$/ },
  },
  { timestamps: true }
);

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);
