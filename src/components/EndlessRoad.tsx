import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Simple noise implementation since we can't import SimplexNoise directly
class SimpleNoise {
  private p: Uint8Array;

  constructor() {
    this.p = new Uint8Array(512);
    this.seed(Math.random());
  }

  seed(seed: number) {
    if (seed > 0 && seed < 1) {
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
      seed |= seed << 8;
    }

    const p = this.p;
    for (let i = 0; i < 256; i++) {
      const v = i & 1 ? (i * seed) : (i ^ seed);
      p[i] = p[i + 256] = v % 256;
    }
  }

  noise(x: number, y: number) {
    // Simple 2D noise implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;
    
    return this.lerp(
      v,
      this.lerp(
        u,
        this.grad(this.p[A], x, y),
        this.grad(this.p[B], x - 1, y)
      ),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}

interface RoadSegment {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  width: number;
  length: number;
}

interface Obstacle {
  id: string;
  position: THREE.Vector3;
  type: 'box' | 'hole';
  size: [number, number, number];
}

interface Decoration {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  type: 'tree' | 'rock' | 'bush';
  scale: number;
}

export interface EndlessRoadRef {
  updatePlayerPosition: (position: THREE.Vector3) => void;
  getForwardSpeed: () => number;
  increaseSpeed: () => void;
}

interface EndlessRoadProps {
  initialSpeed?: number;
}

export const EndlessRoad = React.forwardRef<EndlessRoadRef, EndlessRoadProps>(({ initialSpeed = 15 }, ref) => {
  const playerRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [forwardSpeed, setForwardSpeed] = useState(initialSpeed);
  const [gameTime, setGameTime] = useState(0);
  
  // Load textures
  const roadTexture = useTexture('/final-texture.png');
  const obstacleTexture = useTexture('/final-texture.png');
  
  // Configure textures
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, 5);
  
  obstacleTexture.wrapS = obstacleTexture.wrapT = THREE.RepeatWrapping;
  obstacleTexture.repeat.set(1, 1);
  
  // Create noise generator for procedural generation
  const noise = useMemo(() => new SimpleNoise(), []);
  
  // Road parameters
  const roadWidth = 10;
  const roadSegmentLength = 50;
  const maxSegments = 10; // How many segments to keep in memory
  const visibleDistance = roadSegmentLength * 3; // How far ahead to render
  
  // Generate initial road segments
  useEffect(() => {
    const initialSegments = [];
    
    for (let i = 0; i < maxSegments; i++) {
      initialSegments.push(createRoadSegment(i * roadSegmentLength));
    }
    
    setRoadSegments(initialSegments);
    generateObstacles(initialSegments);
    generateDecorations(initialSegments);
  }, []);
  
  // Increase speed over time
  useFrame((_, delta) => {
    setGameTime(prev => prev + delta);
    
    // Every 10 seconds, increase speed
    if (Math.floor(gameTime) % 10 === 0 && Math.floor(gameTime) > 0) {
      const speedIncrease = 0.001; // Small continuous increment
      setForwardSpeed(prev => Math.min(prev + speedIncrease, 40)); // Cap at 40
    }
  });
  
  // Function to create a single road segment
  const createRoadSegment = (zPosition: number) => {
    const id = `road-${zPosition}`;
    // Use simplex noise to determine the segment properties
    const xOffset = noise.noise(zPosition * 0.01, 0) * 5; // Small curve left/right
    const yOffset = Math.max(0, noise.noise(zPosition * 0.01, 100) * 2); // Small height variations
    
    const segment: RoadSegment = {
      id,
      position: new THREE.Vector3(xOffset, yOffset, zPosition),
      rotation: new THREE.Euler(0, 0, 0),
      width: roadWidth,
      length: roadSegmentLength,
    };
    
    return segment;
  };
  
  // Generate obstacles for given road segments
  const generateObstacles = (segments: RoadSegment[]) => {
    const newObstacles: Obstacle[] = [];
    
    segments.forEach(segment => {
      // Skip the first two segments to give player a safe start
      if (segment.position.z < roadSegmentLength * 2) return;
      
      // Random chance to generate obstacles
      const obstacleCount = Math.floor(noise.noise(segment.position.z * 0.1, 200) * 4 + 2);
      
      for (let i = 0; i < obstacleCount; i++) {
        // Random position along the segment
        const zPos = segment.position.z - (Math.random() * segment.length);
        // Random position across the width (keep within road boundaries)
        const xPos = segment.position.x + (Math.random() * roadWidth - roadWidth / 2) * 0.8;
        
        // Determine obstacle type (75% box, 25% hole)
        const type = Math.random() > 0.75 ? 'hole' : 'box';
        
        // Size based on type
        const size: [number, number, number] = type === 'box' 
          ? [1 + Math.random(), 1 + Math.random(), 1 + Math.random()]
          : [2, 0.5, 2];
        
        newObstacles.push({
          id: `obstacle-${segment.id}-${i}`,
          position: new THREE.Vector3(xPos, segment.position.y + (type === 'box' ? size[1]/2 : -0.5), zPos),
          type,
          size
        });
      }
    });
    
    setObstacles(newObstacles);
  };
  
  // Generate decorative elements along the road
  const generateDecorations = (segments: RoadSegment[]) => {
    const newDecorations: Decoration[] = [];
    
    segments.forEach(segment => {
      // Skip the first segment
      if (segment.position.z < roadSegmentLength) return;
      
      // Generate trees, rocks, etc. along the sides of the road
      const decorCount = Math.floor(Math.random() * 8 + 4);
      
      for (let i = 0; i < decorCount; i++) {
        // Random position along the segment
        const zPos = segment.position.z - (Math.random() * segment.length);
        
        // Position on either side of the road
        const side = Math.random() > 0.5 ? 1 : -1;
        const xPos = segment.position.x + (roadWidth / 2 + 2 + Math.random() * 10) * side;
        
        // Determine decoration type
        const typeRandom = Math.random();
        let type: 'tree' | 'rock' | 'bush';
        
        if (typeRandom < 0.6) type = 'tree';
        else if (typeRandom < 0.9) type = 'rock';
        else type = 'bush';
        
        // Random scale
        const scale = type === 'tree' 
          ? 1 + Math.random() * 2 
          : 0.5 + Math.random();
        
        newDecorations.push({
          id: `decoration-${segment.id}-${i}`,
          position: new THREE.Vector3(xPos, segment.position.y, zPos),
          rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
          type,
          scale
        });
      }
    });
    
    setDecorations(newDecorations);
  };
  
  // Update player position reference (to be set by character controller)
  const updatePlayerPosition = (position: THREE.Vector3) => {
    playerRef.current.copy(position);
  };
  
  // Get current forward speed
  const getForwardSpeed = () => forwardSpeed;
  
  // Manually increase speed
  const increaseSpeed = () => {
    setForwardSpeed(prev => Math.min(prev + 5, 40)); // Increase by 5, capped at 40
  };
  
  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    updatePlayerPosition,
    getForwardSpeed,
    increaseSpeed
  }));
  
  // Handle road recycling and generation
  useFrame(() => {
    if (!playerRef.current) return;
    
    const playerZ = playerRef.current.z;
    
    // Check if we need to spawn new segments
    const lastSegment = roadSegments[roadSegments.length - 1];
    if (lastSegment && playerZ > lastSegment.position.z - visibleDistance) {
      // Create new segment
      const newSegmentZ = lastSegment.position.z + roadSegmentLength;
      const newSegment = createRoadSegment(newSegmentZ);
      
      // Update road segments (remove oldest, add newest)
      setRoadSegments(prev => {
        const updated = [...prev.slice(1), newSegment];
        
        // Also update obstacles and decorations
        setTimeout(() => {
          generateObstacles(updated);
          generateDecorations(updated);
        }, 0);
        
        return updated;
      });
    }
  });
  
  return (
    <group>
      {/* Render road segments */}
      {roadSegments.map(segment => (
        <RigidBody 
          key={segment.id} 
          type="fixed"
          position={[segment.position.x, segment.position.y, segment.position.z]}
          rotation={[segment.rotation.x, segment.rotation.y, segment.rotation.z]}
          colliders="cuboid"
        >
          <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[segment.width, segment.length]} />
            <meshStandardMaterial 
              map={roadTexture}
              roughness={0.8}
              metalness={0.2}
            />
          </mesh>
          {/* Physics collider */}
          <mesh>
            <boxGeometry args={[segment.width, 0.2, segment.length]} />
            <meshStandardMaterial visible={false} />
          </mesh>
          
          {/* Road edges */}
          <mesh position={[segment.width/2, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 1, segment.length]} />
            <meshStandardMaterial color="#888888" roughness={0.9} />
          </mesh>
          <mesh position={[-segment.width/2, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 1, segment.length]} />
            <meshStandardMaterial color="#888888" roughness={0.9} />
          </mesh>
        </RigidBody>
      ))}
      
      {/* Render obstacles */}
      {obstacles.map(obstacle => (
        obstacle.type === 'box' ? (
          <RigidBody 
            key={obstacle.id} 
            type="fixed" 
            position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
            colliders="cuboid"
          >
            <mesh castShadow receiveShadow>
              <boxGeometry args={obstacle.size} />
              <meshStandardMaterial 
                map={obstacleTexture}
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
          </RigidBody>
        ) : (
          <RigidBody 
            key={obstacle.id} 
            type="fixed" 
            position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
            colliders="cuboid"
            sensor
          >
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[obstacle.size[0], 16]} />
              <meshStandardMaterial color="#000" transparent opacity={0.7} />
            </mesh>
          </RigidBody>
        )
      ))}
      
      {/* Render decorations */}
      {decorations.map(decoration => (
        <group 
          key={decoration.id} 
          position={[decoration.position.x, decoration.position.y, decoration.position.z]}
          rotation={[decoration.rotation.x, decoration.rotation.y, decoration.rotation.z]}
          scale={decoration.scale}
        >
          {decoration.type === 'tree' && (
            <>
              <mesh castShadow position={[0, 2, 0]}>
                <coneGeometry args={[1.5, 3, 8]} />
                <meshStandardMaterial color="#2d4c25" />
              </mesh>
              <mesh castShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
                <meshStandardMaterial color="#6b4226" />
              </mesh>
            </>
          )}
          
          {decoration.type === 'rock' && (
            <mesh castShadow>
              <dodecahedronGeometry args={[1]} />
              <meshStandardMaterial color="#777777" roughness={0.9} />
            </mesh>
          )}
          
          {decoration.type === 'bush' && (
            <mesh castShadow>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color="#3a5e32" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
});

// This is a hook component that connects the player position to the endless road
export function ConnectPlayerToRoad({ playerRef, roadRef }: { 
  playerRef: React.RefObject<{ position: THREE.Vector3 }>, 
  roadRef: React.RefObject<EndlessRoadRef> 
}) {
  useFrame(() => {
    if (playerRef.current && roadRef.current) {
      const playerPos = playerRef.current.position.clone();
      roadRef.current.updatePlayerPosition(playerPos);
    }
  });
  
  return null;
} 