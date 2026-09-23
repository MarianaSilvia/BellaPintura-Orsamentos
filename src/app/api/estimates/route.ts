/**
 * API Route: /api/estimates
 * Multi-Tenant GET (list) and POST (create) estimates scoped by user companyId
 */

import { prisma } from '../../../lib/prisma';
import { EstimationEngine } from '../../../services/EstimationEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || 'comp_elite';

    const estimates = await prisma.estimate?.findMany?.({
      where: { companyId },
      include: {
        customer: true,
        environments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify({ success: true, data: estimates || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Erro ao carregar orçamentos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyId,
      customerId,
      userId,
      title,
      environments,
      discountType = 'PERCENTAGE',
      discountValue = 0,
      validityDays = 15,
      estimatedDays = 5,
      paymentTerms = '50% sinal + 50% na conclusão',
    } = body;

    if (!companyId || !customerId || !environments || environments.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parâmetros obrigatórios ausentes.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Recalcular no backend para integridade de auditoria
    const calculated = EstimationEngine.calculateFullEstimate(environments, {
      type: discountType,
      value: discountValue,
    });

    const code = `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEstimate = await prisma.estimate?.create?.({
      data: {
        code,
        companyId,
        customerId,
        userId,
        title,
        status: 'DRAFT',
        totalLabor: calculated.totals.totalLaborCost,
        totalMaterial: calculated.totals.totalMaterialCost,
        subtotal: calculated.totals.grossTotal,
        discountType,
        discountValue: calculated.totals.discountValue,
        finalTotal: calculated.totals.finalTotal,
        estimatedDays: Math.max(estimatedDays, calculated.totals.estimatedExecutionDays),
        validityDays,
        paymentTerms,
        environments: {
          create: calculated.environments.map((env, i) => ({
            name: environments[i]?.name || `Ambiente ${i + 1}`,
            width: env.dimensions.width,
            height: env.dimensions.height,
            wallCount: env.dimensions.wallCount,
            openingsArea: env.dimensions.openingsDiscountM2,
            netWallArea: env.dimensions.netAreaM2,
            coatsCount: env.paint.coatsCount,
            surfaceCondition: environments[i]?.surfaceCondition || 'CLEAN_REPAINT',
            finishType: environments[i]?.finishType || 'ACRYLIC_MATTE',
            paintColorName: environments[i]?.paintColorName || 'Branco Neve',
            paintColorHex: environments[i]?.paintColorHex || '#F8FAFC',
            paintBrand: environments[i]?.paintBrand || 'Suvinil / Coral',
            paintLitersNeeded: env.paint.totalLitersNeeded,
            cans18L: env.paint.containers.cans18L,
            gallons3_6L: env.paint.containers.gallons3_6L,
            quarts0_9L: env.paint.containers.quarts0_9L,
            laborRatePerM2: env.labor.finalRatePerM2,
            laborCost: env.labor.totalLaborCost,
            materialCost: env.material.totalMaterialCost,
            subtotalCost: env.financialSummary.subtotal,
          })),
        },
      },
      include: {
        customer: true,
        environments: true,
      },
    });

    return new Response(JSON.stringify({ success: true, data: newEstimate }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Erro ao persistir orçamento' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
