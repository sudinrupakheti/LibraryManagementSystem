import { Router } from 'express';
import Book from '../schema/bookSchema.js';

const bookRoute = Router();

bookRoute
    .route('/')
    .post(async (req, res) => {
      try {
        const result = await Book.create(req.body);
        res.status(201).json({
          success: true,
          message: 'Book created successfully',
          result: result
        });
      } catch (error) {
        console.error('Error:', error.message);
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
            console.error('Error:', error.message);
            res.status(500).json({ success: false, message: 'Error reading books' });
        }
    });

bookRoute
  .route('/:id')
  .get(async (req, res) => {
    try {
      const result = await Book.findById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Book read successfully',
        result: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error reading book' });
    }
  })
  .patch(async (req, res) => {
    try {
      const result = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        result: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating book' });
    }
  })
  .delete(async (req, res) => {
      try {
          const result = await Book.findByIdAndDelete(req.params.id);
          res.status(200).json({
              success: true,
              message: 'Book deleted successfully',
              result: result
          });
      } catch (error) {
          res.status(500).json({ success: false, message: 'Error deleting book' });
      }
  });

export default bookRoute
