import * as THREE from "three";

export interface CollisionBox {
  position: THREE.Vector3;
  size: THREE.Vector3;
}

export function checkAABBCollision(box1: CollisionBox, box2: CollisionBox): boolean {
  return (
    Math.abs(box1.position.x - box2.position.x) < (box1.size.x + box2.size.x) / 2 &&
    Math.abs(box1.position.y - box2.position.y) < (box1.size.y + box2.size.y) / 2 &&
    Math.abs(box1.position.z - box2.position.z) < (box1.size.z + box2.size.z) / 2
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function getRandomColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
}

export function calculateDistance(pos1: THREE.Vector3, pos2: THREE.Vector3): number {
  return pos1.distanceTo(pos2);
}

export function calculateManhattanDistance(pos1: THREE.Vector3, pos2: THREE.Vector3): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.z - pos2.z);
}

export function normalizeVector(vector: THREE.Vector3): THREE.Vector3 {
  return vector.clone().normalize();
}

export function getRandomPosition(
  centerX: number, 
  centerZ: number, 
  radius: number
): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  return new THREE.Vector3(
    centerX + Math.cos(angle) * distance,
    0,
    centerZ + Math.sin(angle) * distance
  );
}
