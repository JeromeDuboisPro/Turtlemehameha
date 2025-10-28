import { IonContent, IonPage } from '@ionic/react';
import { GameCanvas } from '../components/GameCanvas';
import './Game.css';

const Game: React.FC = () => {
  console.log('Game page: Rendering');

  const handleGameReady = (game: Phaser.Game) => {
    console.log('Game page: Game initialized successfully!', game);
  };

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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Game;
