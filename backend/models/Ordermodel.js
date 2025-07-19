import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
    product:   { type: Schema.Types.ObjectId, ref: "Product", required: true },
    fabrics:   [{ type: Schema.Types.ObjectId, ref: "Fabric"   }],
    eshra:     [{ type: Schema.Types.ObjectId, ref: "Eshra"    }],
    paintings: [{ type: Schema.Types.ObjectId, ref: "Painting" }],
    marble:    [{ type: Schema.Types.ObjectId, ref: "Marble"   }],
    dehnat:    [{ type: Schema.Types.ObjectId, ref: "Dehnat"   }],
    supplier:  { type: Schema.Types.ObjectId, ref: "Supplier", required: true }
});

const OrderSchema = new Schema({
    orderId: { type: Number, required: true, unique: true },
    items:   [OrderItemSchema],
    status:  {
        type: String,
        enum: ["New", "manufacturing", "Done"],
        default: "New"
    }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
