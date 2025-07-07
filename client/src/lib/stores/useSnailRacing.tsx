import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect } from "react";
import { useAudio } from "./useAudio";
import * as THREE from "three";

export type GameState = "waiting" | "racing" | "finished";

interface SnailData {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  color: string;
  shellColor: string;
  boosted: boolean;
  boostTimer: number;
}

interface OozeBomb {
  id: string;
  snailId: string;
  position: THREE.Vector3;
  startPosition: THREE.Vector3;
  active: boolean;
  timer: number;
}

interface OozeTrail {
  id: string;
  snailId: string;
  position: THREE.Vector3;
  timer: number;
}

interface SnailRacingState {
  gameState: GameState;
  raceTime: number;
  playerSnail: SnailData | null;
  aiSnails: SnailData[];
  oozeBombs: OozeBomb[];
  oozeTrails: OozeTrail[];
  playerPosition: number;
  
  // Actions
  initializeGame: () => void;
  updateGame: (delta: number) => void;
  resetGame: () => void;
  deployOozeBomb: (snailId: string) => void;
}

const TRACK_LENGTH = 56; // Distance from start to finish
const FINISH_LINE_X = 28;
const SNAIL_BASE_SPEED = 0.5; // Very slow base speed
const SNAIL_BOOST_SPEED = 2.0; // Speed when boosted
const OOZE_BOMB_TRAVEL_SPEED = 8.0;
const OOZE_BOMB_RANGE = 4.0;

export const useSnailRacing = create<SnailRacingState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "waiting",
    raceTime: 0,
    playerSnail: null,
    aiSnails: [],
    oozeBombs: [],
    oozeTrails: [],
    playerPosition: 1,
    
    initializeGame: () => {
      const aiColors = [
        { color: "#FF8C42", shellColor: "#FF6B42" },
        { color: "#6A4C93", shellColor: "#8B5CF6" },
        { color: "#F72585", shellColor: "#FF1744" }
      ];
      
      const aiSnails = aiColors.map((colorData, index) => ({
        position: new THREE.Vector3(-28, 0, -1.5 + index * 1.5),
        rotation: 0,
        speed: SNAIL_BASE_SPEED * (0.8 + Math.random() * 0.4), // Slight speed variation
        color: colorData.color,
        shellColor: colorData.shellColor,
        boosted: false,
        boostTimer: 0,
      }));
      
      set({
        gameState: "waiting",
        raceTime: 0,
        playerSnail: {
          position: new THREE.Vector3(-28, 0, 1.5),
          rotation: 0,
          speed: SNAIL_BASE_SPEED,
          color: "#FF6B6B",
          shellColor: "#4ECDC4",
          boosted: false,
          boostTimer: 0,
        },
        aiSnails,
        oozeBombs: [],
        oozeTrails: [],
        playerPosition: 1,
      });
    },
    
    updateGame: (delta: number) => {
      const state = get();
      
      if (state.gameState === "waiting") {
        // Check for race start
        // This would be handled by keyboard controls in the component
        return;
      }
      
      if (state.gameState === "racing") {
        // Update race time
        set({ raceTime: state.raceTime + delta });
        
        // Update ooze bombs
        const updatedOozeBombs = state.oozeBombs.map(bomb => {
          if (!bomb.active) {
            // Move bomb forward
            const newPosition = bomb.position.clone();
            newPosition.x += OOZE_BOMB_TRAVEL_SPEED * delta;
            
            // Check if bomb should activate (traveled the specified range)
            const distanceTraveled = newPosition.x - bomb.startPosition.x;
            if (distanceTraveled >= OOZE_BOMB_RANGE) {
              return { ...bomb, active: true, position: newPosition };
            }
            
            return { ...bomb, position: newPosition };
          } else {
            // Bomb is active, decrease timer
            const newTimer = bomb.timer - delta;
            if (newTimer <= 0) {
              return null; // Remove bomb
            }
            return { ...bomb, timer: newTimer };
          }
        }).filter(Boolean) as OozeBomb[];
        
        // Update ooze trails
        const updatedOozeTrails = state.oozeTrails.map(trail => {
          const newTimer = trail.timer - delta;
          if (newTimer <= 0) {
            return null; // Remove trail
          }
          return { ...trail, timer: newTimer };
        }).filter(Boolean) as OozeTrail[];
        
        // Update player snail
        let updatedPlayerSnail = state.playerSnail;
        if (updatedPlayerSnail) {
          // Check for boost from ooze bombs
          const nearbyOozeBomb = updatedOozeBombs.find(bomb => 
            bomb.active && 
            bomb.snailId === 'player' &&
            Math.abs(bomb.position.x - updatedPlayerSnail!.position.x) < 1.5 &&
            Math.abs(bomb.position.z - updatedPlayerSnail!.position.z) < 1.5
          );
          
          if (nearbyOozeBomb) {
            updatedPlayerSnail = {
              ...updatedPlayerSnail,
              boosted: true,
              boostTimer: 3.0, // 3 seconds of boost
            };
          }
          
          // Update boost timer
          if (updatedPlayerSnail.boostTimer > 0) {
            updatedPlayerSnail = {
              ...updatedPlayerSnail,
              boostTimer: updatedPlayerSnail.boostTimer - delta,
              boosted: updatedPlayerSnail.boostTimer > 0,
            };
          }
        }
        
        // Update AI snails
        const updatedAiSnails = state.aiSnails.map((snail, index) => {
          let updatedSnail = { ...snail };
          
          // Simple AI: move forward with occasional ooze bomb deployment
          const newPosition = snail.position.clone();
          const currentSpeed = snail.boosted ? SNAIL_BOOST_SPEED : snail.speed;
          newPosition.x += currentSpeed * delta;
          
          // Check for boost from ooze bombs
          const nearbyOozeBomb = updatedOozeBombs.find(bomb => 
            bomb.active && 
            bomb.snailId === `ai-${index}` &&
            Math.abs(bomb.position.x - newPosition.x) < 1.5 &&
            Math.abs(bomb.position.z - newPosition.z) < 1.5
          );
          
          if (nearbyOozeBomb) {
            updatedSnail.boosted = true;
            updatedSnail.boostTimer = 3.0;
          }
          
          // Update boost timer
          if (updatedSnail.boostTimer > 0) {
            updatedSnail.boostTimer -= delta;
            updatedSnail.boosted = updatedSnail.boostTimer > 0;
          }
          
          updatedSnail.position = newPosition;
          
          // AI deployment of ooze bombs (random chance)
          if (Math.random() < 0.001) { // Very low chance per frame
            get().deployOozeBomb(`ai-${index}`);
          }
          
          return updatedSnail;
        });
        
        // Check for race finish
        const allSnails = [updatedPlayerSnail, ...updatedAiSnails].filter(Boolean);
        const finishedSnails = allSnails
          .map((snail, index) => ({ snail, index, isPlayer: index === 0 }))
          .filter(({ snail }) => snail.position.x >= FINISH_LINE_X)
          .sort((a, b) => b.snail.position.x - a.snail.position.x);
        
        if (finishedSnails.length > 0) {
          const playerFinished = finishedSnails.find(s => s.isPlayer);
          const playerPosition = playerFinished ? finishedSnails.indexOf(playerFinished) + 1 : allSnails.length;
          
          set({
            gameState: "finished",
            playerPosition,
            oozeBombs: updatedOozeBombs,
            oozeTrails: updatedOozeTrails,
            playerSnail: updatedPlayerSnail,
            aiSnails: updatedAiSnails,
          });
        } else {
          // Calculate player position
          const sortedSnails = allSnails
            .map((snail, index) => ({ snail, index, isPlayer: index === 0 }))
            .sort((a, b) => b.snail.position.x - a.snail.position.x);
          
          const playerIndex = sortedSnails.findIndex(s => s.isPlayer);
          const playerPosition = playerIndex + 1;
          
          set({
            oozeBombs: updatedOozeBombs,
            oozeTrails: updatedOozeTrails,
            playerSnail: updatedPlayerSnail,
            aiSnails: updatedAiSnails,
            playerPosition,
          });
        }
      }
    },
    
    resetGame: () => {
      get().initializeGame();
    },
    
    deployOozeBomb: (snailId: string) => {
      const state = get();
      const isPlayer = snailId === 'player';
      const snail = isPlayer ? state.playerSnail : state.aiSnails[parseInt(snailId.split('-')[1])];
      
      if (!snail) return;
      
      // Deploy bomb slightly ahead of the snail
      const bombPosition = snail.position.clone();
      bombPosition.x += 1.0; // Start 1 unit ahead
      bombPosition.y += 0.5; // Slightly above ground for visibility
      
      const newBomb: OozeBomb = {
        id: `${snailId}-${Date.now()}`,
        snailId,
        position: bombPosition,
        startPosition: bombPosition,
        active: false,
        timer: 10.0, // 10 seconds active time
      };
      
      set({
        oozeBombs: [...state.oozeBombs, newBomb],
      });
      
      // Play sound effect
      const { playHit } = useAudio.getState();
      playHit();
    },
  }))
);

// Hook to handle keyboard controls
export function useSnailRacingControls() {
  const [subscribe, getKeys] = useKeyboardControls();
  const { gameState, playerSnail, deployOozeBomb } = useSnailRacing();
  
  useEffect(() => {
    const unsubscribe = subscribe(
      (state) => state,
      (pressed) => {
        if (gameState === "waiting" && (pressed.forward || pressed.backward || pressed.left || pressed.right)) {
          useSnailRacing.setState({ gameState: "racing" });
        }
        
        if (pressed.restart) {
          useSnailRacing.getState().resetGame();
        }
        
        if (pressed.ooze && gameState === "racing") {
          deployOozeBomb('player');
        }
      }
    );
    
    return unsubscribe;
  }, [subscribe, gameState, deployOozeBomb]);
  
  // Handle continuous movement
  useEffect(() => {
    const handleMovement = () => {
      if (gameState !== "racing" || !playerSnail) return;
      
      const keys = getKeys();
      let moved = false;
      
      const newPosition = playerSnail.position.clone();
      const currentSpeed = playerSnail.boosted ? SNAIL_BOOST_SPEED : playerSnail.speed;
      
      if (keys.forward) {
        newPosition.x += currentSpeed * 0.016; // Assuming 60fps
        moved = true;
      }
      if (keys.backward) {
        newPosition.x -= currentSpeed * 0.016;
        moved = true;
      }
      if (keys.left && newPosition.z < 2.5) {
        newPosition.z += currentSpeed * 0.5 * 0.016;
        moved = true;
      }
      if (keys.right && newPosition.z > -2.5) {
        newPosition.z -= currentSpeed * 0.5 * 0.016;
        moved = true;
      }
      
      if (moved) {
        // Add ooze trail
        const newTrail: OozeTrail = {
          id: `player-trail-${Date.now()}`,
          snailId: 'player',
          position: playerSnail.position.clone(),
          timer: 2.0,
        };
        
        useSnailRacing.setState(state => ({
          playerSnail: { ...state.playerSnail!, position: newPosition },
          oozeTrails: [...state.oozeTrails, newTrail],
        }));
      }
    };
    
    const interval = setInterval(handleMovement, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameState, playerSnail, getKeys]);
}
