import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import bookRoute from "./src/routes/bookRoutes.js";
import authRoute from "./src/routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));

app.use('/book', bookRoute)
app.use('/auth', authRoute)

await connectDB();
app.listen(process.env.PORT, () =>
  console.log(`Server on ${process.env.PORT}`),
);
