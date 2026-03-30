import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: {
      type: String,
      required: true,
      enum: ["Skincare", "Makeup", "Haircare", "Fragrance", "Clothing"],
    },
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    badge: { type: String, enum: ["NEW", "SALE", "HOT", ""] },
    variants: [
      {
        colorName: { type: String },
        colorHex: { type: String },
        price: { type: Number },
        images: [{ type: String }]
      }
    ]
  },
  { timestamps: true },
);

delete mongoose.models.Product;
const Product = mongoose.model("Product", ProductSchema);
export default Product;
