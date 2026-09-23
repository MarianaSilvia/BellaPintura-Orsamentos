import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}

export const LiveSupportChat: React.FC = () => {
  const { currentCompany } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'support',
      text: `Olá! Bem-vindo ao suporte em tempo real da ${currentCompany.name}. Como podemos auxiliar em seus orçamentos técnicos de pintura hoje?`,
      time: 'Agora',
    },
  ]);

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Automatic intelligent response
    setTimeout(() => {
      let reply = 'Entendido! Nossa equipe técnica está analisando a medição dos ambientes e as regras de diluição de tintas para apoiar seu projeto.';
      const lower = query.toLowerCase();
      if (lower.includes('cimento') || lower.includes('queimado')) {
        reply = 'Para Cimento Queimado, nosso motor técnico sugere aplicar fundo selador acrílico e duas demãos com desempenadeira de cantos arredondados, calculando o adicional de mão de obra automaticamente.';
      } else if (lower.includes('assinatura') || lower.includes('aprovar')) {
        reply = 'O link único do cliente permite assinatura digital na tela com hash SHA-256 e emissão instantânea de comprovante com valor legal!';
      } else if (lower.includes('whatsapp')) {
        reply = 'Você pode enviar propostas com um clique via WhatsApp direto da tabela do painel geral ou pelo botão verde no portal do cliente!';
      } else if (lower.includes('lata') || lower.includes('galão') || lower.includes('calcular')) {
        reply = 'O cálculo técnico considera 1L para cada 5m² por demão (total 2 demãos). Latas de 18L cobrem ~45m², galões de 3.6L cobrem ~9m² e quartos de 0.9L cobrem ~2.25m².';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'support',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="no-print fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition active:scale-95 group"
          title="Suporte em Tempo Real"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[480px]">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold">Suporte Especialista {currentCompany.tradeName || currentCompany.name}</h3>
                <p className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span>Atendimento online agora</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition"
              title="Fechar suporte"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleSend(undefined, 'Como calcular latas e galões para 2 demãos?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600 font-medium transition"
            >
              🎨 Cálculo de Latas
            </button>
            <button
              type="button"
              onClick={() => handleSend(undefined, 'Como funciona a assinatura digital com validade legal?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600 font-medium transition"
            >
              ✍️ Assinatura Digital
            </button>
            <button
              type="button"
              onClick={() => handleSend(undefined, 'Como enviar proposta por WhatsApp?')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600 font-medium transition"
            >
              📱 Envio WhatsApp
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 text-xs ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'support' && (
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    BP
                  </div>
                )}
                <div
                  className={`max-w-[78%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida técnica..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
export default LiveSupportChat;
