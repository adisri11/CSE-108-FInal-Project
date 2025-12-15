import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MazeChoice from "../components/MazeChoice";
import { api } from "../services/api";

export default function Game() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await api.getUser();
        setUser(userData);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <MazeChoice />
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <a href="/store">
          <button style={{ padding: "10px 20px" }}>Go to Store</button>
        </a>
      </div>
    </div>
  );
}
