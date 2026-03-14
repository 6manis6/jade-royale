import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true, enum: ['Skincare', 'Makeup', 'Haircare', 'Fragrance'] },
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    badge: { type: String, enum: ['NEW', 'SALE', 'HOT', ''] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
