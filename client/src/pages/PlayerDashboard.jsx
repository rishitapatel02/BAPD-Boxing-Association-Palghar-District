import React, { useEffect, useMemo, useState } from "react";
import { API } from "../api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayTournament(achievement) {
  return (
    achievement.tournament_name ||
    achievement.custom_tournament_name ||
    "Not specified"
  );
}

function medalCount(achievements, medal) {
  const target = medal.toLowerCase();

  return achievements.filter((item) => {
    const result = String(
      item.result ??
        item.achievement_result ??
        item.medal ??
        item.placement ??
        ""
    )
      .trim()
      .toLowerCase();

    return result === target || result.includes(target);
  }).length;
}

function displayResult(achievement) {
  const rawResult = String(
    achievement.result ??
      achievement.achievement_result ??
      achievement.medal ??
      achievement.placement ??
      ""
  ).trim();

  if (rawResult) return rawResult;

  const title = String(
    achievement.achievement_title || ""
  ).toLowerCase();

  if (title.includes("gold")) return "Gold";
  if (title.includes("silver")) return "Silver";
  if (title.includes("bronze")) return "Bronze";

  return "—";
}

export default function PlayerDashboard() {
  const [player, setPlayer] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState([]);
  const [registeringTournamentId, setRegisteringTournamentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [aiResponse, setAiResponse] = useState("");
  const [aiAction, setAiAction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  async function loadPlayerDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        playerRes,
        tournamentsRes,
        achievementsRes,
        registrationsRes,
      ] = await Promise.all([
        API.get("/players/me"),
        API.get("/public/tournaments"),
        API.get("/achievements/my"),
        API.get("/players/tournaments/registrations"),
      ]);

      setPlayer(playerRes.data);
      setTournaments(tournamentsRes.data || []);
      setAchievements(achievementsRes.data || []);

      const registeredIds = (
        registrationsRes.data || []
      ).map((item) => Number(item.tournament_id));

      setRegisteredTournamentIds(registeredIds);
    } catch (err) {
      console.error(
        "Player dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not load your player dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayerDashboard();
  }, []);

  async function registerForTournament(tournamentId) {
    if (
      registeredTournamentIds.includes(
        Number(tournamentId)
      )
    ) {
      setMessage(
        "You are already registered for this tournament."
      );
      return;
    }

    setRegisteringTournamentId(
      Number(tournamentId)
    );

    setMessage("");

    try {
      const response = await API.post(
        `/players/tournaments/${tournamentId}/register`
      );

      setRegisteredTournamentIds((current) => [
        ...new Set([
          ...current,
          Number(tournamentId),
        ]),
      ]);

      setMessage(
        response.data.message ||
          "Tournament registration successful"
      );
    } catch (err) {
      const status = err.response?.status;

      if (status === 409) {
        setRegisteredTournamentIds(
          (current) => [
            ...new Set([
              ...current,
              Number(tournamentId),
            ]),
          ]
        );

        setMessage(
          err.response?.data?.message ||
            "You are already registered for this tournament."
        );
      } else {
        setMessage(
          err.response?.data?.message ||
            "Registration failed"
        );
      }
    } finally {
      setRegisteringTournamentId(null);
    }
  }

  const performance = useMemo(() => {
    const totalPoints =
      achievements.reduce(
        (sum, achievement) =>
          sum +
          Number(
            achievement.points_earned || 0
          ),
        0
      );

    return {
      achievementCount:
        achievements.length,

      totalPoints,

      gold: medalCount(
        achievements,
        "Gold"
      ),

      silver: medalCount(
        achievements,
        "Silver"
      ),

      bronze: medalCount(
        achievements,
        "Bronze"
      ),
    };
  }, [achievements]);

  const upcomingTournaments =
    tournaments.filter(
      (tournament) =>
        tournament.status !== "completed"
    );

  // =========================================================
  // AI BOXING ASSISTANT
  // =========================================================

  async function generateAiInsight(action) {
    setAiLoading(true);
    setAiAction(action);
    setAiResponse("");

    try {
      const response = await API.post(
        "/chatbot/player-insights",
        {
          action,
        }
      );

      setAiResponse(
        response.data.reply ||
          "The AI assistant could not generate an insight right now."
      );
    } catch (err) {
      console.error(
        "AI player insight error:",
        err
      );

      setAiResponse(
        err.response?.data?.message ||
          "Unable to generate the AI insight. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="section page">
        <span className="eyebrow blue-text">
          PLAYER PORTAL
        </span>

        <h1>Player Dashboard</h1>

        <p>
          Loading your dashboard…
        </p>
      </section>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <section className="section page">
        <span className="eyebrow red-text">
          PLAYER PORTAL
        </span>

        <h1>Player Dashboard</h1>

        <div className="alert">
          {error}
        </div>

        <button
          className="btn blue"
          onClick={loadPlayerDashboard}
        >
          Try Again
        </button>
      </section>
    );
  }

  // =========================================================
  // NO PLAYER
  // =========================================================

  if (!player) {
    return (
      <section className="section page">
        <span className="eyebrow red-text">
          PLAYER PORTAL
        </span>

        <h1>Player Dashboard</h1>

        <div className="alert">
          Complete your player profile first.
        </div>
      </section>
    );
  }

  // =========================================================
  // MAIN JSX
  // =========================================================

  return (
    <section className="section page">
      <span className="eyebrow blue-text">
        PLAYER PORTAL
      </span>

      <div className="section-title">
        <div>
          <h1>
            Welcome, {player.full_name}
          </h1>

          <p className="lead">
            View your profile, achievements,
            tournament opportunities and
            performance summary in one place.
          </p>
        </div>

        <button
          className="btn blue"
          onClick={loadPlayerDashboard}
        >
          Refresh Dashboard
        </button>
      </div>

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {/* =====================================================
          PERFORMANCE SUMMARY
      ===================================================== */}

      <div className="stats">
        <div>
          <b>
            {player.status || "—"}
          </b>

          <span>
            Approval status
          </span>
        </div>

        <div>
          <b>
            {player.ranking_points ?? 0}
          </b>

          <span>
            Ranking points
          </span>
        </div>

        <div>
          <b>
            {performance.achievementCount}
          </b>

          <span>
            Achievements
          </span>
        </div>

        <div>
          <b>
            {performance.totalPoints}
          </b>

          <span>
            Achievement points
          </span>
        </div>
      </div>

      {/* =====================================================
          MEDAL SUMMARY
      ===================================================== */}

      <div
        className="grid three"
        style={{
          marginBottom: "28px",
        }}
      >
        <div className="card">
          <h3>
            🥇 Gold Medals
          </h3>

          <h2>
            {performance.gold}
          </h2>
        </div>

        <div className="card">
          <h3>
            🥈 Silver Medals
          </h3>

          <h2>
            {performance.silver}
          </h2>
        </div>

        <div className="card">
          <h3>
            🥉 Bronze Medals
          </h3>

          <h2>
            {performance.bronze}
          </h2>
        </div>
      </div>

      {/* =====================================================
          PROFILE + RANKING
      ===================================================== */}

      <div
        className="grid two"
        style={{
          marginBottom: "28px",
        }}
      >
        <article className="card">
          <h2>
            My Profile
          </h2>

          <p>
            <b>Date of Birth:</b>{" "}
            {formatDate(player.dob)}
          </p>

          <p>
            <b>Gender:</b>{" "}
            {player.gender || "—"}
          </p>

          <p>
            <b>Weight Category:</b>{" "}
            {player.weight_category || "—"}
          </p>

          <p>
            <b>Age Group:</b>{" "}
            {player.age_group || "—"}
          </p>

          <p>
            <b>Club:</b>{" "}
            {player.club || "—"}
          </p>

          <p>
            <b>Email:</b>{" "}
            {player.email || "—"}
          </p>
        </article>

        <article className="card">
          <h2>
            Performance Overview
          </h2>

          <p>
            <b>Ranking points:</b>{" "}
            {player.ranking_points ?? 0}
          </p>

          <p>
            <b>Achievement points:</b>{" "}
            {performance.totalPoints}
          </p>

          <p>
            <b>Total medals:</b>{" "}
            {performance.gold +
              performance.silver +
              performance.bronze}
          </p>

          <p>
            <b>Recorded achievements:</b>{" "}
            {performance.achievementCount}
          </p>

          <p className="muted">
            Performance statistics are based
            on the records currently stored
            in the BAPD system.
          </p>
        </article>
      </div>

      {/* =====================================================
          MY ACHIEVEMENTS
      ===================================================== */}

      <div
        className="card"
        style={{
          marginBottom: "28px",
        }}
      >
        <div className="section-title">
          <div>
            <h2>
              My Achievements
            </h2>

            <p className="lead">
              Your recorded boxing achievements
              across different competition
              levels.
            </p>
          </div>
        </div>

        {achievements.length === 0 ? (
          <div className="empty">
            <h3>
              No achievements recorded yet.
            </h3>

            <p>
              Achievements added by the
              BAPD administrator will appear
              here.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Tournament</th>
                  <th>Achievement</th>
                  <th>Type</th>
                  <th>Result</th>
                  <th>Points</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {achievements.map(
                  (achievement) => (
                    <tr
                      key={
                        achievement.id
                      }
                    >
                      <td>
                        <span className="badge">
                          {
                            achievement.achievement_level ||
                            "—"
                          }
                        </span>
                      </td>

                      <td>
                        {displayTournament(
                          achievement
                        )}
                      </td>

                      <td>
                        {
                          achievement.achievement_title ||
                          "—"
                        }
                      </td>

                      <td>
                        {
                          achievement.achievement_type ||
                          "—"
                        }
                      </td>

                      <td>
                        {displayResult(
                          achievement
                        )}
                      </td>

                      <td>
                        {
                          achievement.points_earned ??
                          0
                        }
                      </td>

                      <td>
                        {formatDate(
                          achievement.achievement_date
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          AI BOXING ASSISTANT
      ===================================================== */}

      <div
        className="card"
        style={{
          marginBottom: "28px",
        }}
      >
        <div className="section-title">
          <div>
            <span className="eyebrow blue-text">
              AI POWERED
            </span>

            <h2>
              🤖 AI Boxing Assistant
            </h2>

            <p className="lead">
              Get personalized insights based
              on the player information and
              achievements currently stored
              in the BAPD system.
            </p>
          </div>
        </div>

        <div
          className="grid three"
          style={{
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            className="btn blue"
            onClick={() =>
              generateAiInsight(
                "Analyze my achievements"
              )
            }
            disabled={aiLoading}
          >
            Analyze My Achievements
          </button>

          <button
            type="button"
            className="btn blue"
            onClick={() =>
              generateAiInsight(
                "Suggest my next competition level"
              )
            }
            disabled={aiLoading}
          >
            Suggest My Next Competition Level
          </button>

          <button
            type="button"
            className="btn blue"
            onClick={() =>
              generateAiInsight(
                "Create my boxing development plan"
              )
            }
            disabled={aiLoading}
          >
            Create My Boxing Development Plan
          </button>
        </div>

        {aiLoading && (
          <div className="alert">
            🤖 AI is analyzing your BAPD profile...
          </div>
        )}

        {!aiLoading &&
          aiResponse && (
            <div
              className="card"
              style={{
                background: "#f8fafc",
                marginTop: "16px",
                whiteSpace: "pre-line",
              }}
            >
              <h3>
                {aiAction || "AI Insight"}
              </h3>

              <p>{aiResponse}</p>

              <p
                className="muted"
                style={{
                  marginTop: "14px",
                }}
              >
                AI-generated guidance is for
                informational and development
                purposes. Official BAPD
                requirements and decisions
                should be confirmed with the
                association.
              </p>
            </div>
          )}
      </div>

      {/* =====================================================
          UPCOMING TOURNAMENTS
      ===================================================== */}

      <div className="card">
        <h2>
          Tournament Opportunities
        </h2>

        <p className="lead">
          Browse currently available BAPD
          tournaments and register directly.
        </p>

        {upcomingTournaments.length ===
        0 ? (
          <div className="empty">
            <h3>
              No upcoming tournaments
              available.
            </h3>
          </div>
        ) : (
          upcomingTournaments.map(
            (tournament) => (
              <div
                className="list-row"
                key={tournament.id}
              >
                <div>
                  <b>
                    {tournament.name}
                  </b>

                  <small>
                    {formatDate(
                      tournament.tournament_date
                    )}{" "}
                    ·{" "}
                    {tournament.venue ||
                      "Venue not specified"}
                  </small>
                </div>

                {registeredTournamentIds.includes(
                  Number(tournament.id)
                ) ? (
                  <button
                    type="button"
                    className="btn small"
                    disabled
                    style={{
                      cursor: "default",
                      opacity: 0.75,
                    }}
                  >
                    ✓ Registered
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn red small"
                    onClick={() =>
                      registerForTournament(
                        tournament.id
                      )
                    }
                    disabled={
                      registeringTournamentId ===
                      Number(tournament.id)
                    }
                  >
                    {
                      registeringTournamentId ===
                      Number(tournament.id)
                        ? "Registering..."
                        : "Register"
                    }
                  </button>
                )}
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}