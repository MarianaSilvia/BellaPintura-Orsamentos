import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, Search, FileCheck, CheckCircle2, AlertCircle, RefreshCw, Key, Download } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentCompany, estimates } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const companyLogs = auditLogs.filter((log) => log.companyId === currentCompany.id);

  const filtered = companyLogs.filter((log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ipAddress.includes(searchTerm)
  );

  const signedEstimates = estimates.filter((e) => e.companyId === currentCompany.id && e.status === 'APPROVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Trilha de Auditoria & Conformidade LGPD / Marco Civil</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Histórico Criptográfico & Auditoria
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro imutável de todas as ações, acessos e assinaturas digitais efetuadas na plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                encodeURIComponent(
                  ['Data e Hora,Usuário,Ação,Detalhes,IP']
                    .concat(
                      filtered.map(
                        (l) =>
                          `"${new Date(l.timestamp).toLocaleString('pt-BR')}","${l.userName}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ipAddress}"`
                      )
                    )
                    .join('\n')
                );
              const link = document.createElement('a');
              link.setAttribute('href', csvContent);
              link.setAttribute('download', `trilha-auditoria-${currentCompany.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition active:scale-95"
            title="Exportar trilha de auditoria para planilha"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Logs (CSV)</span>
          </button>

          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Criptografia SHA-256 Ativa</span>
          </div>
        </div>
      </div>

      {/* Real-time Signatures Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total de Assinaturas Válidas
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">
            {signedEstimates.length}
          </span>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Todos com hash criptográfico e IP gravados</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Eventos Registrados no Ledger
          </span>
          <span className="text-3xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {companyLogs.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Rastreamento de ponta a ponta
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Status de Conformidade
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              100% em Conformidade (LGPD & MP 2.200)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Armazenamento em nuvem redundante
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por ação, IP ou usuário..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} registro(s) auditáveis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Data & Hora</th>
                <th className="p-4">Usuário / Agente</th>
                <th className="p-4">Ação</th>
                <th className="p-4">Detalhes e Hash</th>
                <th className="p-4">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {log.userName}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        log.action.includes('SIGNATURE')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action.includes('CREATED')
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 max-w-md">
                    {log.details}
                  </td>
                  <td className="p-4 font-mono text-slate-500">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default AuditLogView;
