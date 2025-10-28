import { IonContent, IonPage } from '@ionic/react';
import { GameCanvas } from '../components/GameCanvas';
import './Game.css';

const Game: React.FC = () => {
  const handleGameReady = (game: Phaser.Game) => {
    console.log('Game initialized:', game);
    // We can access the game instance here if needed
  };

  return (
    <IonPage>
      <IonContent fullscreen className="game-content">
        <GameCanvas onGameReady={handleGameReady} />
      </IonContent>
    </IonPage>
  );
};

export default Game;
