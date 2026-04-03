import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    variantLabel: { type: String },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    defaultShippingAddress: {
      address: { type: String },
      city: { type: String },
    },
    passwordHash: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", UserSchema);
export default User;
