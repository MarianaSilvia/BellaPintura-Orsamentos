import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Image as ImageIcon, Palette, Layers, CheckCircle2, ArrowRight, Download, Check, Sliders, Camera } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import WallSimulator from './simulator/WallSimulator';
import AdvancedSimulator, { MarketColor, TextureFinish, LightingMode } from './simulator/AdvancedSimulator';
import { FinishType } from '../services/EstimationEngine';

const ROOM_TEMPLATES = [
  {
    id: 'living',
    name: 'Sala de Estar Contemporânea',
    before: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&auto=format&fit=crop&q=80',
    description: 'Parede de destaque para aplicação de Cimento Queimado ou Acrílico Aveludado',
  },
  {
    id: 'bedroom',
    name: 'Suíte Master & Cabeceira',
    before: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=900&auto=format&fit=crop&q=80',
    after: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80',
    description: 'Tons acolhedores como Algodão Egípcio e Verde Sálvia para relaxamento',
  },
  {
    id: 'facade',
    name: 'Fachada & Área Externa',
    before: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
    after: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop&q=80',
    description: 'Textura Grafiato rústica com alta resistência contra intempéries e sol',
  },
];

export const VisualAiLab: React.FC = () => {
  const { startNewEstimateFromSimulation, setCurrentView } = useApp();
  const [simulatorMode, setSimulatorMode] = useState<'advanced' | 'templates'>('advanced');
  const [activeTemplate, setActiveTemplate] = useState(ROOM_TEMPLATES[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>('BURNT_CEMENT');
  const [selectedColorName, setSelectedColorName] = useState('Cimento Queimado Platina');
  const [selectedColorHex, setSelectedColorHex] = useState('#64748b');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleStartEstimateWithSimulation = () => {
    startNewEstimateFromSimulation(
      selectedFinish,
      selectedColorName,
      selectedColorHex,
      activeTemplate.name
    );
  };

  const handleAdvancedSimulatorSave = (data: {
    imageUrl: string;
    selectedColor: MarketColor;
    finish: TextureFinish;
    lighting: LightingMode;
    roomName: string;
  }) => {
    startNewEstimateFromSimulation(
      data.finish as FinishType,
      `${data.selectedColor.name} (${data.selectedColor.brand})`,
      data.selectedColor.hex,
      data.roomName
    );
  };

  const handleSimulatorSave = (data: {
    imageUrl: string;
    zoneSettings: any;
    roomName: string;
  }) => {
    const primaryFinish = data.zoneSettings.WALLS?.finish || 'BURNT_CEMENT';
    const primaryColorName = data.zoneSettings.WALLS?.colorName || 'Cor Personalizada';
    const primaryColorHex = data.zoneSettings.WALLS?.colorHex || '#64748b';

    startNewEstimateFromSimulation(
      primaryFinish,
      primaryColorName,
      primaryColorHex,
      data.roomName
    );
  };

  const handleDownloadPreview = () => {
    const link = document.createElement('a');
    link.href = activeTemplate.after;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.download = `simulacao-${activeTemplate.id}-${selectedColorName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Simulação visual para proposta • Bella Pintura</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Simulador de Cores &amp; Acabamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Escolha uma foto, teste cores e leve a combinação escolhida direto para o orçamento.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setSimulatorMode('advanced')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              simulatorMode === 'advanced'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Editar foto</span>
          </button>
          <button
            type="button"
            onClick={() => setSimulatorMode('templates')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              simulatorMode === 'templates'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Modelos prontos</span>
          </button>
        </div>
      </div>

      {simulatorMode === 'advanced' ? (
        /* Advanced Simulator with Precision Brush, Eraser, Lighting & Shadows */
        <AdvancedSimulator onSaveToEstimate={handleAdvancedSimulatorSave} />
      ) : (
        /* Presets Template Viewer */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROOM_TEMPLATES.map((tmpl) => {
              const isSelected = activeTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl)}
                  className={`p-4 rounded-2xl text-left border transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {tmpl.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Antes e depois: {activeTemplate.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Deslize para comparar o ambiente original com uma proposta de acabamento.
                </p>
              </div>
            </div>

            <BeforeAfterSlider
              originalImage={activeTemplate.before}
              simulatedImage={activeTemplate.after}
              allowColorChange={true}
              onColorChange={(colorHex, colorName, finish) => {
                setSelectedFinish(finish);
                setSelectedColorName(colorName);
                setSelectedColorHex(colorHex);
              }}
            />
          </div>
        </div>
      )}

      {/* Benefits Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Ajude o cliente a aprovar com segurança</span>
          </h3>
          <p className="text-xs text-slate-300">
            A simulação entra na proposta para reduzir dúvidas sobre cor, acabamento e resultado final.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartEstimateWithSimulation}
          className="whitespace-nowrap px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
        >
          Transformar em Orçamento
        </button>
      </div>

    </div>
  );
};
export default VisualAiLab;
