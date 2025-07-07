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
  
  // Create ooze bomb geometry - back to normal but visible
  const oozeBombGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.3, 12, 8);
    const material = new THREE.MeshLambertMaterial({ 
      color: active ? "#FFFF00" : "#32CD32", // Yellow when active, green when traveling  
      transparent: true,
      opacity: active ? 0.9 : 0.7,
      emissive: active ? "#FFFF00" : "#228B22",
      emissiveIntensity: active ? 0.3 : 0.1
    });
    return { geometry, material };
  }, [active]);

  // Pulsing animation
  useFrame((state) => {
    if (groupRef.current) {
      const scale = active ? 
        1 + Math.sin(state.clock.elapsedTime * 4) * 0.3 : 
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
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
