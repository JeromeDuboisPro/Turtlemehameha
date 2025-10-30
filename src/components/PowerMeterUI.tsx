import React from 'react';
import './PowerMeterUI.css';

interface PowerMeterUIProps {
  power: number; // 0-100
  isCharging: boolean;
  nextThreshold: number | null;
}

export const PowerMeterUI: React.FC<PowerMeterUIProps> = ({
  power,
  isCharging,
  nextThreshold,
}) => {
  // Determine color based on power level
  const getColor = (): string => {
    if (power < 25) return '#3498db'; // Blue
    if (power < 50) return '#2ecc71'; // Green
    if (power < 75) return '#f39c12'; // Orange
    return '#e74c3c'; // Red
  };

  // Calculate width percentage
  const widthPercentage = Math.min(100, Math.max(0, power));

  return (
    <div className="power-meter-container">
      <div className="power-meter-label">
        <span className="power-meter-text">POWER</span>
        <span className="power-meter-value">{Math.round(power)}%</span>
      </div>

      <div className="power-meter-bar-container">
        <div
          className={`power-meter-bar ${isCharging ? 'charging' : 'draining'}`}
          style={{
            width: `${widthPercentage}%`,
            backgroundColor: getColor(),
          }}
        >
          {isCharging && <div className="power-meter-glow"></div>}
        </div>

        {/* Threshold markers */}
        {[25, 50, 75, 100].map((threshold) => (
          <div
            key={threshold}
            className={`threshold-marker ${
              power >= threshold ? 'reached' : ''
            }`}
            style={{ left: `${threshold}%` }}
          >
            <div className="threshold-line"></div>
          </div>
        ))}
      </div>

      {nextThreshold !== null && (
        <div className="next-threshold-indicator">
          Next Event: {nextThreshold}%
        </div>
      )}
    </div>
  );
};
