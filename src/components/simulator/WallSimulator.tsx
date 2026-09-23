'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Check,
  RotateCcw,
  Download,
  FileCheck2,
  Eye,
  EyeOff,
  Sun,
  Camera,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Sparkle
} from 'lucide-react';

export type SimulationZone = 'WALLS' | 'ACCENT_WALL' | 'CEILING' | 'TRIM';

export type TextureFinish = 'MATTE' | 'SATIN' | 'BURNT_CEMENT' | 'GRAFIATO';

export interface ColorPreset {
  name: string;
  hex: string;
  category: string;
}

export const COMMERCIAL_COLORS: ColorPreset[] = [
  // Neutros & Clássicos
  { name: 'Branco Neve', hex: '#f8fafc', category: 'Clássicos' },
  { name: 'Algodão Egípcio', hex: '#ede8df', category: 'Clássicos' },
  { name: 'Cinza Crômio', hex: '#d1d5db', category: 'Clássicos' },
  { name: 'Palha Natural', hex: '#e2d9cc', category: 'Clássicos' },
  
  // Modernos & Urbanos
  { name: 'Cimento Queimado Platina', hex: '#64748b', category: 'Modernos' },
  { name: 'Azul Petróleo Profundo', hex: '#0f2942', category: 'Modernos' },
  { name: 'Grafite Urbano', hex: '#334155', category: 'Modernos' },
  { name: 'Chumbo Nobre', hex: '#1e293b', category: 'Modernos' },

  // Aconchegantes & Tendências
  { name: 'Verde Sálvia Suave', hex: '#8da399', category: 'Tendências' },
  { name: 'Terracota Toscana', hex: '#c25e34', category: 'Tendências' },
  { name: 'Areia do Deserto', hex: '#d4b996', category: 'Tendências' },
  { name: 'Rosé Calmo', hex: '#d8b4b4', category: 'Tendências' },
];

export const FINISH_OPTIONS: { id: TextureFinish; name: string; tag: string; desc: string }[] = [
  {
    id: 'MATTE',
    name: 'Tinta Fosca Tradicional',
    tag: 'Ultra-Opaca',
    desc: 'Disfarça imperfeições e absorve a luz sem reflexos.',
  },
  {
    id: 'SATIN',
    name: 'Acabamento Acetinado',
    tag: 'Toque de Seda',
    desc: 'Semibrilho elegante com alta lavabilidade e resistência.',
  },
  {
    id: 'BURNT_CEMENT',
    name: 'Cimento Queimado',
    tag: 'Efeito Decorativo',
    desc: 'Nuances contemporâneas e manchas de espátula inox.',
  },
  {
    id: 'GRAFIATO',
    name: 'Grafiato / Rústico',
    tag: 'Hidro-repelente',
    desc: 'Relevo ranhurado com alta resistência e proteção.',
  },
];

export const SAMPLE_ROOMS = [
  {
    id: 'living-modern',
    name: 'Sala de Estar Contemporânea',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'master-bedroom',
    name: 'Suíte Master & Cabeceira',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 'facade-house',
    name: 'Fachada & Área Externa',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
  },
];

interface ZoneSettings {
  colorHex: string;
  colorName: string;
  finish: TextureFinish;
  opacity: number; // 0 to 100
}

interface WallSimulatorProps {
  onSaveToEstimate?: (simulationData: {
    imageUrl: string;
    zoneSettings: Record<SimulationZone, ZoneSettings>;
    roomName: string;
  }) => void;
  initialImageUrl?: string;
  roomName?: string;
  className?: string;
}

export const WallSimulator: React.FC<WallSimulatorProps> = ({
  onSaveToEstimate,
  initialImageUrl,
  roomName = 'Ambiente do Cliente',
  className = '',
}) => {
  // Current loaded image source
  const [imageSrc, setImageSrc] = useState<string>(
    initialImageUrl || SAMPLE_ROOMS[0].url
  );
  const [activeZone, setActiveZone] = useState<SimulationZone>('WALLS');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentRoomName, setCurrentRoomName] = useState<string>(roomName);

  // Settings per Zone
  const [zoneConfig, setZoneConfig] = useState<Record<SimulationZone, ZoneSettings>>({
    WALLS: {
      colorHex: '#64748b',
      colorName: 'Cimento Queimado Platina',
      finish: 'BURNT_CEMENT',
      opacity: 85,
    },
    ACCENT_WALL: {
      colorHex: '#0f2942',
      colorName: 'Azul Petróleo Profundo',
      finish: 'MATTE',
      opacity: 80,
    },
    CEILING: {
      colorHex: '#f8fafc',
      colorName: 'Branco Neve',
      finish: 'MATTE',
      opacity: 70,
    },
    TRIM: {
      colorHex: '#f8fafc',
      colorName: 'Branco Neve',
      finish: 'SATIN',
      opacity: 90,
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);

  // Load image whenever imageSrc changes
  useEffect(() => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      baseImageRef.current = img;
      renderSimulation();
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [imageSrc]);

  // Re-render whenever zoneConfig changes
  useEffect(() => {
    if (baseImageRef.current) {
      renderSimulation();
    }
  }, [zoneConfig]);

  /**
   * Advanced Canvas Color Blending Engine
   * Preserves natural shadows, ambient occlusion, highlights and texture relief.
   */
  const renderSimulation = useCallback(() => {
    const img = baseImageRef.current;
    if (!img) return;

    const origCanvas = originalCanvasRef.current;
    const simCanvas = simulatedCanvasRef.current;
    if (!origCanvas || !simCanvas) return;

    const width = img.naturalWidth || 1000;
    const height = img.naturalHeight || 667;

    origCanvas.width = width;
    origCanvas.height = height;
    simCanvas.width = width;
    simCanvas.height = height;

    const origCtx = origCanvas.getContext('2d');
    const simCtx = simCanvas.getContext('2d', { willReadFrequently: true });
    if (!origCtx || !simCtx) return;

    // 1. Draw base photo on both
    origCtx.drawImage(img, 0, 0, width, height);
    simCtx.drawImage(img, 0, 0, width, height);

    // 2. Multi-Zone Architectural Layering
    // We compute segment geometric masks and color overlays
    const wallSetting = zoneConfig.WALLS;
    const ceilingSetting = zoneConfig.CEILING;
    const accentSetting = zoneConfig.ACCENT_WALL;

    // === LAYER A: CEILING ZONE (Top 25% with perspective gradient) ===
    applyZoneShading(
      simCtx,
      width,
      height,
      ceilingSetting,
      (ctx) => {
        // Ceiling polygon
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width * 0.85, height * 0.28);
        ctx.lineTo(width * 0.15, height * 0.28);
        ctx.closePath();
      }
    );

    // === LAYER B: ACCENT WALL (Center/Right vertical feature wall) ===
    applyZoneShading(
      simCtx,
      width,
      height,
      accentSetting,
      (ctx) => {
        // Accent wall polygon (right perspective)
        ctx.beginPath();
        ctx.moveTo(width * 0.58, height * 0.26);
        ctx.lineTo(width, height * 0.18);
        ctx.lineTo(width, height * 0.85);
        ctx.lineTo(width * 0.58, height * 0.92);
        ctx.closePath();
      }
    );

    // === LAYER C: MAIN WALLS (Left & background walls) ===
    applyZoneShading(
      simCtx,
      width,
      height,
      wallSetting,
      (ctx) => {
        // Main left and center walls polygon
        ctx.beginPath();
        ctx.moveTo(0, height * 0.26);
        ctx.lineTo(width * 0.58, height * 0.26);
        ctx.lineTo(width * 0.58, height * 0.92);
        ctx.lineTo(0, height * 0.88);
        ctx.closePath();
      }
    );

    // Add subtle watermark logo
    simCtx.save();
    simCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    simCtx.font = 'bold 16px sans-serif';
    simCtx.textAlign = 'right';
    simCtx.fillText('Bela Pintura LTDA • Simulação Inteligente', width - 20, height - 20);
    simCtx.restore();
  }, [zoneConfig]);

  /** Helper to apply realistic color blending over a path */
  const applyZoneShading = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    setting: ZoneSettings,
    definePath: (ctx: CanvasRenderingContext2D) => void
  ) => {
    ctx.save();
    definePath(ctx);
    ctx.clip();

    const opacity = setting.opacity / 100;

    // Pass 1: Multiply Blend Mode (Binds color to base luminance & shadow creases)
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = setting.colorHex;
    ctx.globalAlpha = opacity * 0.85;
    ctx.fillRect(0, 0, width, height);

    // Pass 2: Soft Light Blend Mode (Brings out rich saturation & highlights)
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = setting.colorHex;
    ctx.globalAlpha = opacity * 0.65;
    ctx.fillRect(0, 0, width, height);

    // Pass 3: Finish-Specific Micro Texture
    if (setting.finish === 'BURNT_CEMENT') {
      applyBurntCementNoise(ctx, width, height);
    } else if (setting.finish === 'GRAFIATO') {
      applyGrafiatoGrooves(ctx, width, height);
    } else if (setting.finish === 'SATIN') {
      applySatinSheen(ctx, width, height);
    }

    ctx.restore();
  };

  /** Procedural Burnt Cement Effect */
  const applyBurntCementNoise = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.28;

    // Draw organic trowel stroke patches
    for (let i = 0; i < 35; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rad = 50 + Math.random() * 120;
      const grad = ctx.createRadialGradient(rx, ry, 5, rx, ry, rad);
      grad.addColorStop(0, i % 2 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /** Procedural Grafiato Scratch Lines */
  const applyGrafiatoGrooves = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x += 14 + Math.random() * 8) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() * 10 - 5), height);
      ctx.stroke();
    }
    ctx.restore();
  };

  /** Procedural Satin Sheen Light */
  const applySatinSheen = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.15;
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(255,255,255,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  // Handle Photo Upload Instantaneously
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida (JPG ou PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageSrc(result);
        setCurrentRoomName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Update setting for active zone
  const updateActiveZoneColor = (color: ColorPreset) => {
    setZoneConfig((prev) => ({
      ...prev,
      [activeZone]: {
        ...prev[activeZone],
        colorHex: color.hex,
        colorName: color.name,
      },
    }));
  };

  const updateActiveZoneFinish = (finish: TextureFinish) => {
    setZoneConfig((prev) => ({
      ...prev,
      [activeZone]: {
        ...prev[activeZone],
        finish,
      },
    }));
  };

  const updateActiveZoneOpacity = (opacity: number) => {
    setZoneConfig((prev) => ({
      ...prev,
      [activeZone]: {
        ...prev[activeZone],
        opacity,
      },
    }));
  };

  // Mouse & Touch events for Before/After Slider
  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, pos)));
    },
    []
  );

  const handlePointerDown = () => setIsDraggingSlider(true);
  const handlePointerUp = () => setIsDraggingSlider(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onUp = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Export & Save Actions
  const handleSaveToEstimate = () => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    if (onSaveToEstimate) {
      onSaveToEstimate({
        imageUrl: dataUrl,
        zoneSettings: zoneConfig,
        roomName: currentRoomName,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadImage = () => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.download = `bela-pintura-${currentRoomName.toLowerCase().replace(/\s+/g, '-')}-simulacao.jpg`;
    link.click();
  };

  const activeZoneConfig = zoneConfig[activeZone];

  const zoneLabels: Record<SimulationZone, { title: string; subtitle: string }> = {
    WALLS: { title: 'Paredes Principais', subtitle: 'Paredes frontais e laterais do cômodo' },
    ACCENT_WALL: { title: 'Parede de Destaque', subtitle: 'Parede focal (TV, cabeceira ou hall)' },
    CEILING: { title: 'Teto & Rebaixo', subtitle: 'Gesso, laje e forro superior' },
    TRIM: { title: 'Rodapés & Sancas', subtitle: 'Acabamentos e molduras arquitetônicas' },
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl space-y-6 ${className}`}>
      
      {/* Top Bar: Title & Upload Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Simulador de Pintura &amp; Texturas Inteligente</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Colorize suas Paredes com Texturas Reais
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserva iluminação, sombras e detalhes arquitetônicos da foto original.
          </p>
        </div>

        {/* Action Buttons: Upload & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition active:scale-95"
            title="Carregar foto do seu próprio cômodo"
          >
            <Camera className="w-4 h-4" />
            <span>Enviar Minha Foto (JPG/PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
            title="Baixar imagem simulada em alta resolução"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar Foto</span>
          </button>
        </div>
      </div>

      {/* Preset Rooms Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium mr-1">Ou teste modelos prontos:</span>
        {SAMPLE_ROOMS.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => {
              setImageSrc(room.url);
              setCurrentRoomName(room.name);
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition border ${
              imageSrc === room.url
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {room.name}
          </button>
        ))}
      </div>

      {/* Main Interactive Viewer & Before/After Slider */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl select-none">
        
        {/* Floating Controls HUD over Image */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">{currentRoomName}</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold backdrop-blur-md transition shadow-md flex items-center gap-1.5"
              title="Segure para ver a foto original sem tinta"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Segure: Foto Original</span>
            </button>
          </div>
        </div>

        {/* Viewport Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-full h-[360px] sm:h-[480px] lg:h-[540px] overflow-hidden cursor-ew-resize touch-none"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Layer 1: Simulated Canvas (Underneath) */}
          <canvas
            ref={simulatedCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Layer 2: Original Canvas (Clipped by slider position via CSS clip-path) */}
          <canvas
            ref={originalCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-[clip-path] duration-75"
            style={{
              clipPath: showOriginal
                ? 'inset(0 0 0 0)'
                : `inset(0 ${100 - sliderPosition}% 0 0)`,
            }}
          />

          {/* Vertical Slider Handle Line */}
          {!showOriginal && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none transition-[left] duration-75"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] -translate-x-1/2" />
              
              {/* Draggable Badge */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-sky-500 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-sky-500/30">
                <Sliders className="w-4 h-4 rotate-90" />
              </div>

              {/* Tags: Antes & Depois */}
              <span className="absolute top-6 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-300 border border-slate-700">
                Antes
              </span>
              <span className="absolute top-6 left-3 px-2 py-0.5 rounded-md bg-sky-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                Depois
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-200">Processando iluminação e sombras...</p>
            </div>
          )}
        </div>

        {/* Bottom Bar: Slider Instruction */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Arraste o divisor para comparar o Antes e Depois</span>
          <span className="font-mono text-sky-400 font-bold">{Math.round(sliderPosition)}% Simulação</span>
        </div>
      </div>

      {/* Control Panel: Zones, Colors, Textures & Blending */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Target Zones Selector */}
        <div className="lg:col-span-4 space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Selecione a Área do Ambiente
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {(Object.keys(zoneLabels) as SimulationZone[]).map((zoneKey) => {
              const info = zoneLabels[zoneKey];
              const isSelected = activeZone === zoneKey;
              const config = zoneConfig[zoneKey];

              return (
                <button
                  key={zoneKey}
                  type="button"
                  onClick={() => setActiveZone(zoneKey)}
                  className={`p-3 rounded-2xl text-left transition border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-500 ring-2 ring-sky-500/20 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-bold truncate">{info.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{config.colorName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: config.colorHex }}
                    />
                    {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Opacity / Intensity Slider for Active Zone */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">Intensidade da Cor</span>
              <span className="font-mono text-sky-400 font-bold">{activeZoneConfig.opacity}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={activeZoneConfig.opacity}
              onChange={(e) => updateActiveZoneOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Right Column: Colors & Finishes */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Texture & Finish Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Escolha o Efeito ou Acabamento da Tinta
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FINISH_OPTIONS.map((finish) => {
                const isSelected = activeZoneConfig.finish === finish.id;
                return (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => updateActiveZoneFinish(finish.id)}
                    className={`p-3 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/20 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-sky-400 block mb-1">
                      {finish.tag}
                    </span>
                    <p className="text-xs font-bold text-slate-200">{finish.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{finish.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Swatches Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Paleta de Cores Comerciais (Suvinil / Coral / Sherwin)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Personalizado:</span>
                <input
                  type="color"
                  value={activeZoneConfig.colorHex}
                  onChange={(e) =>
                    setZoneConfig((prev) => ({
                      ...prev,
                      [activeZone]: {
                        ...prev[activeZone],
                        colorHex: e.target.value,
                        colorName: 'Cor Personalizada',
                      },
                    }))
                  }
                  className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {COMMERCIAL_COLORS.map((col) => {
                const isSelected = activeZoneConfig.colorHex.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => updateActiveZoneColor(col)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-400 text-white'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: col.hex }}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{col.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono uppercase">{col.hex}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Save & Export Actions Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Simulação protegida com precisão cromática. Ao salvar, a imagem é anexada à proposta técnica da{' '}
            <strong className="text-white">Bela Pintura LTDA</strong>.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveToEstimate}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs shadow-xl transition flex items-center justify-center gap-2 active:scale-95 ${
            saveSuccess
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Simulação Anexada ao Orçamento com Sucesso!</span>
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" />
              <span>Salvar Simulação no Orçamento</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default WallSimulator;
