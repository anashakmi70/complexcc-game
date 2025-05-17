// src/GameTracker.js
import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaGem, FaCrown, FaChessQueen } from "react-icons/fa";
import { CgCardSpades } from "react-icons/cg";
import { useScoreStore } from "./useScoreStore";

const maxValues = {
  L6oosh: 13,
  Diamonds: 13,
  Queens: 4,
  King: 1,
};

const categories = [
  { label: "L6oosh", icon: <CgCardSpades color="#f87171" /> },
  { label: "Diamonds", icon: <FaGem color="#60a5fa" /> },
  { label: "Queens", icon: <FaChessQueen color="#facc15" /> },
  { label: "King", icon: <FaCrown color="#a78bfa" /> },
];

function GameTracker() {
  const { roundId, gameId } = useParams();
  const navigate = useNavigate();
  const { scores, setScores, names, setNames } = useScoreStore();
  const [modalInfo, setModalInfo] = useState(null);
  const [showScoreSheet, setShowScoreSheet] = useState(false);

  const roundScores = scores[roundId][gameId];

  const handleNameChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const openModal = (playerIdx, catLabel) => {
    setModalInfo({ playerIdx, catLabel, doubled: false, playedBy: null });
  };

  const closeModal = () => setModalInfo(null);

  const submitModal = () => {
    const { playerIdx, catLabel, doubled, playedBy } = modalInfo;
    const newScores = { ...scores };
    const player = [...newScores[roundId][gameId]];
    const cat = player[playerIdx][catLabel];
    const max = maxValues[catLabel];

    if (cat.count < max) {
      cat.count++;
      cat.doubled = doubled;
      cat.playedBy = doubled ? playedBy : null;
    }

    newScores[roundId][gameId] = player;
    setScores(newScores);
    closeModal();
  };

  const updateCount = (playerIdx, catLabel, delta) => {
    if (delta === 1 && ["Queens", "King"].includes(catLabel)) {
      openModal(playerIdx, catLabel);
      return;
    }

    const newScores = { ...scores };
    const player = [...newScores[roundId][gameId]];
    const cat = player[playerIdx][catLabel];
    const max = maxValues[catLabel];

    cat.count = Math.max(0, Math.min(cat.count + delta, max));
    if (cat.count === 0) {
      cat.doubled = false;
      cat.playedBy = null;
    }

    newScores[roundId][gameId] = player;
    setScores(newScores);
  };

  // Calculate score for playerIdx in a specific round and game
  const calculateScore = (rId, gId, playerIdx) => {
    let score = 0;
    const player = scores[rId][gId][playerIdx];

    for (const cat of categories) {
      const { count, doubled } = player[cat.label];
      switch (cat.label) {
        case "L6oosh":
          score += count * -15;
          break;
        case "Diamonds":
          score += count * -10;
          break;
        case "Queens":
          score += doubled ? count * -50 : count * -25;
          break;
        case "King":
          score += doubled ? count * -150 : count * -75;
          break;
        default:
          break;
      }
    }

    scores[rId][gId].forEach((other, idx) => {
      if (idx === playerIdx) return;
      ["Queens", "King"].forEach((catName) => {
        const { count, doubled, playedBy } = other[catName];
        const bonus = catName === "Queens" ? 25 : 75;
        if (doubled && playedBy === playerIdx) {
          score += count * bonus;
        }
      });
    });

    return score;
  };

  // New: Calculate cumulative score for playerIdx across all rounds/games up to current
  const calculateCumulativeScore = (playerIdx) => {
    let totalScore = 0;

    const sortedRounds = Object.keys(scores).sort((a, b) => parseInt(a) - parseInt(b));

    for (const rId of sortedRounds) {
      const games = scores[rId];
      const sortedGames = Object.keys(games).sort((a, b) => parseInt(a) - parseInt(b));

      for (const gId of sortedGames) {
        if (
          parseInt(rId) < parseInt(roundId) ||
          (parseInt(rId) === parseInt(roundId) && parseInt(gId) <= parseInt(gameId))
        ) {
          totalScore += calculateScore(rId, gId, playerIdx);
        }
      }
    }

    return totalScore;
  };

  // For Score Sheet: gather all totals by round/game/player
  const allScores = Object.entries(scores).flatMap(([rId, games]) =>
    Object.entries(games).map(([gId, playerData]) => ({
      round: rId,
      game: gId,
      totals: playerData.map((_, idx) => calculateScore(rId, gId, idx)),
    }))
  );

  const goToNextGame = () => {
    const currentRound = parseInt(roundId);
    const currentGame = parseInt(gameId);
  
    if (currentGame === 1) {
      // Go to Game 2 of the same round
      navigate(`/round/${currentRound}/game/2`);
    } else if (currentGame === 2 && currentRound < 4) {
      // Go to Game 1 of the next round
      navigate(`/round/${currentRound + 1}/game/1`);
    } else {
      // End of last game (Round 4 Game 2), maybe show a message or do nothing
      alert("🎉 You've completed all rounds!");
    }
  };
  

  return (
    <div className="counter-page">
      <h2>
        Round {roundId} - Game {gameId}
      </h2>
      <div className="players-grid">
        {roundScores.map((playerScore, i) => (
          <div key={i} className="player-card">
            <input
              className="name-input"
              value={names[i]}
              onChange={(e) => handleNameChange(i, e.target.value)}
            />
            {categories.map((cat) => (
              <div key={cat.label} className="controls">
                <span>{cat.icon}</span>
                <button onClick={() => updateCount(i, cat.label, -1)}>-</button>
                <span>{playerScore[cat.label].count}</span>
                <button onClick={() => updateCount(i, cat.label, 1)}>+</button>
              </div>
            ))}
            {/* Show cumulative total score here */}
            <div className="score-display">Total: {calculateCumulativeScore(i)}</div>
          </div>
        ))}
      </div>

      {modalInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalInfo.catLabel} Options</h3>
            <label>
              <input
                type="checkbox"
                checked={modalInfo.doubled}
                onChange={(e) =>
                  setModalInfo({
                    ...modalInfo,
                    doubled: e.target.checked,
                    playedBy: e.target.checked ? 0 : null,
                  })
                }
              />
              Doubled?
            </label>
            {modalInfo.doubled && (
              <select
                value={modalInfo.playedBy}
                onChange={(e) =>
                  setModalInfo({
                    ...modalInfo,
                    playedBy: parseInt(e.target.value),
                  })
                }
              >
                {names.map((n, idx) => (
                  <option key={idx} value={idx}>
                    {n}
                  </option>
                ))}
              </select>
            )}
            <button onClick={submitModal}>Confirm</button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link to={`/round/${roundId}`}>
          <button className="back-btn">← Back to Round {roundId}</button>
        </Link>
        <button onClick={goToNextGame}>→ Next Game</button>
        <button onClick={() => setShowScoreSheet(true)}>📊 View Score Sheet</button>
      </div>

      {showScoreSheet && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "90%", overflowX: "auto" }}
          >
            <h3>Score Sheet</h3>
            <table
              style={{ width: "100%", color: "#fff", borderCollapse: "collapse" }}
            >
              <thead>
  <tr>
    <th>Game</th>
    {names.map((n, idx) => (
      <th key={idx}>{n}</th>
    ))}
  </tr>
</thead>
<tbody>
  {allScores.map((entry, idx) => (
    <tr key={idx}>
      <td style={{ padding: "4px 8px" }}>
        Round {entry.round} - Game {entry.game}
      </td>
      {entry.totals.map((score, i) => (
        <td key={i} style={{ padding: "4px 8px" }}>{score}</td>
      ))}
    </tr>
  ))}
</tbody>

            </table>
            <button onClick={() => setShowScoreSheet(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameTracker;
