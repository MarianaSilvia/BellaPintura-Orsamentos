import React, { useRef, useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Eraser, PenTool, Lock, FileText, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignComplete: (signerName: string, signerDocument: string, signatureImage: string) => Promise<{ success: boolean; hash: string }>;
  proposalTitle: string;
  proposalCode: string;
  totalAmount: number;
  clientDefaultName?: string;
  clientDefaultDoc?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSignComplete,
  proposalTitle,
  proposalCode,
  totalAmount,
  clientDefaultName = '',
  clientDefaultDoc = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(clientDefaultName);
  const [signerDocument, setSignerDocument] = useState(clientDefaultDoc);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (clientDefaultName) setSignerName(clientDefaultName);
    if (clientDefaultDoc) setSignerDocument(clientDefaultDoc);
  }, [clientDefaultName, clientDefaultDoc]);

  // Canvas setup when opened
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0284c7'; // Brand color
    ctx.lineWidth = 2.5;

    // Reset state
    setHasSignature(false);
    setErrorMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  // Drawing coordinates helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signerName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!signerDocument.trim()) {
      setErrorMessage('Por favor, informe seu CPF ou documento oficial.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMessage('É necessário aceitar os termos da proposta para assinar.');
      return;
    }
    if (!hasSignature || !canvasRef.current) {
      setErrorMessage('Por favor, faça sua assinatura na área do quadro abaixo.');
      return;
    }

    try {
      setIsSubmitting(true);
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      
      const result = await onSignComplete(signerName, signerDocument, signatureDataUrl);
      
      if (result.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        onClose();
      }
    } catch {
      setErrorMessage('Erro ao processar assinatura digital. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assinatura Eletrônica da Proposta
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Código: <span className="font-semibold text-slate-700 dark:text-slate-300">{proposalCode}</span> • R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Proposal Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {proposalTitle}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Ao assinar, esta proposta torna-se um acordo de prestação de serviços com validade jurídica assegurada pela legislação vigente.
            </p>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo do Signatário *
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Ex: Mariana Silva"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CPF ou CNPJ *
              </label>
              <input
                type="text"
                required
                value={signerDocument}
                onChange={(e) => setSignerDocument(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Canvas Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-sky-600" />
                <span>Assine no quadro abaixo (Dedo no celular ou Mouse)</span>
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs gap-1">
                  <PenTool className="w-5 h-5 opacity-40" />
                  <span>Clique ou toque aqui para assinar</span>
                </div>
              )}
              {/* Baseline guideline */}
              <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200 dark:border-slate-800 pointer-events-none" />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Declaro que li e concordo expressamente com os valores, materiais especificados, prazos e condições de garantia contidos nesta proposta comercial, conforme as diretrizes do Código Civil Brasileiro e da LGPD.
              </span>
            </label>
          </div>

          {/* Security stamp info */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Assinatura protegida com criptografia ponta a ponta e registro auditável de IP.</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !acceptedTerms || !hasSignature}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprovar e Assinar Agora</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SignatureModal;
