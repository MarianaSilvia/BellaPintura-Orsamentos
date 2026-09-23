import React, { useState, useRef, useCallback } from 'react';
import { Sliders, Sparkles, Image as ImageIcon, Check, RefreshCw, Palette, Layers } from 'lucide-react';
import { FinishType } from '../services/EstimationEngine';

interface BeforeAfterSliderProps {
  originalImage?: string;
  simulatedImage?: string;
  initialSliderPosition?: number;
  allowColorChange?: boolean;
  onColorChange?: (colorHex: string, colorName: string, finish: FinishType) => void;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Cimento Queimado Platina', hex: '#64748b', finish: 'BURNT_CEMENT' as FinishType },
  { name: 'Azul Petróleo Nobre', hex: '#0e7490', finish: 'ACRYLIC_MATTE' as FinishType },
  { name: 'Terracota Concreto', hex: '#b45309', finish: 'GRAFIATO' as FinishType },
  { name: 'Algodão Egípcio', hex: '#e2e8f0', finish: 'ACRYLIC_SEMIGLOSS' as FinishType },
  { name: 'Verde Sálvia Suave', hex: '#4d7c0f', finish: 'ACRYLIC_MATTE' as FinishType },
  { name: 'Preto Absoluto / Carvão', hex: '#1e293b', finish: 'BURNT_CEMENT' as FinishType },
];

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
  simulatedImage = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&auto=format&fit=crop&q=80',
  initialSliderPosition = 50,
  allowColorChange = true,
  onColorChange,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(initialSliderPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [activeColor, setActiveColor] = useState(PRESET_COLORS[0]);
  const [customOriginal, setCustomOriginal] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCustomOriginal(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectColor = (item: typeof PRESET_COLORS[0]) => {
    setActiveColor(item);
    if (onColorChange) {
      onColorChange(item.hex, item.name, item.finish);
    }
  };

  const effectiveOriginal = customOriginal || originalImage;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Slider Visual Container */}
      <div
        ref={containerRef}
        className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden select-none shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 cursor-ew-resize touch-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* Layer 2: Simulated Wall (Full width beneath) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={simulatedImage}
            alt="Simulação visual de acabamento"
            className="w-full h-full object-cover"
          />
          {/* Real-time Dynamic Color Overlay to match selected color palette */}
          <div
            className="absolute inset-0 mix-blend-color opacity-70 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: activeColor.hex }}
          />
          {activeColor.finish === 'BURNT_CEMENT' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 mix-blend-overlay pointer-events-none" />
          )}

          {/* Badge Simulated */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-semibold shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulação: {activeColor.name}</span>
          </div>
        </div>

        {/* Layer 1: Original Wall (Clipped by slider position via CSS clip-path) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-[clip-path] duration-75"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={effectiveOriginal}
            alt="Parede Original"
            className="w-full h-full object-cover"
          />

          {/* Badge Original */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 text-slate-200 text-xs font-semibold shadow-md backdrop-blur-md">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Parede Original</span>
          </div>
        </div>

        {/* Divider Split Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 transition-transform pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle Grip */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-primary-500 cursor-ew-resize">
            <Sliders className="w-4 h-4 rotate-90 text-sky-600" />
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm pointer-events-none">
          Arraste para comparar antes e depois
        </div>
      </div>

      {/* Interactive Controls & Swatches */}
      {allowColorChange && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Palette className="w-4 h-4 text-sky-600" />
              <span>Testar cores e efeitos de pintura:</span>
            </div>

            {/* Upload Custom Photo Option */}
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 transition">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Enviar foto da parede</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_COLORS.map((c) => {
              const isSelected = activeColor.name === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectColor(c)}
                  className={`group flex items-center gap-2 p-2 rounded-lg text-left transition border ${
                    isSelected
                      ? 'border-sky-500 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border border-black/10 shadow-inner flex items-center justify-center text-white"
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {c.finish === 'BURNT_CEMENT' ? 'Cim. Queimado' : c.finish === 'GRAFIATO' ? 'Grafiato' : 'Acrílico'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default BeforeAfterSlider;
