'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles as SparklesIcon,
  RotateCcw,
  Palette,
  Check,
  Layers,
  Eye,
  Sliders,
  Maximize2,
  ShieldCheck,
  MousePointerClick
} from 'lucide-react';

export type WallFinishType = 'CEMENT' | 'MATTE_NAVY' | 'TERRACOTTA' | 'MARBLE';

export interface WallFinishConfig {
  id: WallFinishType;
  name: string;
  category: string;
  badge: string;
  color: string;
  roughness: number;
  metalness: number;
  specularColor: string;
  lightAccent: string;
  coats: string;
  washable: string;
  description: string;
}

export const WALL_FINISHES: Record<WallFinishType, WallFinishConfig> = {
  CEMENT: {
    id: 'CEMENT',
    name: 'Cimento Queimado Platina',
    category: 'Efeito Decorativo Nobre',
    badge: 'Urbano & Industrial',
    color: '#64748b',
    roughness: 0.72,
    metalness: 0.12,
    specularColor: '#94a3b8',
    lightAccent: '#38bdf8',
    coats: '2 demãos com desempenadeira inox',
    washable: 'Limpeza com pano úmido',
    description: 'Efeito contemporâneo com manchas suaves que reproduzem o concreto polido.',
  },
  MATTE_NAVY: {
    id: 'MATTE_NAVY',
    name: 'Acrílico Fosco Azul Petróleo',
    category: 'Pintura Fina Premium',
    badge: 'Aveludado & Intenso',
    color: '#0f2942',
    roughness: 0.94,
    metalness: 0.02,
    specularColor: '#38bdf8',
    lightAccent: '#0284c7',
    coats: '2 a 3 demãos de rolo microfibra',
    washable: '100% Super Lavável',
    description: 'Tinta acrílica ultra-opaca com toque aveludado e absorção uniforme de luz.',
  },
  TERRACOTTA: {
    id: 'TERRACOTTA',
    name: 'Grafiato Terracota Toscana',
    category: 'Textura Hidro-repelente',
    badge: 'Rústico de Alta Durabilidade',
    color: '#c25e34',
    roughness: 0.88,
    metalness: 0.05,
    specularColor: '#f97316',
    lightAccent: '#ea580c',
    coats: '1 demão de fundo + aplicação rústica',
    washable: 'Lavável sob pressão',
    description: 'Revestimento com ranhuras marcantes, hidrorrepelência e excelente proteção solar.',
  },
  MARBLE: {
    id: 'MARBLE',
    name: 'Mármore Calacatta Polido',
    category: 'Efeito Veneziano Cristal',
    badge: 'Luxo & Brilho Espelhado',
    color: '#f1f5f9',
    roughness: 0.14,
    metalness: 0.28,
    specularColor: '#ffffff',
    lightAccent: '#a855f7',
    coats: '3 demãos + cera protetora espelhada',
    washable: 'Polimento impermeável',
    description: 'Veios acinzentados sobre fundo branco com reflexão de iluminação arquitetônica.',
  },
};

/** Procedural Wall Texture Generator (SSR-Safe Canvas) */
function createProceduralTexture(type: WallFinishType): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'CEMENT') {
    // Cloud mottling for Burnt Cement
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 20 + Math.random() * 60;
      const alpha = 0.04 + Math.random() * 0.07;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(30,41,59,${alpha})`;
      ctx.fill();
    }
  } else if (type === 'TERRACOTTA') {
    // Vertical striations for Grafiato
    ctx.fillStyle = '#c25e34';
    ctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += 3 + Math.random() * 4) {
      const alpha = 0.08 + Math.random() * 0.15;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(90,25,10,${alpha})` : `rgba(255,180,140,${alpha})`;
      ctx.fillRect(x, 0, 1.5, 512);
    }
  } else if (type === 'MARBLE') {
    // Elegant veining for Calacatta Marble
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle veins
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.bezierCurveTo(120, 160, 220, 280, 480, 512);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(350, 0);
    ctx.bezierCurveTo(280, 180, 310, 320, 100, 512);
    ctx.stroke();
  } else {
    // Smooth fine matte grain
    ctx.fillStyle = '#0f2942';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/** 3D Room & Wall Mesh */
const ModernArchitecturalRoom: React.FC<{ finish: WallFinishConfig }> = ({ finish }) => {
  const wallMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Generate procedural canvas texture for texture fidelity
  const texture = useMemo(() => createProceduralTexture(finish.id), [finish.id]);

  // Smooth color and lighting transition with lerp
  useFrame((_, delta) => {
    if (wallMaterialRef.current) {
      const targetColor = new THREE.Color(finish.color);
      wallMaterialRef.current.color.lerp(targetColor, delta * 4);
      wallMaterialRef.current.roughness = THREE.MathUtils.lerp(
        wallMaterialRef.current.roughness,
        finish.roughness,
        delta * 4
      );
      wallMaterialRef.current.metalness = THREE.MathUtils.lerp(
        wallMaterialRef.current.metalness,
        finish.metalness,
        delta * 4
      );
    }
    if (spotLightRef.current) {
      const targetLightColor = new THREE.Color(finish.lightAccent);
      spotLightRef.current.color.lerp(targetLightColor, delta * 3);
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* 1. Main Feature Wall (Back) */}
      <mesh position={[0, 1.25, -1.8]} receiveShadow castShadow>
        <planeGeometry args={[5.2, 3.2, 32, 32]} />
        <meshStandardMaterial
          ref={wallMaterialRef}
          color={finish.color}
          map={texture || undefined}
          roughness={finish.roughness}
          metalness={finish.metalness}
        />
      </mesh>

      {/* 2. Side Return Wall (Architectural depth) */}
      <mesh position={[-2.6, 1.25, -0.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2.5, 3.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* 3. Floor (Polished Concrete / Hardwood with subtle reflection) */}
      <mesh position={[0, -0.35, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 2.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.2} />
      </mesh>

      {/* 4. Architectural Baseboard (Rodapé Branco Alto) */}
      <mesh position={[0, -0.28, -1.78]} castShadow>
        <boxGeometry args={[5.2, 0.16, 0.05]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* 5. Minimalist Floating Wood Shelf */}
      <mesh position={[0.4, 0.45, -1.6]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.06, 0.35]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>

      {/* Decorative Ceramic Vase on Shelf */}
      <mesh position={[0.1, 0.65, -1.6]} castShadow>
        <cylinderGeometry args={[0.07, 0.11, 0.32, 16]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Floating Modern Art Accent Frame */}
      <mesh position={[-1.1, 1.4, -1.77]} castShadow>
        <boxGeometry args={[1.1, 1.4, 0.03]} />
        <meshStandardMaterial color="#020617" roughness={0.8} />
      </mesh>
      <mesh position={[-1.1, 1.4, -1.75]}>
        <planeGeometry args={[0.95, 1.25]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} emissive="#0284c7" emissiveIntensity={0.15} />
      </mesh>

      {/* LED Cove Lighting strip above the baseboard */}
      <pointLight position={[0, -0.2, -1.7]} intensity={0.4} distance={2.5} color={finish.lightAccent} />

      {/* Primary Architectural Spotlight focused on Wall */}
      <spotLight
        ref={spotLightRef}
        position={[1.5, 3.2, 1.2]}
        target-position={[0, 1.2, -1.8]}
        angle={0.65}
        penumbra={0.8}
        intensity={2.2}
        castShadow
        color={finish.lightAccent}
      />
    </group>
  );
};

interface Interactive3DWallProps {
  onSelectFinish?: (finish: WallFinishConfig) => void;
  className?: string;
}

export const Interactive3DWall: React.FC<Interactive3DWallProps> = ({
  onSelectFinish,
  className = '',
}) => {
  const [activeFinishId, setActiveFinishId] = useState<WallFinishType>('CEMENT');
  const [isMounted, setIsMounted] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const controlsRef = useRef<any>(null);

  const activeFinish = WALL_FINISHES[activeFinishId];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleFinishChange = (id: WallFinishType) => {
    setActiveFinishId(id);
    if (onSelectFinish) {
      onSelectFinish(WALL_FINISHES[id]);
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl ${className}`}
      style={{ minHeight: '480px' }}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            Simulador 3D em Tempo Real
          </span>
          <span className="text-[10px] text-sky-400 font-mono font-semibold bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800">
            WebGL
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleResetCamera}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 backdrop-blur-md transition active:scale-95 shadow-md"
            title="Resetar ângulo de câmera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resetar Ângulo</span>
          </button>
        </div>
      </div>

      {/* Floating Drag Hint (Fades when user interacts) */}
      {!isInteracting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-500">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-[11px] text-slate-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
            <MousePointerClick className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
            <span>Arraste com o mouse para girar o ambiente em 3D</span>
          </div>
        </div>
      )}

      {/* 3D Canvas Area */}
      <div className="w-full h-[420px] sm:h-[480px]">
        {isMounted ? (
          <Canvas
            shadows
            camera={{ position: [0, 0.4, 3.2], fov: 46 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onPointerDown={() => setIsInteracting(true)}
          >
            {/* General Ambient Illumination */}
            <ambientLight intensity={0.65} />

            {/* Directional Soft Sun/Window Light */}
            <directionalLight
              position={[-3, 4, 3]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            {/* Glowing Dust Particles in Architectural Space */}
            <Sparkles
              count={28}
              scale={[4.5, 3, 3]}
              size={1.6}
              speed={0.3}
              opacity={0.4}
              color={activeFinish.lightAccent}
            />

            <Suspense fallback={null}>
              <ModernArchitecturalRoom finish={activeFinish} />
            </Suspense>

            {/* Orbit Controls with Natural Architectural Clamps */}
            <OrbitControls
              ref={controlsRef}
              enableZoom={false}
              enablePan={false}
              autoRotate={!isInteracting}
              autoRotateSpeed={0.6}
              dampingFactor={0.06}
              minPolarAngle={Math.PI / 2.8}
              maxPolarAngle={Math.PI / 1.95}
              minAzimuthAngle={-Math.PI / 4.5}
              maxAzimuthAngle={Math.PI / 4.5}
            />
          </Canvas>
        ) : (
          /* Loading Fallback for Server-Side Rendering */
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Carregando Cenário Arquitetônico 3D...</p>
          </div>
        )}
      </div>

      {/* Bottom Floating Finishes Selector HUD */}
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Finish Info Pill */}
          <div className="space-y-0.5 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {activeFinish.name}
              </span>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 border border-sky-800 px-2 py-0.5 rounded-full">
                {activeFinish.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {activeFinish.description}
            </p>
          </div>

          {/* Quick Swatch Selector Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            {(Object.keys(WALL_FINISHES) as WallFinishType[]).map((finishKey) => {
              const item = WALL_FINISHES[finishKey];
              const isSelected = activeFinishId === finishKey;

              return (
                <button
                  key={finishKey}
                  type="button"
                  onClick={() => handleFinishChange(finishKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition border ${
                    isSelected
                      ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="overflow-hidden">
                    <span className="block text-[11px] font-bold truncate">
                      {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-sky-400 ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Interactive3DWall;
