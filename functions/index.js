const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "https://estimates.webefriends.com",
    credentials: true,
  })
);

app.use(express.json());

// Calculate
app.post("/calculate", async (req, res) => {
  return res.json({ ok: true, received: req.body });
});

// Save
app.post("/save", async (req, res) => {
  return res.json({ ok: true });
});

// Load
app.get("/:id", async (req, res) => {
  return res.json({ ok: true, id: req.params.id });
});

// Export
exports.estimatesApi = functions.https.onRequest(app);
