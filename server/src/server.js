const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary data storage for the demo
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

// Temporary claim storage for the demo
let claims = [];

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Campus Lost and Found API is running!",
  });
});

// GET all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// POST a new item
app.post("/api/items", (req, res) => {
  const { name, type, location, date, description } = req.body;

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
    description: description || "No description provided.",
  };

  items.unshift(newItem);

  res.status(201).json(newItem);
});

// POST a new claim
app.post("/api/claims", (req, res) => {
  const { itemId, itemName, claimantName, proof } = req.body;

  if (!itemId || !itemName || !claimantName || !proof) {
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

// Approve or reject a claim
app.patch("/api/claims/:id", (req, res) => {
  const claimId = Number(req.params.id);
  const { status, rejectionReason } = req.body;

  const claim = claims.find((item) => item.id === claimId);

  if (!claim) {
    return res.status(404).json({
      message: "Claim not found.",
    });
  }

  if (status !== "Approved" && status !== "Rejected") {
    return res.status(400).json({
      message: "Status must be Approved or Rejected.",
    });
  }

  if (status === "Rejected" && !rejectionReason) {
    return res.status(400).json({
      message: "A rejection reason is required.",
    });
  }

  claim.status = status;
  claim.rejectionReason =
    status === "Rejected" ? rejectionReason : "";

  res.json(claim);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});