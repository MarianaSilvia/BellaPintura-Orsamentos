/**
 * API Route: /api/export
 * Endpoint para exportação direta de dados em formato CSV para consumo externo
 * Suporta filtros por tenant (companyId), status e tipo de delimitador (; ou ,)
 */

import { prisma } from '../../../lib/prisma';
import {
  exportEstimatesToCsv,
  exportDetailedEnvironmentsToCsv,
  exportCustomersToCsv,
  CsvDelimiter
} from '../../../services/CsvExportService';
import { initialEstimates, initialCustomers } from '../../../data/mockData';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get('type') || 'estimates') as 'estimates' | 'environments' | 'customers';
    const companyId = searchParams.get('companyId') || 'comp_elite';
    const delimiter = (searchParams.get('delimiter') === ',' ? ',' : ';') as CsvDelimiter;
    const status = searchParams.get('status') || 'ALL';

    // Buscar do prisma ou fallback para dados locais em memória
    let estimatesData: any[] = [];
    let customersData: any[] = [];

    try {
      if (prisma && prisma.estimate?.findMany) {
        estimatesData = (await prisma.estimate.findMany({
          where: {
            companyId,
            ...(status !== 'ALL' ? { status } : {}),
          },
          include: { customer: true, environments: true },
        })) || [];

        customersData = (await prisma.customer.findMany({
          where: { companyId },
        })) || [];
      }
    } catch {
      // Usar seed em caso de ambiente sem banco ativo
    }

    if (estimatesData.length === 0) {
      estimatesData = initialEstimates.filter((e) => {
        const matchesComp = e.companyId === companyId;
        const matchesStatus = status === 'ALL' || e.status === status;
        return matchesComp && matchesStatus;
      });
    }

    if (customersData.length === 0) {
      customersData = initialCustomers.filter((c) => c.companyId === companyId);
    }

    let csvContent = '';
    const today = new Date().toISOString().split('T')[0];
    let filename = `tintaspro_orcamentos_${today}.csv`;

    if (type === 'environments') {
      csvContent = exportDetailedEnvironmentsToCsv(estimatesData, customersData, { delimiter });
      filename = `tintaspro_ambientes_tintas_${today}.csv`;
    } else if (type === 'customers') {
      csvContent = exportCustomersToCsv(customersData, estimatesData, { delimiter });
      filename = `tintaspro_clientes_${today}.csv`;
    } else {
      csvContent = exportEstimatesToCsv(estimatesData, customersData, { delimiter });
      filename = `tintaspro_orcamentos_${today}.csv`;
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Erro ao exportar dados em CSV' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
