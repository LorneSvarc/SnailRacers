import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RaceTrack from "./RaceTrack";
import Snail from "./Snail";
import GameUI from "./GameUI";
import Environment from "./Environment";
import OozeBomb from "./OozeBomb";
import { useSnailRacing, useSnailRacingControls } from "../../lib/stores/useSnailRacing";
import { useAudio } from "../../lib/stores/useAudio";

export default function SnailRacing() {
  const cameraRef = useRef<THREE.Camera>(null);
  const { 
    gameState, 
    playerSnail, 
    aiSnails, 
    oozeBombs,
    initializeGame, 
    updateGame,
    resetGame 
  } = useSnailRacing();
  
  const { backgroundMusic, setBackgroundMusic } = useAudio();

  // Initialize controls
  useSnailRacingControls();

  // Initialize the game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Setup background music
  useEffect(() => {
    if (!backgroundMusic) {
      const music = new Audio('/sounds/background.mp3');
      music.loop = true;
      music.volume = 0.3;
      setBackgroundMusic(music);
    }
  }, [backgroundMusic, setBackgroundMusic]);

  // Game loop
  useFrame((state, delta) => {
    updateGame(delta);
    
    // Camera follows the player snail
    if (playerSnail && state.camera) {
      const targetPosition = new THREE.Vector3(
        playerSnail.position.x,
        playerSnail.position.y + 8,
        playerSnail.position.z + 12
      );
      
      state.camera.position.lerp(targetPosition, 0.02);
      state.camera.lookAt(playerSnail.position.x, playerSnail.position.y, playerSnail.position.z);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Game environment */}
      <Environment />
      
      {/* Race track */}
      <RaceTrack />
      
      {/* Player snail */}
      {playerSnail && (
        <Snail
          key="player"
          position={[playerSnail.position.x, playerSnail.position.y, playerSnail.position.z]}
          rotation={[0, playerSnail.rotation, 0]}
          isPlayer={true}
          color="#FF6B6B"
          shellColor="#4ECDC4"
        />
      )}
      
      {/* AI snails */}
      {aiSnails.map((snail, index) => (
        <Snail
          key={`ai-${index}`}
          position={[snail.position.x, snail.position.y, snail.position.z]}
          rotation={[0, snail.rotation, 0]}
          isPlayer={false}
          color={snail.color}
          shellColor={snail.shellColor}
        />
      ))}
      
      {/* All ooze bombs */}
      {oozeBombs.map((bomb, index) => {
        console.log(`Rendering bomb ${bomb.id} at position x:${bomb.position.x.toFixed(1)}, z:${bomb.position.z.toFixed(1)}, active:${bomb.active}`);
        return (
          <OozeBomb
            key={`${bomb.id}`}
            position={[bomb.position.x, bomb.position.y, bomb.position.z]}
            active={bomb.active}
          />
        );
      })}
      

    </>
  );
}
