import "dotenv/config";
import cors from "cors";
import dns from "node:dns";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const scrypt = promisify(scryptCallback);
dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(",").map((server) => server.trim()).filter(Boolean));

app.use(cors());
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  if (!stripe || !stripeWebhookSecret) return response.status(503).send("Payment webhook is not configured.");
  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, request.headers["stripe-signature"], stripeWebhookSecret);
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await Order.findOneAndUpdate({ stripeSessionId: event.data.object.id }, { paymentStatus: "paid", paidAt: new Date() });
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      await Order.findOneAndUpdate({ stripeSessionId: event.data.object.id }, { paymentStatus: "failed" });
    }
    return response.json({ received: true });
  } catch (error) {
    console.error("Payment webhook failed:", error.message);
    return response.status(500).send("Unable to update payment status.");
  }
});
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

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  businessName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.models.BizGrowContact || mongoose.model("BizGrowContact", contactSchema);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: "", match: /^(|\d{10})$/ },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.BizGrowUser || mongoose.model("BizGrowUser", userSchema);

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  items: [{ plan: String, duration: Number, unitPrice: Number, quantity: Number }],
  total: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  stripeSessionId: { type: String, index: true },
  paidAt: Date,
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.models.BizGrowOrder || mongoose.model("BizGrowOrder", orderSchema);

const planCatalog = {
  Monthly: { label: "Monthly", unitPrice: 49, benefits: ["Monthly strategy review", "One priority channel", "Progress dashboard"] },
  "3 Months": { label: "3 Months", unitPrice: 129, benefits: ["Quarterly growth plan", "Two priority channels", "Monthly performance review"] },
  "6 Months": { label: "6 Months", unitPrice: 239, benefits: ["Integrated marketing strategy", "Four priority channels", "Biweekly optimization"] },
  "12 Months": { label: "12 Months", unitPrice: 399, benefits: ["Full-funnel strategy", "Ongoing channel support", "Quarterly planning sessions"] },
};

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
    const { name, email, phone = "" } = request.body;
    const password = String(request.body.password || "");
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || password.length < 8 || !/^\d{10}$/.test(phone)) return response.status(400).json({ error: "Valid name, email, password, and 10-digit phone number are required." });
    const passwordHash = await hashPassword(password);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, phone, passwordHash });
    return response.status(201).json({ user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: "Account already exists. Please login." });
    console.error("Registration failed:", error.message);
    return response.status(500).json({ error: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const email = String(request.body.email || "").trim().toLowerCase();
    const phone = String(request.body.phone || "");
    const password = String(request.body.password || "");
    if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone)) return response.status(400).json({ error: "Enter a valid email and exactly 10-digit phone number." });
    const user = await User.findOne({ email }).lean();
    if (!user || !(await verifyPassword(password, user.passwordHash))) return response.status(401).json({ error: "Invalid email or password. Please check your credentials and try again." });
    await User.updateOne({ _id: user._id }, { $set: { phone } });
    return response.json({ user: { name: user.name, email: user.email, phone } });
  } catch (error) {
    console.error("Login failed:", error.message);
    return response.status(500).json({ error: "Unable to log in." });
  }
});

app.post("/api/orders/checkout", async (request, response) => {
  try {
    if (!stripe) return response.status(503).json({ error: "Online payment is not configured." });
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const email = String(request.body.email || "").trim().toLowerCase();
    const phone = String(request.body.phone || "");
    const requestedItems = Array.isArray(request.body.items) ? request.body.items : [];
    if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(phone) || !requestedItems.length) return response.status(400).json({ error: "A valid email, 10-digit phone number, and cart are required." });
    const items = requestedItems.map((item) => {
      const catalogItem = planCatalog[item.plan];
      const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
      if (!catalogItem) throw new Error("Invalid plan selected.");
      return { plan: item.plan, duration: Number(item.duration), unitPrice: catalogItem.unitPrice, quantity, catalogItem };
    });
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const orderId = randomUUID();
    const order = await Order.create({ orderId, email, phone, items: items.map((item) => ({ plan: item.plan, duration: item.duration, unitPrice: item.unitPrice, quantity: item.quantity })), total });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: items.map((item) => ({ price_data: { currency: "usd", product_data: { name: `BizGrow ${item.plan} plan`, description: item.catalogItem.benefits.join(" | ") }, unit_amount: item.unitPrice * 100 }, quantity: item.quantity })),
      metadata: { orderId },
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/pricing?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/pricing?payment=cancelled`,
    });
    await Order.updateOne({ _id: order._id }, { stripeSessionId: session.id });
    return response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout creation failed:", error.message);
    return response.status(500).json({ error: error.message === "Invalid plan selected." ? error.message : "Unable to start secure checkout." });
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

app.post("/api/contact", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const { fullName, businessName, email, phone, message } = request.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!fullName?.trim() || !businessName?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !/^\d{10}$/.test(phone || "") || !message?.trim()) {
      return response.status(400).json({ error: "Valid name, business, email, 10-digit phone, and message are required." });
    }
    const contact = await Contact.create({ fullName: fullName.trim(), businessName: businessName.trim(), email: normalizedEmail, phone, message: message.trim() });
    return response.status(201).json({ success: true, id: contact._id });
  } catch (error) {
    console.error("Contact save failed:", error.message);
    return response.status(500).json({ error: "Unable to save contact submission." });
  }
});

app.get("/api/contact", async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) return response.status(503).json({ error: "MongoDB is not connected." });
    const email = String(request.query.email || "").trim().toLowerCase();
    const query = email ? { email } : {};
    const contacts = await Contact.find(query).sort({ createdAt: -1 }).limit(50).lean();
    return response.json(contacts);
  } catch (error) {
    console.error("Contact lookup failed:", error.message);
    return response.status(500).json({ error: "Unable to load contacts." });
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
