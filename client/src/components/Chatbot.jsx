import React, { useState } from "react";
import { API } from "../api";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I am the BAPD support assistant. Ask me about registration, tournaments, rankings or contact details.",
    },
  ]);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    const q = text.trim();

    setText("");

    setMessages((m) => [
      ...m,
      {
        from: "user",
        text: q,
      },
    ]);

    setLoading(true);

    try {
      const r = await API.post("/chatbot", {
        message: q,
      });

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text:
            r.data.reply ||
            "Sorry, I could not find an answer.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: "Sorry, I could not answer right now. Please use the Contact page.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chatbot">

      {/* CHAT BUTTON */}
      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
        type="button"
      >
        💬
      </button>


      {/* CHAT WINDOW */}
      {open && (
        <div className="chatbox">

          {/* HEADER */}
          <div className="chathead">
            <span>BAPD Support</span>

            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>


          {/* MESSAGES */}
          <div className="chatmessages">

            {messages.map((m, i) => (
              <div
                key={i}
                className={m.from}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="bot">
                Typing…
              </div>
            )}

          </div>


          {/* MESSAGE FORM */}
          <form onSubmit={send}>

            <input
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              placeholder="Ask BAPD…"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
            >
              Send
            </button>

          </form>

        </div>
      )}

    </div>
  );
}
