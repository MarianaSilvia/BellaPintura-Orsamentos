/**
 * TintasPro SaaS - Sistema Completo de Orçamentos e Simulação Visual para Pintores
 * Multi-Tenant Architecture with Real-Time EstimationEngine and Digital Signatures
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import EstimateWizard from './components/EstimateWizard';
import PublicClientProposalView from './components/PublicClientProposalView';
import CommercialPdfView from './components/CommercialPdfView';
import CustomersView from './components/CustomersView';
import VisualAiLab from './components/VisualAiLab';
import AuditLogView from './components/AuditLogView';
import SettingsView from './components/SettingsView';
import LiveSupportChat from './components/LiveSupportChat';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, setSelectedEstimateId } = useApp();

  // Handle URL hash changes (for direct links like /#public-view-est_001)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#public-view-')) {
        const estId = hash.replace('#public-view-', '');
        setSelectedEstimateId(estId);
        setCurrentView('public-view');
      } else if (hash.startsWith('#pdf-')) {
        const estId = hash.replace('#pdf-', '');
        setSelectedEstimateId(estId);
        setCurrentView('commercial-pdf');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setCurrentView, setSelectedEstimateId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Hide Navbar on clean Public View and PDF view for distraction-free client experience */}
      {currentView !== 'public-view' && currentView !== 'commercial-pdf' && <Navbar />}

      <main className="flex-1">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'new-estimate' && <EstimateWizard />}
        {currentView === 'public-view' && <PublicClientProposalView />}
        {currentView === 'commercial-pdf' && <CommercialPdfView />}
        {currentView === 'customers' && <CustomersView />}
        {currentView === 'visual-ai' && <VisualAiLab />}
        {currentView === 'audit' && <AuditLogView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Floating Real-Time Support Chat */}
      <LiveSupportChat />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
