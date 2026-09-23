'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Armchair,
  Bed,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Compass,
  Palette,
  Droplets,
  Zap,
  Hammer,
  Eye,
  ChevronRight,
  Award
} from 'lucide-react';

export type TourEnvironmentId = 'fachada' | 'sala' | 'quarto' | 'cozinha';

export interface TourEnvironment {
  id: TourEnvironmentId;
  name: string;
  category: string;
  badge: string;
  tagline: string;
  description: string;
  image: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
  services: string[];
  masterTip: string;
  warranty: string;
  hotspots: {
    id: string;
    x: number; // percentage
    y: number; // percentage
    title: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }[];
}

export const TOUR_ENVIRONMENTS: TourEnvironment[] = [
  {
    id: 'fachada',
    name: 'Fachada & Área Externa',
    category: 'Pintura Predial & Residencial',
    badge: 'Proteção Climática UV',
    tagline: 'Imponência arquitetônica com blindagem contra intempéries e fissuras.',
    description:
      'Tratamento preventivo contra umidade, lavagem com hidro-jato, restauração de trincas com selador elastomérico e aplicação de Grafiato rústico de altíssima durabilidade.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
    icon: Building2,
    accentColor: '#38bdf8', // sky-400
    services: [
      'Pintura Elastomérica com bloqueio solar UV',
      'Textura Grafiato e Projetada com desempenadeira',
      'Impermeabilização de lajes, calhas e platibandas',
      'Pintura de portões, esquadrias e grades com esmalte',
    ],
    masterTip:
      'Recomendamos selador acrílico pigmentado antes da textura para garantir 100% de uniformidade na absorção.',
    warranty: 'Garantia de 5 anos em contrato',
    hotspots: [
      {
        id: 'hs-fac-1',
        x: 32,
        y: 42,
        title: 'Textura Grafiato Hidro-repelente',
        desc: 'Ranhuras minerais com proteção contra chuva e fungos.',
        icon: Droplets,
      },
      {
        id: 'hs-fac-2',
        x: 68,
        y: 28,
        title: 'Impermeabilização de Platibanda',
        desc: 'Manta líquida emborrachada para infiltração zero.',
        icon: ShieldCheck,
      },
      {
        id: 'hs-fac-3',
        x: 52,
        y: 75,
        title: 'Iluminação Cênica Externa',
        desc: 'Instalação de arandelas e balizadores em conformidade NBR.',
        icon: Zap,
      },
    ],
  },
  {
    id: 'sala',
    name: 'Sala de Estar Contemporânea',
    category: 'Pintura Fina & Efeitos Especiais',
    badge: 'Ambiente de Convivência',
    tagline: 'O coração do seu lar com acabamento aveludado e sem poeira.',
    description:
      'Emassamento com massa corrida PVA premium, lixamento técnico com aspirador industrial para zero pó na sua mobília, e aplicação de Cimento Queimado ou Acrílico Fosco acetinado.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85',
    icon: Armchair,
    accentColor: '#818cf8', // indigo-400
    services: [
      'Lixamento aspirado sem poeira (99.8% de retenção)',
      'Efeito Cimento Queimado com espátula de inox',
      'Sancas de gesso com fita de LED embutida',
      'Pintura ultra-lavável sem reflexos indesejados',
    ],
    masterTip:
      'Paredes de destaque com tons grafite ou cimento queimado valorizam a iluminação indireta quente.',
    warranty: 'Garantia de 24 meses de acabamento',
    hotspots: [
      {
        id: 'hs-sal-1',
        x: 48,
        y: 38,
        title: 'Parede Cimento Queimado',
        desc: 'Efeito marmorizado com desempenadeira inox especial.',
        icon: Sparkles,
      },
      {
        id: 'hs-sal-2',
        x: 25,
        y: 18,
        title: 'Sanca Iluminada com LED',
        desc: 'Projetos luminotécnicos com iluminação aconchegante.',
        icon: Zap,
      },
      {
        id: 'hs-sal-3',
        x: 75,
        y: 65,
        title: 'Rodapé Branco de 15cm',
        desc: 'Instalação alinhada a laser com calafetação acústica.',
        icon: Hammer,
      },
    ],
  },
  {
    id: 'quarto',
    name: 'Suíte Master & Cabeceira',
    category: 'Acabamentos Aconchegantes',
    badge: 'Descanso & Requinte',
    tagline: 'Cores serenas e texturas sedosas que promovem o descanso restaurador.',
    description:
      'Paletas harmônicas em tons neutros e terrosos, pintura de teto com tinta antimofo lavável e cabeceiras personalizadas com texturas de linho ou boiseries clássicos.',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&auto=format&fit=crop&q=85',
    icon: Bed,
    accentColor: '#f59e0b', // amber-500
    services: [
      'Pintura acetinada com toque sedoso ultra-suave',
      'Pintura de teto com fórmula antialérgica e antimofo',
      'Molduras boiserie em poliestireno e pintura fina',
      'Isolamento acústico em drywall e sancas fechadas',
    ],
    masterTip:
      'Tonalidades como Algodão Egípcio e Verde Sálvia trazem conforto térmico e elegância atemporal.',
    warranty: 'Garantia de 24 meses de acabamento',
    hotspots: [
      {
        id: 'hs-qua-1',
        x: 50,
        y: 45,
        title: 'Pintura Acetinada Toque de Seda',
        desc: 'Superfície uniforme com reflexão suave da luz.',
        icon: Palette,
      },
      {
        id: 'hs-qua-2',
        x: 78,
        y: 35,
        title: 'Tratamento de Teto Antimofo',
        desc: 'Proteção contra manchas de umidade e vapores.',
        icon: ShieldCheck,
      },
      {
        id: 'hs-qua-3',
        x: 22,
        y: 60,
        title: 'Pontos de Leitura & Tomadas USB',
        desc: 'Instalação elétrica embutida ao lado da cabeceira.',
        icon: Zap,
      },
    ],
  },
  {
    id: 'cozinha',
    name: 'Cozinha & Área Gourmet',
    category: 'Resistência & Praticidade',
    badge: '100% Super Lavável',
    tagline: 'Superfícies resistentes à gordura, vapores e limpezas constantes.',
    description:
      'Aplicação de esmalte base água epóxi para azulejos e paredes, tintas epóxi sem odor, instalações de tomadas dedicadas para fornos e eletrodomésticos com segurança total.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=85',
    icon: UtensilsCrossed,
    accentColor: '#10b981', // emerald-500
    services: [
      'Tinta Epóxi base água super resistente à gordura',
      'Pintura de azulejos antigos sem quebra-quebra',
      'Circuitos elétricos dedicados e proteção DR',
      'Impermeabilização de bancadas e áreas úmidas',
    ],
    masterTip:
      'Pintar os azulejos antigos com tinta epóxi moderniza a cozinha por uma fração do custo de troca de revestimento.',
    warranty: 'Garantia de 3 anos contra descolamento',
    hotspots: [
      {
        id: 'hs-coz-1',
        x: 62,
        y: 48,
        title: 'Pintura Epóxi de Alta Resistência',
        desc: 'Lavável com bucha e detergente neutro.',
        icon: Droplets,
      },
      {
        id: 'hs-coz-2',
        x: 35,
        y: 62,
        title: 'Circuitos 220V Dedicados',
        desc: 'Fiação dimensionada para fornos, coifas e micro-ondas.',
        icon: Zap,
      },
      {
        id: 'hs-coz-3',
        x: 80,
        y: 25,
        title: 'Perfil de LED Sob os Armários',
        desc: 'Iluminação técnica focada para preparo de alimentos.',
        icon: Sparkles,
      },
    ],
  },
];

interface InteractiveHomeTourProps {
  onCustomizeInSimulator?: (environmentId: TourEnvironmentId) => void;
  className?: string;
}

export const InteractiveHomeTour: React.FC<InteractiveHomeTourProps> = ({
  onCustomizeInSimulator,
  className = '',
}) => {
  const [activeEnvId, setActiveEnvId] = useState<TourEnvironmentId>('fachada');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const currentEnv = TOUR_ENVIRONMENTS.find((e) => e.id === activeEnvId) || TOUR_ENVIRONMENTS[0];

  const handleSelectEnvironment = (id: TourEnvironmentId) => {
    setActiveEnvId(id);
    setSelectedHotspot(null);
  };

  const handleRedirectToSimulator = () => {
    if (onCustomizeInSimulator) {
      onCustomizeInSimulator(currentEnv.id);
    } else {
      // Direct navigation fallback: changes hash to visual-ai and sets search param
      window.location.hash = `#visual-ai?environment=${currentEnv.id}`;
      // Smooth scroll if simulator is on page
      const el = document.getElementById('simulador');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="tour-ambientes"
      className={`relative w-full overflow-hidden bg-slate-950 py-20 text-slate-100 ${className}`}
    >
      {/* Background Section Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span>Tour Interativo por Ambientes • Bela Pintura LTDA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Explore a Nossa Maestria em Cada{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300">
              Cômodo do Seu Imóvel
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
            Selecione um ambiente abaixo para caminhar virtualmente pela obra. Clique nos pontos interativos
            (hotspots) para descobrir as técnicas aplicadas e leve o cômodo para o nosso simulador visual.
          </p>
        </div>

        {/* Floating Environment Selector Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
          {TOUR_ENVIRONMENTS.map((env) => {
            const Icon = env.icon;
            const isSelected = activeEnvId === env.id;

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => handleSelectEnvironment(env.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-lg ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white border-sky-400/80 ring-2 ring-sky-500/30 scale-105'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-sky-400'}`} />
                <span>{env.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Immersive Showcase Canvas Container */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex flex-col justify-end">
          
          {/* Animated Background Image with Framer Motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEnv.id}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentEnv.image}
                alt={currentEnv.name}
                className="w-full h-full object-cover brightness-[0.78] contrast-[1.05]"
              />

              {/* Cinematic Vignette Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/30" />
            </motion.div>
          </AnimatePresence>

          {/* Top Floating Badge Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-bold text-white shadow-xl pointer-events-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Ambiente: {currentEnv.name}</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-md ml-1">
                {currentEnv.badge}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-semibold text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentEnv.warranty}</span>
            </div>
          </div>

          {/* Interactive Hotspots Over Photo */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {currentEnv.hotspots.map((hs) => {
              const Icon = hs.icon;
              const isOpened = selectedHotspot === hs.id;

              return (
                <div
                  key={hs.id}
                  className="absolute pointer-events-auto transition-transform duration-300 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                >
                  {/* Pulsing Hotspot Trigger */}
                  <button
                    type="button"
                    onClick={() => setSelectedHotspot(isOpened ? null : hs.id)}
                    className="relative group p-2.5 rounded-full bg-slate-950/90 text-sky-400 border-2 border-sky-400/90 shadow-2xl hover:scale-125 transition-transform cursor-pointer"
                    title={hs.title}
                  >
                    <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-ping group-hover:bg-sky-400/60" />
                    <Icon className="w-4 h-4 text-white relative z-10" />
                  </button>

                  {/* Hotspot Popover Tooltip */}
                  <AnimatePresence>
                    {isOpened && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-sky-500/40 p-3.5 text-left shadow-2xl z-30"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-sky-400" />
                          <h4 className="text-xs font-bold text-white tracking-tight">{hs.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{hs.desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Bottom Glassmorphic Information & CTA Bar */}
          <div className="relative z-20 p-5 sm:p-7 lg:p-8 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              
              {/* Left Column: Story & Services Details */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    {currentEnv.category}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[10px] text-amber-300 font-semibold">
                    Tradição Familiar de 30 Anos
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {currentEnv.tagline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {currentEnv.description}
                </p>

                {/* 4 Feature Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {currentEnv.services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{srv}</span>
                    </div>
                  ))}
                </div>

                {/* Master Painter Tip */}
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-amber-300 font-bold">Dica Técnica dos Nossos Mestres:</strong>{' '}
                    {currentEnv.masterTip}
                  </p>
                </div>
              </div>

              {/* Right Column: Direct CTA to Simulator */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleRedirectToSimulator}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-sky-600/30 hover:shadow-sky-500/50 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <Palette className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Personalizar este ambiente no Simulador</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-slate-400">
                  Teste combinações de Cimento Queimado, Acrílico Fosco e Texturas com precisão de cores.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default InteractiveHomeTour;
