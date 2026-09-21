const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// TEMPORARY DATA STORAGE
// ==========================================

let items = [
  {
    id: 1,
    name: "Black Wallet",
    type: "Lost",
    location: "Library",
    date: "21 Sep 2026",
    description: "Black leather wallet with college ID.",
  },
  {
    id: 2,
    name: "Blue Water Bottle",
    type: "Found",
    location: "Block A",
    date: "20 Sep 2026",
    description: "Blue Milton bottle found near the staircase.",
  },
];

// Claims are temporarily stored in memory.
// Later, we will move this to MongoDB.
let claims = [];

// ==========================================
// TEST API
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Campus Lost and Found API is running!",
  });
});

// ==========================================
// ADMIN LOGIN
// ==========================================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  const validAdmins = [
    {
      username: process.env.ADMIN1_USERNAME,
      password: process.env.ADMIN1_PASSWORD,
    },
    {
      username: process.env.ADMIN2_USERNAME,
      password: process.env.ADMIN2_PASSWORD,
    },
    {
      username: process.env.ADMIN3_USERNAME,
      password: process.env.ADMIN3_PASSWORD,
    },
  ];

  const admin = validAdmins.find(
    (account) =>
      account.username === username &&
      account.password === password
  );

  if (!admin) {
    return res.status(401).json({
      message: "Invalid username or password.",
    });
  }

  res.json({
    message: "Login successful.",
    username: admin.username,
  });
});

// ==========================================
// ITEM ROUTES
// ==========================================

// GET all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// POST a new item
app.post("/api/items", (req, res) => {
  const {
    name,
    type,
    location,
    date,
    description,
  } = req.body;

  if (!name || !type || !location || !date) {
    return res.status(400).json({
      message: "Please provide all required fields.",
    });
  }

  const newItem = {
    id: Date.now(),
    name,
    type,
    location,
    date,
    description:
      description || "No description provided.",
  };

  items.unshift(newItem);

  res.status(201).json(newItem);
});

// ==========================================
// PUBLIC STATISTICS
// ==========================================

app.get("/api/stats", (req, res) => {
  const lost = items.filter(
    (item) => item.type === "Lost"
  ).length;

  const found = items.filter(
    (item) => item.type === "Found"
  ).length;

  const claimed = claims.filter(
    (claim) => claim.status === "Approved"
  ).length;

  res.json({
    lost,
    found,
    claimed,
    total: items.length,
  });
});

// ==========================================
// CLAIM ROUTES
// ==========================================

// POST a new claim
app.post("/api/claims", (req, res) => {
  const {
    itemId,
    itemName,
    claimantName,
    proof,
  } = req.body;

  if (
    !itemId ||
    !itemName ||
    !claimantName ||
    !proof
  ) {
    return res.status(400).json({
      message: "Please provide all claim details.",
    });
  }

  const newClaim = {
    id: Date.now(),
    itemId,
    itemName,
    claimantName,
    proof,
    status: "Pending",
    rejectionReason: "",
  };

  claims.push(newClaim);

  res.status(201).json(newClaim);
});

// GET all claims
app.get("/api/claims", (req, res) => {
  res.json(claims);
});

// ==========================================
// APPROVE OR REJECT CLAIM
// ==========================================

app.patch("/api/claims/:id", (req, res) => {
  const claimId = Number(req.params.id);

  const {
    status,
    rejectionReason,
  } = req.body;

  const claim = claims.find(
    (item) => item.id === claimId
  );

  if (!claim) {
    return res.status(404).json({
      message: "Claim not found.",
    });
  }

  if (
    status !== "Approved" &&
    status !== "Rejected"
  ) {
    return res.status(400).json({
      message:
        "Status must be Approved or Rejected.",
    });
  }

  if (
    status === "Rejected" &&
    !rejectionReason
  ) {
    return res.status(400).json({
      message:
        "A rejection reason is required.",
    });
  }

  claim.status = status;

  claim.rejectionReason =
    status === "Rejected"
      ? rejectionReason
      : "";

  res.json(claim);
});

// ==========================================
// START SERVER
// ==========================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});