import * as THREE from "three";
import { useRef } from "react";

interface TrailSegmentProps {
  position: [number, number, number];
  color: string;
}

export default function TrailSegment({ position, color }: TrailSegmentProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert hex color to RGB for transparency
  const colorObj = new THREE.Color(color);
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to lay flat on the track
    >
      {/* Flat rectangular plane - width: 0.5, height: 0.1 */}
      <planeGeometry args={[0.5, 0.1]} />
      <meshBasicMaterial 
        color={colorObj}
        transparent={true}
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}