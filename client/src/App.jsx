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

  // Admin login
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState("");

  // Admin login error
  const [loginError, setLoginError] = useState("");

  // Rejection form
  const [rejectingClaim, setRejectingClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
    fetch("http://localhost:5000/api/items")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }

        return response.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        setLoading(false);
      });
  }, []);

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

    if (!claimName.trim() || !claimMessage.trim()) {
      alert("Please fill in all claim details.");
      return;
    }

    if (!claimItem || !claimItem._id) {
      alert("Unable to identify this item. Please refresh the page and try again.");
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
            // IMPORTANT:
            // MongoDB uses _id, not id
            itemId: claimItem._id,
            itemName: claimItem.name,
            claimantName: claimName.trim(),
            proof: claimMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Claim API error:", data);

        throw new Error(
          data.message || "Failed to submit claim"
        );
      }

      console.log("Claim submitted:", data);

      setClaims((currentClaims) => [
        ...currentClaims,
        data,
      ]);

      alert("Claim submitted successfully!");

      setClaimItem(null);
      setClaimName("");
      setClaimMessage("");
    } catch (error) {
      console.error("Error submitting claim:", error);

      alert(
        error.message || "Unable to submit claim."
      );
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to approve claim"
        );
      }

      const updatedClaim = data;

      setClaims((currentClaims) =>
        currentClaims.map((claim) =>
          claim._id === updatedClaim._id
            ? updatedClaim
            : claim
        )
      );

      alert("Claim approved successfully!");
    } catch (error) {
      console.error(
        "Error approving claim:",
        error
      );

      alert(
        error.message || "Unable to approve claim."
      );
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

    if (!rejectingClaim || !rejectingClaim._id) {
      alert("Unable to identify this claim.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/claims/${rejectingClaim._id}`,
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to reject claim"
        );
      }

      const updatedClaim = data;

      setClaims((currentClaims) =>
        currentClaims.map((claim) =>
          claim._id === updatedClaim._id
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

      alert(
        error.message || "Unable to reject claim."
      );
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
          <a href="#admin">Admin</a>
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

            <a
              href="#report"
              className="hero-button"
            >
              Report an Item
            </a>

          </div>

          <div className="hero-card">

            <div className="hero-icon">
              🔎
            </div>

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
            STATISTICS
        ================================= */}

        <section className="stats">

          <div>
            <strong>
              {items.length}
            </strong>

            <span>
              Total Reports
            </span>
          </div>

          <div>
            <strong>
              {lostCount}
            </strong>

            <span>
              Lost Items
            </span>
          </div>

          <div>
            <strong>
              {foundCount}
            </strong>

            <span>
              Found Items
            </span>
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

          </div>

          <div className="search-controls">

            <input
              type="text"
              placeholder="Search by item name or location..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

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
            <p>
              Loading reports...
            </p>
          ) : filteredItems.length === 0 ? (

            <div className="empty-state">

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

                  // IMPORTANT:
                  // MongoDB uses _id
                  key={item._id}
                >

                  <div
                    className={`badge ${item.type.toLowerCase()}`}
                  >
                    {item.type}
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

                    <span>
                      📅 {item.date}
                    </span>

                  </div>

                  {item.type === "Found" && (

                    <button
                      className="claim-button"
                      onClick={() =>
                        handleClaim(item)
                      }
                    >
                      Claim Item
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
              Report a Lost or Found Item
            </h2>

            <p>
              Provide the details below so
              other students can identify and
              recover the item.
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

            <button type="submit">
              Submit Report
            </button>

          </form>

        </section>

        {/* ================================
            ADMIN SECTION
        ================================= */}

        <section
          className="admin-section"
          id="admin"
        >

          {!isAdminLoggedIn ? (

            <div className="admin-login">

              <div className="section-heading">

                <p className="eyebrow">
                  ADMINISTRATION
                </p>

                <h2>
                  Admin Login
                </h2>

                <p>
                  Authorized administrators
                  can log in to manage item claims.
                </p>

              </div>

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

                <button type="submit">
                  Login
                </button>

              </form>

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
                    Logged in as{" "}
                    <strong>
                      {loggedInAdmin}
                    </strong>
                  </p>

                </div>

                <button
                  className="logout-button"
                  onClick={handleAdminLogout}
                >
                  Logout
                </button>

              </div>

              {/* Admin statistics */}

              <div className="admin-summary">

                <div>

                  <strong>
                    {pendingClaims.length}
                  </strong>

                  <span>
                    Pending Claims
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

                      // IMPORTANT:
                      // MongoDB claim uses _id
                      key={claim._id}
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
                                claim._id
                              )
                            }
                          >
                            Approve Claim
                          </button>

                          <button
                            className="reject-button"
                            onClick={() =>
                              handleRejectClick(
                                claim
                              )
                            }
                          >
                            Reject Claim
                          </button>

                        </div>

                      )}

                    </div>

                  ))}

                </div>

              )}

            </div>

          )}

        </section>

      </main>

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
                Submit Claim
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
              Please provide a reason.
              This helps explain to the
              claimant why their claim
              was not accepted.
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

      </footer>

    </div>
  );
}

export default App;