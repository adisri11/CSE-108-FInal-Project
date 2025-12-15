import React from "react";
import { useNavigate } from "react-router-dom";

export default function MazeChoice() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Choose Your Maze</h1>

      <button onClick={() => navigate("/game?mode=fall")}>
        Fall Maze
      </button>

      <br /><br />

      <button onClick={() => navigate("/game?mode=winter")}>
        Winter Maze
      </button>

      <br /><br />

      <button onClick={() => navigate("/game?mode=random")}>
        Random Maze
      </button>
    </div>
  );
}
