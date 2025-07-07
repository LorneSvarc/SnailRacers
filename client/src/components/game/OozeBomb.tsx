import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ParticleSystem from "./ParticleSystem";

interface OozeBombProps {
  position: [number, number, number];
  active: boolean;
}

export default function OozeBomb({ position, active }: OozeBombProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create ooze bomb geometry
  const oozeBombGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.2, 12, 8);
    const material = new THREE.MeshLambertMaterial({ 
      color: "#32CD32",
      transparent: true,
      opacity: active ? 0.8 : 0.3
    });
    return { geometry, material };
  }, [active]);

  // Pulsing animation
  useFrame((state) => {
    if (groupRef.current && active) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={oozeBombGeometry.geometry} material={oozeBombGeometry.material} />
      
      {/* Ooze puddle effect when active */}
      {active && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial 
              color="#32CD32" 
              transparent 
              opacity={0.4}
            />
          </mesh>
          
          {/* Particle effects */}
          <ParticleSystem
            position={[0, 0.1, 0]}
            color="#32CD32"
            particleCount={30}
            spread={1}
          />
        </>
      )}
    </group>
  );
}
