import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Trash2,
  PaintBucket,
  Calculator,
  User,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  FileText,
  DollarSign,
  Palette,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import EstimationEngine, {
  SurfaceCondition,
  FinishType,
  EnvironmentDimensionInput
} from '../services/EstimationEngine';
import { EnvironmentItem, Estimate, Customer } from '../types';

const PRESET_ROOM_NAMES = [
  'Sala de Estar Integrada',
  'Suíte Master',
  'Quarto de Hóspedes',
  'Cozinha & Área de Serviço',
  'Fachada Externa',
  'Varanda Gourmet',
  'Escritório / Home Office',
  'Lavabo',
];

const PRESET_COLORS = [
  { name: 'Branco Neve', hex: '#f8fafc' },
  { name: 'Algodão Egípcio', hex: '#f1f0ea' },
  { name: 'Cimento Queimado Platina', hex: '#94a3b8' },
  { name: 'Azul Petróleo Nobre', hex: '#0e7490' },
  { name: 'Verde Sálvia', hex: '#4d7c0f' },
  { name: 'Terracota Rústico', hex: '#b45309' },
];

export const EstimateWizard: React.FC = () => {
  const {
    currentCompany,
    customers,
    currentUser,
    addEstimate,
    addCustomer,
    setCurrentView,
    openPublicProposal
  } = useApp();

  // Step 1: Customer & Basics
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustDoc, setNewCustDoc] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [estimateTitle, setEstimateTitle] = useState('Pintura Residencial Completa');
  const [validityDays, setValidityDays] = useState(15);
  const [estimatedDays, setEstimatedDays] = useState(5);
  const [paymentTerms, setPaymentTerms] = useState('40% de sinal na aprovação + 30% no meio da obra + 30% na entrega final.');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);

  // Step 2: Dynamic Environments
  const [environments, setEnvironments] = useState<EnvironmentDimensionInput[]>([
    {
      name: 'Sala de Estar Integrada',
      width: 5.5,
      height: 2.8,
      wallCount: 4,
      openingsDiscount: 6.0,
      coatsCount: 2,
      surfaceCondition: 'CLEAN_REPAINT',
      finishType: 'ACRYLIC_MATTE',
      paintBrand: 'Suvinil / Coral',
      paintColorName: 'Algodão Egípcio',
      paintColorHex: '#f1f0ea',
    },
    {
      name: 'Parede Destaque / Home Theater',
      width: 4.2,
      height: 2.8,
      wallCount: 1,
      openingsDiscount: 0,
      coatsCount: 2,
      surfaceCondition: 'CLEAN_REPAINT',
      finishType: 'BURNT_CEMENT',
      paintBrand: 'Suvinil Efeito Especial',
      paintColorName: 'Cimento Queimado Platina',
      paintColorHex: '#94a3b8',
    }
  ]);

  // Real-time calculation with EstimationEngine
  const calculation = useMemo(() => {
    return EstimationEngine.calculateFullEstimate(environments, {
      type: discountType,
      value: discountValue,
    });
  }, [environments, discountType, discountValue]);

  const handleAddEnvironment = () => {
    const nextName = PRESET_ROOM_NAMES[environments.length % PRESET_ROOM_NAMES.length];
    setEnvironments([
      ...environments,
      {
        name: nextName,
        width: 4.0,
        height: 2.7,
        wallCount: 4,
        openingsDiscount: 4.0,
        coatsCount: 2,
        surfaceCondition: 'CLEAN_REPAINT',
        finishType: 'ACRYLIC_MATTE',
        paintBrand: 'Suvinil / Coral',
        paintColorName: 'Branco Neve',
        paintColorHex: '#f8fafc',
      },
    ]);
  };

  const handleRemoveEnvironment = (index: number) => {
    if (environments.length <= 1) return;
    setEnvironments(environments.filter((_, i) => i !== index));
  };

  const handleUpdateEnv = (index: number, fields: Partial<EnvironmentDimensionInput>) => {
    setEnvironments(
      environments.map((env, i) => (i === index ? { ...env, ...fields } : env))
    );
  };

  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@email.com`,
      document: newCustDoc,
      address: newCustAddress,
      companyId: currentCompany.id,
      createdAt: new Date().toISOString(),
    };

    addCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setIsNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustDoc('');
    setNewCustAddress('');
  };

  const handleCreateEstimate = () => {
    if (!selectedCustomerId) {
      alert('Por favor, selecione ou cadastre um cliente.');
      return;
    }

    const nextCode = `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const savedEnvironments: EnvironmentItem[] = calculation.environments.map((calc, i) => {
      const original = environments[i];
      return {
        id: 'env_' + Date.now() + '_' + i,
        name: original.name || `Ambiente ${i + 1}`,
        width: calc.dimensions.width,
        height: calc.dimensions.height,
        wallCount: calc.dimensions.wallCount,
        openingsDiscount: calc.dimensions.openingsDiscountM2,
        coatsCount: calc.paint.coatsCount,
        surfaceCondition: original.surfaceCondition,
        finishType: original.finishType,
        paintColorName: original.paintColorName || 'Branco Neve',
        paintColorHex: original.paintColorHex || '#f8fafc',
        paintBrand: original.paintBrand || 'Suvinil / Coral',
        netAreaM2: calc.dimensions.netAreaM2,
        paintLitersNeeded: calc.paint.totalLitersNeeded,
        cans18L: calc.paint.containers.cans18L,
        gallons3_6L: calc.paint.containers.gallons3_6L,
        quarts0_9L: calc.paint.containers.quarts0_9L,
        laborCost: calc.labor.totalLaborCost,
        materialCost: calc.material.totalMaterialCost,
        subtotal: calc.financialSummary.subtotal,
        originalPhotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        simulatedPhotoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      };
    });

    const newEstimate: Estimate = {
      id: 'est_' + Date.now(),
      code: nextCode,
      companyId: currentCompany.id,
      customerId: selectedCustomerId,
      userId: currentUser.id,
      title: estimateTitle,
      status: 'DRAFT',
      totalLabor: calculation.totals.totalLaborCost,
      totalMaterial: calculation.totals.totalMaterialCost,
      subtotal: calculation.totals.grossTotal,
      discountType,
      discountValue: calculation.totals.discountValue,
      finalTotal: calculation.totals.finalTotal,
      estimatedDays: Math.max(estimatedDays, calculation.totals.estimatedExecutionDays),
      validityDays,
      paymentTerms,
      remindersSentCount: 0,
      environments: savedEnvironments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addEstimate(newEstimate);
    openPublicProposal(newEstimate.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Painel Geral</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Criador de Orçamentos Técnicos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cálculo automatizado de área líquida, rendimento de tintas para 2 demãos e mão de obra por m².
          </p>
        </div>
      </div>

      {/* Block 1: Cliente e Informações da Obra */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-sky-600" />
          <span>1. Dados do Cliente e Projeto</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cliente Select */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cliente Cadastrado *
              </label>
              <button
                type="button"
                onClick={() => setIsNewCustomerModal(true)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                + Cadastrar Novo Cliente
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">Selecione um cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone} {c.address ? `(${c.address})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Título do Projeto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título da Proposta
            </label>
            <input
              type="text"
              value={estimateTitle}
              onChange={(e) => setEstimateTitle(e.target.value)}
              placeholder="Ex: Reforma Pintura Apto 82"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Block 2: Ambientes e Paredes Dinâmicos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>2. Ambientes, Medições e Acabamentos ({environments.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Adicione os cômodos para calcular a metragem líquida e o consumo das latas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddEnvironment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Cômodo</span>
          </button>
        </div>

        <div className="space-y-5">
          {environments.map((env, index) => {
            const envCalc = calculation.environments[index];

            return (
              <div
                key={index}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header of Room Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={env.name}
                      onChange={(e) => handleUpdateEnv(index, { name: e.target.value })}
                      placeholder="Nome do Cômodo (Ex: Sala, Quarto 1)"
                      className="text-base font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none text-slate-900 dark:text-white transition"
                    />
                  </div>

                  {environments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEnvironment(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Excluir cômodo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Measurements Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Largura (metros)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={env.width}
                      onChange={(e) => handleUpdateEnv(index, { width: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Pé-direito / Altura (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={env.height}
                      onChange={(e) => handleUpdateEnv(index, { height: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Qtd. Paredes
                    </label>
                    <select
                      value={env.wallCount ?? 4}
                      onChange={(e) => handleUpdateEnv(index, { wallCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="1">1 Parede Avulsa</option>
                      <option value="2">2 Paredes</option>
                      <option value="3">3 Paredes</option>
                      <option value="4">4 Paredes (Cômodo Completo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Desconto Portas/Vãos (m²)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={env.openingsDiscount ?? 0}
                      onChange={(e) => handleUpdateEnv(index, { openingsDiscount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Surface Condition & Finish Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Condição da Parede
                    </label>
                    <select
                      value={env.surfaceCondition}
                      onChange={(e) => handleUpdateEnv(index, { surfaceCondition: e.target.value as SurfaceCondition })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="CLEAN_REPAINT">Repintura Simples / Conservada</option>
                      <option value="NEW_PLASTER">Gesso ou Reboco Novo (requer fundo selador)</option>
                      <option value="DAMAGED_CRACKED">Paredes Danificadas / Trincas (massa)</option>
                      <option value="MOISTURE_TREATED">Umidade Tratada / Antimofo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Tipo de Acabamento
                    </label>
                    <select
                      value={env.finishType}
                      onChange={(e) => handleUpdateEnv(index, { finishType: e.target.value as FinishType })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="ACRYLIC_MATTE">Acrílico Fosco Premium</option>
                      <option value="ACRYLIC_SEMIGLOSS">Acrílico Semibrilho Lavável</option>
                      <option value="BURNT_CEMENT">Cimento Queimado / Marmorato</option>
                      <option value="GRAFIATO">Grafiato Rústico</option>
                      <option value="PROJECTED_TEXTURE">Textura Projetada</option>
                      <option value="EPOXY">Tinta Epóxi (Azulejo/Piso)</option>
                      <option value="LATEX_PVA">Látex PVA Econômico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Cor Sugerida
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={env.paintColorName}
                        onChange={(e) => {
                          const found = PRESET_COLORS.find((p) => p.name === e.target.value);
                          handleUpdateEnv(index, {
                            paintColorName: e.target.value,
                            paintColorHex: found ? found.hex : '#f8fafc',
                          });
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {PRESET_COLORS.map((col) => (
                          <option key={col.name} value={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                      <span
                        className="w-8 h-8 rounded-lg shrink-0 border border-slate-300 shadow-sm"
                        style={{ backgroundColor: env.paintColorHex || '#f8fafc' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Instant Calculation Badge for this room */}
                {envCalc && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Área Líquida:</span>{' '}
                        <strong className="text-slate-900 dark:text-white font-mono">{envCalc.dimensions.netAreaM2} m²</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Tinta 2 Demãos:</span>{' '}
                        <strong className="text-sky-700 dark:text-sky-300 font-mono">{envCalc.paint.totalLitersNeeded} L</strong>{' '}
                        <span className="text-[11px] text-slate-500">
                          ({envCalc.paint.containers.cans18L > 0 ? `${envCalc.paint.containers.cans18L}x 18L ` : ''}
                          {envCalc.paint.containers.gallons3_6L > 0 ? `${envCalc.paint.containers.gallons3_6L}x 3.6L ` : ''}
                          {envCalc.paint.containers.quarts0_9L > 0 ? `${envCalc.paint.containers.quarts0_9L}x 0.9L` : ''})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Mão de obra: R$ {envCalc.labor.totalLaborCost.toFixed(2)}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        Subtotal: R$ {envCalc.financialSummary.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Block 3: Condições Comerciais e Desconto */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>3. Condições de Pagamento e Desconto</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Desconto Comercial
            </label>
            <div className="flex items-center gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="w-24 px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold"
              >
                <option value="PERCENTAGE">% Porcento</option>
                <option value="FIXED">R$ Fixo</option>
              </select>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Prazo Estimado de Execução (Dias Úteis)
            </label>
            <input
              type="number"
              min="1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Validade da Proposta (Dias)
            </label>
            <input
              type="number"
              min="5"
              value={validityDays}
              onChange={(e) => setValidityDays(parseInt(e.target.value) || 15)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Termos de Pagamento
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Quick Customer Modal */}
      {isNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cadastrar Novo Cliente
            </h3>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="joao@email.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Endereço da Obra</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="Rua das Acácias, 100 - Apto 32"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-md"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar with Real-Time Total & Paint Containers (Mandatory Prompt Feature) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Real-time Materials Breakdown */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Área Líquida Total</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {calculation.totals.totalNetAreaM2} m²
              </span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Consumo de Tinta (2 demãos)</span>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {calculation.totals.totalContainers.cans18L > 0 && `${calculation.totals.totalContainers.cans18L}x Latas 18L `}
                {calculation.totals.totalContainers.gallons3_6L > 0 && `${calculation.totals.totalContainers.gallons3_6L}x Galões 3.6L `}
                {calculation.totals.totalContainers.quarts0_9L > 0 && `${calculation.totals.totalContainers.quarts0_9L}x Quartos 0.9L`}
              </span>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Mão de Obra + Material</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                R$ {calculation.totals.totalLaborCost.toFixed(2)} + R$ {calculation.totals.totalMaterialCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Total in R$ */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Orçamento</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                R$ {calculation.totals.finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCreateEstimate}
              className="py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 flex items-center gap-2 transition active:scale-[0.98]"
            >
              <span>Gerar Proposta Comercial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
export default EstimateWizard;
