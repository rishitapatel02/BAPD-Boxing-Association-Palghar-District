import React from "react";
import { useEffect, useState } from "react";
import { API } from "../api";

export function Players() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/public/players").then((r) => setData(r.data));
  }, []);

  return (
    <section className="section page">
      <span className="eyebrow blue-text">ATHLETES</span>
      <h1>Registered Players</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Gender</th>
              <th>Weight</th>
              <th>Age Group</th>
              <th>Club</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name}</td>
                <td>{p.gender}</td>
                <td>{p.weight_category}</td>
                <td>{p.age_group}</td>
                <td>{p.club || "—"}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


export function Tournaments() {
  const [data, setData] = useState([]);
  const [cat, setCat] = useState("");

  useEffect(() => {
    API.get("/public/tournaments", {
      params: { category: cat || undefined },
    }).then((r) => setData(r.data));
  }, [cat]);

  return (
    <section className="section page">
      <span className="eyebrow red-text">COMPETITIONS</span>

      <h1>Tournaments, Schedules & Results</h1>

      <input
        className="filter"
        placeholder="Filter by category"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
      />

      <div className="grid two">
        {data.map((t) => (
          <article className="card" key={t.id}>
            <span className="badge">{t.status}</span>

            <h3>{t.name}</h3>

            <p>
              📅{" "}
              {new Date(t.tournament_date).toLocaleDateString()}
            </p>

            <p>📍 {t.venue}</p>

            <p>{t.category || "All categories"}</p>

            <p>{t.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


/* =========================================================
   PUBLIC MATCHES
   ========================================================= */

export function Matches() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      setLoading(true);

      const response = await API.get("/matches");

      setData(response.data);
    } catch (error) {
      console.error("Could not load matches:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <section className="section page">
      <span className="eyebrow red-text">
        MATCH SCHEDULE
      </span>

      <h1>Matches & Results</h1>

      <p>
        View upcoming and completed boxing matches organized
        by the Boxing Association of Palghar District.
      </p>

      {loading ? (
        <div className="empty">
          Loading matches...
        </div>
      ) : data.length === 0 ? (
        <div className="empty">
          No matches have been scheduled yet.
        </div>
      ) : (
        <div className="grid two">
          {data.map((match) => (
            <article className="card" key={match.id}>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
                <span className="badge">
                  {match.status}
                </span>

                {match.match_no && (
                  <strong>
                    Match #{match.match_no}
                  </strong>
                )}
              </div>

              <h2>
                {match.player_a_name || "Player A"}
                {"  "}
                <span>vs</span>
                {"  "}
                {match.player_b_name || "Player B"}
              </h2>

              <p>
                🥊 <strong>Category:</strong>{" "}
                {match.category || "—"}
              </p>

              <p>
                🏆 <strong>Round:</strong>{" "}
                {match.round_name || "—"}
              </p>

              <p>
                🏟️ <strong>Tournament:</strong>{" "}
                {match.tournament_name || "—"}
              </p>

              <p>
                📅 <strong>Date & Time:</strong>{" "}
                {formatDate(match.scheduled_at)}
              </p>

              <p>
                📍 <strong>Venue:</strong>{" "}
                {match.venue || "Venue not announced"}
              </p>

            </article>
          ))}
        </div>
      )}
    </section>
  );
}


export function Rankings() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/public/rankings").then((r) =>
      setData(r.data)
    );
  }, []);

  return (
    <section className="section page">
      <span className="eyebrow blue-text">
        LEADERBOARD
      </span>

      <h1>Player Rankings</h1>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Weight</th>
              <th>Age Group</th>
              <th>Club</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td>#{r.rank_position}</td>
                <td>{r.full_name}</td>
                <td>{r.weight_category}</td>
                <td>{r.age_group}</td>
                <td>{r.club || "—"}</td>
                <td>
                  <strong>{r.points}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


export function News() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/public/news").then((r) =>
      setData(r.data)
    );
  }, []);

  return (
    <section className="section page">
      <span className="eyebrow red-text">
        BAPD NEWS
      </span>

      <h1>News & Notices</h1>

      <div className="grid two">
        {data.map((n) => (
          <article className="card" key={n.id}>
            <span className="badge">Notice</span>

            <h2>{n.title}</h2>

            <p>{n.content}</p>

            <small>
              {new Date(n.published_at).toLocaleString()}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Gallery() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/public/gallery").then((r) =>
      setData(r.data)
    );
  }, []);

  // Group photos by title
  const albums = Object.values(
    data.reduce((groups, photo) => {
      const title = photo.title || "Untitled Album";

      if (!groups[title]) {
        groups[title] = {
          title,
          caption: photo.caption || "",
          photos: [],
        };
      }

      groups[title].photos.push(photo);

      return groups;
    }, {})
  );

  return (
    <section className="section page">
      <span className="eyebrow blue-text">
        MEMORIES
      </span>

      <h1>Gallery</h1>

      {albums.length ? (
        albums.map((album) => (
          <div
            className="card"
            key={album.title}
            style={{
              marginBottom: "30px",
            }}
          >
            <h2>{album.title}</h2>

            {album.caption && (
              <p className="muted">
                {album.caption}
              </p>
            )}

            <div className="gallery">
              {album.photos.map((photo) => (
                <figure key={photo.id}>
                  <img
                    src={
                      (
                        import.meta.env.VITE_API_URL ||
                        "http://localhost:5000/api"
                      ).replace("/api", "") +
                      photo.image_path
                    }
                    alt={album.title}
                  />

                  {photo.caption && (
                    <figcaption>
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>

            <p className="muted">
              {album.photos.length} photo
              {album.photos.length !== 1
                ? "s"
                : ""}
            </p>
          </div>
        ))
      ) : (
        <div className="empty">
          Gallery photos will appear here when an
          administrator uploads them.
        </div>
      )}
    </section>
  );
}