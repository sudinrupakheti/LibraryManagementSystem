import { Router } from 'express';
import User from '../schema/userSchema.js';
import protect from '../middleware/authMiddleware.js';
import checkAdmin from '../middleware/adminMiddleware.js';

const userRoute = Router();

userRoute
  .route('/')
  .get(protect, checkAdmin, async (req, res) => {
    try {
      const result = await User.find().select('-password');
      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        result: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching users' });
    }
  });

userRoute
  .route('/:id')
  .delete(protect, checkAdmin, async (req, res) => {
    try {
      if (req.params.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
      }
      const result = await User.findByIdAndDelete(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        result: result
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid user id' });
      }
      res.status(500).json({ success: false, message: 'Error deleting user' });
    }
  });

export default userRoute;
