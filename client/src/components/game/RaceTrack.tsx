import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function RaceTrack() {
  const grassTexture = useTexture("/textures/grass.png");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  
  // Configure texture repeating
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(20, 2);

  return (
    <group>
      {/* Main grass field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>
      
      {/* Race track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 6]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>
      
      {/* Start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-28, 0.02, 0]}>
        <planeGeometry args={[2, 6]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[28, 0.02, 0]}>
        <planeGeometry args={[2, 6]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      
      {/* Lane dividers */}
      {[-1.5, 0, 1.5].map((z, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, z]}>
          <planeGeometry args={[60, 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
      
      {/* Track boundaries */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3.5]}>
        <planeGeometry args={[60, 0.5]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -3.5]}>
        <planeGeometry args={[60, 0.5]} />
        <meshBasicMaterial color="#FF0000" />
      </mesh>
    </group>
  );
}
