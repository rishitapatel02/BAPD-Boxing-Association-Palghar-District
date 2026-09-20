import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <div className="app-container">

      {/* Navigation Bar */}
      <nav
        style={{
          background: "#000",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >

        {/* Logo / Brand */}
        <Link
          to="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          🥊 BAPD
        </Link>

        {/* Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >

          <Link to="/" style={navStyle}>
            Home
          </Link>

          <Link to="/about" style={navStyle}>
            About
          </Link>

          <Link to="/players" style={navStyle}>
            Players
          </Link>

          <Link to="/tournaments" style={navStyle}>
            Tournaments
          </Link>

          {/* NEW: MATCHES */}
          <Link to="/matches" style={navStyle}>
            Matches
          </Link>

          <Link to="/rankings" style={navStyle}>
            Rankings
          </Link>

          <Link to="/news" style={navStyle}>
            News
          </Link>

          <Link to="/gallery" style={navStyle}>
            Gallery
          </Link>

          <Link to="/contact" style={navStyle}>
            Contact
          </Link>


          {/* Login / Dashboard */}
          {!user ? (
            <>
              <Link
                to="/login"
                style={{
                  ...navStyle,
                  background: "#174ea6",
                  padding: "8px 14px",
                  borderRadius: "6px",
                }}
              >
                Player Login
              </Link>

              <Link
                to="/register"
                style={{
                  ...navStyle,
                  background: "#d62828",
                  padding: "8px 14px",
                  borderRadius: "6px",
                }}
              >
                Register
              </Link>

              <Link
                to="/admin/login"
                style={navStyle}
              >
                Admin Login
              </Link>
            </>
          ) : (
            <>
              {user.role === "player" && (
                <Link
                  to="/player"
                  style={{
                    ...navStyle,
                    background: "#174ea6",
                    padding: "8px 14px",
                    borderRadius: "6px",
                  }}
                >
                  My Dashboard
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={{
                    ...navStyle,
                    background: "#174ea6",
                    padding: "8px 14px",
                    borderRadius: "6px",
                  }}
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                style={{
                  background: "#d62828",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
            </>
          )}

        </div>
      </nav>

      {/* Page Content */}
      {children}

    </div>
  );
}

const navStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "600",
};

export default Layout;