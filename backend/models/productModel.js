import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductSchema = new Schema({
    productId:  { type: Number, required: true, unique: true },
    name:       { type: String, required: true },
    description:{ type: String },

    fabrics:   [{ type: Schema.Types.ObjectId, ref: "Fabric",   required: true }],
    eshra:     [{ type: Schema.Types.ObjectId, ref: "Eshra",    required: true }],
    paintings: [{ type: Schema.Types.ObjectId, ref: "Painting", required: true }],
    marble:    [{ type: Schema.Types.ObjectId, ref: "Marble",   required: true }],
    glass:    [{ type: Schema.Types.ObjectId, ref: "Glass",   required: true }],

    supplier:  { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    images:    { type: String }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
