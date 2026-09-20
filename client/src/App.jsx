import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";
import Chatbot from "./components/Chatbot";

import Home from "./pages/Home";
import About from "./pages/About";

import {
  Players,
  Tournaments,
  Matches,
  Rankings,
  News,
  Gallery,
} from "./pages/PublicList";

import Contact from "./pages/Contact";
import MatchResults from "./pages/MatchResults";

import {
  PlayerLogin,
  AdminLogin,
  Register,
  ForgotPassword,
  ResetPassword,
} from "./pages/AuthPages";

import PlayerDashboard from "./pages/PlayerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./styles.css";

// =====================================================
// ROLE GUARD
// =====================================================

function Guard({ role, children }) {
  const { user } = useAuth();

  // User is not logged in
  if (!user) {
    return (
      <Navigate
        to={
          role === "admin"
            ? "/admin/login"
            : "/login"
        }
        replace
      />
    );
  }

  // Player-only page
  if (role === "player") {
    if (
      user.role !== "player" &&
      user.role !== "PLAYER"
    ) {
      console.log(
        "Player dashboard blocked. User data:",
        user
      );

      return (
        <Navigate
          to="/"
          replace
        />
      );
    }
  }

  // Admin-only page
  if (role === "admin") {
    if (
      user.role !== "admin" &&
      user.role !== "ADMIN"
    ) {
      console.log(
        "Admin dashboard blocked. User data:",
        user
      );

      return (
        <Navigate
          to="/"
          replace
        />
      );
    }
  }

  return children;
}

// =====================================================
// APP
// =====================================================

function App() {
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <BrowserRouter>

      <GoogleOAuthProvider clientId={clientId}>

        <AuthProvider>

          <Layout>

            <Routes>

              {/* ======================================
                  PUBLIC PAGES
              ====================================== */}

              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/players"
                element={<Players />}
              />

              <Route
                path="/tournaments"
                element={<Tournaments />}
              />

              <Route
                path="/matches"
                element={<Matches />}
              />

              <Route
                path="/results"
                element={<MatchResults />}
              />

              <Route
                path="/rankings"
                element={<Rankings />}
              />

              <Route
                path="/news"
                element={<News />}
              />

              <Route
                path="/gallery"
                element={<Gallery />}
              />

              <Route
                path="/contact"
                element={<Contact />}
              />


              {/* ======================================
                  AUTHENTICATION
              ====================================== */}

              <Route
                path="/login"
                element={<PlayerLogin />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              <Route
                path="/admin/login"
                element={<AdminLogin />}
              />


              {/* ======================================
                  PLAYER DASHBOARD
              ====================================== */}

              <Route
                path="/player"
                element={
                  <Guard role="player">
                    <PlayerDashboard />
                  </Guard>
                }
              />


              {/* ======================================
                  ADMIN DASHBOARD
              ====================================== */}

              <Route
                path="/admin"
                element={
                  <Guard role="admin">
                    <AdminDashboard />
                  </Guard>
                }
              />


              {/* ======================================
                  FALLBACK
              ====================================== */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />

            </Routes>


            {/* ========================================
                AI CHATBOT
            ======================================== */}

            <Chatbot />

          </Layout>

        </AuthProvider>

      </GoogleOAuthProvider>

    </BrowserRouter>
  );
}

export default App;
