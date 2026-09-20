import React, { useEffect, useState } from "react";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PlayerDashboard() {
  const [p, setP] = useState(null);
  const [t, setT] = useState([]);
  const [msg, setMsg] = useState("");
  const [registeredTournaments, setRegisteredTournaments] = useState([]);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // =========================
  // LOAD PLAYER DATA
  // =========================

  useEffect(() => {
    Promise.all([
      API.get("/players/me"),
      API.get("/public/tournaments"),
    ])
      .then(([a, b]) => {
        setP(a.data);
        setT(b.data);

        // Load previously registered tournaments
        const storageKey = `bapd_registered_tournaments_${
          a.data.id
        }`;

        const saved =
          localStorage.getItem(storageKey);

        if (saved) {
          try {
            setRegisteredTournaments(
              JSON.parse(saved)
            );
          } catch (error) {
            console.error(
              "Could not read registered tournaments:",
              error
            );
          }
        }
      })
      .catch((error) => {
        console.error(
          "Could not load player dashboard:",
          error
        );

        setMsg(
          error.response?.data?.message ||
            "Could not load dashboard"
        );
      });
  }, []);

  // =========================
  // TOURNAMENT REGISTRATION
  // =========================

  async function reg(id) {
    // Prevent another click if already registered
    if (registeredTournaments.includes(id)) {
      return;
    }

    try {
      const r = await API.post(
        `/players/tournaments/${id}/register`
      );

      // Add tournament to registered list
      const updatedRegistrations = [
        ...registeredTournaments,
        id,
      ];

      setRegisteredTournaments(
        updatedRegistrations
      );

      // Save registration state for this player
      if (p?.id) {
        localStorage.setItem(
          `bapd_registered_tournaments_${p.id}`,
          JSON.stringify(updatedRegistrations)
        );
      }

      setMsg(
        r.data.message ||
          "Tournament registration successful"
      );
    } catch (e) {
      // If backend says already registered,
      // keep the button disabled.
      if (
        e.response?.status === 409
      ) {
        const updatedRegistrations = [
          ...registeredTournaments,
          id,
        ];

        setRegisteredTournaments(
          updatedRegistrations
        );

        if (p?.id) {
          localStorage.setItem(
            `bapd_registered_tournaments_${p.id}`,
            JSON.stringify(updatedRegistrations)
          );
        }

        setMsg(
          "You are already registered for this tournament."
        );
      } else {
        setMsg(
          e.response?.data?.message ||
            "Registration failed"
        );
      }
    }
  }

  // =========================
  // LOGOUT
  // =========================

  function handleLogout() {
    logout();
    navigate("/");
  }

  // =========================
  // LOADING
  // =========================

  if (!p) {
    return (
      <section className="section page">
        <h1>Player Profile</h1>
        <p>Loading your profile…</p>
      </section>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <section className="section page">

      {/* Dashboard Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <span className="eyebrow blue-text">
            PLAYER PORTAL
          </span>

          <h1>Welcome, {p.full_name}</h1>
        </div>

        <button
          className="btn red"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Player Stats */}
      <div className="stats">

        <div>
          <b>{p.status}</b>
          <span>Approval status</span>
        </div>

        <div>
          <b>{p.ranking_points}</b>
          <span>Ranking points</span>
        </div>

        <div>
          <b>{p.weight_category}</b>
          <span>Weight category</span>
        </div>

      </div>

      {/* Message */}
      {msg && (
        <div className="success">
          {msg}
        </div>
      )}

      {/* Main Dashboard */}
      <div className="grid two">

        {/* My Profile */}
        <article className="card">

          <h2>My Profile</h2>

          <p>
            <b>DOB:</b>{" "}
            {new Date(
              p.dob
            ).toLocaleDateString()}
          </p>

          <p>
            <b>Age group:</b>{" "}
            {p.age_group}
          </p>

          <p>
            <b>Club:</b>{" "}
            {p.club || "—"}
          </p>

          <p>
            <b>Email:</b>{" "}
            {p.email}
          </p>

        </article>

        {/* Tournament Registration */}
        <article className="card">

          <h2>Tournament Registration</h2>

          {t
            .filter(
              (x) => x.status !== "completed"
            )
            .map((x) => {

              const isRegistered =
                registeredTournaments.includes(
                  x.id
                );

              return (
                <div
                  className="list-row"
                  key={x.id}
                >

                  <div>
                    <b>{x.name}</b>

                    <small>
                      {new Date(
                        x.tournament_date
                      ).toLocaleDateString()}{" "}
                      · {x.venue}
                    </small>
                  </div>

                  <button
                    className={
                      isRegistered
                        ? "btn small"
                        : "btn red small"
                    }
                    onClick={() =>
                      reg(x.id)
                    }
                    disabled={isRegistered}
                    style={
                      isRegistered
                        ? {
                            opacity: 0.5,
                            cursor: "not-allowed",
                          }
                        : {}
                    }
                  >
                    {isRegistered
                      ? "Registered ✓"
                      : "Register"}
                  </button>

                </div>
              );
            })}

        </article>

      </div>

    </section>
  );
}
