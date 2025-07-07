import { useMemo } from "react";
import * as THREE from "three";

export default function Environment() {
  // Pre-calculate random positions for environmental elements
  const flowerPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 20; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 80,
        y: 0.1,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return positions;
  }, []);

  const treePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 10; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100,
        y: 0,
        scale: 0.8 + Math.random() * 0.4
      });
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Flowers scattered around the track */}
      {flowerPositions.map((pos, index) => (
        <group key={`flower-${index}`} position={[pos.x, pos.y, pos.z]} rotation={[0, pos.rotation, 0]} scale={pos.scale}>
          {/* Flower stem */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
            <meshLambertMaterial color="#228B22" />
          </mesh>
          
          {/* Flower petals */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshLambertMaterial color="#FF69B4" />
          </mesh>
          
          {/* Flower center */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshLambertMaterial color="#FFD700" />
          </mesh>
        </group>
      ))}

      {/* Simple trees */}
      {treePositions.map((pos, index) => (
        <group key={`tree-${index}`} position={[pos.x, pos.y, pos.z]} scale={pos.scale}>
          {/* Tree trunk */}
          <mesh>
            <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          
          {/* Tree foliage */}
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[1.5, 12, 8]} />
            <meshLambertMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Clouds in the sky */}
      <group position={[0, 15, 0]}>
        {[...Array(8)].map((_, index) => (
          <mesh 
            key={`cloud-${index}`} 
            position={[
              (Math.random() - 0.5) * 100,
              Math.random() * 10,
              (Math.random() - 0.5) * 100
            ]}
          >
            <sphereGeometry args={[2 + Math.random() * 2, 12, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Sun */}
      <mesh position={[20, 25, -20]}>
        <sphereGeometry args={[3, 16, 8]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}
