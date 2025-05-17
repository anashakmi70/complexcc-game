import React from "react";
import "./DoubleCardModal.css";

function DoubleCardModal({ category, onClose, onConfirm, players }) {
  const [doubled, setDoubled] = React.useState(false);
  const [playedBy, setPlayedBy] = React.useState("");

  const handleConfirm = () => {
    onConfirm({
      doubled,
      playedBy: doubled ? parseInt(playedBy) : null,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{category} Played</h3>

        <label>
          <input
            type="checkbox"
            checked={doubled}
            onChange={(e) => setDoubled(e.target.checked)}
          />
          Doubled?
        </label>

        {doubled && (
          <select
            value={playedBy}
            onChange={(e) => setPlayedBy(e.target.value)}
          >
            <option value="">Select who played it</option>
            {players.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
        )}

        <div className="modal-buttons">
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={onClose} className="cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default DoubleCardModal;