import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ให้เสิร์ฟไฟล์ในโฟลเดอร์นี้ (index.html, main.js)
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🚀 Dev server running at http://localhost:${PORT}`);
});
