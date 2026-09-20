import React, { useEffect, useState } from "react";
import { API } from "../api";

export default function MatchResults() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      setLoading(true);

      const response = await API.get("/matches");

      const completedMatches = (response.data || []).filter(
        (match) =>
          match.status === "completed" ||
          match.result_id
      );

      setMatches(completedMatches);
    } catch (err) {
      console.error("Failed to load match results:", err);

      setError(
        err.response?.data?.message ||
          "Could not load match results."
      );
    } finally {
      setLoading(false);
    }
  }

  function getPlayerName(match, side) {
    if (side === "winner") {
      return (
        match.winner_name ||
        match.winner_full_name ||
        match.player_a_name ||
        "Player"
      );
    }

    return (
      match.loser_name ||
      match.loser_full_name ||
      match.player_b_name ||
      "Player"
    );
  }

  function getScore(roundScores, player) {
    if (!roundScores) return [];

    return roundScores.map((round) => {
      if (player === "winner") {
        return round.player_a;
      }

      return round.player_b;
    });
  }

  return (
    <section className="section page">
      <span className="eyebrow red-text">
        BAPD COMPETITION
      </span>

      <h1>Match Results</h1>

      <p className="muted">
        View completed boxing matches, winners,
        results and round scores.
      </p>

      {loading && (
        <div className="card">
          <p>Loading match results...</p>
        </div>
      )}

      {error && (
        <div className="card">
          <p className="error">{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="card">
          <h2>No Match Results Yet</h2>
          <p className="muted">
            Completed match results will appear here
            once they are recorded by the administrator.
          </p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="results-list">
          {matches.map((match) => {
            const result = match.result || {};

            let roundScores = result.round_scores;

            if (typeof roundScores === "string") {
              try {
                roundScores = JSON.parse(roundScores);
              } catch {
                roundScores = [];
              }
            }

            const winner =
              result.winner_name ||
              match.winner_name ||
              getPlayerName(match, "winner");

            const loser =
              result.loser_name ||
              match.loser_name ||
              getPlayerName(match, "loser");

            const winnerScores = getScore(
              roundScores,
              "winner"
            );

            const loserScores = getScore(
              roundScores,
              "loser"
            );

            return (
              <div
                className="card result-card"
                key={match.id}
              >
                <div className="result-header">
                  <div>
                    <span className="eyebrow">
                      MATCH #{match.match_no || match.id}
                    </span>

                    <h2>
                      {match.tournament_name ||
                        "BAPD Boxing Match"}
                    </h2>
                  </div>

                  <span className="status completed">
                    COMPLETED
                  </span>
                </div>

                <div className="result-info">
                  <span>
                    <strong>Category:</strong>{" "}
                    {match.category || "N/A"}
                  </span>

                  <span>
                    <strong>Round:</strong>{" "}
                    {match.round_name || "N/A"}
                  </span>

                  {match.venue && (
                    <span>
                      <strong>Venue:</strong>{" "}
                      {match.venue}
                    </span>
                  )}
                </div>

                <div className="fighters">
                  <div className="fighter winner">
                    <span className="winner-label">
                      WINNER
                    </span>

                    <h3>{winner}</h3>

                    {winnerScores.length > 0 && (
                      <div className="score">
                        {winnerScores.map(
                          (score, index) => (
                            <span key={index}>
                              R{index + 1}: {score}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div className="vs">
                    VS
                  </div>

                  <div className="fighter loser">
                    <span className="loser-label">
                      OPPONENT
                    </span>

                    <h3>{loser}</h3>

                    {loserScores.length > 0 && (
                      <div className="score">
                        {loserScores.map(
                          (score, index) => (
                            <span key={index}>
                              R{index + 1}: {score}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="result-footer">
                  <span>
                    <strong>Result:</strong>{" "}
                    {result.result_type ||
                      match.result_type ||
                      "Decision"}
                  </span>

                  {result.points_awarded !== undefined && (
                    <span>
                      <strong>Points:</strong>{" "}
                      {result.points_awarded}
                    </span>
                  )}
                </div>

                {result.notes && (
                  <div className="result-notes">
                    <strong>Notes:</strong>{" "}
                    {result.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}