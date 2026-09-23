const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Item = require("./models/Item");
const Claim = require("./models/Claim");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

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
// ITEM ROUTES - MONGODB
// ==========================================

// GET all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);

    res.status(500).json({
      message: "Failed to fetch items.",
    });
  }
});

// POST a new item
app.post("/api/items", async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      date,
      description,
    } = req.body;

    if (!name || !type || !location || !date) {
      return res.status(400).json({
        message:
          "Please provide all required fields.",
      });
    }

    const newItem = new Item({
      name,
      type,
      location,
      date,
      description:
        description || "No description provided.",
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error creating item:", error);

    res.status(500).json({
      message: "Failed to create item.",
    });
  }
});

// ==========================================
// CLAIM ROUTES - MONGODB
// ==========================================

// POST a new claim
app.post("/api/claims", async (req, res) => {
  try {
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

    const newClaim = new Claim({
      itemId,
      itemName,
      claimantName,
      proof,
      status: "Pending",
      rejectionReason: "",
    });

    const savedClaim = await newClaim.save();

    res.status(201).json(savedClaim);
  } catch (error) {
    console.error("Error creating claim:", error);

    res.status(500).json({
      message: "Failed to create claim.",
    });
  }
});

// GET all claims
app.get("/api/claims", async (req, res) => {
  try {
    const claims = await Claim.find().sort({
      createdAt: -1,
    });

    res.json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);

    res.status(500).json({
      message: "Failed to fetch claims.",
    });
  }
});

// ==========================================
// APPROVE OR REJECT CLAIM
// ==========================================

app.patch("/api/claims/:id", async (req, res) => {
  try {
    const claimId = req.params.id;

    const {
      status,
      rejectionReason,
    } = req.body;

    const claim = await Claim.findById(claimId);

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

    const updatedClaim = await claim.save();

    res.json(updatedClaim);
  } catch (error) {
    console.error("Error updating claim:", error);

    res.status(500).json({
      message: "Failed to update claim.",
    });
  }
});

// ==========================================
// PUBLIC STATISTICS
// ==========================================

app.get("/api/stats", async (req, res) => {
  try {
    const lost = await Item.countDocuments({
      type: "Lost",
    });

    const found = await Item.countDocuments({
      type: "Found",
    });

    const total = await Item.countDocuments();

    const claimed = await Claim.countDocuments({
      status: "Approved",
    });

    res.json({
      lost,
      found,
      claimed,
      total,
    });
  } catch (error) {
    console.error(
      "Error fetching statistics:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch statistics.",
    });
  }
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