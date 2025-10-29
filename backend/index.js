import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const results = [];

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        // Map CSV headers to DB fields
        results.push({
          ItemName: row["ItemName"],
          SKU: row["SKU"],
          Category: row["Category"],
          Unit: row["Unit"],
          CurrentStock: parseFloat(row["Current Stock"]) || 0,
          ReorderLevel: parseFloat(row["Reorder Level"]) || 0,
          Status: row["Status"],
        });
      })
      .on("end", async () => {
        // Insert data into PostgreSQL
        await prisma.stock.createMany({
          data: results,
          skipDuplicates: true, // avoids duplicates if re-uploaded
        });

        fs.unlinkSync(filePath); // delete the CSV after import (optional)
        res.json({ success: true, message: "CSV uploaded and data stored successfully!" });
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
