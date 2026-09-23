import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Calendar,
  Phone,
  MessageCircle,
  Share2,
  FileDown,
  Sparkles,
  Layers,
  PaintBucket,
  User,
  MapPin,
  FileCheck,
  Lock,
  ArrowLeft,
  Copy,
  Download,
  AlertTriangle
} from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import SignatureModal from './SignatureModal';

export const PublicClientProposalView: React.FC = () => {
  const {
    currentCompany,
    estimates,
    customers,
    selectedEstimateId,
    signEstimate,
    setCurrentView,
    openPdfView
  } = useApp();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const estimate = estimates.find((e) => e.id === selectedEstimateId) || estimates[0];
  const customer = customers.find((c) => c.id === estimate?.customerId);
  const clientGreetingName = customer?.name
    ?.replace(/^(dr\.?|dra\.?)\s+/i, '')
    .trim()
    .split(/\s+/)[0];
  const proposalGreeting = clientGreetingName ? `Olá, ${clientGreetingName}.` : 'Olá.';

  if (!estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="text-center">
          <p className="text-lg font-semibold">Orçamento não encontrado</p>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  const isApproved = estimate.status === 'APPROVED';

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! A ${currentCompany.tradeName || currentCompany.name} preparou sua proposta de pintura para ${estimate.title}.\n` +
      `Código: ${estimate.code}\n` +
      `Valor: R$ ${estimate.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Acesse para ver os ambientes, a simulação visual e aprovar online: ${window.location.origin}/#public-view-${estimate.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#public-view-${estimate.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectSign = async (name: string, doc: string, signatureImg: string) => {
    return await signEstimate(estimate.id, name, doc, signatureImg);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Bar for Demonstration / Contractor Controls */}
      <div className="no-print bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            Modo demonstração: esta é a visão que o cliente recebe para revisar e aprovar a proposta.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel</span>
          </button>
          <button
            onClick={() => openPdfView(estimate.id)}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Ver versão para impressão</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header Hero Card with Company Branding */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: currentCompany.primaryColor }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={currentCompany.logo || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=160&auto=format&fit=crop&q=80'}
                alt={currentCompany.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentCompany.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pintura fina, reforma e acabamentos • {currentCompany.city}/{currentCompany.state}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={`https://wa.me/${currentCompany.whatsapp}?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20o%20or%C3%A7amento%20${estimate.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Falar no WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${currentCompany.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition"
                  >
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{currentCompany.phone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Status Stamp */}
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Situação
              </span>
              {isApproved ? (
                <div className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-sm font-bold border border-emerald-300 dark:border-emerald-800 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>APROVADA E ASSINADA</span>
                </div>
              ) : (
                <div className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-sm font-bold border border-amber-300 dark:border-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>AGUARDANDO APROVAÇÃO</span>
                </div>
              )}
              <span className="text-[11px] text-slate-500 mt-1 font-mono">
                Ref: {estimate.code}
              </span>
            </div>
          </div>

          <div className="pt-6">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              {proposalGreeting} Preparamos uma proposta completa para
              <strong className="text-slate-900 dark:text-white"> {estimate.title}</strong>, com ambientes, materiais,
              prazo, garantia e simulação visual para você aprovar com tranquilidade.
            </p>
          </div>

          {/* Project & Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-sm">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Cliente</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {customer?.name || 'Cliente'}
              </p>
              <p className="text-xs text-slate-500">{customer?.document || 'CPF não informado'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Local da Obra</span>
              <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                {customer?.address || 'Endereço fornecido pelo cliente'}
              </p>
              <p className="text-xs text-slate-500">{customer?.city}/{customer?.state}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Prazo previsto</span>
              <p className="font-semibold text-sky-600 dark:text-sky-400 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{estimate.estimatedDays} dias úteis</span>
              </p>
              <p className="text-xs text-slate-500">Validade da proposta: {estimate.validityDays} dias</p>
            </div>
          </div>
        </div>

        {/* Visual Simulation Interactive Module (Before & After Slider) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Antes e Depois do Acabamento</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Compare o ambiente original com a proposta de cor e acabamento planejada.
              </p>
            </div>
          </div>

          <BeforeAfterSlider
            originalImage={estimate.environments[0]?.originalPhotoUrl}
            simulatedImage={estimate.environments[0]?.simulatedPhotoUrl}
            allowColorChange={true}
          />
        </div>

        {/* Room By Room Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <span>O que está incluído ({estimate.environments.length} ambiente{estimate.environments.length > 1 ? 's' : ''})</span>
          </h2>

          <div className="space-y-4">
            {estimate.environments.map((env, index) => (
              <div
                key={env.id || index}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {env.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {env.paintBrand} • Cor: <span className="font-medium text-slate-700 dark:text-slate-300">{env.paintColorName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Subtotal do Cômodo</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      R$ {env.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Specs Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Área de pintura</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{env.netAreaM2} m²</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Acabamento</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {env.finishType === 'BURNT_CEMENT' ? 'Cimento Queimado' : env.finishType === 'GRAFIATO' ? 'Grafiato' : 'Acrílico Premium'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Condição Parede</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {env.surfaceCondition === 'NEW_PLASTER' ? 'Gesso Novo' : env.surfaceCondition === 'DAMAGED_CRACKED' ? 'Com Trincas / Massa' : 'Repintura'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tinta estimada</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">{env.paintLitersNeeded} Litros</span>
                  </div>
                </div>

                {env.notes && (
                  <p className="text-xs text-slate-500 italic pt-1">
                    Nota técnica: {env.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Paint Materials (18L Cans and 3.6L Gallons) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <PaintBucket className="w-5 h-5 text-indigo-600" />
            <span>Materiais previstos</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Quantidades estimadas para reduzir desperdício e evitar compras de última hora.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                18L
              </div>
              <div>
                <span className="text-xs text-indigo-900 dark:text-indigo-300 font-semibold block">Latas Grandes 18L</span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-200">
                  {estimate.environments.reduce((sum, e) => sum + e.cans18L, 0)} unidade(s)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                3.6L
              </div>
              <div>
                <span className="text-xs text-sky-900 dark:text-sky-300 font-semibold block">Galões 3.6L</span>
                <span className="text-xl font-black text-sky-700 dark:text-sky-200">
                  {estimate.environments.reduce((sum, e) => sum + e.gallons3_6L, 0)} unidade(s)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                0.9L
              </div>
              <div>
                <span className="text-xs text-emerald-900 dark:text-emerald-300 font-semibold block">Quartos 0.9L</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-200">
                  {estimate.environments.reduce((sum, e) => sum + e.quarts0_9L, 0)} unidade(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary & Terms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Payment Terms & Warranty */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Condições e Termo de Garantia</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Forma de Pagamento:
                  </p>
                  <p>{estimate.paymentTerms}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Garantia de {currentCompany.warrantyDays} Dias:
                  </p>
                  <p className="whitespace-pre-line text-slate-500 dark:text-slate-400">
                    {currentCompany.defaultTerms}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Conforme Código de Defesa do Consumidor e Marco Civil da Internet.</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                Valor da Proposta
              </span>
              <div className="space-y-2 py-4 border-b border-slate-800 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Mão de obra especializada:</span>
                  <span className="font-semibold">R$ {estimate.totalLabor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Materiais e tintas:</span>
                  <span className="font-semibold">R$ {estimate.totalMaterial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {estimate.discountValue > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto Concedido:</span>
                    <span>- R$ {estimate.discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <span className="text-xs text-slate-400 block">Total para aprovação</span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                R$ {estimate.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                {isApproved ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-300">Proposta Assinada Digitalmente</p>
                      <p className="text-[11px] text-emerald-400/80 mt-0.5 font-mono">
                        Hash SHA-256: {estimate.signatureSha256?.substring(0, 24)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignModalOpen(true)}
                    className="w-full py-4 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition active:scale-[0.99]"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Aprovar Proposta</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    onClick={() => openPdfView(estimate.id)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <FileDown className="w-3.5 h-3.5 text-sky-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature Proof Block if already signed */}
        {isApproved && estimate.signatureImage && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-300 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Certificado de Assinatura Eletrônica
                </h3>
                <p className="text-xs text-slate-500">
                  Emitido em conformidade com o Art. 10 da Medida Provisória nº 2.200-2/2001
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-2 text-xs">
                <p><span className="text-slate-400">Signatário:</span> <strong className="text-slate-800 dark:text-slate-200">{estimate.signedByName}</strong></p>
                <p><span className="text-slate-400">Documento:</span> <strong className="text-slate-800 dark:text-slate-200">{estimate.signedByDocument}</strong></p>
                <p><span className="text-slate-400">Data e Hora:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{new Date(estimate.signedAt || '').toLocaleString('pt-BR')}</span></p>
                <p><span className="text-slate-400">Endereço IP:</span> <span className="font-mono text-slate-700 dark:text-slate-300">{estimate.signatureIp}</span></p>
                <p className="break-all"><span className="text-slate-400">Carimbo SHA-256:</span> <span className="font-mono text-sky-600 dark:text-sky-400">{estimate.signatureSha256}</span></p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[11px] text-slate-400 mb-2">Rubrica Digital Registrada</span>
                <img
                  src={estimate.signatureImage}
                  alt="Rubrica Digital"
                  className="max-h-20 object-contain"
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSignComplete={handleDirectSign}
        proposalTitle={estimate.title}
        proposalCode={estimate.code}
        totalAmount={estimate.finalTotal}
        clientDefaultName={customer?.name}
        clientDefaultDoc={customer?.document}
      />
    </div>
  );
};
export default PublicClientProposalView;
