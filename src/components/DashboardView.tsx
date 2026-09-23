import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  Search,
  MessageCircle,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  Trash2,
  Filter,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  Send,
  DollarSign,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { EstimateStatus, Estimate } from '../types';
import { ExportDataModal, ExportDatasetType } from './ExportDataModal';

export const DashboardView: React.FC = () => {
  const {
    currentCompany,
    estimates,
    customers,
    setCurrentView,
    setSelectedEstimateId,
    openPublicProposal,
    openPdfView,
    deleteEstimate,
    sendWhatsAppNotification,
    sendEmailReminder,
    t
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EstimateStatus>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDatasetType, setExportDatasetType] = useState<ExportDatasetType>('estimates');

  // Filter estimates for current company
  const companyEstimates = useMemo(() => {
    return estimates.filter((e) => e.companyId === currentCompany.id);
  }, [estimates, currentCompany.id]);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalCount = companyEstimates.length;
    const approvedList = companyEstimates.filter((e) => e.status === 'APPROVED');
    const pendingList = companyEstimates.filter((e) => e.status === 'SENT' || e.status === 'VIEWED');

    const approvedRevenue = approvedList.reduce((acc, curr) => acc + curr.finalTotal, 0);
    const pendingRevenue = pendingList.reduce((acc, curr) => acc + curr.finalTotal, 0);

    const conversionRate = totalCount > 0 ? (approvedList.length / totalCount) * 100 : 0;
    const averageTicket = approvedList.length > 0 ? approvedRevenue / approvedList.length : 0;

    const totalSquareMeters = companyEstimates.reduce((acc, e) => {
      const envArea = e.environments.reduce((sum, env) => sum + env.netAreaM2, 0);
      return acc + envArea;
    }, 0);

    return {
      approvedRevenue,
      pendingRevenue,
      pendingCount: pendingList.length,
      conversionRate,
      averageTicket,
      totalSquareMeters,
      totalEstimates: totalCount,
    };
  }, [companyEstimates]);

  // Filtered List
  const filteredEstimates = useMemo(() => {
    return companyEstimates.filter((e) => {
      const customer = customers.find((c) => c.id === e.customerId);
      const matchesSearch =
        e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companyEstimates, customers, searchTerm, statusFilter]);

  const handleCopyLink = (estimateId: string) => {
    const url = `${window.location.origin}/#public-view-${estimateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(estimateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Empresa Ativa: {currentCompany.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Painel Geral de Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe propostas comerciais, métricas de conversão e assinaturas eletrônicas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              setExportDatasetType('estimates');
              setIsExportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition shadow-sm"
            title="Exportar dados analíticos em CSV para Excel e Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => setCurrentView('visual-ai')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulador IA</span>
          </button>
          <button
            onClick={() => setCurrentView('new-estimate')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Required by Prompt) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Aprovado */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Faturamento Aprovado
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            R$ {metrics.approvedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Contratos assinados digitalmente</span>
          </p>
        </div>

        {/* Card 2: Orçamentos Pendentes */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Orçamentos Pendentes
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            R$ {metrics.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {metrics.pendingCount} proposta(s) aguardando assinatura
          </p>
        </div>

        {/* Card 3: Taxa de Conversão */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Taxa de Conversão
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Ticket Médio: R$ {metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </p>
        </div>

        {/* Card 4: Metragem Total Orçada */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Metragem Total Orçada
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2 font-mono">
            {metrics.totalSquareMeters.toFixed(1)} m²
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Em {metrics.totalEstimates} projeto(s) computados
          </p>
        </div>

      </div>

      {/* Management Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Filters & Search */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, cliente ou projeto..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status Tabs and Quick Export */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'DRAFT', 'SENT', 'APPROVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'ALL' && 'Todos'}
                  {st === 'DRAFT' && 'Rascunhos'}
                  {st === 'SENT' && 'Enviados'}
                  {st === 'APPROVED' && 'Aprovados & Assinados'}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            <button
              onClick={() => {
                setExportDatasetType('estimates');
                setIsExportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition whitespace-nowrap"
              title="Exportar dados filtrados para planilha CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar CSV ({filteredEstimates.length})</span>
            </button>
          </div>

        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Código / Projeto</th>
                <th className="p-4">Cliente & Contato</th>
                <th className="p-4">Ambientes / Área</th>
                <th className="p-4">Valor Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nenhum orçamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((est) => {
                  const customer = customers.find((c) => c.id === est.customerId);
                  const totalArea = est.environments.reduce((sum, env) => sum + env.netAreaM2, 0);

                  return (
                    <tr
                      key={est.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Code and Title */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 block">
                          {est.code}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white block mt-0.5 text-xs">
                          {est.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(est.createdAt).toLocaleDateString('pt-BR')} • {est.estimatedDays} dias
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {customer?.name || 'Cliente'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {customer?.phone}
                        </span>
                      </td>

                      {/* Environments */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block font-mono">
                          {totalArea.toFixed(1)} m²
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {est.environments.length} cômodo(s) cadastrado(s)
                        </span>
                      </td>

                      {/* Final Total */}
                      <td className="p-4">
                        <span className="text-sm font-black text-slate-900 dark:text-white block tracking-tight">
                          R$ {est.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {est.discountValue > 0 && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            Desc: -R$ {est.discountValue.toFixed(0)}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {est.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Assinado</span>
                          </span>
                        )}
                        {est.status === 'SENT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold text-[10px] border border-sky-200 dark:border-sky-800">
                            <Clock className="w-3 h-3 text-sky-600" />
                            <span>Enviado</span>
                          </span>
                        )}
                        {est.status === 'DRAFT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                            <span>Rascunho</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Quick WhatsApp Action (Mandatory Prompt Feature) */}
                          <button
                            type="button"
                            onClick={() => sendWhatsAppNotification(est.id)}
                            title="Envio Rápido por WhatsApp"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(est.id)}
                            title="Copiar Link Único de Acesso"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* View Client Portal */}
                          <button
                            type="button"
                            onClick={() => openPublicProposal(est.id)}
                            title="Ver Proposta no Portal do Cliente"
                            className="p-2 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 hover:bg-sky-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* View Commercial PDF */}
                          <button
                            type="button"
                            onClick={() => openPdfView(est.id)}
                            title="Ver e Gerar PDF Proposta"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Excluir o orçamento ${est.code}?`)) {
                                deleteEstimate(est.id);
                              }
                            }}
                            title="Excluir Orçamento"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Exportação CSV */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultDataset={exportDatasetType}
      />
    </div>
  );
};
export default DashboardView;
