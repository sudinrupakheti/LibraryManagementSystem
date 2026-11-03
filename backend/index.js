import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import bookRoute from "./src/routes/bookRoutes.js";
import authRoute from "./src/routes/authRoutes.js";
import borrowRoute from "./src/routes/borrowRoutes.js";
import userRoute from "./src/routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));

app.use('/', authRoute)
app.use('/book', bookRoute)
app.use('/borrow', borrowRoute)
app.use('/user', userRoute)

await connectDB();
app.listen(process.env.PORT, () =>
  console.log(`Server on ${process.env.PORT}`),
);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }
  res.status(500).json({ success: false, message: 'Server error' });
});
