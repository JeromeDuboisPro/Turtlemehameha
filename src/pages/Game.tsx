import { useState, useEffect, useCallback, useRef } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { GameCanvas } from '../components/GameCanvas';
import { PowerMeterUI } from '../components/PowerMeterUI';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { GameScene } from '../game/scenes/GameScene';
import './Game.css';

const Game: React.FC = () => {
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [nextThreshold, setNextThreshold] = useState<number | null>(25);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboTimeRemaining, setComboTimeRemaining] = useState(0);

  const sceneRef = useRef<GameScene | null>(null);
  const listenersRegistered = useRef(false);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    console.log('Game page: Game initialized successfully!', game);

    // Get the GameScene instance
    const scene = game.scene.getScene('GameScene') as GameScene;

    if (scene && !listenersRegistered.current) {
      sceneRef.current = scene;
      listenersRegistered.current = true;

      // Listen to power meter events
      scene.events.on('power_changed', (newPower: number) => {
        setPower(newPower);
        const powerMeter = scene.getPowerMeter();
        if (powerMeter) {
          setIsCharging(powerMeter.getIsCharging());
          setNextThreshold(powerMeter.getNextThreshold());
        }
      });

      // Listen to score events
      scene.events.on('score_changed', (newScore: number) => {
        setScore(newScore);
        const scoreSystem = scene.getScoreSystem();
        if (scoreSystem) {
          setCombo(scoreSystem.getCombo());
          setComboTimeRemaining(scoreSystem.getComboTimeRemaining());
        }
      });

      // Listen to animation events
      scene.events.on('animation_started', () => {
        setIsCharging(true);
      });

      scene.events.on('animation_stopped', () => {
        setIsCharging(false);
      });

      // Listen to threshold events
      scene.events.on('threshold_reached', (threshold: number) => {
        console.log(`UI: Threshold ${threshold}% reached!`);
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        sceneRef.current.events.off('power_changed');
        sceneRef.current.events.off('score_changed');
        sceneRef.current.events.off('animation_started');
        sceneRef.current.events.off('animation_stopped');
        sceneRef.current.events.off('threshold_reached');
      }
    };
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen className="game-content">
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: '#000'
        }}>
          <GameCanvas onGameReady={handleGameReady} />
          <PowerMeterUI
            power={power}
            isCharging={isCharging}
            nextThreshold={nextThreshold}
          />
          <ScoreDisplay
            score={score}
            combo={combo}
            comboTimeRemaining={comboTimeRemaining}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Game;
