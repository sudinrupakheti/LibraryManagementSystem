import { Router } from "express";
import Borrow from "../schema/src/schema/borrowSchema";
import Book from '../schema/bookSchema.js';
import protect from "../middleware/authMiddleware";

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
      console.error('Error:', error.message);
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
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Error fetching borrow history' });
    }
  });

borrowRoute
  .route('/')
  .post(protect, async (req, res) => {
    try {
      const { bookId, dueDate } = req.body;

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }

      if (book.availableCopies <= 0) {
        return res.status(400).json({ success: false, message: 'No copies available' });
      }

      const borrow = await Borrow.create({
        bookId: bookId,
        userID: req.user.id,
        dueDate: dueDate
      });
      book.availableCopies -= 1;
      await book.save();

      res.status(201).json({
        success: true,
        message: 'Book borrowed successfully',
        result: borrow
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Error borrowing book' });
    }
  });

borrowRoute
  .route('/:id/return')
  .put(protect, async (req, res) => {
    try {
      const borrow = await Borrow.findById(req.params.id);

      if (!borrow) {
        return res.status(404).json({
          success: false,
          message: 'Borrow record not found'
        });
      }

      if (borrow.status === 'returned') {
        return res.status(400).json({
          success: false,
          message: 'Book already returned'
        });
      }
      borrow.returnDate = Date.now();
      borrow.status = 'returned';
      await borrow.save();

      await Book.findByIdAndUpdate(borrow.bookId, {
        $inc: { availableCopies: 1 }
      });

      res.status(200).json({
        success: true,
        message: 'Book returned successfully',
        result: borrow
      });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error returning book'
      });
    }
  });
