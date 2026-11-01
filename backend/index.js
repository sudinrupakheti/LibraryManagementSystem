import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is running on port 8000"));

await connectDB();
app.listen(process.env.PORT, () =>
  console.log(`Server on ${process.env.PORT}`),
);
