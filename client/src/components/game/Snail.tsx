import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSnailRacing } from "../../lib/stores/useSnailRacing";
import OozeBomb from "./OozeBomb";
import ParticleSystem from "./ParticleSystem";

interface SnailProps {
  position: [number, number, number];
  rotation: [number, number, number];
  isPlayer: boolean;
  color: string;
  shellColor: string;
}

export default function Snail({ position, rotation, isPlayer, color, shellColor }: SnailProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { oozeBombs, oozeTrails } = useSnailRacing();
  
  // Create snail geometry
  const snailGeometry = useMemo(() => {
    const group = new THREE.Group();
    
    // Snail body (elongated sphere)
    const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 8);
    bodyGeometry.scale(1.5, 0.8, 1);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.2, 0);
    body.castShadow = true;
    group.add(body);
    
    // Snail shell (spiral-like)
    const shellGeometry = new THREE.SphereGeometry(0.4, 16, 8);
    const shellMaterial = new THREE.MeshLambertMaterial({ color: shellColor });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.position.set(-0.2, 0.4, 0);
    shell.castShadow = true;
    group.add(shell);
    
    // Shell spiral details
    const spiralGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
    const spiralMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(shellColor).multiplyScalar(0.8) });
    const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
    spiral.position.set(-0.2, 0.4, 0);
    spiral.rotation.x = Math.PI / 2;
    group.add(spiral);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: "#000000" });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.35, 0.35, 0.15);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.35, 0.35, -0.15);
    group.add(rightEye);
    
    // Antennae
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const antennaMaterial = new THREE.MeshLambertMaterial({ color });
    
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.position.set(0.4, 0.5, 0.1);
    leftAntenna.rotation.z = 0.3;
    group.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(0.4, 0.5, -0.1);
    rightAntenna.rotation.z = 0.3;
    group.add(rightAntenna);
    
    return group;
  }, [color, shellColor]);

  // Subtle bobbing animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={snailGeometry} />
      
      {/* Ooze bombs for this snail */}
      {oozeBombs
        .filter(bomb => bomb.snailId === (isPlayer ? 'player' : 'ai'))
        .map((bomb, index) => (
          <OozeBomb
            key={`${bomb.snailId}-${index}`}
            position={[bomb.position.x, bomb.position.y, bomb.position.z]}
            active={bomb.active}
          />
        ))}
      
      {/* Ooze trail particles */}
      {oozeTrails
        .filter(trail => trail.snailId === (isPlayer ? 'player' : 'ai'))
        .map((trail, index) => (
          <ParticleSystem
            key={`trail-${trail.snailId}-${index}`}
            position={[trail.position.x, trail.position.y, trail.position.z]}
            color="#32CD32"
            particleCount={20}
            spread={0.5}
          />
        ))}
    </group>
  );
}
