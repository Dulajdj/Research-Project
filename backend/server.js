import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";

// Existing Routes
import signupRoute from "./routes/signup/route.js";
import loginRoute from "./routes/login/route.js";
import jobRoute from "./routes/jobs/route.js";
import applicationRoute from "./routes/applications/route.js";
import interviewRoutes from "./routes/interviewRoutes.js";

// NEW: Assessment Routes
import assessmentRoutes from "./routes/assessmentRoutes.js";

import connectDB from "./config/db.js";

// prefer .env.local for development (Next.js convention); fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(cors());
// parse JSON bodies for most endpoints
app.use(express.json());

// multer configuration to handle form-data uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() }); //

// Routes
app.use("/api/interview", interviewRoutes);

// Import legacy API handlers
import {
  handleCheckResumePOST,
  handleParseResumePOST,
  handleGenerateCoverLetterPOST,
  handleGenerateSummaryPOST,
  handleResumeGET,
  handleResumePOST,
  handleResumePUT,
  handleResumeDELETE,
} from "./apiHandlers.js";

// Cover Letter actions
import {
  getCoverLetters,
  getCoverLetter,
  saveCoverLetter,
  deleteCoverLetter,
} from "./actions/cover-letter.js";

// Environment Config
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration to handle form-data uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// --- Route Registration ---

// Modules
app.use("/api/interview", interviewRoutes);
app.use("/api/auth", signupRoute);
app.use("/api/auth", loginRoute);
app.use("/api/jobs", upload.single("file"), jobRoute);
app.use("/api/applications", upload.single("cv"), applicationRoute);

// NEW: Assessment Feature (Quiz generation & Confidence check)
app.use("/api/assessment", assessmentRoutes);

// Helper to adapt Express request to handler format
function makeNextReq(req) {
  return {
    url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    json: () => Promise.resolve(req.body),
    formData: async () => {
      const fd = new Map();
      for (const [k, v] of Object.entries(req.body || {})) {
        fd.set(k, v);
      }
      if (req.file) {
        const f = req.file;
        const buf = f.buffer;
        const ab = buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        );
        fd.set("file", {
          arrayBuffer: async () => ab,
          type: f.mimetype,
          name: f.originalname,
        });
      }
      return fd;
    },
  };
}

// --- Legacy & Specific Endpoints ---

app.get("/", (req, res) =>
  res.json({ status: "success", message: "Server is running" }),
);

// Health check verified by DB connectivity
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

app.post("/api/check-resume", upload.single("file"), async (req, res) => {
  const result = await handleCheckResumePOST(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

app.post("/api/parse-resume", upload.single("file"), async (req, res) => {
  const result = await handleParseResumePOST(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

app.post("/api/generate-cover-letter", async (req, res) => {
  const result = await handleGenerateCoverLetterPOST(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

app.post("/api/generate-summary", async (req, res) => {
  const result = await handleGenerateSummaryPOST(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

// Resume CRUD
app.get("/api/resume", async (req, res) => {
  const result = await handleResumeGET(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

app.post("/api/resume", async (req, res) => {
  const result = await handleResumePOST(makeNextReq(req));
  res.status(result.status || 201).json(result.body);
});

app.put("/api/resume", async (req, res) => {
  const result = await handleResumePUT(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

app.delete("/api/resume", async (req, res) => {
  const result = await handleResumeDELETE(makeNextReq(req));
  res.status(result.status || 200).json(result.body);
});

// Cover Letter actions
app.get("/api/cover-letter", async (req, res) => {
  const { id } = req.query;
  try {
    if (id) return res.json(await getCoverLetter(id));
    const data = await getCoverLetters();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cover-letter", async (req, res) => {
  try {
    const { id, content } = req.body;
    const r = await saveCoverLetter(id, content);
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/cover-letter", async (req, res) => {
  try {
    const { id } = req.query;
    await deleteCoverLetter(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server Start
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection failed:", err));
