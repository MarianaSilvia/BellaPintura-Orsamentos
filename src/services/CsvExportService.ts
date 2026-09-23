/**
 * CsvExportService.ts
 * Utilitário profissional de exportação de dados para relatórios em CSV
 * Suporta Excel (pt-BR com delimitador ponto-e-vírgula e UTF-8 BOM) e formato internacional (vírgula)
 */

import { Estimate, Customer } from '../types';

export type CsvDelimiter = ';' | ',';

export interface CsvExportOptions {
  delimiter?: CsvDelimiter;
  includeBOM?: boolean; // Padrão true para compatibilidade perfeita com Excel Windows/Mac
}

/**
 * Escapa valores para o padrão RFC 4180
 */
function escapeCsvValue(val: any, delimiter: CsvDelimiter): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  // Se contiver delimitador, quebras de linha ou aspas, deve ser envolvido em aspas duplas
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formata número conforme o delimitador escolhido
 * Se delimitador for ';', usa vírgula decimal (padrão Brasil/Excel)
 * Se for ',', usa ponto decimal
 */
function formatNumber(num: number, delimiter: CsvDelimiter, decimals = 2): string {
  if (isNaN(num)) return '0';
  const fixed = num.toFixed(decimals);
  if (delimiter === ';') {
    return fixed.replace('.', ',');
  }
  return fixed;
}

/**
 * Formata data ISO para DD/MM/AAAA HH:mm
 */
function formatDate(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Converte status para rótulo legível em português
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado & Assinado';
    case 'SENT':
      return 'Enviado ao Cliente';
    case 'VIEWED':
      return 'Visualizado pelo Cliente';
    case 'DRAFT':
      return 'Rascunho em Elaboração';
    case 'REJECTED':
      return 'Rejeitado / Cancelado';
    default:
      return status;
  }
}

/**
 * Exporta Resumo Geral de Orçamentos (Desempenho Comercial & Faturamento)
 */
export function exportEstimatesToCsv(
  estimates: Estimate[],
  customers: Customer[],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ';';
  const includeBOM = options.includeBOM ?? true;

  const headers = [
    'Código do Orçamento',
    'Título da Proposta',
    'Status Comercial',
    'Nome do Cliente',
    'Documento Cliente (CPF/CNPJ)',
    'Telefone / WhatsApp',
    'E-mail Cliente',
    'Endereço da Obra',
    'Cidade',
    'Estado',
    'Qtd de Cômodos/Ambientes',
    'Área Líquida Total (m²)',
    'Tinta Total Necessária (Litros)',
    'Latas de 18 Litros',
    'Galões de 3.6 Litros',
    'Quartos de 0.9 Litros',
    'Mão de Obra Total (R$)',
    'Materiais Totais (R$)',
    'Subtotal Bruto (R$)',
    'Tipo de Desconto',
    'Valor do Desconto (R$)',
    'Faturamento Final / Total Líquido (R$)',
    'Prazo Estimado de Execução (Dias)',
    'Validade da Proposta (Dias)',
    'Condições de Pagamento',
    'Data de Emissão',
    'Data da Última Atualização',
    'Data da Assinatura Digital',
    'Nome do Signatário',
    'Documento do Signatário',
    'IP da Assinatura',
    'Hash Criptográfico SHA-256',
    'Qtd Lembretes Enviados',
  ];

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c.id, c));

  const rows = estimates.map((est) => {
    const cust = customerMap.get(est.customerId);
    const totalArea = est.environments.reduce((sum, env) => sum + (env.netAreaM2 || 0), 0);
    const totalPaintLiters = est.environments.reduce((sum, env) => sum + (env.paintLitersNeeded || 0), 0);
    const cans18L = est.environments.reduce((sum, env) => sum + (env.cans18L || 0), 0);
    const gallons3_6L = est.environments.reduce((sum, env) => sum + (env.gallons3_6L || 0), 0);
    const quarts0_9L = est.environments.reduce((sum, env) => sum + (env.quarts0_9L || 0), 0);

    return [
      est.code,
      est.title,
      getStatusLabel(est.status),
      cust?.name || 'Cliente Não Informado',
      cust?.document || '',
      cust?.phone || '',
      cust?.email || '',
      cust?.address || '',
      cust?.city || '',
      cust?.state || '',
      est.environments.length,
      formatNumber(totalArea, delimiter, 2),
      formatNumber(totalPaintLiters, delimiter, 2),
      cans18L,
      gallons3_6L,
      quarts0_9L,
      formatNumber(est.totalLabor, delimiter, 2),
      formatNumber(est.totalMaterial, delimiter, 2),
      formatNumber(est.subtotal, delimiter, 2),
      est.discountType === 'PERCENTAGE' ? 'Percentual (%)' : 'Fixo (R$)',
      formatNumber(est.discountValue, delimiter, 2),
      formatNumber(est.finalTotal, delimiter, 2),
      est.estimatedDays,
      est.validityDays,
      est.paymentTerms || '',
      formatDate(est.createdAt),
      formatDate(est.updatedAt),
      formatDate(est.signedAt),
      est.signedByName || '',
      est.signedByDocument || '',
      est.signatureIp || '',
      est.signatureSha256 || '',
      est.remindersSentCount || 0,
    ].map((val) => escapeCsvValue(val, delimiter));
  });

  const content = [
    headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter),
    ...rows.map((r) => r.join(delimiter)),
  ].join('\r\n');

  return includeBOM ? '\uFEFF' + content : content;
}

/**
 * Exporta Detalhamento Operacional de Ambientes e Consumo de Tintas
 * Útil para lista de compras, almoxarifado e distribuição de tarefas de pintura
 */
export function exportDetailedEnvironmentsToCsv(
  estimates: Estimate[],
  customers: Customer[],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ';';
  const includeBOM = options.includeBOM ?? true;

  const headers = [
    'Código do Orçamento',
    'Status da Proposta',
    'Cliente',
    'Telefone Cliente',
    'Nome do Ambiente / Cômodo',
    'Largura (m)',
    'Altura / Pé-Direito (m)',
    'Qtd de Paredes',
    'Desconto Portas e Vãos (m²)',
    'Área Líquida de Parede (m²)',
    'Condição da Superfície',
    'Tipo de Acabamento',
    'Cor Escolhida',
    'Código Hex da Cor',
    'Marca de Tinta Recomendada',
    'Demãos Recomendadas',
    'Volume de Tinta (Litros)',
    'Latas 18L Recomendadas',
    'Galões 3.6L Recomendados',
    'Quartos 0.9L Recomendados',
    'Custo Mão de Obra Ambiente (R$)',
    'Custo Materiais Ambiente (R$)',
    'Subtotal do Ambiente (R$)',
    'Data de Emissão',
  ];

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c.id, c));

  const rows: string[][] = [];

  estimates.forEach((est) => {
    const cust = customerMap.get(est.customerId);

    est.environments.forEach((env) => {
      let surfaceLabel: string = env.surfaceCondition;
      if (env.surfaceCondition === 'CLEAN_REPAINT') surfaceLabel = 'Repintura Conservada';
      if (env.surfaceCondition === 'NEW_PLASTER') surfaceLabel = 'Gesso ou Reboco Novo';
      if (env.surfaceCondition === 'DAMAGED_CRACKED') surfaceLabel = 'Paredes Danificadas com Trincas';
      if (env.surfaceCondition === 'MOISTURE_TREATED') surfaceLabel = 'Umidade Tratada / Antimofo';

      let finishLabel: string = env.finishType;
      if (env.finishType === 'ACRYLIC_MATTE') finishLabel = 'Acrílico Fosco Premium';
      if (env.finishType === 'ACRYLIC_SEMIGLOSS') finishLabel = 'Acrílico Semibrilho Lavável';
      if (env.finishType === 'BURNT_CEMENT') finishLabel = 'Cimento Queimado / Marmorato';
      if (env.finishType === 'GRAFIATO') finishLabel = 'Grafiato Rústico';
      if (env.finishType === 'PROJECTED_TEXTURE') finishLabel = 'Textura Projetada';
      if (env.finishType === 'EPOXY') finishLabel = 'Tinta Epóxi (Azulejo/Piso)';
      if (env.finishType === 'LATEX_PVA') finishLabel = 'Látex PVA Econômico';

      rows.push(
        [
          est.code,
          getStatusLabel(est.status),
          cust?.name || 'Cliente',
          cust?.phone || '',
          env.name,
          formatNumber(env.width, delimiter, 2),
          formatNumber(env.height, delimiter, 2),
          env.wallCount,
          formatNumber(env.openingsDiscount || 0, delimiter, 2),
          formatNumber(env.netAreaM2, delimiter, 2),
          surfaceLabel,
          finishLabel,
          env.paintColorName || '',
          env.paintColorHex || '',
          env.paintBrand || '',
          env.coatsCount || 2,
          formatNumber(env.paintLitersNeeded, delimiter, 2),
          env.cans18L,
          env.gallons3_6L,
          env.quarts0_9L,
          formatNumber(env.laborCost, delimiter, 2),
          formatNumber(env.materialCost, delimiter, 2),
          formatNumber(env.subtotal, delimiter, 2),
          formatDate(est.createdAt),
        ].map((v) => escapeCsvValue(v, delimiter))
      );
    });
  });

  const content = [
    headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter),
    ...rows.map((r) => r.join(delimiter)),
  ].join('\r\n');

  return includeBOM ? '\uFEFF' + content : content;
}

/**
 * Exporta Base de Clientes e Indicadores de LTV / Desempenho
 */
export function exportCustomersToCsv(
  customers: Customer[],
  estimates: Estimate[],
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter ?? ';';
  const includeBOM = options.includeBOM ?? true;

  const headers = [
    'ID do Cliente',
    'Nome Completo do Cliente',
    'Documento (CPF / CNPJ)',
    'Telefone / WhatsApp',
    'E-mail',
    'Endereço da Obra',
    'Cidade',
    'Estado',
    'Observações do Cliente',
    'Data de Cadastro',
    'Total de Orçamentos Emitidos',
    'Orçamentos Aprovados e Assinados',
    'Orçamentos Pendentes',
    'Taxa de Conversão do Cliente (%)',
    'Faturamento Total Aprovado (R$)',
    'Ticket Médio Aprovado (R$)',
    'Metragem Total Contratada (m²)',
    'Código do Último Orçamento',
    'Data do Último Orçamento',
    'Status do Último Orçamento',
  ];

  const rows = customers.map((c) => {
    const custEstimates = estimates.filter((e) => e.customerId === c.id);
    const approvedEstimates = custEstimates.filter((e) => e.status === 'APPROVED');
    const pendingEstimates = custEstimates.filter((e) => e.status === 'SENT' || e.status === 'VIEWED');

    const totalApprovedRevenue = approvedEstimates.reduce((sum, e) => sum + e.finalTotal, 0);
    const avgTicket = approvedEstimates.length > 0 ? totalApprovedRevenue / approvedEstimates.length : 0;
    const conversionRate = custEstimates.length > 0 ? (approvedEstimates.length / custEstimates.length) * 100 : 0;

    const totalM2Approved = approvedEstimates.reduce((sum, e) => {
      const m2 = e.environments.reduce((acc, env) => acc + (env.netAreaM2 || 0), 0);
      return sum + m2;
    }, 0);

    // Último orçamento
    const sorted = [...custEstimates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latest = sorted[0];

    return [
      c.id,
      c.name,
      c.document || '',
      c.phone || '',
      c.email || '',
      c.address || '',
      c.city || '',
      c.state || '',
      c.notes || '',
      formatDate(c.createdAt),
      custEstimates.length,
      approvedEstimates.length,
      pendingEstimates.length,
      formatNumber(conversionRate, delimiter, 1) + '%',
      formatNumber(totalApprovedRevenue, delimiter, 2),
      formatNumber(avgTicket, delimiter, 2),
      formatNumber(totalM2Approved, delimiter, 2),
      latest ? latest.code : 'Nenhum',
      latest ? formatDate(latest.createdAt) : '',
      latest ? getStatusLabel(latest.status) : '',
    ].map((val) => escapeCsvValue(val, delimiter));
  });

  const content = [
    headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter),
    ...rows.map((r) => r.join(delimiter)),
  ].join('\r\n');

  return includeBOM ? '\uFEFF' + content : content;
}

/**
 * Dispara o download automático do arquivo CSV no navegador
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copia o conteúdo CSV para a área de transferência do sistema
 */
export async function copyCsvToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Erro ao copiar CSV:', err);
    return false;
  }
}
