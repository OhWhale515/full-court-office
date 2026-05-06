"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, Text, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function BasketballCourt() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[-Math.PI / 12, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color="#0c0c14" />
      </mesh>

      {/* Grid Lines */}
      <gridHelper args={[20, 20, "#ff6b00", "#222230"]} position={[0, -0.49, 0]} />

      {/* Court Outlines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[19, 11]} />
        <meshStandardMaterial color="#ff6b00" wireframe />
      </mesh>

      {/* Stylized Center Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
        <ringGeometry args={[1.8, 2, 32]} />
        <meshStandardMaterial color="#ff6b00" emissive="#ff6b00" emissiveIntensity={2} />
      </mesh>

      {/* Floating Industrial Elements */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-6, 2, -2]}>
          <boxGeometry args={[1, 1, 1]} />
          <MeshDistortMaterial color="#ff6b00" speed={2} distort={0.4} />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <mesh position={[7, 1, 3]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#2563eb" wireframe />
        </mesh>
      </Float>

      {/* Text Elements */}
      <Text
        position={[0, 4, -5]}
        fontSize={1.5}
        color="#ff6b00"
        font="/fonts/Inter-Black.woff" // Assuming font availability or default
        anchorX="center"
        anchorY="middle"
      >
        FULL COURT OFFICE
      </Text>
      
      <Text
        position={[0, 3, -5]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        INSTITUTIONAL GRADE INTEL
      </Text>
    </group>
  );
}

export default function CourtScene() {
  return (
    <div className="w-full h-[400px] bg-background brutalist-border relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10 pointer-events-none" />
      
      {/* Corner Accents */}
      <div className="absolute top-4 left-4 z-20 border-t-2 border-l-2 border-accent w-8 h-8 opacity-40 group-hover:w-12 group-hover:h-12 transition-all" />
      <div className="absolute bottom-4 right-4 z-20 border-b-2 border-r-2 border-accent w-8 h-8 opacity-40 group-hover:w-12 group-hover:h-12 transition-all" />

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={40} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff6b00" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <BasketballCourt />
        
        <fog attach="fog" args={["#050508", 10, 25]} />
      </Canvas>
      
      <div className="absolute bottom-6 left-6 z-20">
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 bg-accent animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Court Rendering</span>
        </div>
      </div>
    </div>
  );
}
