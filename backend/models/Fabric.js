import mongoose from "mongoose";
const { Schema } = mongoose;

const FabricSchema = new Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.models.Fabric || mongoose.model('Fabric', FabricSchema);

