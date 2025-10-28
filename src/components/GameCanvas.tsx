import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config/gameConfig';
import './GameCanvas.css';

interface GameCanvasProps {
  onGameReady?: (game: Phaser.Game) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameReady }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('GameCanvas: useEffect triggered');

    if (!containerRef.current) {
      console.error('GameCanvas: Container ref is null');
      return;
    }

    console.log('GameCanvas: Container ref exists, creating Phaser game');
    console.log('Container dimensions:', containerRef.current.clientWidth, containerRef.current.clientHeight);

    // Wait a frame to ensure container is sized
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth || window.innerWidth;
      const height = containerRef.current.clientHeight || window.innerHeight;

      console.log('Using dimensions:', width, height);

      try {
        // Create Phaser game instance with explicit dimensions
        const config = {
          ...gameConfig,
          parent: containerRef.current,
          width: width,
          height: height,
        };

        console.log('GameCanvas: Phaser config:', config);

        const game = new Phaser.Game(config);
        gameRef.current = game;

        console.log('GameCanvas: Phaser game created successfully');

        // Wait for game to be ready
        game.events.once('ready', () => {
          console.log('GameCanvas: Phaser game is ready');
          setLoading(false);

          // Notify parent component that game is ready
          if (onGameReady) {
            onGameReady(game);
          }
        });

      } catch (err) {
        console.error('GameCanvas: Error creating Phaser game:', err);
        setError(err instanceof Error ? err.message : 'Failed to create game');
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('GameCanvas: Cleaning up Phaser game');
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameReady]);

  if (error) {
    return (
      <div className="game-canvas-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h2>Error Loading Game</h2>
          <p>{error}</p>
          <p style={{ fontSize: '12px', marginTop: '20px' }}>
            Check browser console (F12) for details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-canvas-container" ref={containerRef}>
      {/* Phaser canvas will be injected here */}
    </div>
  );
};
