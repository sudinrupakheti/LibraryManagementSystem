import { model, Schema } from "mongoose";

const borrowSchema = Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: [true, "Book ID is required"] },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: [true, "User ID is required"] },
    borrowDate: { type: Date, default: Date.now },
    returnDate: { type: Date, default: null },
    dueDate: { type: Date, required: [true, "Due date is required."] },
    status: { type: String, enum: ['borrowed', 'returned'], default: 'borrowed' }
  },
  { timestamps: true }
);

const Borrow = model("Borrow", borrowSchema)

export default Borrow;
