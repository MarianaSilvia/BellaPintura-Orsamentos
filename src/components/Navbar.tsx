import React, { useState } from 'react';
import { useApp, AppView } from '../context/AppContext';
import {
  Paintbrush,
  LayoutDashboard,
  PlusCircle,
  Users,
  Sparkles,
  ShieldCheck,
  Settings,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  Building2,
  Check,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import { ExportDataModal } from './ExportDataModal';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentCompany,
    setCurrentCompany,
    companies,
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isDarkMode,
    toggleDarkMode,
    selectedEstimateId,
    openPublicProposal
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { label: string; view: AppView; icon: React.FC<{ className?: string }> }[] = [
    { label: 'Vitrine', view: 'landing', icon: Globe },
    { label: 'Painel', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Novo Orçamento', view: 'new-estimate', icon: PlusCircle },
    { label: 'Clientes', view: 'customers', icon: Users },
    { label: 'Simulador', view: 'visual-ai', icon: Sparkles },
    { label: 'Histórico', view: 'audit', icon: ShieldCheck },
    { label: 'Configurações', view: 'settings', icon: Settings },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition">
              <Paintbrush className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-white block">
                Bella Pintura
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px] sm:max-w-xs">
                {currentCompany.tradeName || currentCompany.name}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2">
          
          {/* Tenant Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTenantOpen(!isTenantOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 transition"
              title="Alternar Empresa"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline font-medium max-w-[120px] truncate">{currentCompany.tradeName || currentCompany.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTenantOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                  Empresas da demonstração
                </span>
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurrentCompany(c);
                      setIsTenantOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                      c.id === currentCompany.id
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === currentCompany.id && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Client Portal Preview */}
          {selectedEstimateId && (
            <button
              onClick={() => openPublicProposal(selectedEstimateId)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              title="Acessar portal público do cliente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              <span>Ver Portal</span>
            </button>
          )}

          {/* Quick CSV Export Tool */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-500/20 transition flex items-center gap-1.5"
            title="Exportar Relatórios CSV (Orçamentos, Materiais e Clientes)"
          >
            <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">Exportar</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Notificações da demonstração"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Notificações da demo
                  </span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                      >
                        Ler todas
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {unreadCount} nova(s)
                    </span>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma notificação</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.estimateId) {
                            openPublicProposal(n.estimateId);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition ${
                          n.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100'
                            : 'bg-sky-50/80 dark:bg-sky-950/60 text-slate-800 dark:text-slate-200 border border-sky-100 dark:border-sky-900 hover:bg-sky-100/80'
                        }`}
                      >
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-[11px] mt-0.5 text-slate-500 dark:text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar - Clickable Profile & Settings */}
          <button
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-2 pl-1 group p-1 rounded-full hover:ring-2 hover:ring-sky-500/30 transition"
            title={`${currentUser.name} (${currentUser.role}) - Clique para Configurações`}
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition"
            />
          </button>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-semibold transition ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global CSV Export Modal */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </header>
  );
};
export default Navbar;
