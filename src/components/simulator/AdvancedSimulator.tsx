'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Download,
  Paintbrush,
  Eraser,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Check,
  Eye,
  FileCheck2,
  ShieldCheck,
  Zap,
  RotateCcw,
  Palette,
  Droplets,
  Layers,
  ZoomIn
} from 'lucide-react';

export type LightingMode = 'DAYLIGHT' | 'WARM_NIGHT' | 'COOL_NIGHT';
export type ToolMode = 'VIEWER' | 'BRUSH' | 'ERASER';
export type TextureFinish = 'MATTE' | 'SATIN' | 'BURNT_CEMENT' | 'GRAFIATO';
export type SimulationZone = 'WALLS' | 'ACCENT_WALL' | 'CEILING' | 'TRIM';

export interface MarketColor {
  id: string;
  name: string;
  hex: string;
  brand: string;
  category: 'Neutros' | 'Modernos' | 'Vibrantes' | 'Terrosos';
}

export const REAL_MARKET_COLORS: MarketColor[] = [
  // Neutros
  { id: 'c-1', name: 'Branco Neve', hex: '#f8fafc', brand: 'Suvinil / Coral', category: 'Neutros' },
  { id: 'c-2', name: 'Algodão Egípcio', hex: '#eee9df', brand: 'Coral Decora', category: 'Neutros' },
  { id: 'c-3', name: 'Cinza Crômio', hex: '#d1d5db', brand: 'Suvinil Fosco', category: 'Neutros' },
  { id: 'c-4', name: 'Palha Clássica', hex: '#e8decb', brand: 'Sherwin-Williams', category: 'Neutros' },

  // Modernos
  { id: 'c-5', name: 'Cimento Platina', hex: '#64748b', brand: 'Efeito Especial', category: 'Modernos' },
  { id: 'c-6', name: 'Azul Cobalto Real', hex: '#1e3a8a', brand: 'Suvinil Premium', category: 'Modernos' },
  { id: 'c-7', name: 'Grafite Urbano', hex: '#334155', brand: 'Coral Acrílico', category: 'Modernos' },
  { id: 'c-8', name: 'Chumbo Escuro', hex: '#0f172a', brand: 'Sherwin Acetinado', category: 'Modernos' },

  // Terrosos & Vibrantes
  { id: 'c-9', name: 'Verde Sálvia', hex: '#849b8a', brand: 'Suvinil Toque Seda', category: 'Terrosos' },
  { id: 'c-10', name: 'Terracota Toscana', hex: '#be5332', brand: 'Textura Mineral', category: 'Terrosos' },
  { id: 'c-11', name: 'Mostarda Real', hex: '#c89228', brand: 'Coral Decora', category: 'Vibrantes' },
  { id: 'c-12', name: 'Rosé Calmo', hex: '#cca3a3', brand: 'Suvinil Clássica', category: 'Vibrantes' },
];

export const FINISH_DETAILS: { id: TextureFinish; title: string; subtitle: string; tag: string }[] = [
  { id: 'MATTE', title: 'Fosco Tradicional', subtitle: 'Ultra-opaca e antirreflexo', tag: 'Disfarça Imperfeições' },
  { id: 'SATIN', title: 'Acetinado Toque Seda', subtitle: 'Semibrilho elegante e lavável', tag: 'Alta Resistência' },
  { id: 'BURNT_CEMENT', title: 'Cimento Queimado', subtitle: 'Nuances contemporâneas inox', tag: 'Efeito Arquitetônico' },
  { id: 'GRAFIATO', title: 'Grafiato Rústico', subtitle: 'Ranhuras minerais com relevo', tag: 'Hidro-repelente' },
];

export const SAMPLE_ENVIRONMENTS = [
  {
    id: 'sala',
    name: 'Sala de Estar Contemporânea',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'quarto',
    name: 'Suíte Master & Cabeceira',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'fachada',
    name: 'Fachada & Área Externa',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
  },
];

interface AdvancedSimulatorProps {
  onSaveToEstimate?: (simulationData: {
    imageUrl: string;
    selectedColor: MarketColor;
    finish: TextureFinish;
    lighting: LightingMode;
    roomName: string;
  }) => void;
  initialImageUrl?: string;
  roomName?: string;
  className?: string;
}

export const AdvancedSimulator: React.FC<AdvancedSimulatorProps> = ({
  onSaveToEstimate,
  initialImageUrl,
  roomName = 'Sala de Estar Residencial',
  className = '',
}) => {
  // State variables
  const [imageSrc, setImageSrc] = useState<string>(initialImageUrl || SAMPLE_ENVIRONMENTS[0].url);
  const [currentRoomName, setCurrentRoomName] = useState<string>(roomName);
  const [selectedColor, setSelectedColor] = useState<MarketColor>(REAL_MARKET_COLORS[4]); // Cimento Platina
  const [selectedFinish, setSelectedFinish] = useState<TextureFinish>('BURNT_CEMENT');
  const [selectedZone, setSelectedZone] = useState<SimulationZone>('WALLS');
  const [lighting, setLighting] = useState<LightingMode>('DAYLIGHT');
  const [toolMode, setToolMode] = useState<ToolMode>('VIEWER');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [colorOpacity, setColorOpacity] = useState<number>(85); // 40 to 100
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Initializes the Paint Mask Canvas based on the chosen geometric zone
   */
  const initZoneMask = useCallback((width: number, height: number, zone: SimulationZone) => {
    let maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) {
      maskCanvas = document.createElement('canvas');
      maskCanvasRef.current = maskCanvas;
    }

    maskCanvas.width = width;
    maskCanvas.height = height;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();

    if (zone === 'WALLS') {
      // Main perspective walls
      ctx.moveTo(0, height * 0.22);
      ctx.lineTo(width * 0.65, height * 0.22);
      ctx.lineTo(width * 0.65, height * 0.90);
      ctx.lineTo(0, height * 0.88);
      ctx.closePath();
    } else if (zone === 'ACCENT_WALL') {
      // Accent focal wall
      ctx.moveTo(width * 0.65, height * 0.20);
      ctx.lineTo(width, height * 0.15);
      ctx.lineTo(width, height * 0.85);
      ctx.lineTo(width * 0.65, height * 0.90);
      ctx.closePath();
    } else if (zone === 'CEILING') {
      // Upper ceiling zone
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width * 0.9, height * 0.22);
      ctx.lineTo(width * 0.1, height * 0.22);
      ctx.closePath();
    } else if (zone === 'TRIM') {
      // Baseboards & trim
      ctx.rect(0, height * 0.88, width, height * 0.12);
    }

    ctx.fill();
  }, []);

  // Load Base Image
  useEffect(() => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      baseImageRef.current = img;
      const width = img.naturalWidth || 1000;
      const height = img.naturalHeight || 667;

      initZoneMask(width, height, selectedZone);
      renderComposite();
      setIsProcessing(false);
    };
    img.onerror = () => setIsProcessing(false);
  }, [imageSrc]);

  // When zone changes, reset and initialize mask for that zone
  useEffect(() => {
    if (baseImageRef.current) {
      const width = baseImageRef.current.naturalWidth || 1000;
      const height = baseImageRef.current.naturalHeight || 667;
      initZoneMask(width, height, selectedZone);
      renderComposite();
    }
  }, [selectedZone, initZoneMask]);

  // Re-render composite when style parameters change
  useEffect(() => {
    if (baseImageRef.current) {
      renderComposite();
    }
  }, [selectedColor, selectedFinish, lighting, colorOpacity]);

  /**
   * High-End Canvas Blending & Lighting Pipeline
   */
  const renderComposite = useCallback(() => {
    const img = baseImageRef.current;
    if (!img) return;

    const origCanvas = originalCanvasRef.current;
    const simCanvas = simulatedCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!origCanvas || !simCanvas || !maskCanvas) return;

    const width = img.naturalWidth || 1000;
    const height = img.naturalHeight || 667;

    if (origCanvas.width !== width || origCanvas.height !== height) {
      origCanvas.width = width;
      origCanvas.height = height;
    }
    if (simCanvas.width !== width || simCanvas.height !== height) {
      simCanvas.width = width;
      simCanvas.height = height;
    }

    const origCtx = origCanvas.getContext('2d');
    const simCtx = simCanvas.getContext('2d', { willReadFrequently: true });
    if (!origCtx || !simCtx) return;

    // 1. Draw base photo onto both canvases
    origCtx.drawImage(img, 0, 0, width, height);
    simCtx.drawImage(img, 0, 0, width, height);

    // 2. Offscreen Shading Buffer to compose realistic color & textures
    const shadeCanvas = document.createElement('canvas');
    shadeCanvas.width = width;
    shadeCanvas.height = height;
    const shadeCtx = shadeCanvas.getContext('2d', { willReadFrequently: true });
    if (!shadeCtx) return;

    // First draw base photo onto shading buffer so multiply/soft-light blends with ambient image luminance
    shadeCtx.drawImage(img, 0, 0, width, height);

    const alpha = colorOpacity / 100;

    // Pass 1: Multiply (Shadow Creases & Ambient Occlusion)
    shadeCtx.globalCompositeOperation = 'multiply';
    shadeCtx.fillStyle = selectedColor.hex;
    shadeCtx.globalAlpha = alpha * 0.88;
    shadeCtx.fillRect(0, 0, width, height);

    // Pass 2: Soft Light (Vibrant Pigments & Highlight Retention)
    shadeCtx.globalCompositeOperation = 'soft-light';
    shadeCtx.fillStyle = selectedColor.hex;
    shadeCtx.globalAlpha = alpha * 0.70;
    shadeCtx.fillRect(0, 0, width, height);

    // Pass 3: Finish Micro-Texture Simulation
    if (selectedFinish === 'BURNT_CEMENT') {
      applyBurntCementTexture(shadeCtx, width, height);
    } else if (selectedFinish === 'GRAFIATO') {
      applyGrafiatoTexture(shadeCtx, width, height);
    } else if (selectedFinish === 'SATIN') {
      applySatinLuster(shadeCtx, width, height);
    }

    // 3. Mask the shaded layer with user's paint/eraser mask
    shadeCtx.globalCompositeOperation = 'destination-in';
    shadeCtx.globalAlpha = 1.0;
    shadeCtx.drawImage(maskCanvas, 0, 0, width, height);

    // 4. Merge the masked shaded paint on top of simulated canvas
    simCtx.save();
    simCtx.globalCompositeOperation = 'source-over';
    simCtx.drawImage(shadeCanvas, 0, 0, width, height);
    simCtx.restore();

    // 5. Environmental Lighting Tint Temperature
    applyLightingTemperature(simCtx, width, height, lighting);

    // 6. Watermark Stamp
    simCtx.save();
    simCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    simCtx.font = 'bold 15px sans-serif';
    simCtx.textAlign = 'right';
    simCtx.fillText('Bella Pintura LTDA • Simulação Visual', width - 20, height - 20);
    simCtx.restore();
  }, [selectedColor, selectedFinish, lighting, colorOpacity]);

  /** Texture Generator: Burnt Cement / Cimento Queimado */
  const applyBurntCementTexture = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.32;

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 60 + Math.random() * 120;
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, radius);
      gradient.addColorStop(0, i % 2 === 0 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.55)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  /** Texture Generator: Grafiato Rústico */
  const applyGrafiatoTexture = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = 2.5;

    for (let x = 0; x < width; x += 12 + Math.random() * 8) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() * 8 - 4), height);
      ctx.stroke();
    }
    ctx.restore();
  };

  /** Texture Generator: Acetinado Toque Seda */
  const applySatinLuster = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.16;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  };

  /** Lighting Temperature Engine */
  const applyLightingTemperature = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: LightingMode
  ) => {
    ctx.save();
    if (mode === 'WARM_NIGHT') {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(0, 0, width, height);
    } else if (mode === 'COOL_NIGHT') {
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(186, 230, 253, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(30, 58, 138, 0.12)';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  };

  // Upload handler
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione uma imagem válida em JPG, PNG ou WebP.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setImageSrc(res);
        setCurrentRoomName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Accurate Coordinate Mapping using Canvas Bounding Box
   */
  const getCanvasCoords = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Global window listeners for mouseup/touchend to prevent stuck drags
  useEffect(() => {
    const handleGlobalRelease = () => {
      setIsDraggingSlider(false);
      setIsPainting(false);
      lastPointRef.current = null;
    };

    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
    };
  }, []);

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (toolMode === 'VIEWER') {
      setIsDraggingSlider(true);
      updateSliderFromPointer(e);
      return;
    }

    setIsPainting(true);
    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;
    drawStroke(coords.x, coords.y, coords.x, coords.y);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (toolMode === 'VIEWER') {
      if (isDraggingSlider) {
        updateSliderFromPointer(e);
      }
      return;
    }

    if (isPainting) {
      const coords = getCanvasCoords(e);
      const prev = lastPointRef.current || coords;
      drawStroke(prev.x, prev.y, coords.x, coords.y);
      lastPointRef.current = coords;
    }
  };

  const updateSliderFromPointer = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPosition(percentage);
  };

  /**
   * Continuous smooth stroke on mask canvas
   */
  const drawStroke = (x1: number, y1: number, x2: number, y2: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (toolMode === 'ERASER') {
      // Cuts out from the paint mask to reveal original clean picture underneath
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (toolMode === 'BRUSH') {
      // Adds painted area to mask
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
    renderComposite();
  };

  const handleResetMask = () => {
    if (baseImageRef.current) {
      const width = baseImageRef.current.naturalWidth || 1000;
      const height = baseImageRef.current.naturalHeight || 667;
      initZoneMask(width, height, selectedZone);
      renderComposite();
    }
  };

  // Export to Estimate
  const handleSaveToEstimate = () => {
    const simCanvas = simulatedCanvasRef.current;
    if (!simCanvas) return;

    const dataUrl = simCanvas.toDataURL('image/jpeg', 0.95);

    if (onSaveToEstimate) {
      onSaveToEstimate({
        imageUrl: dataUrl,
        selectedColor,
        finish: selectedFinish,
        lighting,
        roomName: currentRoomName,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Download Image
  const handleDownload = () => {
    const simCanvas = simulatedCanvasRef.current;
    if (!simCanvas) return;

    const link = document.createElement('a');
    link.href = simCanvas.toDataURL('image/jpeg', 0.95);
    link.download = `bela-pintura-${currentRoomName.toLowerCase().replace(/\s+/g, '-')}-simulado.jpg`;
    link.click();
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl space-y-6 ${className}`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Simulador Visual • Bella Pintura LTDA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Colorização Real com Pincel de Precisão &amp; Iluminação
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pinte, ajuste recortes perto de tomadas e rodapés, e simule o impacto da luz do dia e noturna.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadImage}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition active:scale-95"
            title="Enviar foto do próprio ambiente"
          >
            <Camera className="w-4 h-4" />
            <span>Carregar Foto do Cômodo</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
            title="Baixar imagem em HD"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar HD</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-100">
          {uploadError}
        </div>
      )}

      {/* Preset Ambientes Rápidos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium mr-1">Ou use fotos de teste:</span>
        {SAMPLE_ENVIRONMENTS.map((env) => (
          <button
            key={env.id}
            type="button"
            onClick={() => {
              setImageSrc(env.url);
              setCurrentRoomName(env.name);
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition border ${
              imageSrc === env.url
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500/50'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {env.name}
          </button>
        ))}
      </div>

      {/* Interactive Canvas Viewport */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 select-none shadow-2xl">
        
        {/* Top Controls: Lighting & Hold Original */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none flex-wrap gap-2">
          
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 pointer-events-auto">
            <button
              type="button"
              onClick={() => setLighting('DAYLIGHT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                lighting === 'DAYLIGHT'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Dia (Natural)</span>
            </button>

            <button
              type="button"
              onClick={() => setLighting('WARM_NIGHT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                lighting === 'WARM_NIGHT'
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Noite (Luz Quente)</span>
            </button>

            <button
              type="button"
              onClick={() => setLighting('COOL_NIGHT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                lighting === 'COOL_NIGHT'
                  ? 'bg-sky-600/30 text-sky-200 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Noite (LED Frio)</span>
            </button>
          </div>

          <button
            type="button"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>Segure: Foto Original</span>
          </button>
        </div>

        {/* Canvas Area with Pixel-Perfect Clip Path */}
        <div
          ref={containerRef}
          className={`relative w-full h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden flex items-center justify-center bg-slate-950 ${
            toolMode === 'VIEWER' ? 'cursor-ew-resize' : 'cursor-crosshair'
          }`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
        >
          {/* Base Layer: Simulated Canvas */}
          <canvas
            ref={simulatedCanvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top Layer: Original Canvas with Glitch-Free CSS Clip-Path */}
          <canvas
            ref={originalCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-[clip-path] duration-75"
            style={{
              clipPath: showOriginal
                ? 'inset(0 0 0 0)'
                : toolMode === 'VIEWER'
                ? `inset(0 ${100 - sliderPosition}% 0 0)`
                : 'inset(0 100% 0 0)',
            }}
          />

          {/* Slider Vertical Divider Line (Viewer Mode Only) */}
          {toolMode === 'VIEWER' && !showOriginal && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none transition-[left] duration-75"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] -translate-x-1/2" />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-sky-500 text-white shadow-2xl flex items-center justify-center border-2 border-white ring-4 ring-sky-500/30">
                <Sliders className="w-4 h-4 rotate-90" />
              </div>
              <span className="absolute top-16 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-slate-300 border border-slate-700 uppercase">
                Antes
              </span>
              <span className="absolute top-16 left-3 px-2 py-0.5 rounded-md bg-sky-500 text-slate-950 font-black text-[10px] uppercase shadow-md">
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

        {/* Toolbar: Pincel, Borracha e Comparador */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setToolMode('VIEWER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                toolMode === 'VIEWER' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Comparador Slider</span>
            </button>

            <button
              type="button"
              onClick={() => setToolMode('BRUSH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                toolMode === 'BRUSH' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Pincel de Precisão</span>
            </button>

            <button
              type="button"
              onClick={() => setToolMode('ERASER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                toolMode === 'ERASER' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Borracha de Recorte</span>
            </button>
          </div>

          {toolMode !== 'VIEWER' && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Tamanho:</span>
              <input
                type="range"
                min="8"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="font-mono text-sky-400 font-bold text-[11px]">{brushSize}px</span>

              <button
                type="button"
                onClick={handleResetMask}
                className="ml-2 text-[10px] text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-1"
                title="Reiniciar a máscara da área selecionada"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Área</span>
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            {toolMode === 'VIEWER' ? (
              <span>Arraste o divisor para comparar o Antes e Depois</span>
            ) : (
              <span className="text-sky-300 font-medium">
                {toolMode === 'BRUSH'
                  ? 'Pinte com o mouse ou toque para aplicar textura em áreas adicionais'
                  : 'Passe a borracha sobre portas, tomadas e móveis para remover a tinta'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Painel de Controle de Cores e Efeitos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Área do Ambiente a Colorir
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'WALLS', name: 'Paredes Principais', sub: 'Paredes de fundo e laterais' },
                { id: 'ACCENT_WALL', name: 'Parede de Destaque', sub: 'Parede de TV ou cabeceira' },
                { id: 'CEILING', name: 'Teto & Rebaixo', sub: 'Gesso e forro superior' },
                { id: 'TRIM', name: 'Rodapés & Sancas', sub: 'Molduras e guarnições' },
              ].map((zone) => {
                const isSelected = selectedZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone.id as SimulationZone)}
                    className={`p-3 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'bg-sky-950/70 border-sky-500 ring-2 ring-sky-500/20 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{zone.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{zone.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">Intensidade do Pigmento</span>
              <span className="font-mono text-sky-400 font-bold">{colorOpacity}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={colorOpacity}
              onChange={(e) => setColorOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Acabamento ou Textura Especial
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FINISH_DETAILS.map((f) => {
                const isSelected = selectedFinish === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFinish(f.id)}
                    className={`p-3 rounded-2xl text-left border transition ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/20 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-sky-400 block mb-0.5">{f.tag}</span>
                    <p className="text-xs font-bold">{f.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{f.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Catálogo de Cores Reais do Mercado
              </label>
              <span className="text-[11px] text-slate-400">
                Ativo: <strong className="text-white">{selectedColor.name}</strong> ({selectedColor.brand})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {REAL_MARKET_COLORS.map((color) => {
                const isSelected = selectedColor.id === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-sky-400 ring-1 ring-sky-400 text-white'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{color.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{color.brand}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Salvar na Proposta */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Simulação protegida com precisão cromática. Ao anexar, a proposta da{' '}
            <strong className="text-white">Bella Pintura LTDA</strong> incluirá os códigos de tinta e acabamentos escolhidos.
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
              <span>Anexar Simulação ao Orçamento</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AdvancedSimulator;
