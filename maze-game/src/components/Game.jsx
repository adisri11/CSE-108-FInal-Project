import { useEffect, useRef } from "react";
import { createGame } from "../game";

export default function Game() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) {
      const game = createGame("game-container");

      return () => {
        game.destroy(true);
      };
    }
  }, []);

  return (
    <div
      id="game-container"
      ref={gameRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
