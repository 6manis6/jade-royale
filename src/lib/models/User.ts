import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    emailVerified: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", UserSchema);
export default User;
