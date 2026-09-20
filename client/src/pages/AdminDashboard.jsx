import React, { useEffect, useState } from "react";
import { API } from "../api";

export default function AdminDashboard() {
  // =========================================================
  // MAIN STATES
  // =========================================================

  const [tab, setTab] = useState("overview");

  const [overview, setOverview] = useState({});
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [news, setNews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [matches, setMatches] = useState([]);
  const [gallery, setGallery] = useState([]);

  const [galleryForm, setGalleryForm] = useState({
    title: "",
    caption: "",
    images: [],
  });

  const [notice, setNotice] = useState("");

  // =========================================================
  // TOURNAMENT REGISTRATIONS
  // =========================================================

  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [selectedRegistrationTournament, setSelectedRegistrationTournament] =
    useState(null);

  // =========================================================
  // MATCH STATES
  // =========================================================

  const [matchPlayers, setMatchPlayers] = useState([]);
  const [selectedMatchTournament, setSelectedMatchTournament] = useState("");

  const [matchForm, setMatchForm] = useState({
    tournament_id: "",
    category: "",
    player_a_id: "",
    player_b_id: "",
    round_name: "Quarter Final",
    scheduled_at: "",
    venue: "",
    match_no: "",
  });

  // =========================================================
  // RESULT STATES
  // =========================================================

  const [selectedResultMatch, setSelectedResultMatch] = useState(null);

  const [resultForm, setResultForm] = useState({
    winner_player_id: "",
    loser_player_id: "",
    result_type: "Decision",

    round_scores: [
      {
        round: 1,
        player_a: 10,
        player_b: 9,
      },
      {
        round: 2,
        player_a: 10,
        player_b: 9,
      },
      {
        round: 3,
        player_a: 10,
        player_b: 9,
      },
    ],

    notes: "",
  });

  // =========================================================
  // NEWS
  // =========================================================

  const [newsForm, setNewsForm] = useState({
    title: "",
    body: "",
  });

  // =========================================================
  // COACH
  // =========================================================

  const [coachForm, setCoachForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    club: "",
    specialization: "",
  });

  // =========================================================
  // TOURNAMENT
  // =========================================================

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    tournament_date: "",
    registration_last_date: "",
    category: "",
    venue: "",
    description: "",
  });

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  async function loadDashboard() {
    try {
      const [
        overviewRes,
        playersRes,
        tournamentsRes,
        newsRes,
        messagesRes,
      ] = await Promise.all([
        API.get("/admin/overview"),
        API.get("/admin/players"),
        API.get("/admin/tournaments"),
        API.get("/admin/news"),
        API.get("/admin/messages"),
      ]);

      setOverview(overviewRes.data || {});
      setPlayers(playersRes.data || []);
      setTournaments(tournamentsRes.data || []);
      setNews(newsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setNotice(
        error.response?.data?.message ||
          "Could not load dashboard data"
      );
    }
  }

  // =========================================================
  // LOAD COACHES
  // =========================================================

  async function loadCoaches() {
    try {
      const response = await API.get("/coaches");

      setCoaches(response.data || []);
    } catch (error) {
      console.error("Could not load coaches:", error);
    }
  }

  // =========================================================
  // LOAD MATCHES
  // =========================================================

  async function loadMatches() {
    try {
      const response = await API.get("/matches");

      setMatches(response.data || []);
    } catch (error) {
      console.error("Could not load matches:", error);
    }
  }

  // =========================================================
  // LOAD GALLERY
  // =========================================================

  async function loadGallery() {
    try {
      const response = await API.get("/public/gallery");

      setGallery(response.data || []);
    } catch (error) {
      console.error("Could not load gallery:", error);

      setNotice(
        error.response?.data?.message ||
          "Could not load gallery"
      );
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDashboard();
    loadCoaches();
    loadMatches();
    loadGallery();
  }, []);

  // =========================================================
  // PLAYER APPROVE / REJECT
  // =========================================================

  async function updatePlayerStatus(id, status) {
    try {
      await API.patch(`/admin/players/${id}/status`, {
        status,
      });

      setNotice(`Player ${status} successfully`);

      loadDashboard();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not update player status"
      );
    }
  }

  // =========================================================
  // CREATE TOURNAMENT
  // =========================================================

  async function createTournament(e) {
    e.preventDefault();

    if (!tournamentForm.name.trim()) {
      setNotice("Tournament name is required");
      return;
    }

    if (!tournamentForm.tournament_date) {
      setNotice("Tournament date is required");
      return;
    }

    if (!tournamentForm.registration_last_date) {
      setNotice("Registration last date is required");
      return;
    }

    if (!tournamentForm.category.trim()) {
      setNotice("Tournament category is required");
      return;
    }

    if (!tournamentForm.venue.trim()) {
      setNotice("Tournament venue is required");
      return;
    }

    try {
      await API.post(
        "/admin/tournaments",
        tournamentForm
      );

      setNotice(
        "Tournament created successfully"
      );

      setTournamentForm({
        name: "",
        tournament_date: "",
        registration_last_date: "",
        category: "",
        venue: "",
        description: "",
      });

      loadDashboard();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not create tournament"
      );
    }
  }

  // =========================================================
  // VIEW TOURNAMENT REGISTRATIONS
  // =========================================================

  async function viewRegistrations(tournament) {
    try {
      const response = await API.get(
        `/admin/tournaments/${tournament.id}/registrations`
      );

      setRegisteredPlayers(response.data || []);

      setSelectedRegistrationTournament(
        tournament
      );
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not load tournament registrations"
      );
    }
  }

  // =========================================================
  // CREATE NEWS
  // =========================================================

  async function createNews(e) {
    e.preventDefault();

    if (!newsForm.title.trim()) {
      setNotice("News title is required");
      return;
    }

    if (!newsForm.body.trim()) {
      setNotice("News content is required");
      return;
    }

    try {
      await API.post("/admin/news", newsForm);

      setNotice(
        "News / notice published successfully"
      );

      setNewsForm({
        title: "",
        body: "",
      });

      loadDashboard();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not publish news"
      );
    }
  }

  // =========================================================
  // DELETE NEWS
  // =========================================================

  async function deleteNews(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news / notice?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/news/${id}`);

      setNotice("News / notice deleted successfully");

      loadDashboard();
    } catch (error) {
      console.error("Delete news error:", error);

      setNotice(
        error.response?.data?.message ||
          "Could not delete news"
      );
    }
  }

  // =========================================================
  // MARK MESSAGE AS READ
  // =========================================================

  async function markMessageAsRead(id) {
    try {
      await API.patch(`/admin/messages/${id}`, {
        status: "read",
      });

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === id
            ? {
                ...message,
                status: "read",
              }
            : message
        )
      );

      setNotice("Message marked as read");
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not update message"
      );
    }
  }

  // =========================================================
  // ADD COACH
  // =========================================================

  async function addCoach(e) {
    e.preventDefault();

    try {
      await API.post("/coaches", coachForm);

      setNotice("Coach added successfully");

      setCoachForm({
        full_name: "",
        email: "",
        phone: "",
        club: "",
        specialization: "",
      });

      loadCoaches();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not add coach"
      );
    }
  }

  // =========================================================
  // DELETE COACH
  // =========================================================

  async function deleteCoach(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coach?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/coaches/${id}`);

      setNotice("Coach deleted successfully");

      loadCoaches();
    } catch (error) {
      console.error("Delete coach error:", error);

      setNotice(
        error.response?.data?.message ||
          "Could not delete coach"
      );
    }
  }

  // =========================================================
  // GALLERY UPLOAD
  // =========================================================

  async function uploadGalleryImage(e) {
    e.preventDefault();

    if (!galleryForm.title.trim()) {
      setNotice("Gallery title is required");
      return;
    }

    if (
      !galleryForm.images ||
      galleryForm.images.length === 0
    ) {
      setNotice("Please select at least one image");
      return;
    }

    if (galleryForm.images.length > 20) {
      setNotice(
        "You can upload maximum 20 images at once"
      );
      return;
    }

    try {
      setNotice("Uploading images...");

      const formData = new FormData();

      formData.append(
        "title",
        galleryForm.title.trim()
      );

      formData.append(
        "caption",
        galleryForm.caption || ""
      );

      galleryForm.images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await API.post(
        "/admin/gallery",
        formData
      );

      setNotice(
        response.data.message ||
          "Gallery images uploaded successfully"
      );

      setGalleryForm({
        title: "",
        caption: "",
        images: [],
      });

      const input = document.getElementById(
        "gallery-image-input"
      );

      if (input) {
        input.value = "";
      }

      loadGallery();
    } catch (error) {
      console.error(
        "Gallery upload error:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      setNotice(
        error.response?.data?.message ||
          "Could not upload gallery images"
      );
    }
  }

  // =========================================================
  // DELETE GALLERY IMAGE
  // =========================================================

  async function deleteGalleryImage(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/gallery/${id}`);

      setNotice(
        "Gallery image deleted successfully"
      );

      loadGallery();
    } catch (error) {
      console.error(
        "Delete gallery image error:",
        error
      );

      setNotice(
        error.response?.data?.message ||
          "Could not delete gallery image"
      );
    }
  }

  // =========================================================
  // LOAD PLAYERS FOR SELECTED TOURNAMENT
  // =========================================================

  async function loadMatchPlayers(tournamentId) {
    if (!tournamentId) {
      setMatchPlayers([]);
      return;
    }

    try {
      const response = await API.get(
        `/admin/tournaments/${tournamentId}/registrations`
      );

      setMatchPlayers(response.data || []);
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not load tournament players"
      );
    }
  }

  // =========================================================
  // HANDLE TOURNAMENT SELECTION FOR MATCH
  // =========================================================

  function handleMatchTournamentChange(value) {
    setSelectedMatchTournament(value);

    setMatchForm({
      ...matchForm,
      tournament_id: value,
      category: "",
      player_a_id: "",
      player_b_id: "",
    });

    loadMatchPlayers(value);
  }

  // =========================================================
  // SCHEDULE MATCH
  // =========================================================

  async function scheduleMatch(e) {
    e.preventDefault();

    if (
      !matchForm.tournament_id ||
      !matchForm.category ||
      !matchForm.player_a_id ||
      !matchForm.player_b_id ||
      !matchForm.round_name
    ) {
      setNotice(
        "Please fill all required match fields"
      );
      return;
    }

    if (
      Number(matchForm.player_a_id) ===
      Number(matchForm.player_b_id)
    ) {
      setNotice(
        "Player A and Player B must be different"
      );
      return;
    }

    try {
      await API.post("/matches", matchForm);

      setNotice(
        "Match scheduled successfully"
      );

      setMatchForm({
        tournament_id: "",
        category: "",
        player_a_id: "",
        player_b_id: "",
        round_name: "Quarter Final",
        scheduled_at: "",
        venue: "",
        match_no: "",
      });

      setSelectedMatchTournament("");
      setMatchPlayers([]);

      loadMatches();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not schedule match"
      );
    }
  }

  // =========================================================
  // OPEN RESULT FORM
  // =========================================================

  function openResultForm(match) {
    setSelectedResultMatch(match);

    setResultForm({
      winner_player_id: "",
      loser_player_id: "",
      result_type: "Decision",

      round_scores: [
        {
          round: 1,
          player_a: 10,
          player_b: 9,
        },
        {
          round: 2,
          player_a: 10,
          player_b: 9,
        },
        {
          round: 3,
          player_a: 10,
          player_b: 9,
        },
      ],

      notes: "",
    });
  }

  // =========================================================
  // CLOSE RESULT FORM
  // =========================================================

  function closeResultForm() {
    setSelectedResultMatch(null);

    setResultForm({
      winner_player_id: "",
      loser_player_id: "",
      result_type: "Decision",

      round_scores: [
        {
          round: 1,
          player_a: 10,
          player_b: 9,
        },
        {
          round: 2,
          player_a: 10,
          player_b: 9,
        },
        {
          round: 3,
          player_a: 10,
          player_b: 9,
        },
      ],

      notes: "",
    });
  }

  // =========================================================
  // CHANGE ROUND SCORE
  // =========================================================

  function updateRoundScore(
    roundIndex,
    player,
    value
  ) {
    const numericValue =
      value === "" ? "" : Number(value);

    setResultForm((current) => {
      const updatedRounds = [
        ...current.round_scores,
      ];

      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        [player]: numericValue,
      };

      return {
        ...current,
        round_scores: updatedRounds,
      };
    });
  }

  // =========================================================
  // CALCULATE TOTAL SCORES
  // =========================================================

  function getTotalScore(player) {
    return resultForm.round_scores.reduce(
      (total, round) =>
        total + Number(round[player] || 0),
      0
    );
  }

  const playerATotal =
    getTotalScore("player_a");

  const playerBTotal =
    getTotalScore("player_b");

  // =========================================================
  // RECORD RESULT
  // =========================================================

  async function recordResult(e) {
    e.preventDefault();

    if (!selectedResultMatch) {
      return;
    }

    // ---------------------------------------------------------
    // VALIDATE SCORES
    // ---------------------------------------------------------

    for (const round of resultForm.round_scores) {
      const scoreA = Number(round.player_a);
      const scoreB = Number(round.player_b);

      if (
        !Number.isInteger(scoreA) ||
        !Number.isInteger(scoreB)
      ) {
        setNotice(
          `Round ${round.round}: scores must be whole numbers`
        );
        return;
      }

      if (
        scoreA < 7 ||
        scoreA > 10 ||
        scoreB < 7 ||
        scoreB > 10
      ) {
        setNotice(
          `Round ${round.round}: scores must be between 7 and 10`
        );
        return;
      }
    }

    // ---------------------------------------------------------
    // WINNER / LOSER VALIDATION
    // ---------------------------------------------------------

    if (!resultForm.winner_player_id) {
      setNotice("Please select the winner");
      return;
    }

    if (!resultForm.loser_player_id) {
      setNotice("Please select the loser");
      return;
    }

    if (
      Number(resultForm.winner_player_id) ===
      Number(resultForm.loser_player_id)
    ) {
      setNotice(
        "Winner and loser cannot be the same player"
      );
      return;
    }

    // ---------------------------------------------------------
    // DECISION SCORE CHECK
    // ---------------------------------------------------------

    if (
      resultForm.result_type === "Decision"
    ) {
      const winnerIsPlayerA =
        Number(
          resultForm.winner_player_id
        ) ===
        Number(
          selectedResultMatch.player_a_id
        );

      const winnerTotal = winnerIsPlayerA
        ? playerATotal
        : playerBTotal;

      const loserTotal = winnerIsPlayerA
        ? playerBTotal
        : playerATotal;

      if (winnerTotal <= loserTotal) {
        setNotice(
          "For a Decision, the selected winner must have a higher total score."
        );
        return;
      }
    }

    try {
      await API.post(
        `/matches/${selectedResultMatch.id}/result`,
        {
          winner_player_id:
            resultForm.winner_player_id,

          loser_player_id:
            resultForm.loser_player_id,

          result_type:
            resultForm.result_type,

          round_scores:
            resultForm.round_scores,

          points_awarded: 0,

          notes: resultForm.notes,
        }
      );

      setNotice(
        "Match result recorded successfully"
      );

      closeResultForm();

      loadMatches();
    } catch (error) {
      console.error(error);

      setNotice(
        error.response?.data?.message ||
          "Could not record match result"
      );
    }
  }

  // =========================================================
  // NAVIGATION STYLE
  // =========================================================

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "8px",
    marginBottom: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <section className="section page">

      <span className="eyebrow red-text">
        ADMIN PANEL
      </span>

      <h1>BAPD Admin Dashboard</h1>

      {notice && (
        <div
          className="success"
          style={{
            marginBottom: "20px",
            padding: "12px",
          }}
        >
          {notice}
        </div>
      )}

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <button
          style={buttonStyle}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("players")}
        >
          Players
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("tournaments")}
        >
          Tournaments
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("matches")}
        >
          Matches
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("news")}
        >
          News
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("messages")}
        >
          Messages
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("coaches")}
        >
          Coaches
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("rankings")}
        >
          Rankings
        </button>

        <button
          style={buttonStyle}
          onClick={() => setTab("gallery")}
        >
          Gallery
        </button>

        <button
          style={buttonStyle}
          onClick={() => {
            loadDashboard();
            loadCoaches();
            loadMatches();
            loadGallery();

            setNotice(
              "Dashboard refreshed"
            );
          }}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      {tab === "overview" && (
        <div className="grid-3">

          <div className="card">
            <h3>Total Players</h3>
            <h2>{overview.players ?? 0}</h2>
          </div>

          <div className="card">
            <h3>Tournaments</h3>
            <h2>
              {overview.tournaments ?? 0}
            </h2>
          </div>

          <div className="card">
            <h3>Messages</h3>
            <h2>
              {overview.messages ?? 0}
            </h2>
          </div>

        </div>
      )}

      {/* =====================================================
          PLAYERS
      ===================================================== */}

      {tab === "players" && (
        <div className="card">

          <h2>Player Management</h2>

          {players.length === 0 ? (
            <p>No players found.</p>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Weight</th>
                    <th>Club</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {players.map((player) => (
                    <tr key={player.id}>

                      <td>
                        {player.full_name}
                      </td>

                      <td>
                        {player.email}
                      </td>

                      <td>
                        {player.gender}
                      </td>

                      <td>
                        {player.weight_category}
                      </td>

                      <td>
                        {player.club}
                      </td>

                      <td>
                        {player.status}
                      </td>

                      <td>

                        {player.status !==
                          "approved" && (
                          <button
                            onClick={() =>
                              updatePlayerStatus(
                                player.id,
                                "approved"
                              )
                            }
                          >
                            Approve
                          </button>
                        )}

                        {player.status !==
                          "rejected" && (
                          <button
                            onClick={() =>
                              updatePlayerStatus(
                                player.id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}

        </div>
      )}

      {/* =====================================================
          TOURNAMENTS
      ===================================================== */}

      {tab === "tournaments" && (
        <>

          <div className="card">

            <h2>Create Tournament</h2>

            <form
              onSubmit={createTournament}
            >

              <label>
                Tournament Name

                <input
                  value={
                    tournamentForm.name
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Tournament Date

                <input
                  type="date"
                  value={
                    tournamentForm.tournament_date
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      tournament_date:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Registration Last Date

                <input
                  type="date"
                  value={
                    tournamentForm.registration_last_date
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      registration_last_date:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Category

                <input
                  value={
                    tournamentForm.category
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      category:
                        e.target.value,
                    })
                  }
                  placeholder="District Boxing Championship"
                  required
                />
              </label>

              {/* NEW: TOURNAMENT VENUE */}

              <label>
                Venue

                <input
                  value={
                    tournamentForm.venue
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      venue:
                        e.target.value,
                    })
                  }
                  placeholder="Example: Palghar Boxing Hall"
                  required
                />
              </label>

              <label>
                Description

                <textarea
                  rows="5"
                  value={
                    tournamentForm.description
                  }
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      description:
                        e.target.value,
                    })
                  }
                />
              </label>

              <button
                className="btn red"
                type="submit"
              >
                Create Tournament
              </button>

            </form>

          </div>

          <div className="card">

            <h2>Existing Tournaments</h2>

            {tournaments.length === 0 ? (
              <p>
                No tournaments found.
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >

                <table>

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Venue</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {tournaments.map(
                      (tournament) => (
                        <tr
                          key={
                            tournament.id
                          }
                        >

                          <td>
                            {tournament.name}
                          </td>

                          <td>
                            {
                              tournament.tournament_date
                            }
                          </td>

                          <td>
                            {
                              tournament.category
                            }
                          </td>

                          <td>
                            {
                              tournament.venue ||
                              "-"
                            }
                          </td>

                          <td>

                            <button
                              onClick={() =>
                                viewRegistrations(
                                  tournament
                                )
                              }
                            >
                              View Registrations
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* REGISTRATION LIST */}

          {selectedRegistrationTournament && (
            <div className="card">

              <h2>
                Registered Players -{" "}
                {
                  selectedRegistrationTournament.name
                }
              </h2>

              <button
                onClick={() => {
                  setSelectedRegistrationTournament(
                    null
                  );

                  setRegisteredPlayers([]);
                }}
                style={{
                  marginBottom: "15px",
                }}
              >
                Close
              </button>

              {registeredPlayers.length ===
              0 ? (
                <p>
                  No players registered yet.
                </p>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >

                  <table>

                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>DOB</th>
                        <th>Weight</th>
                        <th>Age Group</th>
                        <th>Club</th>
                        <th>Phone</th>
                      </tr>
                    </thead>

                    <tbody>

                      {registeredPlayers.map(
                        (player) => (
                          <tr
                            key={
                              player.registration_id
                            }
                          >

                            <td>
                              {
                                player.full_name
                              }
                            </td>

                            <td>
                              {player.gender}
                            </td>

                            <td>
                              {player.dob}
                            </td>

                            <td>
                              {
                                player.weight_category
                              }
                            </td>

                            <td>
                              {
                                player.age_group
                              }
                            </td>

                            <td>
                              {player.club}
                            </td>

                            <td>
                              {player.phone}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>
          )}

        </>
      )}

      {/* =====================================================
          MATCHES
      ===================================================== */}

      {tab === "matches" && (
        <>

          <div className="card">

            <h2>
              Schedule New Match
            </h2>

            <form
              onSubmit={scheduleMatch}
            >

              <label>
                Tournament

                <select
                  value={
                    selectedMatchTournament
                  }
                  onChange={(e) =>
                    handleMatchTournamentChange(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Tournament
                  </option>

                  {tournaments.map(
                    (tournament) => (
                      <option
                        key={
                          tournament.id
                        }
                        value={
                          tournament.id
                        }
                      >
                        {
                          tournament.name
                        }
                      </option>
                    )
                  )}

                </select>
              </label>

              <label>
                Weight Category

                <input
                  value={
                    matchForm.category
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      category:
                        e.target.value,
                    })
                  }
                  placeholder="Example: 60 KG"
                  required
                />
              </label>

              <label>
                Player A

                <select
                  value={
                    matchForm.player_a_id
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      player_a_id:
                        e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Select Player A
                  </option>

                  {matchPlayers.map(
                    (player) => (
                      <option
                        key={
                          player.player_id
                        }
                        value={
                          player.player_id
                        }
                      >
                        {
                          player.full_name
                        }{" "}
                        -{" "}
                        {
                          player.weight_category
                        }
                      </option>
                    )
                  )}

                </select>
              </label>

              <label>
                Player B

                <select
                  value={
                    matchForm.player_b_id
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      player_b_id:
                        e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Select Player B
                  </option>

                  {matchPlayers.map(
                    (player) => (
                      <option
                        key={
                          player.player_id
                        }
                        value={
                          player.player_id
                        }
                      >
                        {
                          player.full_name
                        }{" "}
                        -{" "}
                        {
                          player.weight_category
                        }
                      </option>
                    )
                  )}

                </select>
              </label>

              <label>
                Round

                <select
                  value={
                    matchForm.round_name
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      round_name:
                        e.target.value,
                    })
                  }
                >

                  <option>
                    Quarter Final
                  </option>

                  <option>
                    Semi Final
                  </option>

                  <option>
                    Final
                  </option>

                  <option>
                    Preliminary
                  </option>

                </select>
              </label>

              <label>
                Match Number

                <input
                  value={
                    matchForm.match_no
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      match_no:
                        e.target.value,
                    })
                  }
                  placeholder="Example: M-001"
                />
              </label>

              <label>
                Date & Time

                <input
                  type="datetime-local"
                  value={
                    matchForm.scheduled_at
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      scheduled_at:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Venue

                <input
                  value={
                    matchForm.venue
                  }
                  onChange={(e) =>
                    setMatchForm({
                      ...matchForm,
                      venue:
                        e.target.value,
                    })
                  }
                  placeholder="Example: Palghar Boxing Hall"
                />
              </label>

              <button
                className="btn red"
                type="submit"
              >
                Schedule Match
              </button>

            </form>

          </div>

          <div className="card">

            <h2>
              Scheduled Matches
            </h2>

            {matches.length === 0 ? (
              <p>
                No matches scheduled yet.
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >

                <table>

                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Players</th>
                      <th>Category</th>
                      <th>Round</th>
                      <th>Tournament</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {matches.map(
                      (match) => (
                        <tr
                          key={match.id}
                        >

                          <td>
                            {
                              match.match_no ||
                              `M-${match.id}`
                            }
                          </td>

                          <td>
                            {
                              match.player_a_name
                            }{" "}
                            vs{" "}
                            {
                              match.player_b_name
                            }
                          </td>

                          <td>
                            {match.category}
                          </td>

                          <td>
                            {
                              match.round_name
                            }
                          </td>

                          <td>
                            {
                              match.tournament_name
                            }
                          </td>

                          <td>
                            {match.scheduled_at
                              ? new Date(
                                  match.scheduled_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
                          </td>

                          <td>
                            {
                              match.venue ||
                              "-"
                            }
                          </td>

                          <td>
                            {match.status}
                          </td>

                          <td>

                            {match.status !==
                              "completed" && (
                              <button
                                onClick={() =>
                                  openResultForm(
                                    match
                                  )
                                }
                              >
                                Record Result
                              </button>
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

          {/* RESULT FORM */}

          {selectedResultMatch && (
            <div className="card">

              <h2>
                Record Match Result
              </h2>

              <p>
                <strong>
                  Match:
                </strong>{" "}
                {
                  selectedResultMatch.player_a_name
                }{" "}
                vs{" "}
                {
                  selectedResultMatch.player_b_name
                }
              </p>

              <p>
                <strong>
                  Category:
                </strong>{" "}
                {
                  selectedResultMatch.category
                }
              </p>

              <p>
                <strong>
                  Round:
                </strong>{" "}
                {
                  selectedResultMatch.round_name
                }
              </p>

              <hr />

              <h3>
                10-Point Must System
              </h3>

              <p>
                Enter the score awarded to each
                boxer for every round.
              </p>

              <p>
                <strong>
                  Allowed score: 7 to 10
                </strong>
              </p>

              {resultForm.round_scores.map(
                (round, index) => (
                  <div
                    key={round.round}
                    className="card"
                    style={{
                      marginTop: "15px",
                      padding: "15px",
                    }}
                  >

                    <h3>
                      Round {round.round}
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "15px",
                      }}
                    >

                      <label>
                        {
                          selectedResultMatch.player_a_name
                        }{" "}
                        Score

                        <input
                          type="number"
                          min="7"
                          max="10"
                          step="1"
                          value={
                            round.player_a
                          }
                          onChange={(e) =>
                            updateRoundScore(
                              index,
                              "player_a",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <label>
                        {
                          selectedResultMatch.player_b_name
                        }{" "}
                        Score

                        <input
                          type="number"
                          min="7"
                          max="10"
                          step="1"
                          value={
                            round.player_b
                          }
                          onChange={(e) =>
                            updateRoundScore(
                              index,
                              "player_b",
                              e.target.value
                            )
                          }
                        />
                      </label>

                    </div>

                    <p>
                      <strong>
                        Round Result:
                      </strong>{" "}

                      {Number(
                        round.player_a
                      ) >
                      Number(
                        round.player_b
                      )
                        ? selectedResultMatch.player_a_name
                        : Number(
                            round.player_b
                          ) >
                          Number(
                            round.player_a
                          )
                        ? selectedResultMatch.player_b_name
                        : "Even Round"}
                    </p>

                  </div>
                )
              )}

              {/* TOTAL */}

              <div
                className="card"
                style={{
                  marginTop: "20px",
                  padding: "20px",
                }}
              >

                <h3>
                  Total Score
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "20px",
                  }}
                >

                  <div>
                    <h4>
                      {
                        selectedResultMatch.player_a_name
                      }
                    </h4>

                    <h2>
                      {playerATotal}
                    </h2>
                  </div>

                  <div>
                    <h4>
                      {
                        selectedResultMatch.player_b_name
                      }
                    </h4>

                    <h2>
                      {playerBTotal}
                    </h2>
                  </div>

                </div>

              </div>

              {/* WINNER */}

              <label>
                Winner

                <select
                  value={
                    resultForm.winner_player_id
                  }
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      winner_player_id:
                        e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Select Winner
                  </option>

                  <option
                    value={
                      selectedResultMatch.player_a_id
                    }
                  >
                    {
                      selectedResultMatch.player_a_name
                    }
                  </option>

                  <option
                    value={
                      selectedResultMatch.player_b_id
                    }
                  >
                    {
                      selectedResultMatch.player_b_name
                    }
                  </option>

                </select>
              </label>

              {/* LOSER */}

              <label>
                Loser

                <select
                  value={
                    resultForm.loser_player_id
                  }
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      loser_player_id:
                        e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Select Loser
                  </option>

                  <option
                    value={
                      selectedResultMatch.player_a_id
                    }
                  >
                    {
                      selectedResultMatch.player_a_name
                    }
                  </option>

                  <option
                    value={
                      selectedResultMatch.player_b_id
                    }
                  >
                    {
                      selectedResultMatch.player_b_name
                    }
                  </option>

                </select>
              </label>

              {/* RESULT TYPE */}

              <label>
                Result Type

                <select
                  value={
                    resultForm.result_type
                  }
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      result_type:
                        e.target.value,
                    })
                  }
                >

                  <option value="Decision">
                    Decision
                  </option>

                  <option value="TKO">
                    TKO
                  </option>

                  <option value="KO">
                    KO
                  </option>

                  <option value="Walkover">
                    Walkover
                  </option>

                </select>
              </label>

              {/* NOTES */}

              <label>
                Notes

                <textarea
                  rows="4"
                  value={
                    resultForm.notes
                  }
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      notes:
                        e.target.value,
                    })
                  }
                  placeholder="Optional match notes"
                />

              </label>

              <div
                style={{
                  marginTop: "20px",
                }}
              >

                <button
                  className="btn red"
                  onClick={recordResult}
                >
                  Save Match Result
                </button>

                <button
                  type="button"
                  onClick={closeResultForm}
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

        </>
      )}

      {/* =====================================================
          NEWS
      ===================================================== */}

      {tab === "news" && (
        <>

          <div className="card">

            <h2>
              Publish News / Notice
            </h2>

            <form
              onSubmit={createNews}
            >

              <label>
                Title

                <input
                  value={
                    newsForm.title
                  }
                  onChange={(e) =>
                    setNewsForm({
                      ...newsForm,
                      title:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Content

                <textarea
                  rows="6"
                  value={
                    newsForm.body
                  }
                  onChange={(e) =>
                    setNewsForm({
                      ...newsForm,
                      body:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <button
                className="btn red"
                type="submit"
              >
                Publish
              </button>

            </form>

          </div>

          <div className="card">

            <h2>
              Published News
            </h2>

            {news.length === 0 ? (
              <p>
                No news available.
              </p>
            ) : (
              news.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    marginBottom:
                      "20px",
                  }}
                >

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.content ||
                      item.body ||
                      "No content"}
                  </p>

                  <button
                    onClick={() =>
                      deleteNews(
                        item.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>
              ))
            )}

          </div>

        </>
      )}

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {tab === "messages" && (
        <div className="card">

          <h2>
            Contact Messages
          </h2>

          {messages.length === 0 ? (
            <p>
              No messages found.
            </p>
          ) : (
            messages.map(
              (message) => (
                <div
                  key={message.id}
                  className="card"
                  style={{
                    marginBottom:
                      "15px",
                  }}
                >

                  <h3>
                    {message.name}
                  </h3>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {message.email}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {message.phone ||
                      "Not provided"}
                  </p>

                  <p>
                    <strong>
                      Message:
                    </strong>{" "}
                    {message.message}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {message.status}
                  </p>

                  {message.status !==
                    "read" && (
                    <button
                      onClick={() =>
                        markMessageAsRead(
                          message.id
                        )
                      }
                    >
                      Mark as Read
                    </button>
                  )}

                </div>
              )
            )
          )}

        </div>
      )}

      {/* =====================================================
          COACHES
      ===================================================== */}

      {tab === "coaches" && (
        <>

          <div className="card">

            <h2>
              Add Coach
            </h2>

            <form
              onSubmit={addCoach}
            >

              <label>
                Full Name

                <input
                  value={
                    coachForm.full_name
                  }
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      full_name:
                        e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={
                    coachForm.email
                  }
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      email:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Phone

                <input
                  value={
                    coachForm.phone
                  }
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      phone:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Club

                <input
                  value={
                    coachForm.club
                  }
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      club:
                        e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Specialization

                <input
                  value={
                    coachForm.specialization
                  }
                  onChange={(e) =>
                    setCoachForm({
                      ...coachForm,
                      specialization:
                        e.target.value,
                    })
                  }
                  placeholder="Boxing Coach"
                />
              </label>

              <button
                className="btn red"
                type="submit"
              >
                Add Coach
              </button>

            </form>

          </div>

          <div className="card">

            <h2>
              Coaches
            </h2>

            {coaches.length === 0 ? (
              <p>
                No coaches found.
              </p>
            ) : (
              <div
                style={{
                  overflowX:
                    "auto",
                }}
              >

                <table>

                  <thead>

                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Club</th>
                      <th>
                        Specialization
                      </th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>

                  </thead>

                  <tbody>

                    {coaches.map(
                      (coach) => (
                        <tr
                          key={
                            coach.id
                          }
                        >

                          <td>
                            {
                              coach.full_name
                            }
                          </td>

                          <td>
                            {coach.email}
                          </td>

                          <td>
                            {coach.phone}
                          </td>

                          <td>
                            {coach.club}
                          </td>

                          <td>
                            {
                              coach.specialization
                            }
                          </td>

                          <td>
                            {coach.status}
                          </td>

                          <td>

                            <button
                              onClick={() =>
                                deleteCoach(
                                  coach.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </>
      )}

      {/* =====================================================
          RANKINGS
      ===================================================== */}

      {tab === "rankings" && (
        <div className="card">

          <h2>
            Ranking Engine
          </h2>

          <p>
            Recalculate player rankings based
            on recorded match results.
          </p>

          <button
            className="btn red"
            onClick={async () => {
              try {
                await API.post(
                  "/admin/rankings/recalculate"
                );

                setNotice(
                  "Rankings recalculated successfully"
                );
              } catch (error) {
                console.error(error);

                setNotice(
                  error.response?.data
                    ?.message ||
                    "Could not recalculate rankings"
                );
              }
            }}
          >
            Recalculate Rankings
          </button>

        </div>
      )}

      {/* =====================================================
          GALLERY
      ===================================================== */}

      {tab === "gallery" && (
        <>

          {/* UPLOAD */}

          <div className="card">

            <h2>
              Upload Gallery Images
            </h2>

            <form
              onSubmit={
                uploadGalleryImage
              }
            >

              <label>
                Image Title

                <input
                  type="text"
                  value={
                    galleryForm.title
                  }
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="Example: District Boxing Championship"
                  required
                />
              </label>

              <label>
                Caption

                <textarea
                  rows="4"
                  value={
                    galleryForm.caption
                  }
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      caption:
                        e.target.value,
                    })
                  }
                  placeholder="Write a short description of the images"
                />
              </label>

              <label>
                Select Images

                <input
                  id="gallery-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      images:
                        Array.from(
                          e.target.files ||
                            []
                        ),
                    })
                  }
                  required
                />
              </label>

              {galleryForm
                .images.length >
                0 && (
                <p className="muted">
                  {
                    galleryForm
                      .images
                      .length
                  }{" "}
                  image(s)
                  selected
                </p>
              )}

              <p className="muted">
                Allowed formats:
                JPG, PNG, WEBP.
                Maximum size:
                100 MB per image.
                Maximum 20 images
                per upload.
              </p>

              <button
                className="btn red"
                type="submit"
              >
                Upload Images
              </button>

            </form>

          </div>

          {/* MANAGEMENT */}

          <div className="card">

            <h2>
              Gallery Management
            </h2>

            {gallery.length ===
            0 ? (
              <p>
                No gallery images
                uploaded yet.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >

                {gallery.map(
                  (photo) => {

                    const imageUrl =
                      (
                        import.meta
                          .env
                          .VITE_API_URL ||
                        "http://localhost:5000/api"
                      ).replace(
                        "/api",
                        ""
                      ) +
                      photo.image_path;

                    return (
                      <div
                        className="card"
                        key={
                          photo.id
                        }
                        style={{
                          padding:
                            "12px",
                        }}
                      >

                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            photo.title
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "180px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "8px",
                            marginBottom:
                              "10px",
                          }}
                        />

                        <h3>
                          {
                            photo.title
                          }
                        </h3>

                        {photo.caption && (
                          <p>
                            {
                              photo.caption
                            }
                          </p>
                        )}

                        <p className="muted">
                          Uploaded:{" "}
                          {photo.uploaded_at
                            ? new Date(
                                photo.uploaded_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>

                        <button
                          onClick={() =>
                            deleteGalleryImage(
                              photo.id
                            )
                          }
                        >
                          Delete Image
                        </button>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </>
      )}

    </section>
  );
}