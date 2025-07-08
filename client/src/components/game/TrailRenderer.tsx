import * as THREE from 'three';
import { useSnailRacing } from '@/lib/stores/useSnailRacing';

export default function TrailRenderer() {
  const { trailSegments } = useSnailRacing();

  return (
    <>
      {trailSegments.map((segment) => (
        <mesh
          key={segment.id}
          position={[segment.position.x, segment.position.y, segment.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.5, 0.1]} />
          <meshStandardMaterial
            color={segment.color}
            transparent={true}
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}