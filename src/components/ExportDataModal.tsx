import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  Filter,
  Layers,
  Users,
  DollarSign,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Estimate, Customer } from '../types';
import {
  exportEstimatesToCsv,
  exportDetailedEnvironmentsToCsv,
  exportCustomersToCsv,
  downloadCsv,
  copyCsvToClipboard,
  CsvDelimiter
} from '../services/CsvExportService';
import { useApp } from '../context/AppContext';

export type ExportDatasetType = 'estimates' | 'environments' | 'customers';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDataset?: ExportDatasetType;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  defaultDataset = 'estimates'
}) => {
  const { estimates, customers, currentCompany, addAuditLog, t } = useApp();

  const [activeDataset, setActiveDataset] = useState<ExportDatasetType>(defaultDataset);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'DRAFT'>('ALL');
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(';');
  const [includeBOM, setIncludeBOM] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Escopo de dados da empresa atual
  const companyEstimates = useMemo(() => {
    return estimates.filter((e) => e.companyId === currentCompany.id);
  }, [estimates, currentCompany.id]);

  const companyCustomers = useMemo(() => {
    return customers.filter((c) => c.companyId === currentCompany.id);
  }, [customers, currentCompany.id]);

  // Aplicar filtro de status para orçamentos e ambientes
  const filteredEstimates = useMemo(() => {
    if (statusFilter === 'ALL') return companyEstimates;
    if (statusFilter === 'APPROVED') {
      return companyEstimates.filter((e) => e.status === 'APPROVED');
    }
    if (statusFilter === 'PENDING') {
      return companyEstimates.filter((e) => e.status === 'SENT' || e.status === 'VIEWED');
    }
    if (statusFilter === 'DRAFT') {
      return companyEstimates.filter((e) => e.status === 'DRAFT');
    }
    return companyEstimates;
  }, [companyEstimates, statusFilter]);

  // Indicadores de desempenho calculados
  const stats = useMemo(() => {
    if (activeDataset === 'customers') {
      const totalCust = companyCustomers.length;
      const totalRevenueFromCust = companyCustomers.reduce((acc, c) => {
        const approved = companyEstimates
          .filter((e) => e.customerId === c.id && e.status === 'APPROVED')
          .reduce((sum, e) => sum + e.finalTotal, 0);
        return acc + approved;
      }, 0);

      return {
        count: totalCust,
        labelCount: 'Clientes Cadastrados',
        revenue: totalRevenueFromCust,
        areaM2: 0,
      };
    }

    const count =
      activeDataset === 'environments'
        ? filteredEstimates.reduce((acc, e) => acc + e.environments.length, 0)
        : filteredEstimates.length;

    const revenue = filteredEstimates.reduce((acc, e) => acc + e.finalTotal, 0);
    const areaM2 = filteredEstimates.reduce((acc, e) => {
      const envSum = e.environments.reduce((sum, env) => sum + (env.netAreaM2 || 0), 0);
      return acc + envSum;
    }, 0);

    return {
      count,
      labelCount: activeDataset === 'environments' ? 'Ambientes Mapeados' : 'Orçamentos',
      revenue,
      areaM2,
    };
  }, [activeDataset, filteredEstimates, companyCustomers, companyEstimates]);

  // Gerar CSV conforme dataset ativo e opções
  const csvContent = useMemo(() => {
    if (activeDataset === 'estimates') {
      return exportEstimatesToCsv(filteredEstimates, companyCustomers, { delimiter, includeBOM });
    }
    if (activeDataset === 'environments') {
      return exportDetailedEnvironmentsToCsv(filteredEstimates, companyCustomers, { delimiter, includeBOM });
    }
    return exportCustomersToCsv(companyCustomers, companyEstimates, { delimiter, includeBOM });
  }, [activeDataset, filteredEstimates, companyCustomers, companyEstimates, delimiter, includeBOM]);

  // Obter amostra de linhas para visualização prévia
  const previewRows = useMemo(() => {
    // Remover BOM se houver para separar linhas
    const raw = csvContent.startsWith('\uFEFF') ? csvContent.slice(1) : csvContent;
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
      // Split simplificado respeitando aspas
      const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
      const matches: string[] = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        matches.push(val ?? '');
      }
      return matches;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1, 6).map((line) => parseLine(line));

    return { headers, rows };
  }, [csvContent, delimiter]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const today = new Date().toISOString().split('T')[0];
    let filename = `tintaspro_orcamentos_${today}.csv`;
    if (activeDataset === 'environments') {
      filename = `tintaspro_ambientes_tintas_${today}.csv`;
    } else if (activeDataset === 'customers') {
      filename = `tintaspro_clientes_crm_${today}.csv`;
    }

    downloadCsv(csvContent, filename);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);

    // Auditoria LGPD & rastreabilidade
    addAuditLog(
      'DATA_EXPORT_CSV',
      `Exportação de dados CSV realizada (${activeDataset.toUpperCase()}). ${stats.count} registros exportados com delimitador '${delimiter}'.`
    );
  };

  const handleCopy = async () => {
    const success = await copyCsvToClipboard(csvContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      addAuditLog(
        'DATA_COPY_CLIPBOARD',
        `Dados do relatório CSV copiados para área de transferência (${activeDataset.toUpperCase()}).`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Exportação de Dados em CSV
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Excel & Sheets
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere arquivos compatíveis com Excel, Google Sheets, PowerBI e relatórios contábeis.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Dataset Type Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 block">
              1. Selecione o Relatório para Exportação:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveDataset('estimates')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                  activeDataset === 'estimates'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    activeDataset === 'estimates'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Orçamentos & Faturamento
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Resumo geral financeiro, status de aprovação, mão de obra e assinaturas.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveDataset('environments')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                  activeDataset === 'environments'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    activeDataset === 'environments'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Ambientes & Consumo de Tinta
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Itemizado cômodo por cômodo, litragem, latas de 18L, acabamentos e m².
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveDataset('customers')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                  activeDataset === 'customers'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    activeDataset === 'customers'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Base de Clientes (CRM & LTV)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Contatos, obras, taxa de conversão individual e receita total aprovada.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Filters & Format Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            {/* Status Filter (applicable to estimates and environments) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filtrar por Status:
              </label>
              {activeDataset === 'customers' ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  Exportando todos os {companyCustomers.length} clientes vinculados à empresa.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'ALL', label: 'Todos os Status' },
                    { id: 'APPROVED', label: 'Apenas Aprovados' },
                    { id: 'PENDING', label: 'Pendentes / Enviados' },
                    { id: 'DRAFT', label: 'Rascunhos' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id as any)}
                      className={`text-xs py-1.5 px-2.5 rounded-lg font-medium text-left transition ${
                        statusFilter === filter.id
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delimiter & Formatting Standard */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Formato do Delimitador & Software Alvo:
              </label>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      delimiter === ';'
                        ? 'border-emerald-500 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delimiter"
                      value=";"
                      checked={delimiter === ';'}
                      onChange={() => setDelimiter(';')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span>Ponto e vírgula ( ; )</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Excel Brasil (pt-BR)
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      delimiter === ','
                        ? 'border-emerald-500 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delimiter"
                      value=","
                      checked={delimiter === ','}
                      onChange={() => setDelimiter(',')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span>Vírgula ( , )</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Google Sheets / US
                      </span>
                    </div>
                  </label>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={includeBOM}
                    onChange={(e) => setIncludeBOM(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Incluir cabeçalho UTF-8 BOM (corrige caracteres com acentuação no Excel)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Metrics of the selection */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                {stats.labelCount}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                {stats.count}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Faturamento no Filtro
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {activeDataset !== 'customers' ? (
              <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Metragem Líquida Total
                </span>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5 block">
                  {stats.areaM2.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} m²
                </span>
              </div>
            ) : (
              <div className="col-span-2 sm:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Ticket Médio Geral
                </span>
                <span className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5 block">
                  R${' '}
                  {companyCustomers.length > 0
                    ? (stats.revenue / companyCustomers.length).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })
                    : '0,00'}
                </span>
              </div>
            )}
          </div>

          {/* Live Data Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Pré-visualização dos Dados ({previewRows.rows.length} primeiras linhas):
              </label>
              <span className="text-[11px] text-slate-400">
                {previewRows.headers.length} colunas estruturadas
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
              <div className="overflow-x-auto max-h-48 text-[11px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                      {previewRows.headers.slice(0, 8).map((h, idx) => (
                        <th
                          key={idx}
                          className="px-3 py-2 text-left font-bold whitespace-nowrap border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                        >
                          {h}
                        </th>
                      ))}
                      {previewRows.headers.length > 8 && (
                        <th className="px-3 py-2 text-left font-bold text-slate-400">
                          +{previewRows.headers.length - 8} colunas
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[10.5px]">
                    {previewRows.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-6 text-center text-slate-400 italic"
                        >
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      previewRows.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                        >
                          {row.slice(0, 8).map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3 py-1.5 whitespace-nowrap border-r border-slate-100 dark:border-slate-800 last:border-r-0 max-w-[200px] truncate"
                            >
                              {cell || '-'}
                            </td>
                          ))}
                          {previewRows.headers.length > 8 && (
                            <td className="px-3 py-1.5 text-slate-400 italic">...</td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Compliance & Security Tip */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs border border-blue-200/60 dark:border-blue-900/50">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Trilha de Auditoria & Segurança:</span> Cada
              exportação gera um registro imutável no log de auditoria com data/hora, contagem de
              linhas e usuário autenticado, garantindo conformidade com a LGPD.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>
              Tamanho estimado:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {(new Blob([csvContent]).size / 1024).toFixed(1)} KB
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Dados</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md shadow-emerald-600/20"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Arquivo Baixado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Baixar Planilha CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
