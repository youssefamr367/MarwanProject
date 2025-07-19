import mongoose from "mongoose";
const { Schema } = mongoose;

const PaintingSchema = new Schema({
    name: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.models.Painting || mongoose.model('Painting', PaintingSchema);
