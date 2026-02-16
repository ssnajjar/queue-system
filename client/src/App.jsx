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
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-indigo-600">QueueSmart</h1>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-4">
                {!isAuthenticated && (
                  <>
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Register
                    </Link>
                  </>
                )}

                {isAuthenticated && role === "user" && (
                  <>
                    <Link 
                      to="/user" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/join" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Join Queue
                    </Link>
                    <Link 
                      to="/status" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Queue Status
                    </Link>
                    <Link 
                      to="/history" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      History
                    </Link>
                  </>
                )}

                {isAuthenticated && role === "admin" && (
                  <>
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      to="/services" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Services
                    </Link>
                    <Link 
                      to="/queues" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Queue Management
                    </Link>
                  </>
                )}

                {isAuthenticated && (
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="ml-4 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
              element={
                <div className="text-center py-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to QueueSmart</h2>
                  <p className="text-lg text-gray-600">Your intelligent queue management system</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;