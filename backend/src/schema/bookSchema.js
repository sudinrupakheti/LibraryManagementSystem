import { Schema, model } from "mongoose";

const bookSchema = Schema(
  {
  title: { type: String, required: [true, "Book title is required."], trim:true },
  author: { type: String, required: [true, "Book author is required."] },
  isbn: { type: String, required: [true, "Book ISBN is required."], unique: true },
  category: { type: String, required: [true, "Book category is required."], enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography'] },
  totalCopies: { type: Number, required: [true, "Total copies of Book is required."], min: [0, "Total copies cannot be negative"] },
  availableCopies: { type: Number, min: [0, "Available copies cannot be negative"] },
  },
  { timestamps: true }
);

let Book = model("Book", bookSchema);

export default Book;
