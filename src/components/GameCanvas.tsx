import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config/gameConfig';
import './GameCanvas.css';

interface GameCanvasProps {
  onGameReady?: (game: Phaser.Game) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameReady }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Phaser game instance
    const config = {
      ...gameConfig,
      parent: containerRef.current,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Notify parent component that game is ready
    if (onGameReady) {
      onGameReady(game);
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameReady]);

  return (
    <div className="game-canvas-container" ref={containerRef}>
      {/* Phaser will inject its canvas here */}
    </div>
  );
};
