import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  contact: {
    reportName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, match: /^\d{10}$/ },
  },
  businessName: { type: String, required: true, trim: true },
  score: { type: Number, min: 0, max: 100, required: true },
  level: { type: String, required: true },
  plan: { type: Number, required: true },
  recommended: { type: [String], default: [] },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.models.BizGrowReport || mongoose.model("BizGrowReport", reportSchema);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/reports", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const { id, contact, businessName, score, level, plan, recommended, answers } = request.body;
    if (!id || !contact?.reportName || !businessName || !/^\S+@\S+\.\S+$/.test(contact.email || "") || !/^\d{10}$/.test(contact.phone || "")) {
      return response.status(400).json({ error: "Valid report contact details are required." });
    }
    const report = await Report.create({ reportId: String(id), contact, businessName, score, level, plan, recommended, answers });
    return response.status(201).json({ id: report.reportId, saved: true });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "This report has already been saved." });
    console.error("Report save failed:", error.message);
    return response.status(500).json({ error: "Unable to save report." });
  }
});

app.get("/api/reports", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const email = String(request.query.email || "").trim().toLowerCase();
    if (!email) return response.status(400).json({ error: "Email is required." });
    const reports = await Report.find({ "contact.email": email }).sort({ createdAt: -1 }).limit(20).lean();
    return response.json(reports);
  } catch (error) {
    console.error("Report lookup failed:", error.message);
    return response.status(500).json({ error: "Unable to load reports." });
  }
});

async function start() {
  if (!mongoUri || mongoUri.includes("<db_password>")) {
    console.warn("MONGODB_URI is missing or still uses <db_password>. API will run, but MongoDB writes are disabled.");
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  }
  app.listen(port, () => console.log(`BizGrow API listening on http://localhost:${port}`));
}

start();
