import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// User
import UserDashboard from "./components/user/UserDashboard";
import JoinQueue from "./components/user/JoinQueue";
import QueueStatus from "./components/user/QueueStatus";
import History from "./components/user/History";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import ServiceManagement from "./components/admin/ServiceManagement";
import QueueManagement from "./components/admin/QueueManagement";

function App() {
  // mock auth + role
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("user"); // "user" or "admin"

  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link> |{" "}
            <Link to="/register">Register</Link>
          </>
        )}

        {isAuthenticated && role === "user" && (
          <>
            <Link to="/user">Dashboard</Link> |{" "}
            <Link to="/join">Join Queue</Link> |{" "}
            <Link to="/status">Queue Status</Link> |{" "}
            <Link to="/history">History</Link>
          </>
        )}

        {isAuthenticated && role === "admin" && (
          <>
            <Link to="/admin">Admin Dashboard</Link> |{" "}
            <Link to="/services">Services</Link> |{" "}
            <Link to="/queues">Queue Management</Link>
          </>
        )}

        {isAuthenticated && (
          <button
            style={{ marginLeft: "15px" }}
            onClick={() => setIsAuthenticated(false)}
          >
            Logout
          </button>
        )}
      </nav>

      <Routes>
        {/* Auth */}
        <Route
          path="/login"
          element={<Login onLogin={() => {
            setIsAuthenticated(true);
            setRole("user"); // change to "admin" to test admin UI
          }} />}
        />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/join" element={<JoinQueue />} />
        <Route path="/status" element={<QueueStatus />} />
        <Route path="/history" element={<History />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/queues" element={<QueueManagement />} />

        {/* Default */}
        <Route
          path="*"
          element={<h2 style={{ padding: "20px" }}>Welcome to QueueSmart</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;
