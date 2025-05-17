// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import RoundSelect from "./RoundSelect";
import GameTracker from "./GameTracker";
import "./App.css";

const LOCAL_STORAGE_KEY = "l6ooshGameData";

function Home() {
  const navigate = useNavigate();

  const handleResetScores = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate("/");         // Optional: keep user on home page
    window.location.reload(); // Force UI refresh
  };

  return (
    <div className="home">
      <h1>Game Tracker</h1>
      <p>Select a Round:</p>
      <div className="button-grid">
        {[1, 2, 3, 4].map((round) => (
          <Link key={round} to={`/round/${round}`}>
            <button>Round {round}</button>
          </Link>
        ))}
      </div>

      <button className="back-btn" onClick={handleResetScores} style={{ marginTop: "40px" }}>
        🔄 Reset All Scores
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/round/:roundId" element={<RoundSelect />} />
        <Route path="/round/:roundId/game/:gameId" element={<GameTracker />} />
      </Routes>
    </Router>
  );
}

export default App;
