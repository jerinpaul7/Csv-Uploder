import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------
// 📁 Ensure uploads directory exists
// ------------------------------------------------------------
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------------------------
// ⚙️ Multer configuration - accept only CSV files
// ------------------------------------------------------------
const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  }),
  fileFilter: (_, file, cb) => {
    const isCSV =
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!isCSV) return cb(new Error("Only CSV files are allowed."));
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max file size
});

// ------------------------------------------------------------
// 📊 CSV Parsing Helper
// ------------------------------------------------------------
const parseCSV = (filePath: string): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const results: Record<string, string>[] = [];
    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header ? header.trim().replace(/\uFEFF/g, "") : header,
        })
      )
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

// ------------------------------------------------------------
// 🚀 Upload & Process CSV Route
// ------------------------------------------------------------
app.post(
  "/upload",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    const filePath = req.file?.path;
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const data = await parseCSV(filePath!);
      if (!data.length) {
        fs.unlinkSync(filePath!);
        res.status(400).json({ error: "CSV is empty." });
        return;
      }

      const requiredColumns = [
        "ItemName",
        "SKU",
        "Category",
        "Unit",
        "CurrentStock",
        "ReorderLevel",
        "Status",
      ];

      const normalizedHeaders = Object.keys(data[0]).map((h) =>
        h.toLowerCase().replace(/\s+/g, "")
      );

      const missing = requiredColumns.filter(
        (col) => !normalizedHeaders.includes(col.toLowerCase())
      );

      if (missing.length > 0) {
        fs.unlinkSync(filePath!);
        res
          .status(400)
          .json({ error: `Missing columns: ${missing.join(", ")}` });
        return;
      }

      const validRecords = data
        .map((row) => ({
          ItemName: String(row.ItemName || row["Item Name"] || "").trim(),
          SKU: String(row.SKU || "").trim(),
          Category: String(row.Category || "").trim(),
          Unit: String(row.Unit || "").trim(),
          CurrentStock:
            parseFloat(row.CurrentStock || row["Current Stock"] || "0") || 0,
          ReorderLevel:
            parseFloat(row.ReorderLevel || row["Reorder Level"] || "0") || 0,
          Status: String(row.Status || "").trim(),
        }))
        .filter(
          (r) =>
            r.ItemName &&
            r.SKU &&
            r.Category &&
            r.Unit &&
            !isNaN(r.CurrentStock) &&
            !isNaN(r.ReorderLevel) &&
            r.Status
        );

      if (!validRecords.length) {
        fs.unlinkSync(filePath!);
        res.status(400).json({ error: "No valid rows found in CSV." });
        return;
      }

      // 🔥 UPSERT (update if SKU exists, else create)
      let upserted = 0;
      for (const record of validRecords) {
        await prisma.stock.upsert({
          where: { SKU: record.SKU },
          update: {
            ItemName: record.ItemName,
            Category: record.Category,
            Unit: record.Unit,
            CurrentStock: record.CurrentStock,
            ReorderLevel: record.ReorderLevel,
            Status: record.Status,
          },
          create: record,
        });
        upserted++;
      }

      fs.unlinkSync(filePath!);

      res.json({
        message: "CSV processed successfully (duplicates updated).",
        count: upserted,
      });
    } catch (error: any) {
      console.error("Error processing CSV:", error);
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res
        .status(500)
        .json({ error: error.message || "Internal server error." });
    }
  }
);

// ------------------------------------------------------------
// 🌐 Health Check Route
// ------------------------------------------------------------
app.get("/", (_req: Request, res: Response) => {
  res.send("Server is running and ready to accept CSV uploads.");
});

// ------------------------------------------------------------
// 🟢 Start Server
// ------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
