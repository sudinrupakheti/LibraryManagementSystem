import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../schema/userSchema.js";
import protect from "../middleware/authMiddleware.js";

const authRoute = Router();

authRoute
  .route('/register')
  .post(async (req, res) => {
    try {
      const { name, email, password } = req.body;
      await User.create({ name, email, password });
      res.status(201).json({
        success: true,
        message: 'User created successfully',
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Error creating user' });
    }
  });

authRoute
  .route('/login')
  .post(async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token
      });

    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Error logging in' });
    }
  });

authRoute.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, result: user });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
});

export default authRoute
