import React, { createContext, useContext, useState, useEffect } from 'react';
import { Company, User, Customer, Estimate, AuditLog, NotificationItem, Language } from '../types';
import { initialCompanies, initialUsers, initialCustomers, initialEstimates, initialAuditLogs } from '../data/mockData';
import { translations, getTranslation } from '../data/translations';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'new-estimate'
  | 'edit-estimate'
  | 'view-estimate'
  | 'public-view'
  | 'commercial-pdf'
  | 'customers'
  | 'visual-ai'
  | 'settings'
  | 'audit';

interface AppContextType {
  // Tenancy & Auth
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  companies: Company[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  
  // Data
  estimates: Estimate[];
  customers: Customer[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  
  // Navigation & Route State
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedEstimateId: string | null;
  setSelectedEstimateId: (id: string | null) => void;

  // Localization & Preferences
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.pt;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // New Estimate Wizard Bridge
  selectedCustomerIdForNewEstimate: string | null;
  setSelectedCustomerIdForNewEstimate: (id: string | null) => void;
  simulationPresetForNewEstimate: {
    finishType: any;
    colorName: string;
    colorHex: string;
    roomName?: string;
  } | null;
  setSimulationPresetForNewEstimate: (preset: any) => void;
  startNewEstimateForCustomer: (customerId: string) => void;
  startNewEstimateFromSimulation: (
    finishType: any,
    colorName: string,
    colorHex: string,
    roomName?: string
  ) => void;

  // Actions
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (estimate: Estimate) => void;
  updateEstimateStatus: (estimateId: string, status: any) => void;
  duplicateEstimate: (estimateId: string) => void;
  deleteEstimate: (id: string) => void;
  signEstimate: (
    estimateId: string,
    signerName: string,
    signerDocument: string,
    signatureImage: string
  ) => Promise<{ success: boolean; hash: string }>;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addAuditLog: (action: string, details: string, estimateId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  openPublicProposal: (estimateId: string) => void;
  openPdfView: (estimateId: string) => void;
  updateCompanySettings: (updated: Partial<Company>) => void;
  sendWhatsAppNotification: (estimateId: string) => void;
  sendEmailReminder: (estimateId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed fallback
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('tintaspro_companies');
    return saved ? JSON.parse(saved) : initialCompanies;
  });

  const [currentCompany, setCurrentCompany] = useState<Company>(() => {
    const savedId = localStorage.getItem('tintaspro_current_company_id');
    const found = companies.find((c) => c.id === savedId);
    return found || companies[0];
  });

  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return initialUsers.find((u) => u.companyId === currentCompany.id) || initialUsers[0];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('tintaspro_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    const saved = localStorage.getItem('tintaspro_estimates');
    return saved ? JSON.parse(saved) : initialEstimates;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('tintaspro_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_welcome',
      title: 'Demo Bella Pintura pronta',
      message: 'Use a vitrine, o simulador e a proposta digital para apresentar a experiência ao cliente.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>('est_002');
  const [selectedCustomerIdForNewEstimate, setSelectedCustomerIdForNewEstimate] = useState<string | null>(null);
  const [simulationPresetForNewEstimate, setSimulationPresetForNewEstimate] = useState<{
    finishType: any;
    colorName: string;
    colorHex: string;
    roomName?: string;
  } | null>(null);
  const [language, setLanguage] = useState<Language>('pt');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tintaspro_theme') === 'dark';
  });

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem('tintaspro_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('tintaspro_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('tintaspro_estimates', JSON.stringify(estimates));
  }, [estimates]);

  useEffect(() => {
    localStorage.setItem('tintaspro_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('tintaspro_current_company_id', currentCompany.id);
    const userForCompany = users.find((u) => u.companyId === currentCompany.id);
    if (userForCompany) setCurrentUser(userForCompany);
  }, [currentCompany, users]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tintaspro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tintaspro_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addAuditLog = (action: string, details: string, estimateId?: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 6),
      companyId: currentCompany.id,
      estimateId,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      ipAddress: '177.102.55.' + Math.floor(Math.random() * 200 + 10),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addEstimate = (estimate: Estimate) => {
    setEstimates((prev) => [estimate, ...prev]);
    addAuditLog('ESTIMATE_CREATED', `Orçamento ${estimate.code} criado para ${estimate.title}`, estimate.id);
    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now(),
        title: 'Novo Orçamento Criado',
        message: `Orçamento ${estimate.code} gravado no banco de dados com cálculo em tempo real.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const updateEstimate = (updated: Estimate) => {
    setEstimates((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    addAuditLog('ESTIMATE_UPDATED', `Orçamento ${updated.code} atualizado.`, updated.id);
  };

  const deleteEstimate = (id: string) => {
    const est = estimates.find((e) => e.id === id);
    setEstimates((prev) => prev.filter((e) => e.id !== id));
    if (est) {
      addAuditLog('ESTIMATE_DELETED', `Orçamento ${est.code} excluído.`, id);
    }
  };

  // Digital signature processing with simulated SHA-256 generation
  const signEstimate = async (
    estimateId: string,
    signerName: string,
    signerDocument: string,
    signatureImage: string
  ): Promise<{ success: boolean; hash: string }> => {
    // Generate cryptographic hash from payload
    const rawPayload = `${estimateId}-${signerName}-${signerDocument}-${Date.now()}`;
    const msgBuffer = new TextEncoder().encode(rawPayload);
    let hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
      hash = 'sha256_' + Math.random().toString(36).substring(2) + Date.now().toString(16);
    }

    const timestamp = new Date().toISOString();
    const simulatedIp = '189.40.72.' + Math.floor(Math.random() * 200 + 20);

    setEstimates((prev) =>
      prev.map((e) => {
        if (e.id === estimateId) {
          return {
            ...e,
            status: 'APPROVED',
            signedAt: timestamp,
            signedByName: signerName,
            signedByDocument: signerDocument,
            signatureImage,
            signatureIp: simulatedIp,
            signatureSha256: hash,
            signedPdfCloudUrl: `demo://bella-pintura/propostas/${e.code}-assinado.pdf`,
            updatedAt: timestamp,
          };
        }
        return e;
      })
    );

    // Add Audit Log
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      companyId: currentCompany.id,
      estimateId,
      userName: `${signerName} (Cliente)`,
      action: 'DIGITAL_SIGNATURE_COMPLETED',
      details: `Proposta aceita e assinada digitalmente. Hash SHA-256: ${hash}. Documento: ${signerDocument}. IP: ${simulatedIp}`,
      ipAddress: simulatedIp,
      timestamp,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Push Notification for the painter / admin
    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now(),
        title: '🎉 Proposta Assinada pelo Cliente!',
        message: `${signerName} acabou de assinar digitalmente a proposta ${estimateId}. PDF e certificado gerados na nuvem.`,
        type: 'success',
        timestamp,
        read: false,
      },
      ...prev,
    ]);

    return { success: true, hash };
  };

  const addCustomer = (customer: Customer) => {
    setCustomers((prev) => [customer, ...prev]);
    addAuditLog('CUSTOMER_CREATED', `Novo cliente cadastrado: ${customer.name}`);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    addAuditLog('CUSTOMER_UPDATED', `Cadastro do cliente ${customer.name} atualizado.`);
  };

  const deleteCustomer = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    addAuditLog('CUSTOMER_DELETED', `Cliente removido: ${cust?.name || customerId}`);
  };

  const updateEstimateStatus = (estimateId: string, status: any) => {
    setEstimates((prev) =>
      prev.map((e) =>
        e.id === estimateId
          ? {
              ...e,
              status,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
    addAuditLog('ESTIMATE_STATUS_UPDATED', `Status do orçamento ${estimateId} alterado para ${status}.`, estimateId);
  };

  const duplicateEstimate = (estimateId: string) => {
    const original = estimates.find((e) => e.id === estimateId);
    if (!original) return;

    const copyCode = `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicated: Estimate = {
      ...original,
      id: 'est_' + Date.now(),
      code: copyCode,
      title: `${original.title} (Cópia)`,
      status: 'DRAFT',
      signedAt: undefined,
      signedByName: undefined,
      signedByDocument: undefined,
      signatureImage: undefined,
      signatureIp: undefined,
      signatureSha256: undefined,
      remindersSentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      environments: original.environments.map((env, idx) => ({
        ...env,
        id: 'env_' + Date.now() + '_' + idx,
      })),
    };

    addEstimate(duplicated);
  };

  const startNewEstimateForCustomer = (customerId: string) => {
    setSelectedCustomerIdForNewEstimate(customerId);
    setCurrentView('new-estimate');
  };

  const startNewEstimateFromSimulation = (
    finishType: any,
    colorName: string,
    colorHex: string,
    roomName?: string
  ) => {
    setSimulationPresetForNewEstimate({
      finishType,
      colorName,
      colorHex,
      roomName: roomName || 'Sala de Estar / Amb. Simulado',
    });
    setCurrentView('new-estimate');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openPublicProposal = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setCurrentView('public-view');
  };

  const openPdfView = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setCurrentView('commercial-pdf');
  };

  const updateCompanySettings = (updated: Partial<Company>) => {
    const updatedCompany = { ...currentCompany, ...updated };
    setCurrentCompany(updatedCompany);
    setCompanies((prev) => prev.map((c) => (c.id === currentCompany.id ? updatedCompany : c)));
    addAuditLog('COMPANY_UPDATED', `Configurações da empresa ${updatedCompany.name} atualizadas.`);
  };

  const sendWhatsAppNotification = (estimateId: string) => {
    const estimate = estimates.find((e) => e.id === estimateId);
    if (!estimate) return;
    const customer = customers.find((c) => c.id === estimate.customerId);
    const cleanPhone = customer?.phone.replace(/\D/g, '') || '';
    const publicUrl = `${window.location.origin}/#public-view-${estimate.id}`;
    const text = encodeURIComponent(
      `Olá ${customer?.name || 'Cliente'}, aqui é da ${currentCompany.name}!\n\n` +
      `Seu orçamento técnico de pintura *(${estimate.title})* está pronto para visualização.\n\n` +
      `📋 Valor Total: R$ ${estimate.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `🎨 Visualize a simulação de cores das paredes e assine digitalmente no link seguro:\n` +
      `${publicUrl}\n\n` +
      `Qualquer dúvida, estamos à sua inteira disposição!`
    );

    // Update status to SENT if it was DRAFT
    if (estimate.status === 'DRAFT') {
      updateEstimate({ ...estimate, status: 'SENT' });
    }

    addAuditLog('WHATSAPP_SHARED', `Link público compartilhado via WhatsApp para ${customer?.name} (${cleanPhone}).`, estimateId);

    // Open WhatsApp Web/App
    const whatsappUrl = `https://wa.me/${cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : ''}?text=${text}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const sendEmailReminder = (estimateId: string) => {
    const estimate = estimates.find((e) => e.id === estimateId);
    if (!estimate) return;
    const customer = customers.find((c) => c.id === estimate.customerId);

    setEstimates((prev) =>
      prev.map((e) =>
        e.id === estimateId
          ? {
              ...e,
              remindersSentCount: e.remindersSentCount + 1,
              lastReminderSentAt: new Date().toISOString(),
            }
          : e
      )
    );

    addAuditLog('EMAIL_REMINDER_SENT', `Lembrete automático enviado para o e-mail ${customer?.email}.`, estimateId);

    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now(),
        title: 'E-mail de Lembrete Enviado',
        message: `Lembrete de assinatura enviado para ${customer?.email} referente ao orçamento ${estimate.code}.`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const t = getTranslation(language);

  return (
    <AppContext.Provider
      value={{
        currentCompany,
        setCurrentCompany,
        companies,
        currentUser,
        setCurrentUser,
        users,
        estimates,
        customers,
        auditLogs,
        notifications,
        currentView,
        setCurrentView,
        selectedEstimateId,
        setSelectedEstimateId,
        language,
        setLanguage,
        t,
        isDarkMode,
        toggleDarkMode,
        addEstimate,
        updateEstimate,
        updateEstimateStatus,
        duplicateEstimate,
        deleteEstimate,
        signEstimate,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        selectedCustomerIdForNewEstimate,
        setSelectedCustomerIdForNewEstimate,
        simulationPresetForNewEstimate,
        setSimulationPresetForNewEstimate,
        startNewEstimateForCustomer,
        startNewEstimateFromSimulation,
        addAuditLog,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        openPublicProposal,
        openPdfView,
        updateCompanySettings,
        sendWhatsAppNotification,
        sendEmailReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
export default AppContext;
