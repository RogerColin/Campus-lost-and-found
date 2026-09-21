import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    type: "Lost",
    location: "",
    date: "",
    description: "",
  });

  // Load items from the Express backend
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

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit a new lost/found report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.location || !form.date) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const newItem = await response.json();

      setItems((currentItems) => [newItem, ...currentItems]);

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

  const lostCount = items.filter((item) => item.type === "Lost").length;
  const foundCount = items.filter((item) => item.type === "Found").length;

  // Search and filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <div className="logo">
          Campus<span>Find</span>
        </div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#items">Items</a>
          <a href="#report">Report Item</a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero" id="home">
          <div>
            <p className="eyebrow">CAMPUS LOST & FOUND SYSTEM</p>

            <h1>
              Lost something?
              <br />
              <span>Let's find it.</span>
            </h1>

            <p className="hero-text">
              A simple platform for students to report lost and found
              belongings across campus.
            </p>

            <a href="#report" className="hero-button">
              Report an Item
            </a>
          </div>

          <div className="hero-card">
            <div className="hero-icon">🔎</div>

            <h3>Find what matters.</h3>

            <p>
              Report items, search existing reports and help return
              belongings to their owners.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="stats">
          <div>
            <strong>{items.length}</strong>
            <span>Total Reports</span>
          </div>

          <div>
            <strong>{lostCount}</strong>
            <span>Lost Items</span>
          </div>

          <div>
            <strong>{foundCount}</strong>
            <span>Found Items</span>
          </div>
        </section>

        {/* Items */}
        <section className="items-section" id="items">
          <div className="section-heading">
            <p className="eyebrow">SEARCH REPORTS</p>
            <h2>Lost & Found Items</h2>
          </div>

          {/* Search and filter controls */}
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search by item name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Items</option>
              <option value="Lost">Lost Items</option>
              <option value="Found">Found Items</option>
            </select>
          </div>

          {loading ? (
            <p>Loading reports...</p>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <h3>No matching items found</h3>
              <p>Try another search or filter.</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div className="item-card" key={item.id}>
                  <div className={`badge ${item.type.toLowerCase()}`}>
                    {item.type}
                  </div>

                  <h3>{item.name}</h3>

                  <p>{item.description}</p>

                  <div className="item-info">
                    <span>📍 {item.location}</span>
                    <span>📅 {item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Report */}
        <section className="report-section" id="report">
          <div className="form-intro">
            <p className="eyebrow">REPORT</p>

            <h2>Report a Lost or Found Item</h2>

            <p>
              Provide the details below so other students can identify and
              recover the item.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Item Name *</label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Black Wallet"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Report Type *</label>

                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location *</label>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Library"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>

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
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item..."
                rows="5"
              />
            </div>

            <button type="submit">Submit Report</button>
          </form>
        </section>
      </main>

      <footer>
        <p>CampusFind — Campus Lost & Found System</p>
      </footer>
    </div>
  );
}

export default App;