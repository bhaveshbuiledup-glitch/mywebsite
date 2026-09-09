import "dotenv/config";
import cors from "cors";
import dns from "node:dns";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import express from "express";
import mongoose from "mongoose";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const scrypt = promisify(scryptCallback);
dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((server) => server.trim()).filter(Boolean));

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
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: "", match: /^(|\d{10})$/ },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.BizGrowUser || mongoose.model("BizGrowUser", userSchema);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = String(storedHash).split(":");
  if (!salt || !key) return false;
  const derivedKey = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected", databaseName: mongoose.connection.name || "" });
});

app.post("/api/auth/register", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const { name, email, password, phone = "" } = request.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || String(password || "").length < 8 || (phone && !/^\d{10}$/.test(phone))) return response.status(400).json({ error: "Valid name, email, password, and phone are required." });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone, passwordHash });
    return response.status(201).json({ user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "An account with this email already exists." });
    console.error("Registration failed:", error.message);
    return response.status(500).json({ error: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const email = String(request.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email }).lean();
    if (!user || !(await verifyPassword(request.body.password || "", user.passwordHash))) return response.status(401).json({ error: "Invalid email/ID or password. Please check your credentials and try again." });
    return response.json({ user: { name: user.name, email: user.email, phone: user.phone || "" } });
  } catch (error) {
    console.error("Login failed:", error.message);
    return response.status(500).json({ error: "Unable to log in." });
  }
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
    for (let attempt = 1; attempt <= 3 && mongoose.connection.readyState !== 1; attempt += 1) {
      try {
        await mongoose.connect(mongoUri, { dbName: "bizgrow", serverSelectionTimeoutMS: 10000, family: 4 });
        console.log(`MongoDB connected to ${mongoose.connection.name}`);
      } catch (error) {
        console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }
  app.listen(port, () => console.log(`BizGrow API listening on http://localhost:${port}`));
}

start();
