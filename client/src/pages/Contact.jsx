import React, { useState } from "react";
import { API } from "../api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();

    try {
      const r = await API.post("/public/contact", form);

      setMsg(r.data.message);

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (e) {
      setMsg(
        e.response?.data?.message ||
          "Could not send message"
      );
    }
  }

  return (
    <section className="section page">

      <span className="eyebrow red-text">
        GET IN TOUCH
      </span>

      <h1>Contact BAPD</h1>

      <div className="contact-grid">

        {/* CONTACT FORM */}

        <form
          className="card"
          onSubmit={submit}
        >

          <h2>Send Us a Message</h2>

          {msg && (
            <div className="success">
              {msg}
            </div>
          )}

          <label>
            Name

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Email

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Phone

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </label>

          <label>
            Message

            <textarea
              rows="6"
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              required
            />
          </label>

          <button
            className="btn red"
            type="submit"
          >
            Send Message
          </button>

        </form>

        {/* ASSOCIATION INFORMATION */}

        <div className="card">

          <h2>Association Office</h2>

          <p>
            Palghar District, Maharashtra, India
          </p>

          <p>
            Use this section for the official BAPD
            address, phone number and email once
            confirmed.
          </p>

          <div className="map">
            <iframe
              title="Palghar map"
              src="https://www.google.com/maps?q=Palghar%20Maharashtra&output=embed"
              loading="lazy"
            ></iframe>
          </div>

        </div>

      </div>

    </section>
  );
}