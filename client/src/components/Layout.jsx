import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bapdLogo from "../assets/bapd-logo.jpeg";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="app-container">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="nav">

        {/* LOGO */}
        <Link
          to="/"
          className="brand"
          onClick={closeMobileMenu}
        >
          <img
            src={bapdLogo}
            alt="BAPD Logo"
          />

          <span>BAPD</span>
        </Link>


        {/* ===================================================
            DESKTOP / LAPTOP NAVBAR
        =================================================== */}

        <div className="desktop-nav">

          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/about" className="nav-link">
            About
          </Link>

          <Link to="/players" className="nav-link">
            Players
          </Link>

          <Link to="/tournaments" className="nav-link">
            Tournaments
          </Link>

          <Link to="/matches" className="nav-link">
            Matches
          </Link>

          <Link to="/rankings" className="nav-link">
            Rankings
          </Link>

          <Link to="/news" className="nav-link">
            News
          </Link>

          <Link to="/gallery" className="nav-link">
            Gallery
          </Link>

          <Link to="/contact" className="nav-link">
            Contact
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="nav-action nav-login"
              >
                Player Login
              </Link>

              <Link
                to="/register"
                className="nav-action nav-register"
              >
                Register
              </Link>

              <Link
                to="/admin/login"
                className="nav-link"
              >
                Admin Login
              </Link>
            </>
          ) : (
            <>
              {user.role === "player" && (
                <Link
                  to="/player"
                  className="nav-action nav-login"
                >
                  My Dashboard
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="nav-action nav-login"
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="nav-action nav-register"
              >
                Logout
              </button>
            </>
          )}

        </div>


        {/* ===================================================
            MOBILE NAVBAR
        =================================================== */}

        <div className="mobile-nav-area">

          {/* ONLY 3 MAIN LINKS */}
          <div className="mobile-main-links">

            <Link
              to="/"
              className="mobile-main-link"
              onClick={closeMobileMenu}
            >
              Home
            </Link>

            <Link
              to="/about"
              className="mobile-main-link"
              onClick={closeMobileMenu}
            >
              About
            </Link>

            <Link
              to="/gallery"
              className="mobile-main-link"
              onClick={closeMobileMenu}
            >
              Gallery
            </Link>

            {/* ARROW */}
            <button
              type="button"
              className="mobile-more-button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              aria-expanded={mobileMenuOpen}
              aria-label="More navigation"
            >
              {mobileMenuOpen ? "▼" : "▶"}
            </button>

          </div>


          {/* =================================================
              MOBILE DROPDOWN
          ================================================= */}

          {mobileMenuOpen && (
            <div className="mobile-dropdown">

              <Link
                to="/players"
                onClick={closeMobileMenu}
              >
                Players
              </Link>

              <Link
                to="/tournaments"
                onClick={closeMobileMenu}
              >
                Tournaments
              </Link>

              <Link
                to="/matches"
                onClick={closeMobileMenu}
              >
                Matches
              </Link>

              <Link
                to="/rankings"
                onClick={closeMobileMenu}
              >
                Rankings
              </Link>

              <Link
                to="/news"
                onClick={closeMobileMenu}
              >
                News
              </Link>

              <Link
                to="/contact"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="mobile-dropdown-blue"
                    onClick={closeMobileMenu}
                  >
                    Player Login
                  </Link>

                  <Link
                    to="/register"
                    className="mobile-dropdown-red"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>

                  <Link
                    to="/admin/login"
                    onClick={closeMobileMenu}
                  >
                    Admin Login
                  </Link>
                </>
              ) : (
                <>
                  {user.role === "player" && (
                    <Link
                      to="/player"
                      className="mobile-dropdown-blue"
                      onClick={closeMobileMenu}
                    >
                      My Dashboard
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="mobile-dropdown-blue"
                      onClick={closeMobileMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    className="mobile-dropdown-red"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}

            </div>
          )}

        </div>

      </nav>


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      {children}

    </div>
  );
}

export default Layout;