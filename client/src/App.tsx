import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "@fontsource/inter";
import SnailRacing from "./components/game/SnailRacing";
import GameUI from "./components/game/GameUI";

// Define control keys for the snail racing game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
  { name: "ooze", keys: ["Space", "KeyX"] },
  { name: "restart", keys: ["KeyR"] },
];

// Main App component
function App() {
  const { toggleMute } = useAudio();

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 8, 12],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            
            <Suspense fallback={null}>
              <SnailRacing />
            </Suspense>
          </Canvas>

          {/* Game UI */}
          <GameUI />

          {/* Audio toggle button */}
          <button
            onClick={toggleMute}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              padding: '10px 15px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              zIndex: 1000
            }}
          >
            🔊 Toggle Sound
          </button>
        </KeyboardControls>
      </div>
    </QueryClientProvider>
  );
}

export default App;
