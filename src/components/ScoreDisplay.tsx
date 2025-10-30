import React from 'react';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  score: number;
  combo: number;
  comboTimeRemaining: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  combo,
  comboTimeRemaining,
}) => {
  const hasActiveCombo = combo > 0 && comboTimeRemaining > 0;

  // Calculate combo progress percentage for visual indicator
  const comboProgressPercentage = hasActiveCombo
    ? (comboTimeRemaining / 0.5) * 100
    : 0;

  return (
    <div className="score-display-container">
      {/* Main Score */}
      <div className="score-main">
        <div className="score-label">SCORE</div>
        <div className="score-value">{score.toLocaleString()}</div>
      </div>

      {/* Combo Indicator */}
      {hasActiveCombo && (
        <div className="combo-container">
          <div className="combo-label">
            COMBO <span className="combo-multiplier">×{combo}</span>
          </div>
          <div className="combo-timer-bar">
            <div
              className="combo-timer-fill"
              style={{ width: `${comboProgressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
