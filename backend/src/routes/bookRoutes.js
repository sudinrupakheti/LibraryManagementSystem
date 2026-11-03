import { Router } from 'express';
import Book from '../schema/bookSchema.js';
import protect from '../middleware/authMiddleware.js';
import checkAdmin from '../middleware/adminMiddleware.js';

const bookRoute = Router();

bookRoute
    .route('/')
    .post(protect, checkAdmin, async (req, res) => {
      try {
        const result = await Book.create(req.body);
        res.status(201).json({
          success: true,
          message: 'Book created successfully',
          result: result
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    })
    .get(async (req, res) => {
        try {
            const result = await Book.find();
            res.status(200).json({
                success: true,
                message: 'Book read successfully',
                result: result
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error reading books' });
        }
    });

bookRoute
  .route('/:id')
  .get(async (req, res) => {
    try {
      const result = await Book.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Book read successfully',
        result: result
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid book id' });
      }
      res.status(500).json({ success: false, message: 'Error reading book' });
    }
  })
  .put(protect, checkAdmin, async (req, res) => {
    try {
      const result = await Book.findById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        result: result
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid book id' });
      }
      res.status(500).json({ success: false, message: 'Error updating book' });
    }
  })
  .delete(protect, checkAdmin, async (req, res) => {
      try {
        const result = await Book.findByIdAndDelete(req.params.id);
        if (!result) {
          return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            result: result
        });
      } catch (error) {
        if (error.name === 'CastError') {
          return res.status(400).json({ success: false, message: 'Invalid book id' });
        }
        res.status(500).json({ success: false, message: 'Error deleting book' });
      }
  });

export default bookRoute
