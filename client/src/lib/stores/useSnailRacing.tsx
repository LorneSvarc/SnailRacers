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
const BOOST_DURATION = 4.0; // 4 seconds boost duration
const OOZE_BOMB_TRAVEL_SPEED = 8.0;
const OOZE_BOMB_RANGE = 4.0;
const AI_BOMB_DETECTION_RANGE = 8.0; // How far AI can see bombs
const AI_LANE_CHANGE_SPEED = 0.3; // How fast AI changes lanes

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
        position: new THREE.Vector3(-28, 0, -2.5 + index * 1.5), // Start at -2.5, -1, 0.5
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
          position: new THREE.Vector3(-28, 0, 2), // Player at lane 2
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
        
        // Update player snail - only boost timer (collision handled in movement)
        let updatedPlayerSnail = state.playerSnail;
        if (updatedPlayerSnail && updatedPlayerSnail.boostTimer > 0) {
          const newTimer = updatedPlayerSnail.boostTimer - delta;
          updatedPlayerSnail = {
            ...updatedPlayerSnail,
            boostTimer: Math.max(0, newTimer),
            boosted: newTimer > 0,
          };
        }
        
        // Update AI snails with smart behavior
        const updatedAiSnails = state.aiSnails.map((snail, index) => {
          let updatedSnail = { ...snail };
          
          // Update boost timer
          if (updatedSnail.boostTimer > 0) {
            const newTimer = updatedSnail.boostTimer - delta;
            updatedSnail.boostTimer = Math.max(0, newTimer);
            updatedSnail.boosted = newTimer > 0;
          }
          
          const newPosition = snail.position.clone();
          let currentSpeed = snail.boosted ? SNAIL_BOOST_SPEED : snail.speed;
          
          // Smart AI: Look for nearby active bombs to steal
          const nearestActiveBomb = updatedOozeBombs
            .filter(bomb => bomb.active)
            .map(bomb => ({
              bomb,
              distance: Math.abs(bomb.position.x - newPosition.x) + Math.abs(bomb.position.z - newPosition.z)
            }))
            .sort((a, b) => a.distance - b.distance)[0];
          
          // If there's a nearby bomb, try to steer toward it
          if (nearestActiveBomb && nearestActiveBomb.distance < 8) {
            const bombPos = nearestActiveBomb.bomb.position;
            
            // Move toward the bomb's Z position (lane switching)
            const zDiff = bombPos.z - newPosition.z;
            if (Math.abs(zDiff) > 0.5) {
              const laneSpeed = currentSpeed * 0.3 * delta;
              if (zDiff > 0) {
                newPosition.z += Math.min(laneSpeed, zDiff);
              } else {
                newPosition.z += Math.max(-laneSpeed, zDiff);
              }
            }
            
            // Speed up slightly when chasing bombs
            currentSpeed *= 1.2;
          }
          
          // Normal forward movement
          newPosition.x += currentSpeed * delta;
          
          // Check for collision with any active ooze bomb
          const nearbyOozeBomb = updatedOozeBombs.find(bomb => 
            bomb.active && 
            Math.abs(bomb.position.x - newPosition.x) < 1.0 &&
            Math.abs(bomb.position.z - newPosition.z) < 1.0
          );
          
          if (nearbyOozeBomb) {
            updatedSnail.boosted = true;
            updatedSnail.boostTimer = BOOST_DURATION;
            
            // Remove the bomb after collision
            const bombIndex = updatedOozeBombs.indexOf(nearbyOozeBomb);
            if (bombIndex > -1) {
              updatedOozeBombs.splice(bombIndex, 1);
            }
          }
          
          updatedSnail.position = newPosition;
          
          // Strategic bomb deployment - more reasonable frequency
          const shouldDeployBomb = 
            Math.random() < 0.002 || // 0.2% chance per frame (reasonable)
            (newPosition.x > -10 && Math.random() < 0.005) || // 0.5% chance after midway
            (updatedSnail.boosted && Math.random() < 0.008) || // 0.8% chance when boosted
            (nearestActiveBomb && nearestActiveBomb.distance < 5 && Math.random() < 0.01); // 1% chance when near other bombs
          
          if (shouldDeployBomb) {
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
      
      // Deploy bomb FROM the snail's shell position (slightly behind shell)
      const bombPosition = snail.position.clone();
      bombPosition.x -= 0.5; // Start slightly behind snail so it shoots forward
      bombPosition.y = 0.4; // At shell height
      
      const newBomb: OozeBomb = {
        id: `${snailId}-${Date.now()}`,
        snailId,
        position: bombPosition,
        startPosition: bombPosition.clone(),
        active: false,
        timer: 10.0, // 10 seconds active time
      };
      
      set({
        oozeBombs: [...state.oozeBombs, newBomb],
      });
      
      // Debug log with clear positioning
      console.log('🚀 BOMB LAUNCHED:', {
        id: newBomb.id,
        snailId: snailId,
        from: `x:${bombPosition.x.toFixed(1)}, z:${bombPosition.z.toFixed(1)}`,
        snailAt: `x:${snail.position.x.toFixed(1)}, z:${snail.position.z.toFixed(1)}`,
        willTravelTo: `x:${(bombPosition.x + OOZE_BOMB_RANGE).toFixed(1)}`
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
      const state = useSnailRacing.getState();
      if (state.gameState !== "racing" || !state.playerSnail) return;
      
      const keys = getKeys();
      let moved = false;
      
      const newPosition = state.playerSnail.position.clone();
      const currentSpeed = state.playerSnail.boosted ? SNAIL_BOOST_SPEED : SNAIL_BASE_SPEED;
      
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
          position: state.playerSnail.position.clone(),
          timer: 2.0,
        };
        
        useSnailRacing.setState(currentState => {
          let updatedPlayerSnail = currentState.playerSnail ? {
            ...currentState.playerSnail,
            position: newPosition,
          } : null;
          
          let newOozeBombs = currentState.oozeBombs;
          
          // Check for collision with any active ooze bomb
          if (updatedPlayerSnail) {
            const nearbyBomb = currentState.oozeBombs.find(bomb => 
              bomb.active && 
              Math.abs(bomb.position.x - newPosition.x) < 1.0 &&
              Math.abs(bomb.position.z - newPosition.z) < 1.0
            );
            
            if (nearbyBomb) {
              updatedPlayerSnail = {
                ...updatedPlayerSnail,
                boosted: true,
                boostTimer: BOOST_DURATION,
              };
              
              // Remove the bomb
              newOozeBombs = currentState.oozeBombs.filter(bomb => bomb.id !== nearbyBomb.id);
              console.log('Player hit bomb! Boost activated for', BOOST_DURATION, 'seconds');
            }
          }
          
          return {
            playerSnail: updatedPlayerSnail,
            oozeTrails: [...currentState.oozeTrails, newTrail],
            oozeBombs: newOozeBombs,
          };
        });
      }
    };
    
    const interval = setInterval(handleMovement, 16); // ~60fps
    return () => clearInterval(interval);
  }, [getKeys]);
}
