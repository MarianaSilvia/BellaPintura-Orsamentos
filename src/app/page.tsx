'use client';

import React, { useState } from 'react';
import {
  Paintbrush,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  Search,
  ArrowRight,
  Star,
  Building2,
  Droplets,
  Layers,
  Check,
  MapPin,
  Mail,
  Instagram,
  Facebook,
  ExternalLink,
  ChevronRight,
  Shield,
  Palette,
  Home,
  Hammer,
  AlertCircle,
} from 'lucide-react';
import AboutSection from '../components/landing/AboutSection';
import InteractiveHomeTour, { TourEnvironmentId } from '../components/landing/InteractiveHomeTour';

interface LandingPageProps {
  onAccessDashboard?: () => void;
  onOpenEstimate?: (estimateId: string) => void;
  onRequestQuote?: () => void;
  onOpenVisualAi?: () => void;
}

export default function LandingPage({
  onAccessDashboard,
  onOpenEstimate,
  onRequestQuote,
  onOpenVisualAi,
}: LandingPageProps) {
  const [estimateQuery, setEstimateQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | 'interna' | 'efeitos' | 'predial'>('todos');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteService, setQuoteService] = useState('Pintura Fina Interna');
  const [quoteCity, setQuoteCity] = useState('São Paulo - SP');
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Demo estimates known in the system
  const DEMO_ESTIMATES = [
    { code: 'ORC-2026-0042', id: 'est_001', client: 'Mariana B. Silva' },
    { code: 'ORC-2026-0043', id: 'est_002', client: 'Dr. Eduardo Vasconcelos' },
  ];

  const handleSearchEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = estimateQuery.trim().toUpperCase();
    if (!clean) {
      setSearchError('Por favor, informe o código do orçamento (ex: ORC-2026-0043) ou CPF.');
      return;
    }

    const found = DEMO_ESTIMATES.find(
      (item) => item.code.toUpperCase() === clean || item.id === clean.toLowerCase()
    );

    if (found) {
      setSearchError(null);
      if (onOpenEstimate) {
        onOpenEstimate(found.id);
      } else {
        window.location.hash = `#public-view-${found.id}`;
      }
    } else {
      // Fallback for custom or direct ID search
      if (clean.startsWith('ORC-') || clean.startsWith('EST_')) {
        const estId = clean.toLowerCase().startsWith('est_') ? clean.toLowerCase() : 'est_001';
        if (onOpenEstimate) {
          onOpenEstimate(estId);
        } else {
          window.location.hash = `#public-view-${estId}`;
        }
      } else {
        setSearchError('Orçamento não localizado com esse código. Verifique os dados ou fale conosco no WhatsApp.');
      }
    }
  };

  const handleQuickQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteName || !quotePhone) return;

    // Build WhatsApp direct message
    const msg = encodeURIComponent(
      `Olá! Gostaria de solicitar um orçamento para o serviço de ${quoteService}.\n\n` +
      `Nome: ${quoteName}\n` +
      `Telefone/WhatsApp: ${quotePhone}\n` +
      `Cidade: ${quoteCity}`
    );

    setQuoteSuccess(true);
    setTimeout(() => {
      window.open(`https://wa.me/5511988887777?text=${msg}`, '_blank');
      setIsQuoteModalOpen(false);
      setQuoteSuccess(false);
      setQuoteName('');
      setQuotePhone('');
    }, 1200);
  };

  const services = [
    {
      id: 'interna',
      title: 'Pintura Fina Interna',
      category: 'interna',
      icon: Home,
      tag: 'Alta Precisão',
      badge: 'Sem Sujeira',
      description:
        'Preparação impecável com emassamento, lixamento técnico com retenção de pó e aplicação de tintas acrílicas laváveis e acetinadas. Proteção total de pisos, rodapés e móveis.',
      features: ['Lixamento com aspiração', 'Tinta lavável e antimofo', 'Proteção milimétrica de pisos'],
      highlight: 'Garantia de 12 meses',
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      id: 'efeitos',
      title: 'Efeitos Especiais & Cimento Queimado',
      category: 'efeitos',
      icon: Sparkles,
      tag: 'Tendência 2026',
      badge: 'Efeito Rústico / Chique',
      description:
        'Aplicação profissional de Cimento Queimado (aveludado ou rústico diamantado), Efeito Mármore Calacatta e Texturas Acrílicas de destaque para salas, suítes e recepções.',
      features: ['Aplicação com desempenadeira inox', 'Hidro-repelência protetora', 'Paleta de tons nobres'],
      highlight: 'Certificação Técnica Suvinil',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: 'predial',
      title: 'Pintura Predial & Fachadas',
      category: 'predial',
      icon: Building2,
      tag: 'Obras & Condomínios',
      badge: 'Trabalho em Altura',
      description:
        'Restauração de fachadas, lavagem sob pressão, tratamento profundo de fissuras e trincas e pintura com tinta elastomérica hidro-repelente resistente a sol e chuva.',
      features: ['Emissão de ART/RRT', 'Equipe com NR-35 e EPIs', 'Tinta elástica contra trincas'],
      highlight: 'Garantia estendida de 5 anos',
      gradient: 'from-indigo-600 to-slate-800',
    },
    {
      id: 'impermeabilizacao',
      title: 'Impermeabilização & Tratamento de Umidade',
      category: 'interna',
      icon: Droplets,
      tag: 'Proteção Preventiva',
      badge: 'Anti-Infiltração',
      description:
        'Diagnóstico e erradicação definitiva de umidade ascendente, bolor e mofo antes da repintura, com barreiras químicas cristalizantes e seladores hidrofugantes.',
      features: ['Bloqueio de umidade de rodapé', 'Fundo preparador consolidante', 'Acabamento impermeável'],
      highlight: 'Zero retorno de mofo',
      gradient: 'from-cyan-600 to-teal-700',
    },
    {
      id: 'grafiato',
      title: 'Textura Grafiato & Rústica',
      category: 'efeitos',
      icon: Layers,
      tag: 'Área Externa',
      badge: 'Alta Resistência',
      description:
        'Revestimento decorativo de alta durabilidade para muros, corredores externos e fachadas. Cria ranhuras marcantes com repelência à água e fácil limpeza.',
      features: ['Malha 10 e Malha 12', 'Resistente a lavagens', 'Cores sob medida'],
      highlight: 'Não descasca no sol',
      gradient: 'from-slate-700 to-slate-900',
    },
    {
      id: 'reformas',
      title: 'Reparos em Drywall & Reformas Rápidas',
      category: 'interna',
      icon: Hammer,
      tag: 'Soluções Integradas',
      badge: 'Obra Rápida',
      description:
        'Consertos de gesso, fechamento de aberturas de ar-condicionado, colocação de sancas e molduras, e pequenas correções estruturais antes da pintura.',
      features: ['Tratamento de juntas com fita tela', 'Alinhamento com nível laser', 'Pronto para pintar'],
      highlight: 'Tudo com um só responsável',
      gradient: 'from-blue-700 to-indigo-900',
    },
  ];

  const filteredServices =
    activeTab === 'todos' ? services : services.filter((s) => s.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white text-xs py-2 px-4 text-center font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider">
            Novidade 2026
          </span>
          <span>
            Veja cores e acabamentos na sua parede antes de comprar a tinta.
          </span>
          <button
            type="button"
            onClick={onOpenVisualAi || (() => { window.location.hash = '#visual-ai'; })}
            className="underline font-bold hover:text-sky-200 transition ml-1"
          >
            Experimentar agora &rarr;
          </button>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/30">
              <Paintbrush className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                Bella Pintura <span className="text-sky-400">&amp; Reformas</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Engenharia de Acabamentos • Pintura Fina e Efeitos
              </p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#quem-somos" className="hover:text-white transition">
              Quem Somos
            </a>
            <a href="#servicos" className="hover:text-white transition">
              Serviços
            </a>
            <a href="#tour-ambientes" className="hover:text-white transition">
              Tour de Ambientes
            </a>
            <a href="#simulador" className="hover:text-white transition">
              Simulador Visual
            </a>
            <a href="#diferenciais" className="hover:text-white transition">
              Diferenciais
            </a>
            <a href="#consulta-orcamento" className="hover:text-white transition">
              Consultar Orçamento
            </a>
            <a href="#contato" className="hover:text-white transition">
              Contato
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#consulta-orcamento"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Acessar Meu Orçamento</span>
            </a>

            <button
              type="button"
              onClick={onAccessDashboard || (() => { window.location.hash = '#dashboard'; })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 transition active:scale-95"
              title="Acessar o Painel de Gestão e Criação de Orçamentos"
            >
              <span>Área do Pintor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Padrão Europeu de Pintura Residencial & Predial</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Transforme seus Ambientes com{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">
                  Acabamento Impecável
                </span>{' '}
                e Sem Poeira.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Esqueça as surpresas e a bagunça na obra. Visualize cores e acabamentos antes de aprovar,
                receba uma proposta clara com materiais, prazo, garantia e assinatura online.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-sm shadow-xl shadow-sky-500/25 transition active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Solicitar Orçamento Grátis</span>
                </button>

                <a
                  href="#simulador"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition"
                >
                  <Palette className="w-4 h-4 text-sky-400" />
                  <span>Ver Antes &amp; Depois Real</span>
                </a>
              </div>

              {/* Micro Social Proof & Assurances */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Garantia Real</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Até 5 anos em contrato</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-sky-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Sem Poeira</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Lixamento aspirado</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>4.9 / 5.0</span>
                  </div>
                  <p className="text-[11px] text-slate-400">+1.200 clientes felizes</p>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-indigo-400 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>No Prazo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Cronograma rígido</p>
                </div>
              </div>

            </div>

            {/* Hero Right Visual: Proposal Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl shadow-sky-950/50">
                  {/* Decorative Pill */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Proposta Comercial Digital
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-sky-400 font-bold bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800">
                      ORC-2026-0043
                    </span>
                  </div>

                  {/* Simulated Before & After Image */}
                  <div className="relative rounded-2xl overflow-hidden mb-5 border border-slate-700">
                    <img
                      src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80"
                      alt="Sala com acabamento em cimento queimado"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                      <Sparkles className="w-3 h-3" />
                      <span>Simulação visual aprovada</span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-[10px] font-bold text-white border border-slate-700">
                      Cimento Queimado Platina
                    </div>
                  </div>

                  {/* Estimate Snapshot Details */}
                  <div className="space-y-3 text-xs mb-5">
                    <div className="flex justify-between text-slate-300">
                      <span>Cliente:</span>
                      <span className="font-semibold text-white">Dra. Camila Vasconcelos</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Área Computada:</span>
                      <span className="font-semibold text-white">92,4 m² (2 demãos)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tintas Sugeridas:</span>
                      <span className="font-semibold text-white">1 Lata 18L + 1 Galão 3.6L</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/80">
                      <span className="text-slate-400 font-medium">Valor Total Aprovado:</span>
                      <span className="text-lg font-black text-emerald-400">R$ 3.850,00</span>
                    </div>
                  </div>

                  {/* Digital Signature Badge */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-emerald-300">Assinado Digitalmente</p>
                        <p className="text-[9px] text-emerald-400/80 font-mono">SHA-256: 8f4c9a2e... válido MP 2.200</p>
                      </div>
                    </div>
                    <a
                      href="#consulta-orcamento"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition"
                    >
                      Ver Demonstração
                    </a>
                  </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Institutional Presentation & 30-Year Heritage (Quem Somos) */}
      <AboutSection
        onRequestQuote={() => setIsQuoteModalOpen(true)}
        onExploreServices={() => {
          const el = document.getElementById('servicos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Services Portfolio Showcase (Fanpage Style) */}
      <section id="servicos" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-xs font-bold mb-3">
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Portfólio &amp; Serviços Especializados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Excelência Técnica do Rústico ao Acetinado
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Utilizamos equipamentos airless de última geração, tintas das melhores marcas e profissionais treinados.
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              {[
                { id: 'todos', label: 'Todos os Serviços' },
                { id: 'interna', label: 'Pintura Interna & Reparos' },
                { id: 'efeitos', label: 'Cimento Queimado & Efeitos' },
                { id: 'predial', label: 'Predial & Fachadas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-slate-950 rounded-3xl p-6 sm:p-7 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-sky-950/20"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${service.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-sky-400 font-bold text-[10px] uppercase tracking-wide">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition">
                      {service.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-1.5 mb-6">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Bottom Action */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {service.highlight}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setQuoteService(service.title);
                        setIsQuoteModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 text-xs font-bold transition"
                    >
                      <span>Orçar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Interactive Home Tour 360° Section */}
      <InteractiveHomeTour
        onCustomizeInSimulator={(envId: TourEnvironmentId) => {
          if (onOpenVisualAi) {
            onOpenVisualAi();
          } else {
            const el = document.getElementById('simulador');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Visual Simulation Section (Diferencial Competitivo) */}
      <section id="simulador" className="py-20 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 border border-sky-800/40 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Diferencial Exclusivo Bella Pintura</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Veja o resultado final na sua parede antes de gastar com tinta
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Você compara antes e depois, testa cores de mercado e entende como o acabamento vai
                  ficar no ambiente antes de aprovar o orçamento.
                </p>

                {/* 3 Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                    <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-2">
                      1
                    </span>
                    <p className="text-xs font-bold text-white">Envie uma Foto</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tire uma foto simples do cômodo com o celular.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                    <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-2">
                      2
                    </span>
                    <p className="text-xs font-bold text-white">Escolha a Cor</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Teste paletas, Cimento Queimado e iluminação.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left">
                    <span className="w-6 h-6 rounded-lg bg-sky-500 text-white font-black text-xs flex items-center justify-center mb-2">
                      3
                    </span>
                    <p className="text-xs font-bold text-white">Aprove sem Dúvidas</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Receba a proposta com materiais, prazo e garantia.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenVisualAi || (() => { window.location.hash = '#visual-ai'; })}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Abrir Simulador Visual</span>
                  </button>
                </div>
              </div>

              {/* Visual Showcase Graphic */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-sky-500/40 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
                    alt="Sala antes e depois da simulação"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-5">
                    <div className="text-left">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                        Simulação Real
                      </span>
                      <p className="text-xs font-bold text-white mt-1">Sala de Estar Contemporânea</p>
                      <p className="text-[11px] text-slate-300">Efeito Cimento Queimado Aveludado Platina</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Client Proposal Quick Lookup Portal (Section 5) */}
      <section id="consulta-orcamento" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700 text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>Portal de Acompanhamento do Cliente</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Já tem um orçamento em andamento?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              Digite o código da proposta ou seu CPF para visualizar o detalhamento técnico de materiais,
              a simulação de fotos e assinar digitalmente.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600" />

            <form onSubmit={handleSearchEstimate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Número do Orçamento ou Documento
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={estimateQuery}
                    onChange={(e) => {
                      setEstimateQuery(e.target.value);
                      setSearchError(null);
                    }}
                    placeholder="Ex: ORC-2026-0043 ou CPF"
                    className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono"
                  />
                </div>
              </div>

              {searchError && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-left">
                  <span className="text-[11px] text-slate-400 block font-medium">Orçamentos de Demonstração:</span>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {DEMO_ESTIMATES.map((demo) => (
                      <button
                        key={demo.code}
                        type="button"
                        onClick={() => {
                          setEstimateQuery(demo.code);
                          setSearchError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono text-[10px] font-bold border border-slate-700 transition"
                      >
                        {demo.code}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Acessar Proposta Digital</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="diferenciais" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              O que nossos clientes dizem
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Avaliações reais de proprietários, arquitetos e síndicos atendidos pela nossa equipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dra. Camila Vasconcelos',
                role: 'Proprietária em Moema',
                text: 'A simulação visual fez toda a diferença. Conseguimos ver o tom exato do Cimento Queimado na sala antes de aplicar. A equipe trabalhou sem poeira e entregou no prazo exato!',
                rating: 5,
              },
              {
                name: 'Eng. Roberto Alencar',
                role: 'Síndico Condomínio Reserva',
                text: 'Fizemos a pintura de todas as fachadas e halls. A proposta veio detalhada em PDF com metragem, latas calculadas e contrato assinado no tablet. Transparência impecável.',
                rating: 5,
              },
              {
                name: 'Mariana Duarte',
                role: 'Arquiteta & Designer',
                text: 'Indico a Bella Pintura para todos os meus projetos de interiores. O recorte é perfeito e o lixamento aspirado preserva o piso de madeira sem nenhum arranhão.',
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    "{t.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold">
                  <Paintbrush className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  Bella Pintura
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empresa especializada em engenharia de pintura fina, efeitos decorativos e restauração de fachadas.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white transition">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-white transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://wa.me/5511988887777" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-900 hover:text-emerald-400 transition">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Serviços */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Serviços</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#servicos" className="hover:text-white transition">Pintura Fina Interna</a></li>
                <li><a href="#servicos" className="hover:text-white transition">Cimento Queimado Platina</a></li>
                <li><a href="#servicos" className="hover:text-white transition">Pintura Predial &amp; Fachadas</a></li>
                <li><a href="#servicos" className="hover:text-white transition">Textura Grafiato Hidro-repelente</a></li>
                <li><a href="#servicos" className="hover:text-white transition">Impermeabilização Anti-Mofo</a></li>
              </ul>
            </div>

            {/* Col 3: Contato & Atendimento */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Atendimento</p>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>(11) 98888-7777</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Comercial</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>contato@bellapintura.com.br</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Acesso Rápido */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Acesso Profissional</p>
              <p className="text-xs text-slate-400">
                Pintores credenciados e administradores podem acessar o painel de orçamentos e simulações.
              </p>
              <button
                type="button"
                onClick={onAccessDashboard || (() => { window.location.hash = '#dashboard'; })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <span>Entrar no Painel do Pintor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-[10px] text-slate-400">CNPJ: 45.123.789/0001-90</p>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Bella Pintura &amp; Reformas. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              <span>Propostas seguras com carimbo SHA-256 e conformidade MP 2.200</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Quick Quote Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Orçamento Grátis e Sem Compromisso</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Solicitar Proposta Comercial
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Preencha os dados abaixo e nossa equipe entrará em contato com a simulação do seu ambiente.
            </p>

            {quoteSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-emerald-200">Redirecionando para o WhatsApp...</p>
                <p className="text-xs text-emerald-300/80">Nosso especialista já está pronto para te atender!</p>
              </div>
            ) : (
              <form onSubmit={handleQuickQuoteSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Seu Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="Ex: Ana Clara Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Serviço Desejado</label>
                  <select
                    value={quoteService}
                    onChange={(e) => setQuoteService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="Pintura Fina Interna">Pintura Fina Interna Residencial</option>
                    <option value="Cimento Queimado">Efeito Cimento Queimado / Mármore</option>
                    <option value="Pintura Predial e Fachadas">Pintura Predial e Fachadas</option>
                    <option value="Impermeabilização">Impermeabilização Anti-Mofo</option>
                    <option value="Textura Grafiato">Textura Grafiato e Rústica</option>
                    <option value="Reformas Rápidas">Reparos em Drywall / Reformas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cidade / Região</label>
                  <input
                    type="text"
                    value={quoteCity}
                    onChange={(e) => setQuoteCity(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar e Abrir no WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
