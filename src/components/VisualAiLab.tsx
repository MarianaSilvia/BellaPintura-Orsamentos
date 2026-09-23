import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Image as ImageIcon, Palette, Layers, CheckCircle2, ArrowRight, Download } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
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
  const { setCurrentView } = useApp();
  const [activeTemplate, setActiveTemplate] = useState(ROOM_TEMPLATES[0]);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>('BURNT_CEMENT');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Módulo de Simulação Visual com IA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Laboratório Visual de Pintura & Acabamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Permita que seus clientes visualizem o resultado final na parede antes de comprar a primeira lata de tinta.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('new-estimate')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
        >
          <span>Criar Orçamento com esta Simulação</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Template Selectors */}
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

      {/* Main Interactive Before/After Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Simulador em Tempo Real: {activeTemplate.name}
            </h2>
            <p className="text-xs text-slate-400">
              Deslize para o lado para inspecionar o contraste de luminosidade, opacidade e textura na parede.
            </p>
          </div>
        </div>

        <BeforeAfterSlider
          originalImage={activeTemplate.before}
          simulatedImage={activeTemplate.after}
          allowColorChange={true}
          onColorChange={(_, __, finish) => setSelectedFinish(finish)}
        />
      </div>

      {/* Benefits Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Aumento de até 42% na taxa de aprovação de propostas</span>
          </h3>
          <p className="text-xs text-slate-300">
            Clientes que conseguem visualizar a cor exata no ambiente aprovam mais rápido e com menos refações.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('new-estimate')}
          className="whitespace-nowrap px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
        >
          Incluir Simulação no Orçamento
        </button>
      </div>

    </div>
  );
};
export default VisualAiLab;
