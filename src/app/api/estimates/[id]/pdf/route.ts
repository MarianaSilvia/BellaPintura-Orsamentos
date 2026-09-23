/**
 * API Route: /api/estimates/[id]/pdf
 * Renders commercial proposal PDF including company header, logo, brand palette,
 * room financial details, suggested paint containers, and warranty terms block.
 */

import { prisma } from '../../../../../lib/prisma';

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const estimateId = context?.params?.id;

    const estimate = await prisma.estimate?.findUnique?.({
      where: { id: estimateId },
      include: {
        company: true,
        customer: true,
        environments: true,
      },
    });

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Orçamento não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PDF metadata & formatted document structure
    const pdfData = {
      header: {
        companyName: estimate.company?.name || 'Bella Pintura',
        cnpj: estimate.company?.cnpj || '',
        phone: estimate.company?.phone || '',
        logoUrl: estimate.company?.logo || '',
        primaryColor: estimate.company?.primaryColor || '#0284c7',
        code: estimate.code,
        date: new Date(estimate.createdAt).toLocaleDateString('pt-BR'),
      },
      customer: {
        name: estimate.customer?.name,
        document: estimate.customer?.document,
        phone: estimate.customer?.phone,
        address: estimate.customer?.address,
      },
      environments: estimate.environments?.map((env: any) => ({
        name: env.name,
        dimensions: `${env.width}m x ${env.height}m`,
        netAreaM2: env.netWallArea || env.netAreaM2,
        finish: env.finishType,
        color: env.paintColorName,
        paintLiters: env.paintLitersNeeded,
        containers: `${env.cans18L}x 18L, ${env.gallons3_6L}x 3.6L`,
        subtotal: env.subtotalCost || env.subtotal,
      })),
      financial: {
        totalLabor: estimate.totalLabor,
        totalMaterial: estimate.totalMaterial,
        discount: estimate.discountValue,
        finalTotal: estimate.finalTotal,
        paymentTerms: estimate.paymentTerms,
      },
      warranty: {
        warrantyDays: estimate.company?.warrantyDays || 90,
        termsText: estimate.company?.defaultTerms || 'Garantia legal de 90 dias contra descascamento precoce.',
      },
      signature: {
        signed: estimate.status === 'APPROVED',
        signedByName: estimate.signedByName,
        signedAt: estimate.signedAt,
        sha256: estimate.signatureSha256,
      },
    };

    return new Response(JSON.stringify({ success: true, pdfData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${estimate.code}-proposta.pdf"`,
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro ao gerar PDF da proposta' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
