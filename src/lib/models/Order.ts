import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    items: [OrderItemSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ["cod", "esewa"], required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Paid",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
