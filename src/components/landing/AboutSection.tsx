'use client';

import React from 'react';
import {
  Award,
  ShieldCheck,
  Clock,
  Sparkles,
  Users,
  Paintbrush,
  Zap,
  Hammer,
  Cpu,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  History,
  Building,
  Home
} from 'lucide-react';

interface AboutSectionProps {
  onRequestQuote?: () => void;
  onExploreServices?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onRequestQuote,
  onExploreServices,
}) => {
  const specialties = [
    {
      icon: Paintbrush,
      title: 'Pintura de Alta Performance',
      badge: 'Acabamento Impecável',
      description:
        'Pintura fina residencial, recuperação de fachadas prediais e efeitos especiais como Cimento Queimado, Mármore Calacatta e Grafiato. Lixamento aspirado sem poeira.',
      features: ['Lixamento técnico sem pó', 'Tintas nobres e laváveis', 'Alinhamento a laser'],
      gradient: 'from-sky-500 to-blue-600',
    },
    {
      icon: Zap,
      title: 'Elétrica Residencial & Comercial',
      badge: 'Segurança & Normas NBR',
      description:
        'Projetos luminotécnicos com fitas de LED e perfis embutidos, troca de fiação, quadros de distribuição modernos e automação residencial com segurança máxima.',
      features: ['Iluminação técnica e decorativa', 'Quadros com proteção DR', 'Adequação às normas NBR 5410'],
      gradient: 'from-amber-500 to-yellow-600',
    },
    {
      icon: Hammer,
      title: 'Reformas Gerais & Manutenção',
      badge: 'Do Chão ao Teto',
      description:
        'Soluções completas integradas: instalação e reparos em drywall, sancas, alvenaria, pisos, revestimentos cerâmicos e impermeabilização preventiva contra umidade.',
      features: ['Gesso acartonado e molduras', 'Impermeabilização estrutural', 'Reparos rápidos sem estresse'],
      gradient: 'from-emerald-500 to-teal-700',
    },
    {
      icon: Cpu,
      title: 'Gestão Digital de Obras',
      badge: 'Inovação & Transparência',
      description:
        'A tradição dos mestres de obra aliada à tecnologia: simulação visual de cores por IA, cálculo preciso de latas sem desperdício e propostas digitais com assinatura jurídica.',
      features: ['Simulação de fotos com IA', 'Cálculo exato de materiais', 'Contratos assinados online'],
      gradient: 'from-indigo-600 to-purple-700',
    },
  ];

  const pillars = [
    {
      icon: HeartHandshake,
      title: 'Tradição Familiar & Confiança',
      desc: 'Mais de 3 décadas honrando a palavra com respeito absoluto ao seu lar e ao seu patrimônio.',
    },
    {
      icon: ShieldCheck,
      title: 'Garantia Contratual Real',
      desc: 'Todas as etapas documentadas com termos de garantia de até 5 anos e conformidade técnica.',
    },
    {
      icon: Clock,
      title: 'Pontualidade Britânica',
      desc: 'Cronograma rigoroso com data certa para início e término, sem imprevistos na sua rotina.',
    },
    {
      icon: Sparkles,
      title: 'Cuidado & Obra Limpa',
      desc: 'Isolamento milimétrico de pisos, móveis e esquadrias. Deixamos o ambiente pronto para morar.',
    },
  ];

  const metrics = [
    { value: '+30', label: 'Anos de Tradição', sub: 'Desde 1994 no mercado' },
    { value: '+2.400', label: 'Obras Realizadas', sub: 'Residências e condomínios' },
    { value: '100%', label: 'Garantia e Nota Fiscal', sub: 'Segurança jurídica e técnica' },
    { value: '4.9 ★', label: 'Satisfação dos Clientes', sub: 'Mais de 1.200 avaliações' },
  ];

  return (
    <section id="quem-somos" className="py-24 bg-slate-950 text-slate-100 relative overflow-hidden border-t border-slate-800">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Mais de 30 Anos de Tradição e Excelência</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            A Arte de Transformar Ambientes com a Solidez de uma{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-400 to-blue-400">
              Família Dedicada à Sua Obra
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 mt-5 leading-relaxed">
            Fundada com os princípios do respeito, da palavra cumprida e do primor em cada demão de tinta,
            a <strong className="text-white font-bold">Bela Pintura LTDA</strong> une mais de três décadas de
            mestria artesanal à mais moderna tecnologia em pintura, instalações elétricas e reformas completas.
          </p>
        </div>

        {/* Storytelling Narrative Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl mb-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Story Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                <History className="w-4 h-4" />
                <span>Nossa História &amp; Valores</span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                Construindo lares impecáveis há mais de três décadas
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tudo começou como uma vocação de família: transformar imóveis com o mesmo carinho e zelo
                que dedicamos à nossa própria casa. Ao longo de 30 anos, acompanhamos a evolução das melhores
                fórmulas de tintas, as inovações em iluminação arquitetônica e os sistemas modernos de acabamentos.
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hoje, somos referência porque combinamos o valor sagrado da <strong>confiança familiar</strong> com
                as ferramentas mais inovadoras da engenharia moderna: simulador 3D de cores por foto com IA,
                orçamentos técnicos auditáveis e equipes treinadas para entregar obras limpas e no prazo acordado.
              </p>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {pillars.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-800/60 flex items-center justify-center shrink-0 text-sky-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Visual Image & Certificate */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"
                  alt="Mestres de pintura e reforma da Bela Pintura"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                      Selo 30 Anos
                    </span>
                    <span className="text-[10px] text-slate-300 font-semibold">
                      Tradição • Família • Segurança
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    "O nosso maior patrimônio é a palavra que mantemos com cada cliente."
                  </h4>
                  <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                    Diretoria &amp; Mestres da Bela Pintura LTDA
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Core Specialties Cards Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Nossas Áreas de Maestria &amp; Soluções Integradas
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Centralize toda a sua obra com uma equipe multidisciplinar experiente e evite o estresse de múltiplos fornecedores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-sky-950/20"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${spec.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-300 font-bold text-[9px] uppercase tracking-wide">
                        {spec.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-sky-300 transition">
                      {spec.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {spec.description}
                    </p>

                    <ul className="space-y-1.5 mb-6">
                      {spec.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={onRequestQuote}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-sky-600 hover:text-white text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Solicitar Este Serviço</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m, i) => (
            <div key={i} className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-sky-400 font-mono">
                {m.value}
              </span>
              <p className="text-xs font-bold text-white">{m.label}</p>
              <p className="text-[11px] text-slate-400">{m.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
