Ah, sharp catch there, Jery — you didn’t use Flask in this version! 🧐

Your **frontend (Next.js + Tailwind)** uploads the CSV to a **Node.js/Express backend** (port `5000`), not Flask. That means we need to fix that part of the README. Here’s your corrected and clean 200-word version 👇

```{"id":"76812","variant":"standard","title":"README for CSV Uploader (Next.js + Node.js)"}
# 📂 CSV Uploader System

A lightweight and modern **CSV Upload and Preview Web Application** built with **Next.js (TypeScript)** and **Tailwind CSS**, connected to a **Node.js + Express backend**. This app allows users to upload CSV files, preview their data before submission, and send them to the backend for storage or processing.

---

## 🚀 Features
- Upload CSV files with instant client-side validation  
- Preview the first 10 rows before uploading  
- Smart CSV parsing — supports quoted values and commas  
- Responsive and elegant UI with Tailwind CSS  
- Live status messages for success or error handling  
- Clean and well-aligned table for data preview  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS  
- **Backend:** Node.js + Express  
- **Communication:** Fetch API (HTTP POST)  

---

## ⚙️ Setup Instructions
1. Clone this repository:  
   `git clone https://github.com/jerinpaul7/Csv-Uploder.git`
2. Install dependencies:  
   `npm install`
3. Run the frontend:  
   `npm run dev`
4. Ensure the backend server runs at `http://localhost:5000`

---

## 📘 Notes
- Supports only `.csv` files for upload.  
- Fully functional demo for CSV import, preview, and upload logic.
```
