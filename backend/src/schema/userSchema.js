import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = Schema(
  {
  name: { type: String, required: [true, "User name is required"] },
  email: { type: String, required: [true, "User email is required"], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, "User password is required"], minlength: [6, "Password must be at least 6 characters"] },
  role: { type: String, required: [true, "User role is required"], enum: ['member', 'admin'], default: 'member' },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model("User", userSchema);

export default User;
