import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import multer from "multer";

import { uploadDocument } from "./controllers/documentController.js";
import { chatWithDocument } from "./controllers/chatController.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "Active",
      db_time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.post("/upload", upload.single("pdf"), uploadDocument);
app.post("/chat", chatWithDocument);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
