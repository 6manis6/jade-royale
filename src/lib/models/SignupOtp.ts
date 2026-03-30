import mongoose from "mongoose";

const SignupOtpSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

if (mongoose.models.SignupOtp) {
  delete mongoose.models.SignupOtp;
}

const SignupOtp = mongoose.model("SignupOtp", SignupOtpSchema);
export default SignupOtp;
