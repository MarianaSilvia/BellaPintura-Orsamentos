import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Palette,
  Shield,
  FileText,
  Save,
  CheckCircle,
  Globe,
  Moon,
  Sun,
  Lock,
  Smartphone,
  Check,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Language } from '../types';

export const SettingsView: React.FC = () => {
  const {
    currentCompany,
    updateCompanySettings,
    companies,
    setCurrentCompany,
    currentUser,
    setCurrentUser,
    language,
    setLanguage,
    isDarkMode,
    toggleDarkMode
  } = useApp();

  const [name, setName] = useState(currentCompany.name);
  const [tradeName, setTradeName] = useState(currentCompany.tradeName || '');
  const [cnpj, setCnpj] = useState(currentCompany.cnpj);
  const [email, setEmail] = useState(currentCompany.email);
  const [phone, setPhone] = useState(currentCompany.phone);
  const [whatsapp, setWhatsapp] = useState(currentCompany.whatsapp || '');
  const [address, setAddress] = useState(currentCompany.address || '');
  const [city, setCity] = useState(currentCompany.city || '');
  const [state, setState] = useState(currentCompany.state || '');
  const [logo, setLogo] = useState(currentCompany.logo || '');
  const [primaryColor, setPrimaryColor] = useState(currentCompany.primaryColor);
  const [warrantyDays, setWarrantyDays] = useState(currentCompany.warrantyDays);
  const [defaultTerms, setDefaultTerms] = useState(currentCompany.defaultTerms);
  const [baseRate, setBaseRate] = useState(currentCompany.laborRatePerM2Base || 18.0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled);
  const [showQr2FA, setShowQr2FA] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      name,
      tradeName,
      cnpj,
      email,
      phone,
      whatsapp,
      address,
      city,
      state,
      logo,
      primaryColor,
      warrantyDays,
      defaultTerms,
      laborRatePerM2Base: baseRate,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    setCurrentUser({ ...currentUser, twoFactorEnabled: nextState });
    if (nextState) {
      setShowQr2FA(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Configurações da Empresa & Segurança
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personalize a identidade da sua marca nas propostas, termos de garantia e preferências de segurança.
        </p>
      </div>

      {/* Multi-Tenant Switcher Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-base font-bold">Empresas da demonstração</h2>
              <p className="text-xs text-slate-400">
                Alterne entre marcas de exemplo para visualizar propostas com identidades diferentes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-mono font-bold">
            ID: {currentCompany.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {companies.map((comp) => {
            const isSelected = comp.id === currentCompany.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => {
                  setCurrentCompany(comp);
                  setName(comp.name);
                  setCnpj(comp.cnpj);
                  setPhone(comp.phone);
                  setPrimaryColor(comp.primaryColor);
                  setDefaultTerms(comp.defaultTerms);
                }}
                className={`p-4 rounded-2xl text-left border flex items-center justify-between transition ${
                  isSelected
                    ? 'border-sky-500 bg-slate-800 ring-2 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: comp.primaryColor }}
                  >
                    {comp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{comp.name}</p>
                    <p className="text-xs text-slate-400">{comp.city}/{comp.state} • CNPJ {comp.cnpj}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company Identity */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Dados da Empresa e Branding</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Telefone Principal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">WhatsApp Comercial (com DDI/DDD)</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Color & Logo */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Cor Primária da Marca na Proposta</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 p-1 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">URL do Logotipo</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* Contractual Terms & Base Rate */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Regras de Negócio e Termos de Garantia</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Dias de Garantia Padrão</label>
              <input
                type="number"
                min="30"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(parseInt(e.target.value) || 90)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Taxa Base de Mão de Obra (R$ / m²)</label>
              <input
                type="number"
                step="0.5"
                min="10"
                value={baseRate}
                onChange={(e) => setBaseRate(parseFloat(e.target.value) || 18)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Termos Contratuais & Cláusula de Garantia</label>
              <textarea
                rows={4}
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Security & 2FA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Autenticação em Dois Fatores (2FA)
                </h3>
                <p className="text-xs text-slate-500">
                  Proteja o acesso administrativo aos orçamentos com autenticador móvel (Google Authenticator).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle2FA}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                twoFactorEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {twoFactorEnabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 text-xs flex items-center gap-4">
              <QrCode className="w-12 h-12 text-indigo-600 shrink-0" />
              <div>
                <p className="font-bold text-indigo-900 dark:text-indigo-200">
                  2FA Configurado com Sucesso
                </p>
                <p className="text-indigo-700 dark:text-indigo-300 text-[11px] mt-0.5">
                  Chave Secreta TOTP: <span className="font-mono font-bold">JBSWY3DPEHPK3PXP</span> • Códigos de 6 dígitos ativos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences: Language & Theme */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-600" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Idioma da interface</p>
              <p className="text-xs text-slate-400">Selecione o idioma da interface</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['pt', 'en', 'es'] as Language[]).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setLanguage(lng)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                  language === lng
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lng === 'pt' ? 'Português' : lng === 'en' ? 'English' : 'Español'}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />

            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
              title="Alternar Modo Escuro / Claro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </form>
    </div>
  );
};
export default SettingsView;
