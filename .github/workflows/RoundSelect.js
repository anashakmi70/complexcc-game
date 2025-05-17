import React from "react";
import { useParams, Link } from "react-router-dom";

function RoundSelect() {
  const { roundId } = useParams();

  return (
    <div className="home">
      <h2>Round {roundId}</h2>
      <p>Select a game:</p>
      <div className="button-grid">
        {[1, 2].map((game) => (
          <Link key={game} to={`/round/${roundId}/game/${game}`}>
            <button>Game {game}</button>
          </Link>
        ))}
      </div>
      <Link to="/"><button className="back-btn">← Back to Home</button></Link>
    </div>
  );
}

export default RoundSelect;