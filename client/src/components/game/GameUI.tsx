import { useSnailRacing } from "../../lib/stores/useSnailRacing";
import { useKeyboardControls } from "@react-three/drei";

export default function GameUI() {
  const { gameState, raceTime, playerPosition, resetGame } = useSnailRacing();
  const [, getKeys] = useKeyboardControls();

  const handleRestart = () => {
    resetGame();
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {/* Game HUD */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div>Race Time: {raceTime.toFixed(1)}s</div>
        <div>Position: {playerPosition}/4</div>
        <div>Speed: Very Slow (as intended!)</div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div><strong>Controls:</strong></div>
        <div>WASD / Arrow Keys: Move</div>
        <div>Space / X: Deploy Ooze Bomb</div>
        <div>R: Restart Race</div>
      </div>

      {/* Game state messages */}
      {gameState === 'waiting' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: '24px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2>🐌 Snail Racing Championship 🐌</h2>
          <p>Press W or ↑ to start the race!</p>
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            <div>Remember: Snails are naturally slow,</div>
            <div>but your ooze bombs can give you a boost!</div>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center',
          fontSize: '24px',
          fontFamily: 'Inter, sans-serif',
          pointerEvents: 'auto'
        }}>
          <h2>🏆 Race Finished! 🏆</h2>
          <p>Final Position: {playerPosition}/4</p>
          <p>Time: {raceTime.toFixed(1)}s</p>
          <button
            onClick={handleRestart}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              background: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Race Again
          </button>
        </div>
      )}
    </div>
  );
}
