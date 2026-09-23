import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Check,
  PaintBucket,
  Layers,
  FileText,
  Lock,
  Phone,
  Mail,
  MapPin,
  QrCode,
  MessageCircle,
  Copy,
  CheckCircle2
} from 'lucide-react';

export const CommercialPdfView: React.FC = () => {
  const {
    currentCompany,
    estimates,
    customers,
    selectedEstimateId,
    setCurrentView
  } = useApp();

  const [copied, setCopied] = useState(false);

  const estimate = estimates.find((e) => e.id === selectedEstimateId) || estimates[0];
  const customer = customers.find((c) => c.id === estimate?.customerId);

  if (!estimate) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Orçamento não selecionado.</p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs"
        >
          Voltar
        </button>
      </div>
    );
  }

  const isSigned = estimate.status === 'APPROVED' && estimate.signedAt;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#public-view-${estimate.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Segue a proposta comercial de pintura da ${currentCompany.name}.\n` +
      `Código: ${estimate.code}\n` +
      `Valor: R$ ${estimate.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `Acesse a proposta digital para visualizar e assinar: ${window.location.origin}/#public-view-${estimate.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 sm:px-6">
      {/* Floating Action Controls */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
            title="Enviar proposta via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition"
            title="Copiar link da proposta online"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentView('public-view')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
          >
            Ver Portal do Cliente
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Mockup for crisp printing */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-8 font-sans">
        
        {/* Document Header with Company Branding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={currentCompany.logo || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=160&auto=format&fit=crop&q=80'}
              alt={currentCompany.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentCompany.name}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {currentCompany.tradeName || 'Pinturas Profissionais & Reformas'}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                <p>CNPJ: {currentCompany.cnpj} • Inscrição Municipal Ativa</p>
                <p>{currentCompany.address} - {currentCompany.city}/{currentCompany.state}</p>
                <p>Contato: {currentCompany.phone} • {currentCompany.email}</p>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">
              Proposta Comercial Técnica
            </span>
            <span className="text-xl font-black font-mono text-sky-700 block mt-0.5">
              {estimate.code}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Data de Emissão: {new Date(estimate.createdAt).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-slate-500">
              Validade: {estimate.validityDays} dias
            </p>
          </div>
        </div>

        {/* Institutional Credibility Badge (30 Years Tradition) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border-l-4 border-amber-500 border border-amber-200/80 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-900 text-xs tracking-tight">
              Bela Pintura LTDA — Mais de 30 Anos de Tradição e Excelência
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              Desde 1994
            </span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Empresa familiar consolidada com mais de três décadas de história em engenharia de acabamentos,
            pintura fina residencial e predial, instalações elétricas e reformas gerais. Garantimos execução dentro das normas
            técnicas, pontualidade rigorosa, isolamento sem poeira e respaldo contratual completo.
          </p>
        </div>

        {/* Customer Information Block */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Tomador dos Serviços</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{customer?.name}</p>
            <p className="text-slate-600">Documento: {customer?.document || 'Não informado'}</p>
            <p className="text-slate-600">Telefone: {customer?.phone}</p>
            <p className="text-slate-600">E-mail: {customer?.email}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Local da Execução</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{customer?.address || 'Conforme vistoria in loco'}</p>
            <p className="text-slate-600">{customer?.city}/{customer?.state}</p>
            <p className="text-slate-600 mt-1">
              Prazo Estimado de Execução: <strong>{estimate.estimatedDays} dias úteis</strong>
            </p>
          </div>
        </div>

        {/* Rooms Breakdown Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Especificação Técnica por Ambiente</span>
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Cômodo</th>
                  <th className="p-3">Medidas (L x A)</th>
                  <th className="p-3">Área Líq.</th>
                  <th className="p-3">Acabamento & Cor</th>
                  <th className="p-3">Tinta Est.</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {estimate.environments.map((env, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-800">{env.name}</td>
                    <td className="p-3 text-slate-600">{env.width}m x {env.height}m ({env.wallCount} paredes)</td>
                    <td className="p-3 font-mono font-medium text-slate-700">{env.netAreaM2} m²</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{env.paintColorName}</span>
                      <span className="block text-[10px] text-slate-500">
                        {env.finishType === 'BURNT_CEMENT' ? 'Cimento Queimado' : env.finishType === 'GRAFIATO' ? 'Grafiato' : 'Acrílico Premium'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{env.paintLitersNeeded} L</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      R$ {env.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suggested Paint Materials (Rule of 1L for 5m2) */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-xs space-y-2">
          <h3 className="font-bold text-indigo-900 flex items-center gap-1.5">
            <PaintBucket className="w-4 h-4 text-indigo-600" />
            <span>Estimativa de Materiais Recomendados (Cálculo 1L para 5m² com 2 demãos)</span>
          </h3>
          <div className="flex flex-wrap gap-4 text-indigo-950 font-semibold pt-1">
            <span>• Latas 18L: {estimate.environments.reduce((sum, e) => sum + e.cans18L, 0)} lata(s)</span>
            <span>• Galões 3.6L: {estimate.environments.reduce((sum, e) => sum + e.gallons3_6L, 0)} galão(ões)</span>
            <span>• Quartos 0.9L: {estimate.environments.reduce((sum, e) => sum + e.quarts0_9L, 0)} quarto(s)</span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Mão de Obra Técnica Especializada:</span>
              <span className="font-mono font-semibold">R$ {estimate.totalLabor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Materiais e Insumos Auxiliares:</span>
              <span className="font-mono font-semibold">R$ {estimate.totalMaterial.toFixed(2)}</span>
            </div>
            {estimate.discountValue > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Desconto Comercial Concedido:</span>
                <span className="font-mono font-semibold">- R$ {estimate.discountValue.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
              <span>VALOR TOTAL DA PROPOSTA:</span>
              <span className="text-xl font-mono text-sky-700">
                R$ {estimate.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Warranty & Terms Block */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 page-break-inside-avoid">
          <h3 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Condições Gerais e Termos de Garantia ({currentCompany.warrantyDays} Dias)</span>
          </h3>
          <p className="whitespace-pre-line text-slate-600 leading-relaxed">
            {currentCompany.defaultTerms}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
            Forma de Pagamento Acordada: <strong>{estimate.paymentTerms}</strong>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-4 border-t-2 border-slate-200 page-break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end text-xs">
            {/* Contractor Signature */}
            <div className="text-center space-y-2">
              <div className="border-b border-slate-400 pb-1 font-semibold text-slate-800">
                {currentCompany.name}
              </div>
              <p className="text-[11px] text-slate-500">Responsável Técnico / Contratada</p>
            </div>

            {/* Client Signature or Digital Stamp */}
            <div className="text-center space-y-2">
              {isSigned ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-left">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ASSINADO DIGITALMENTE COM VALIDADE JURÍDICA</span>
                  </div>
                  <p className="mt-1 text-[11px]">Signatário: <strong>{estimate.signedByName}</strong> (Doc: {estimate.signedByDocument})</p>
                  <p className="text-[10px] text-slate-600 font-mono">Data: {new Date(estimate.signedAt || '').toLocaleString('pt-BR')} • IP: {estimate.signatureIp}</p>
                  <p className="text-[9px] text-slate-500 font-mono break-all mt-0.5">Hash SHA-256: {estimate.signatureSha256}</p>
                  {estimate.signatureImage && (
                    <img src={estimate.signatureImage} alt="Rubrica" className="h-10 mt-1 object-contain" />
                  )}
                </div>
              ) : (
                <>
                  <div className="border-b border-slate-400 pb-1 font-semibold text-slate-800">
                    {customer?.name}
                  </div>
                  <p className="text-[11px] text-slate-500">Assinatura do Cliente / Contratante</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Digital Verification Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Emitido via TintasPro Cloud • Plataforma para Pintores e Empreiteiros</span>
          <span>Verificação online: {window.location.origin}/#public-view-{estimate.id}</span>
        </div>

      </div>
    </div>
  );
};
export default CommercialPdfView;
