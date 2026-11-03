import { Router } from "express";
import Borrow from "../schema/borrowSchema.js";
import Book from '../schema/bookSchema.js';
import protect from "../middleware/authMiddleware.js";
import checkAdmin from "../middleware/adminMiddleware.js";

const borrowRoute = Router();

borrowRoute
  .route('/my')
  .get(protect, async (req, res) => {
    try {
      const result = await Borrow.find({ userID: req.user.id })
        .populate('bookId')
        .sort({ borrowDate: -1 });

      res.status(200).json({
        success: true,
        message: 'Borrow history fetched successfully',
        result: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching borrow history' });
    }
  });

borrowRoute
  .route('/')
  .get(protect, checkAdmin, async (req, res) => {
    try {
      const result = await Borrow.find()
        .populate('bookId')
        .populate('userID', '-password')
        .sort({ borrowDate: -1 });

      res.status(200).json({
        success: true,
        message: 'All borrows fetched successfully',
        result: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching borrow history' });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const { bookId, dueDate } = req.body;

      if (!bookId || !dueDate) {
        return res.status(400).json({ success: false, message: 'bookId and dueDate required' });
      }

      const due = new Date(dueDate);
      if (isNaN(due) || due <= new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid due date' });
      }

      const book = await Book.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 } },
        { returnDocument: 'after' }
      );

      if (!book) {
        return res.status(400).json({ success: false, message: 'Book not found or unavailable' });
      }
      try {
        const borrow = await Borrow.create({
          bookId,
          userID: req.user.id,
          dueDate: due
        });
        return res.status(201).json({
          success: true,
          message: 'Book borrowed successfully',
          result: borrow
        });
      } catch (err) {
        await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
        throw err;
      }
    } catch (error) {
      console.error('Error:', error.message);
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid book id' });
      }
      res.status(500).json({ success: false, message: 'Error borrowing book' });
    }
  });

borrowRoute
  .route('/:id/return')
  .put(protect, async (req, res) => {
    try {
      const borrow = await Borrow.findOneAndUpdate(
        { _id: req.params.id, status: { $ne: 'returned' } },
        { status: 'returned', returnDate: Date.now() },
        { returnDocument: 'after' }
      );

      if (!borrow) {
        return res.status(404).json({ success: false, message: 'Borrow not found or already returned' });
      }

      await Book.findByIdAndUpdate(borrow.bookId, { $inc: { availableCopies: 1 } });

      res.status(200).json({
        success: true,
        message: 'Book returned successfully',
        result: borrow
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid borrow id' });
      }
      res.status(500).json({ success: false, message: 'Error returning book' });
    }
  });

export default borrowRoute
