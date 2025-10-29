import express, { Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// --- Multer Storage Config ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// --- Route: Upload CSV ---
app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results: any[] = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // Insert rows into DB
        for (const row of results) {
          await prisma.stock.create({
            data: {
              ItemName: row.ItemName,
              SKU: row.SKU,
              Category: row.Category,
              Unit: row.Unit,
              CurrentStock: parseFloat(row.CurrentStock),
              ReorderLevel: parseInt(row.ReorderLevel),
              Status: row.Status,
            },
          });
        }

        res.status(200).json({
          message: "CSV uploaded and data inserted successfully!",
          rowsInserted: results.length,
        });
      } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Database insertion failed" });
      } finally {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
      }
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
