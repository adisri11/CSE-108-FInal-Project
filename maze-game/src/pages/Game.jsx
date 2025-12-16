import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Phaser from "phaser";
import MazeChoice from "../components/MazeChoice";
import { api } from "../services/api";
import PreloadFall from "../fall/scenes/PreloadFall";
import FallMazeScene from "../fall/scenes/FallMazeScene";
import PreloadWinter from "../winter/scenes/PreloadWinter";
import WinterMazeScene from "../winter/scenes/WinterMazeScene";

export default function Game() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mazeMode = searchParams.get("mode");
  const gameRef = useRef(null);
  const hasInitialized = useRef(false);

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

  useEffect(() => {
    // Only initialize game once when maze mode is selected
    if (mazeMode && !loading && !hasInitialized.current) {
      console.log("=== INITIALIZING GAME ===");
      console.log("Mode:", mazeMode);
      hasInitialized.current = true;

      // Determine which scenes to load
      let scenesArray;
      if (mazeMode === "fall") {
        scenesArray = [PreloadFall, FallMazeScene];
      } else if (mazeMode === "winter") {
        scenesArray = [PreloadWinter, WinterMazeScene];
      } else if (mazeMode === "random") {
        scenesArray = Math.random() < 0.5 
          ? [PreloadFall, FallMazeScene]
          : [PreloadWinter, WinterMazeScene];
      } else {
        scenesArray = [PreloadFall, FallMazeScene];
      }

      const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 800,
        parent: "game-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        dom: {
          createContainer: true
        },
        scene: scenesArray
      };

      console.log("Creating game...");
      gameRef.current = new Phaser.Game(config);

      // Listen for exit event
      const exitInterval = setInterval(() => {
        if (window.mazeGameEvent === 'exit') {
          console.log("Exit detected");
          window.mazeGameEvent = null;
          if (gameRef.current) {
            gameRef.current.destroy(true);
            gameRef.current = null;
          }
          hasInitialized.current = false;
          // change this to store
          navigate("/store");
        }
      }, 100);

      return () => {
        console.log("Cleanup interval");
        clearInterval(exitInterval);
      };
    }
  }, [mazeMode, loading, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting");
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      hasInitialized.current = false;
    };
  }, []);

  const handleBackToMenu = () => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    hasInitialized.current = false;
    navigate("/game");
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Error: {error}
      </div>
    );
  }

  if (mazeMode) {
    return (
      <div style={{ 
        width: "100vw", 
        height: "100vh", 
        overflow: "hidden", 
        backgroundColor: "#000",
        position: "relative"
      }}>
        <div id="game-container" style={{ width: "100%", height: "100%" }} />
        <button 
          onClick={handleBackToMenu}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 20px",
            zIndex: 1000,
            cursor: "pointer",
            backgroundColor: "#fff",
            border: "2px solid #000",
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

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