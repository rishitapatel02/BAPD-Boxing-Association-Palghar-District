import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API } from "../api";
import { useAuth } from "../context/AuthContext";

// =====================================================
// PLAYER LOGIN
// =====================================================

export function PlayerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post(
        "/auth/player/login",
        {
          email,
          password,
        }
      );

      login(response.data);

      nav("/player");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    }
  }

  return (
    <section className="auth page">
      <div className="auth-card">

        <span className="eyebrow blue-text">
          PLAYER PORTAL
        </span>

        <h1>Player Login</h1>

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </label>

          <button
            type="submit"
            className="btn blue"
          >
            Sign In
          </button>

        </form>

        {/* FORGOT PASSWORD */}

        <p>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p>
          New player?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

        <p>
          <Link to="/admin/login">
            Administrator Login →
          </Link>
        </p>

      </div>
    </section>
  );
}


// =====================================================
// ADMIN LOGIN
// =====================================================

export function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [error, setError] = useState("");

  async function google(credential) {
    try {
      const response = await API.post(
        "/auth/admin/google",
        {
          credential,
        }
      );

      login(response.data);

      nav("/admin");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Administrator sign-in failed."
      );
    }
  }

  return (
    <section className="auth dark page">

      <div className="auth-card admin-auth">

        <span className="eyebrow red-text">
          SECURE ADMIN ACCESS
        </span>

        <h1>Administrator Login</h1>

        <p>
          Sign in with an approved BAPD Google account.
        </p>

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        <GoogleLogin
          onSuccess={(response) =>
            google(response.credential)
          }
          onError={() =>
            setError(
              "Google Sign-In was not completed."
            )
          }
          useOneTap={false}
        />

        <small>
          Only Google emails configured in the BAPD
          administrator allow-list can enter the dashboard.
        </small>

      </div>

    </section>
  );
}


// =====================================================
// PLAYER REGISTRATION
// =====================================================

export function Register() {
  const [step, setStep] = useState(1);

  const [account, setAccount] = useState({
    email: "",
    password: "",
  });

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    gender: "Male",
    weight_category: "",
    age_group: "",
    club: "",
    phone: "",
    address: "",
  });

  const [files, setFiles] = useState({
    photo: null,
    age_proof: null,
  });

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const nav = useNavigate();

  // ===================================================
  // STEP 1 - CREATE ACCOUNT
  // ===================================================

  async function createAccount(e) {
    e.preventDefault();

    setMsg("");
    setError("");

    try {
      const registerResponse = await API.post(
        "/auth/player/register",
        account
      );

      const loginResponse = await API.post(
        "/auth/player/login",
        account
      );

      login(loginResponse.data);

      setMsg(
        registerResponse.data.message ||
          "Account created successfully!"
      );

      setStep(2);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not create account."
      );
    }
  }

  // ===================================================
  // STEP 2 - SAVE PLAYER PROFILE
  // ===================================================

  async function profile(e) {
    e.preventDefault();

    setMsg("");
    setError("");

    const formData = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        formData.append(key, value);
      }
    );

    if (files.photo) {
      formData.append(
        "photo",
        files.photo
      );
    }

    if (files.age_proof) {
      formData.append(
        "age_proof",
        files.age_proof
      );
    }

    try {
      const response = await API.post(
        "/players/profile",
        formData
      );

      setMsg(
        response.data.message ||
          "Player profile submitted successfully for approval!"
      );

      setTimeout(() => {
        nav("/player");
      }, 2000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not save player profile."
      );
    }
  }

  return (
    <section className="auth page">

      <div className="auth-card wide">

        <span className="eyebrow blue-text">
          PLAYER REGISTRATION
        </span>

        <h1>
          {step === 1
            ? "Create Account"
            : "Complete Player Profile"}
        </h1>

        {msg && (
          <div className="alert">
            {msg}
          </div>
        )}

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        {/* =========================================
            STEP 1
        ========================================= */}

        {step === 1 && (
          <form onSubmit={createAccount}>

            <label>
              Email

              <input
                type="email"
                value={account.email}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    email: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Password

              <input
                type="password"
                minLength="8"
                value={account.password}
                onChange={(e) =>
                  setAccount({
                    ...account,
                    password: e.target.value,
                  })
                }
                required
              />

              <small>
                Use at least 8 characters.
              </small>

            </label>

            <button
              type="submit"
              className="btn blue"
            >
              Create Account
            </button>

          </form>
        )}

        {/* =========================================
            STEP 2
        ========================================= */}

        {step === 2 && (
          <form
            onSubmit={profile}
            className="form-grid"
          >

            <label>
              Full Name

              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Date of Birth

              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dob: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Weight Category

              <input
                type="text"
                value={form.weight_category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    weight_category: e.target.value,
                  })
                }
                placeholder="Example: 60 kg"
                required
              />
            </label>

            <label>
              Age Group

              <input
                type="text"
                value={form.age_group}
                onChange={(e) =>
                  setForm({
                    ...form,
                    age_group: e.target.value,
                  })
                }
                placeholder="Example: Senior"
                required
              />
            </label>

            <label>
              Club

              <input
                type="text"
                value={form.club}
                onChange={(e) =>
                  setForm({
                    ...form,
                    club: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Phone

              <input
                type="text"
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
              Address

              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Gender

              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value,
                  })
                }
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </label>

            <label>
              Photo

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFiles({
                    ...files,
                    photo: e.target.files[0],
                  })
                }
              />
            </label>

            <label>
              Age Proof

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFiles({
                    ...files,
                    age_proof: e.target.files[0],
                  })
                }
              />
            </label>

            <button
              type="submit"
              className="btn red full"
            >
              Submit for Approval
            </button>

          </form>
        )}

      </div>

    </section>
  );
}


// =====================================================
// FORGOT PASSWORD
// =====================================================

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/player/forgot-password",
        {
          email,
        }
      );

      setMessage(
        response.data.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not process the password reset request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth page">

      <div className="auth-card">

        <span className="eyebrow blue-text">
          PASSWORD RECOVERY
        </span>

        <h1>Forgot Password?</h1>

        <p>
          Enter your registered player email address.
          We will send you a password reset link.
        </p>

        {message && (
          <div className="alert">
            {message}
          </div>
        )}

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your registered email"
              required
            />
          </label>

          <button
            type="submit"
            className="btn blue"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

        <p>
          Remember your password?{" "}
          <Link to="/login">
            Back to Player Login
          </Link>
        </p>

      </div>

    </section>
  );
}


// =====================================================
// RESET PASSWORD
// =====================================================

export function ResetPassword() {
  const params = new URLSearchParams(
    window.location.search
  );

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await API.post(
        "/auth/player/reset-password",
        {
          token,
          password,
        }
      );

      setMessage(
        response.data.message ||
          "Password reset successful."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        nav("/login");
      }, 2000);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth page">

      <div className="auth-card">

        <span className="eyebrow blue-text">
          PASSWORD RECOVERY
        </span>

        <h1>Reset Password</h1>

        <p>
          Create a new password for your BAPD
          player account.
        </p>

        {message && (
          <div className="alert">
            {message}
          </div>
        )}

        {error && (
          <div className="alert">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <label>
            New Password

            <input
              type="password"
              minLength="8"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Minimum 8 characters"
              required
            />
          </label>

          <label>
            Confirm Password

            <input
              type="password"
              minLength="8"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Enter password again"
              required
            />
          </label>

          <button
            type="submit"
            className="btn blue"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        <p>
          Remember your password?{" "}
          <Link to="/login">
            Back to Player Login
          </Link>
        </p>

      </div>

    </section>
  );
}