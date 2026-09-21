import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Student claim form
  const [claimItem, setClaimItem] = useState(null);
  const [claimName, setClaimName] = useState("");
  const [claimMessage, setClaimMessage] = useState("");

  // Admin
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState("");

  // Admin login error
  const [loginError, setLoginError] = useState("");

  // Rejection form
  const [rejectingClaim, setRejectingClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Public statistics
  const [claimedCount, setClaimedCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    type: "Lost",
    location: "",
    date: "",
    description: "",
  });

  // ==========================================
  // LOAD ITEMS
  // ==========================================

  useEffect(() => {
    loadItems();
    loadPublicStats();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/items"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();

      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PUBLIC STATISTICS
  // ==========================================

  const loadPublicStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/stats"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();

      setClaimedCount(data.claimed);
    } catch (error) {
      console.error(
        "Error fetching public statistics:",
        error
      );
    }
  };

  // ==========================================
  // LOAD CLAIMS
  // ==========================================

  const loadClaims = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/claims"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }

      const data = await response.json();

      setClaims(data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };

  // ==========================================
  // FORM HANDLING
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SUBMIT ITEM REPORT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.location || !form.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const newItem = await response.json();

      setItems((currentItems) => [
        newItem,
        ...currentItems,
      ]);

      setForm({
        name: "",
        type: "Lost",
        location: "",
        date: "",
        description: "",
      });

      alert("Item reported successfully!");
    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Unable to submit the report.");
    }
  };

  // ==========================================
  // STUDENT CLAIM
  // ==========================================

  const handleClaim = (item) => {
    setClaimItem(item);
    setClaimName("");
    setClaimMessage("");
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    if (!claimName || !claimMessage) {
      alert("Please fill in all claim details.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/claims",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: claimItem.id,
            itemName: claimItem.name,
            claimantName: claimName,
            proof: claimMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit claim");
      }

      const newClaim = await response.json();

      setClaims((currentClaims) => [
        ...currentClaims,
        newClaim,
      ]);

      alert("Claim submitted successfully!");

      setClaimItem(null);
      setClaimName("");
      setClaimMessage("");
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert("Unable to submit claim.");
    }
  };

  // ==========================================
  // OPEN ADMIN LOGIN
  // ==========================================

  const openAdmin = () => {
    setShowAdmin(true);
    setLoginError("");
  };

  // ==========================================
  // CLOSE ADMIN
  // ==========================================

  const closeAdmin = () => {
    if (!isAdminLoggedIn) {
      setShowAdmin(false);
      setAdminUsername("");
      setAdminPassword("");
      setLoginError("");
    }
  };

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    if (!adminUsername || !adminPassword) {
      setLoginError(
        "Please enter username and password."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: adminUsername,
            password: adminPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoginError(
          data.message || "Invalid login details."
        );
        return;
      }

      setIsAdminLoggedIn(true);
      setLoggedInAdmin(data.username);

      await loadClaims();

      setAdminPassword("");
    } catch (error) {
      console.error("Admin login error:", error);

      setLoginError(
        "Unable to connect to the server."
      );
    }
  };

  // ==========================================
  // ADMIN LOGOUT
  // ==========================================

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setLoggedInAdmin("");
    setAdminUsername("");
    setAdminPassword("");
    setClaims([]);
    setShowAdmin(false);
  };

  // ==========================================
  // APPROVE CLAIM
  // ==========================================

  const handleApprove = async (claimId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/claims/${claimId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Approved",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve claim");
      }

      const updatedClaim = await response.json();

      setClaims((currentClaims) =>
        currentClaims.map((claim) =>
          claim.id === updatedClaim.id
            ? updatedClaim
            : claim
        )
      );

      setClaimedCount((current) => current + 1);

      alert("Claim approved successfully!");
    } catch (error) {
      console.error(
        "Error approving claim:",
        error
      );

      alert("Unable to approve claim.");
    }
  };

  // ==========================================
  // OPEN REJECTION FORM
  // ==========================================

  const handleRejectClick = (claim) => {
    setRejectingClaim(claim);
    setRejectionReason("");
  };

  // ==========================================
  // REJECT CLAIM
  // ==========================================

  const handleRejectSubmit = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/claims/${rejectingClaim.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Rejected",
            rejectionReason:
              rejectionReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject claim");
      }

      const updatedClaim = await response.json();

      setClaims((currentClaims) =>
        currentClaims.map((claim) =>
          claim.id === updatedClaim.id
            ? updatedClaim
            : claim
        )
      );

      alert("Claim rejected.");

      setRejectingClaim(null);
      setRejectionReason("");
    } catch (error) {
      console.error(
        "Error rejecting claim:",
        error
      );

      alert("Unable to reject claim.");
    }
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const lostCount = items.filter(
    (item) => item.type === "Lost"
  ).length;

  const foundCount = items.filter(
    (item) => item.type === "Found"
  ).length;

  const pendingClaims = claims.filter(
    (claim) => claim.status === "Pending"
  );

  const approvedClaims = claims.filter(
    (claim) => claim.status === "Approved"
  );

  const rejectedClaims = claims.filter(
    (claim) => claim.status === "Rejected"
  );

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.location
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      item.type === filter;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="app">

      {/* ================================
          NAVIGATION
      ================================= */}

      <header className="navbar">

        <div className="logo">
          Campus<span>Find</span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#items">Items</a>
          <a href="#report">Report Item</a>

          <button
            className="admin-nav-button"
            onClick={openAdmin}
          >
            🔒 Admin
          </button>
        </nav>

      </header>

      <main>

        {/* ================================
            HERO
        ================================= */}

        <section
          className="hero"
          id="home"
        >

          <div>

            <p className="eyebrow">
              CAMPUS LOST & FOUND SYSTEM
            </p>

            <h1>
              Lost something?
              <br />
              <span>Let's find it.</span>
            </h1>

            <p className="hero-text">
              A simple platform for students to
              report lost and found belongings
              across campus.
            </p>

            <div className="hero-actions">

              <a
                href="#items"
                className="hero-button"
              >
                Explore Items
              </a>

              <a
                href="#report"
                className="hero-secondary-button"
              >
                Report an Item
              </a>

            </div>

          </div>

          <div className="hero-card">

            <div className="hero-icon">
              🔎
            </div>

            <p className="hero-card-label">
              CAMPUS FIND
            </p>

            <h3>
              Find what matters.
            </h3>

            <p>
              Report items, search existing
              reports and help return belongings
              to their owners.
            </p>

          </div>

        </section>

        {/* ================================
            PUBLIC STATISTICS
        ================================= */}

        <section className="stats-section">

          <div className="section-heading stats-heading">

            <p className="eyebrow">
              CAMPUS ACTIVITY
            </p>

            <h2>
              What's happening on campus
            </h2>

            <p>
              A quick look at the lost and found
              activity reported by students.
            </p>

          </div>

          <div className="stats">

            <div className="stat-card">

              <span className="stat-icon">
                🔴
              </span>

              <strong>
                {lostCount}
              </strong>

              <span>
                Lost Items
              </span>

            </div>

            <div className="stat-card">

              <span className="stat-icon">
                🟢
              </span>

              <strong>
                {foundCount}
              </strong>

              <span>
                Found Items
              </span>

            </div>

            <div className="stat-card">

              <span className="stat-icon">
                ✓
              </span>

              <strong>
                {claimedCount}
              </strong>

              <span>
                Items Claimed
              </span>

            </div>

            <div className="stat-card">

              <span className="stat-icon">
                ◉
              </span>

              <strong>
                {items.length}
              </strong>

              <span>
                Total Reports
              </span>

            </div>

          </div>

        </section>

        {/* ================================
            ITEMS
        ================================= */}

        <section
          className="items-section"
          id="items"
        >

          <div className="section-heading">

            <p className="eyebrow">
              SEARCH REPORTS
            </p>

            <h2>
              Lost & Found Items
            </h2>

            <p>
              Search through items reported
              around campus.
            </p>

          </div>

          <div className="search-controls">

            <div className="search-box">

              <span>
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by item name or location..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              <option value="All">
                All Items
              </option>

              <option value="Lost">
                Lost Items
              </option>

              <option value="Found">
                Found Items
              </option>
            </select>

          </div>

          {loading ? (

            <p className="loading-state">
              Loading reports...
            </p>

          ) : filteredItems.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🔎
              </div>

              <h3>
                No matching items found
              </h3>

              <p>
                Try another search or filter.
              </p>

            </div>

          ) : (

            <div className="items-grid">

              {filteredItems.map((item) => (

                <div
                  className="item-card"
                  key={item.id}
                >

                  <div className="item-card-top">

                    <span
                      className={`badge ${item.type.toLowerCase()}`}
                    >
                      {item.type}
                    </span>

                    <span className="item-date">
                      {item.date}
                    </span>

                  </div>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                  <div className="item-info">

                    <span>
                      📍 {item.location}
                    </span>

                  </div>

                  {item.type === "Found" && (

                    <button
                      className="claim-button"
                      onClick={() =>
                        handleClaim(item)
                      }
                    >
                      Claim Item →
                    </button>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ================================
            REPORT ITEM
        ================================= */}

        <section
          className="report-section"
          id="report"
        >

          <div className="form-intro">

            <p className="eyebrow">
              REPORT
            </p>

            <h2>
              Help reunite someone with their item.
            </h2>

            <p>
              Whether you've lost something or
              found something on campus, report it
              here so the right person can find it.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="name">
                  Item Name *
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Black Wallet"
                />

              </div>

              <div className="form-group">

                <label htmlFor="type">
                  Report Type *
                </label>

                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >

                  <option value="Lost">
                    Lost
                  </option>

                  <option value="Found">
                    Found
                  </option>

                </select>

              </div>

            </div>

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="location">
                  Location *
                </label>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Library"
                />

              </div>

              <div className="form-group">

                <label htmlFor="date">
                  Date *
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item..."
                rows="5"
              />

            </div>

            <button
              type="submit"
              className="submit-report-button"
            >
              Submit Report →
            </button>

          </form>

        </section>

      </main>

      {/* ================================
          ADMIN OVERLAY
      ================================= */}

      {showAdmin && (

        <div
          className="admin-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAdmin();
            }
          }}
        >

          <div className="admin-panel">

            {!isAdminLoggedIn ? (

              <div className="admin-login">

                <button
                  className="close-button"
                  onClick={closeAdmin}
                >
                  ×
                </button>

                <div className="admin-login-icon">
                  🔒
                </div>

                <p className="eyebrow">
                  RESTRICTED AREA
                </p>

                <h2>
                  Admin Access
                </h2>

                <p>
                  Authorized administrators can
                  sign in to manage item claims.
                </p>

                <form
                  className="admin-login-form"
                  onSubmit={handleAdminLogin}
                >

                  <div className="form-group">

                    <label htmlFor="adminUsername">
                      Username
                    </label>

                    <input
                      id="adminUsername"
                      type="text"
                      value={adminUsername}
                      onChange={(e) =>
                        setAdminUsername(
                          e.target.value
                        )
                      }
                      placeholder="Enter admin username"
                    />

                  </div>

                  <div className="form-group">

                    <label htmlFor="adminPassword">
                      Password
                    </label>

                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) =>
                        setAdminPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter admin password"
                    />

                  </div>

                  {loginError && (

                    <p className="login-error">
                      {loginError}
                    </p>

                  )}

                  <button
                    type="submit"
                    className="admin-login-button"
                  >
                    Sign In →
                  </button>

                </form>

                <p className="admin-security-note">
                  Authorized personnel only
                </p>

              </div>

            ) : (

              <div className="admin-dashboard">

                <div className="admin-dashboard-header">

                  <div>

                    <p className="eyebrow">
                      ADMINISTRATION
                    </p>

                    <h2>
                      Claim Management
                    </h2>

                    <p>
                      Signed in as{" "}
                      <strong>
                        {loggedInAdmin}
                      </strong>
                    </p>

                  </div>

                  <div className="admin-header-actions">

                    <button
                      className="logout-button"
                      onClick={handleAdminLogout}
                    >
                      Logout
                    </button>

                  </div>

                </div>

                {/* Admin statistics */}

                <div className="admin-summary">

                  <div>
                    <strong>
                      {pendingClaims.length}
                    </strong>

                    <span>
                      Pending
                    </span>
                  </div>

                  <div>
                    <strong>
                      {approvedClaims.length}
                    </strong>

                    <span>
                      Approved
                    </span>
                  </div>

                  <div>
                    <strong>
                      {rejectedClaims.length}
                    </strong>

                    <span>
                      Rejected
                    </span>
                  </div>

                </div>

                {/* Claims */}

                {claims.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-icon">
                      ✓
                    </div>

                    <h3>
                      No claims submitted
                    </h3>

                    <p>
                      Claims will appear here when
                      students submit them.
                    </p>

                  </div>

                ) : (

                  <div className="claims-list">

                    {claims.map((claim) => (

                      <div
                        className="claim-card"
                        key={claim.id}
                      >

                        <div className="claim-card-header">

                          <div>

                            <p className="eyebrow">
                              CLAIM
                            </p>

                            <h3>
                              {claim.itemName}
                            </h3>

                          </div>

                          <span
                            className={`claim-status ${claim.status.toLowerCase()}`}
                          >
                            {claim.status}
                          </span>

                        </div>

                        <div className="claim-details">

                          <p>
                            <strong>
                              Claimant:
                            </strong>{" "}
                            {claim.claimantName}
                          </p>

                          <p>
                            <strong>
                              Proof:
                            </strong>{" "}
                            {claim.proof}
                          </p>

                          {claim.status ===
                            "Rejected" &&
                            claim.rejectionReason && (

                              <p className="rejection-text">

                                <strong>
                                  Rejection Reason:
                                </strong>{" "}

                                {claim.rejectionReason}

                              </p>

                            )}

                        </div>

                        {claim.status ===
                          "Pending" && (

                          <div className="claim-actions">

                            <button
                              className="approve-button"
                              onClick={() =>
                                handleApprove(
                                  claim.id
                                )
                              }
                            >
                              ✓ Approve
                            </button>

                            <button
                              className="reject-button"
                              onClick={() =>
                                handleRejectClick(
                                  claim
                                )
                              }
                            >
                              × Reject
                            </button>

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      )}

      {/* ================================
          STUDENT CLAIM MODAL
      ================================= */}

      {claimItem && (

        <div className="modal-overlay">

          <div className="claim-modal">

            <button
              className="close-button"
              onClick={() =>
                setClaimItem(null)
              }
            >
              ×
            </button>

            <p className="eyebrow">
              CLAIM ITEM
            </p>

            <h2>
              Claim {claimItem.name}
            </h2>

            <p>
              Provide some information that
              helps verify that this item
              belongs to you.
            </p>

            <form
              onSubmit={handleClaimSubmit}
            >

              <div className="form-group">

                <label htmlFor="claimName">
                  Your Name *
                </label>

                <input
                  id="claimName"
                  value={claimName}
                  onChange={(e) =>
                    setClaimName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your name"
                />

              </div>

              <div className="form-group">

                <label htmlFor="claimMessage">
                  Proof / Description *
                </label>

                <textarea
                  id="claimMessage"
                  value={claimMessage}
                  onChange={(e) =>
                    setClaimMessage(
                      e.target.value
                    )
                  }
                  placeholder="Describe something that proves this item belongs to you..."
                  rows="4"
                />

              </div>

              <button type="submit">
                Submit Claim →
              </button>

            </form>

          </div>

        </div>

      )}

      {/* ================================
          REJECTION MODAL
      ================================= */}

      {rejectingClaim && (

        <div className="modal-overlay">

          <div className="claim-modal">

            <button
              className="close-button"
              onClick={() =>
                setRejectingClaim(null)
              }
            >
              ×
            </button>

            <p className="eyebrow">
              REJECT CLAIM
            </p>

            <h2>
              Reject {rejectingClaim.itemName}?
            </h2>

            <p>
              Please provide a reason. This helps
              explain to the claimant why their
              claim was not accepted.
            </p>

            <form
              onSubmit={handleRejectSubmit}
            >

              <div className="form-group">

                <label htmlFor="rejectionReason">
                  Reason for Rejection *
                </label>

                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) =>
                    setRejectionReason(
                      e.target.value
                    )
                  }
                  placeholder="Explain why this claim is being rejected..."
                  rows="5"
                />

              </div>

              <button
                type="submit"
                className="reject-confirm-button"
              >
                Confirm Rejection
              </button>

            </form>

          </div>

        </div>

      )}

      {/* ================================
          FOOTER
      ================================= */}

      <footer>
        <p>
          CampusFind — Campus Lost & Found System
        </p>

        <button
          className="footer-admin-link"
          onClick={openAdmin}
        >
          Admin Access
        </button>
      </footer>

    </div>
  );
}

export default App;