import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  MessageCircle,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Edit3,
  Trash2,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { Customer } from '../types';
import { ExportDataModal } from './ExportDataModal';

export const CustomersView: React.FC = () => {
  const {
    customers,
    currentCompany,
    estimates,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    openPublicProposal,
    startNewEstimateForCustomer
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Edit customer modal state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Delete customer confirmation state
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form states for Add/Edit
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(currentCompany.city || '');
  const [state, setState] = useState(currentCompany.state || '');
  const [notes, setNotes] = useState('');

  const companyCustomers = customers.filter((c) => c.companyId === currentCompany.id);

  // Open edit modal pre-filled
  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setDocument(c.document || '');
    setAddress(c.address || '');
    setCity(c.city || currentCompany.city || '');
    setState(c.state || currentCompany.state || '');
    setNotes(c.notes || '');
  };

  // Métricas agregadas da base de clientes para tomada de decisão
  const customerMetrics = useMemo(() => {
    const total = companyCustomers.length;
    const companyEstimates = estimates.filter((e) => e.companyId === currentCompany.id);
    const approvedEstimates = companyEstimates.filter((e) => e.status === 'APPROVED');
    const totalRevenue = approvedEstimates.reduce((acc, curr) => acc + curr.finalTotal, 0);
    const avgTicket = approvedEstimates.length > 0 ? totalRevenue / approvedEstimates.length : 0;

    return {
      total,
      totalRevenue,
      avgTicket,
    };
  }, [companyCustomers, estimates, currentCompany.id]);

  const filtered = companyCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
        document,
        address,
        city,
        state,
        notes,
      });
      setEditingCustomer(null);
    } else {
      const newCustomer: Customer = {
        id: 'cust_' + Date.now(),
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
        document,
        address,
        city,
        state,
        notes,
        companyId: currentCompany.id,
        createdAt: new Date().toISOString(),
      };
      addCustomer(newCustomer);
      setIsAddModalOpen(false);
    }

    setName('');
    setPhone('');
    setEmail('');
    setDocument('');
    setAddress('');
    setNotes('');
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    deleteCustomer(deletingCustomer.id);
    setDeletingCustomer(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestão de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Base de contatos, endereços de obras e histórico de orçamentos vinculados.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-sm transition"
            title="Exportar base completa de clientes em formato CSV para Excel e Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Clientes (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cliente</span>
          </button>
        </div>
      </div>

      {/* Quick Customer Performance Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Base de Clientes</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">{customerMetrics.total} cadastrados</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receita Aprovada na Base</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {customerMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ticket Médio por Obra</span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              R$ {customerMetrics.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, telefone ou e-mail..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          const custEstimates = estimates.filter((e) => e.customerId === customer.id);
          const cleanPhone = customer.phone.replace(/\D/g, '');

          return (
            <div
              key={customer.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {customer.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    CPF/CNPJ: {customer.document || 'Não cadastrado'}
                  </span>
                </div>

                <a
                  href={`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Chamar no WhatsApp"
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{customer.address} - {customer.city}/{customer.state}</span>
                  </div>
                )}
              </div>

              {/* Estimate history pills */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Orçamentos Recentes ({custEstimates.length})
                </span>
                {custEstimates.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">Nenhum orçamento emitido ainda.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {custEstimates.map((est) => (
                      <button
                        key={est.id}
                        onClick={() => openPublicProposal(est.id)}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-300 text-[11px] font-mono transition"
                      >
                        {est.code} (R$ {est.finalTotal.toFixed(0)})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: New Estimate, Edit, Delete */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => startNewEstimateForCustomer(customer.id)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  title="Criar novo orçamento técnico para este cliente"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Orçar</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(customer)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Editar dados do cliente"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingCustomer(customer)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Remover cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Customer */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCustomer ? 'Editar Dados do Cliente' : 'Cadastrar Novo Cliente'}
            </h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Drummond de Andrade"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Endereço do Imóvel / Obra</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Apto"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Observações do Cliente</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Preferências de cores, horário de atendimento, etc."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md"
                >
                  {editingCustomer ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Excluir Cliente?
              </h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja remover <strong>{deletingCustomer.name}</strong> da sua base de clientes?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação CSV para Clientes */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultDataset="customers"
      />
    </div>
  );
};
export default CustomersView;
