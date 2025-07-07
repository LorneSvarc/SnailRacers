import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSystemProps {
  position: [number, number, number];
  color: string;
  particleCount: number;
  spread: number;
}

export default function ParticleSystem({ position, color, particleCount, spread }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create particle geometry and material
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = Math.random() * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const mat = new THREE.PointsMaterial({
      color: color,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    
    return { geometry: geo, material: mat };
  }, [particleCount, spread, color]);

  // Animate particles
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position;
      const velocities = pointsRef.current.geometry.attributes.velocity;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update positions
        positions.array[i3] += velocities.array[i3];
        positions.array[i3 + 1] += velocities.array[i3 + 1];
        positions.array[i3 + 2] += velocities.array[i3 + 2];
        
        // Reset particles that have moved too far
        if (positions.array[i3 + 1] > 2) {
          positions.array[i3] = (Math.random() - 0.5) * spread;
          positions.array[i3 + 1] = 0;
          positions.array[i3 + 2] = (Math.random() - 0.5) * spread;
        }
      }
      
      positions.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <primitive object={geometry} />
      <primitive object={material} />
    </points>
  );
}
