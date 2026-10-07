import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password, role);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-art">
        <h1>Learn at your own pace.</h1>
        <p>Browse courses, enroll in one click, and pick up your lessons where you left off.</p>
      </div>
      <form className="auth-card form" onSubmit={submit}>
        <h2>Log in</h2>
        <div className="segmented" role="tablist" aria-label="Log in as">
          {["STUDENT", "ADMIN"].map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              className={role === r ? "seg active" : "seg"}
              onClick={() => setRole(r)}
            >
              {r === "STUDENT" ? "Student" : "Admin"}
            </button>
          ))}
        </div>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        {role === "STUDENT" && (
          <p className="muted center">
            New here? <Link to="/register">Create a student account</Link>
          </p>
        )}
      </form>
    </div>
  );
}
