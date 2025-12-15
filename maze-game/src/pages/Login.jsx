import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthPages.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        navigate("/game");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="game-card">
        <h1>Maze Game</h1>
        <p>Log in to collect tokens and explore a new world</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Enter Game"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          New player?{" "}
          <a href="/signup">Create an account</a>
        </p>
      </div>
    </div>
  );
}
