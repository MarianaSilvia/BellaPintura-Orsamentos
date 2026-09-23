/**
 * EstimationEngine.ts
 * Motor de cálculo em TypeScript puro para orçamentos de pintura e reformas.
 * 
 * Responsabilidades:
 * 1. Cálculo de área bruta e líquida (descontando portas, janelas e vãos)
 * 2. Cálculo exato de consumo de tinta por demão (rendimento médio de 1L para 5m² com 2 demãos padrão)
 * 3. Otimização de embalagens comerciais (Latas de 18L, Galões de 3.6L e Quartos de 0.9L)
 * 4. Precificação de mão de obra dinâmica por m² conforme condição da parede e tipo de acabamento
 * 5. Estimativa de tempo de execução (dias úteis) e margem de segurança
 */

export type SurfaceCondition =
  | 'NEW_PLASTER'      // Gesso ou reboco novo: necessita selador + lixamento prévio
  | 'CLEAN_REPAINT'    // Repintura limpa e estável: higienização e pintura direta
  | 'DAMAGED_CRACKED'  // Paredes danificadas / trincas: raspagem + massa corrida/acrílica
  | 'MOISTURE_TREATED'; // Umidade tratada: fundo preparador + impermeabilizante

export type FinishType =
  | 'LATEX_PVA'          // Látex PVA Econômico
  | 'ACRYLIC_MATTE'      // Acrílico Fosco Premium
  | 'ACRYLIC_SEMIGLOSS'  // Acrílico Semibrilho Lavável
  | 'BURNT_CEMENT'       // Cimento Queimado / Marmorato Decorativo
  | 'GRAFIATO'           // Grafiato Rústico
  | 'PROJECTED_TEXTURE'  // Textura Projetada
  | 'EPOXY';             // Tinta Epóxi (Piso/Azulejo)

export interface EnvironmentDimensionInput {
  name?: string;
  width: number;            // Largura em metros (ex: 4.5)
  height: number;           // Altura em metros (pé-direito, ex: 2.8)
  wallCount?: number;       // Quantidade de paredes (padrão: 1 para parede avulsa, 4 para perímetro do cômodo)
  openingsDiscount?: number; // Área total de portas/janelas a descontar em m² (ex: 3.5)
  coatsCount?: number;      // Número de demãos (padrão: 2)
  surfaceCondition: SurfaceCondition;
  finishType: FinishType;
  paintBrand?: string;
  paintColorName?: string;
  paintColorHex?: string;
  customLaborRate?: number; // Permite sobrescrever a taxa por m²
}

export interface PaintConsumptionResult {
  grossAreaM2: number;
  openingsDiscountM2: number;
  netAreaM2: number;
  coatsCount: number;
  totalLitersNeeded: number;
  // Otimização de embalagens comerciais
  containers: {
    cans18L: number;
    gallons3_6L: number;
    quarts0_9L: number;
    totalPurchasedLiters: number;
    leftoverLiters: number;
  };
  estimatedPaintCost: number;
}

export interface EnvironmentCalculationResult {
  dimensions: {
    width: number;
    height: number;
    wallCount: number;
    grossAreaM2: number;
    openingsDiscountM2: number;
    netAreaM2: number;
  };
  paint: PaintConsumptionResult;
  labor: {
    baseRatePerM2: number;
    conditionMultiplier: number;
    finishMultiplier: number;
    finalRatePerM2: number;
    totalLaborCost: number;
  };
  material: {
    paintCost: number;
    sundriesCost: number; // Fita crepe, lixas, rolos, lonas plásticas (aprox. 12% da tinta)
    totalMaterialCost: number;
  };
  financialSummary: {
    subtotal: number;
    suggestedExecutionDays: number;
  };
}

export interface OverallProjectEstimate {
  environments: EnvironmentCalculationResult[];
  totals: {
    totalNetAreaM2: number;
    totalLitersNeeded: number;
    totalContainers: {
      cans18L: number;
      gallons3_6L: number;
      quarts0_9L: number;
    };
    totalLaborCost: number;
    totalMaterialCost: number;
    grossTotal: number;
    discountValue: number;
    finalTotal: number;
    estimatedExecutionDays: number;
  };
}

export class EstimationEngine {
  // Cobertura padrão: 1 Litro cobre 10m² por demão. Para 2 demãos, 1 Litro cobre 5m² da parede líquida.
  public static readonly COVERAGE_PER_LITER_SINGLE_COAT = 10; // m²/L para 1 demão
  public static readonly COVERAGE_PER_LITER_TWO_COATS = 5;    // m²/L para 2 demãos (regra do briefing: 1L para 5m²)

  // Preços de referência médios por embalagem (mercado brasileiro em BRL)
  public static readonly CAN_18L_VOLUME = 18.0;
  public static readonly GALLON_3_6L_VOLUME = 3.6;
  public static readonly QUART_0_9L_VOLUME = 0.9;

  // Tabela de Preço Médio por Galão/Lata de acordo com o acabamento
  public static readonly FINISH_PRICE_MAP: Record<FinishType, { pricePerLiter: number; label: string }> = {
    LATEX_PVA: { pricePerLiter: 18.5, label: 'Látex PVA Econômico' },
    ACRYLIC_MATTE: { pricePerLiter: 28.0, label: 'Acrílico Fosco Premium' },
    ACRYLIC_SEMIGLOSS: { pricePerLiter: 36.5, label: 'Acrílico Semibrilho Lavável' },
    BURNT_CEMENT: { pricePerLiter: 58.0, label: 'Cimento Queimado / Marmorato' },
    GRAFIATO: { pricePerLiter: 22.0, label: 'Grafiato Rústico' },
    PROJECTED_TEXTURE: { pricePerLiter: 32.0, label: 'Textura Projetada' },
    EPOXY: { pricePerLiter: 75.0, label: 'Tinta Epóxi' },
  };

  // Taxa base de mão de obra por m² baseada na condição da parede
  public static readonly CONDITION_BASE_RATES: Record<SurfaceCondition, { ratePerM2: number; label: string; prepDescription: string }> = {
    CLEAN_REPAINT: {
      ratePerM2: 18.0,
      label: 'Repintura Simples / Conservada',
      prepDescription: 'Limpeza superficial, isolamento e aplicação de 2 demãos',
    },
    NEW_PLASTER: {
      ratePerM2: 26.0,
      label: 'Gesso ou Reboco Novo',
      prepDescription: 'Aplicação de fundo preparador/selador acrílico, lixamento e 2 a 3 demãos',
    },
    DAMAGED_CRACKED: {
      ratePerM2: 34.0,
      label: 'Parede Danificada / Trincas e Fissuras',
      prepDescription: 'Raspagem de descascados, correção com massa corrida/acrílica, selagem e lixamento',
    },
    MOISTURE_TREATED: {
      ratePerM2: 42.0,
      label: 'Infiltração / Umidade Tratada',
      prepDescription: 'Tratamento fungicida/antimofo, primer impermeabilizante bloqueador e pintura de acabamento',
    },
  };

  // Adicionais de mão de obra conforme complexidade da técnica de acabamento
  public static readonly FINISH_LABOR_SURCHARGES: Record<FinishType, number> = {
    LATEX_PVA: 0.0,
    ACRYLIC_MATTE: 2.0,
    ACRYLIC_SEMIGLOSS: 4.5,
    BURNT_CEMENT: 24.0, // Técnica refinada com espátula / efeito marmorato
    GRAFIATO: 16.0,     // Aplicação com desempenadeira e ranhuras uniformes
    PROJECTED_TEXTURE: 18.0, // Uso de pistola compressora
    EPOXY: 25.0,        // Aplicação técnica com catalisador e precisão
  };

  /**
   * Calcula a área líquida de pintura
   */
  public static calculateNetArea(
    width: number,
    height: number,
    openingsDiscount: number = 0,
    wallCount: number = 1
  ): { grossArea: number; netArea: number } {
    const validWidth = Math.max(0, Number(width) || 0);
    const validHeight = Math.max(0, Number(height) || 0);
    const validDiscount = Math.max(0, Number(openingsDiscount) || 0);
    const validWalls = Math.max(1, Number(wallCount) || 1);

    const grossArea = Number((validWidth * validHeight * validWalls).toFixed(2));
    const netArea = Number(Math.max(0, grossArea - validDiscount).toFixed(2));

    return { grossArea, netArea };
  }

  /**
   * Calcula consumo de tinta e otimiza embalagens (18L, 3.6L, 0.9L)
   * Regra base: Para 2 demãos, 1L cobre 5m²
   */
  public static calculatePaintConsumption(
    netAreaM2: number,
    coatsCount: number = 2,
    finishType: FinishType = 'ACRYLIC_MATTE'
  ): PaintConsumptionResult {
    const coats = Math.max(1, coatsCount);
    // Consumo por litro para o número de demãos requisitado
    // Exemplo: 2 demãos = 5m²/L; 1 demão = 10m²/L; 3 demãos = 3.33m²/L
    const coveragePerLiter = this.COVERAGE_PER_LITER_SINGLE_COAT / coats;
    
    // Adiciona 5% de margem de perda em recortes e rolo
    const rawLitersNeeded = (netAreaM2 / coveragePerLiter) * 1.05;
    const totalLitersNeeded = Number(rawLitersNeeded.toFixed(2));

    // Otimização matemática gulosa (greedy container packing)
    let remaining = totalLitersNeeded;
    let cans18L = 0;
    let gallons3_6L = 0;
    let quarts0_9L = 0;

    // Se a necessidade for alta (ex: >= 14.4L), é economicamente vantajoso comprar a lata de 18L
    // pois 4 galões de 3.6L (14.4L) custam quase o mesmo que 1 lata de 18L
    while (remaining >= 14.4) {
      cans18L++;
      remaining -= this.CAN_18L_VOLUME;
    }

    if (remaining > 0) {
      // Para o que sobrou, verificar galões de 3.6L
      while (remaining >= 2.7) {
        gallons3_6L++;
        remaining -= this.GALLON_3_6L_VOLUME;
      }
    }

    if (remaining > 0) {
      // Para o que restou (menor que 2.7L), usar quartos de 0.9L ou arredondar para galão
      if (remaining > 1.8) {
        gallons3_6L++;
        remaining -= this.GALLON_3_6L_VOLUME;
      } else {
        quarts0_9L = Math.ceil(remaining / this.QUART_0_9L_VOLUME);
        remaining -= quarts0_9L * this.QUART_0_9L_VOLUME;
      }
    }

    // Se tudo deu 0 mas a área > 0, sugere ao menos 1 galão ou quarto
    if (netAreaM2 > 0 && cans18L === 0 && gallons3_6L === 0 && quarts0_9L === 0) {
      quarts0_9L = 1;
    }

    const totalPurchasedLiters = Number(
      (cans18L * this.CAN_18L_VOLUME + gallons3_6L * this.GALLON_3_6L_VOLUME + quarts0_9L * this.QUART_0_9L_VOLUME).toFixed(2)
    );
    const leftoverLiters = Number(Math.max(0, totalPurchasedLiters - totalLitersNeeded).toFixed(2));

    // Custo estimado de tintas
    const pricePerLiter = this.FINISH_PRICE_MAP[finishType]?.pricePerLiter ?? 28.0;
    const estimatedPaintCost = Number((totalPurchasedLiters * pricePerLiter).toFixed(2));

    return {
      grossAreaM2: 0, // preenchido no ambiente
      openingsDiscountM2: 0,
      netAreaM2,
      coatsCount: coats,
      totalLitersNeeded,
      containers: {
        cans18L,
        gallons3_6L,
        quarts0_9L,
        totalPurchasedLiters,
        leftoverLiters,
      },
      estimatedPaintCost,
    };
  }

  /**
   * Calcula a taxa de mão de obra por m² baseada em condição e acabamento
   */
  public static calculateLaborRate(
    surfaceCondition: SurfaceCondition,
    finishType: FinishType,
    customRate?: number
  ): { baseRate: number; conditionMultiplier: number; finishSurcharge: number; finalRatePerM2: number } {
    if (customRate && customRate > 0) {
      return {
        baseRate: customRate,
        conditionMultiplier: 1.0,
        finishSurcharge: 0,
        finalRatePerM2: Number(customRate.toFixed(2)),
      };
    }

    const baseCondition = this.CONDITION_BASE_RATES[surfaceCondition] ?? this.CONDITION_BASE_RATES.CLEAN_REPAINT;
    const finishSurcharge = this.FINISH_LABOR_SURCHARGES[finishType] ?? 0;
    const finalRate = baseCondition.ratePerM2 + finishSurcharge;

    return {
      baseRate: baseCondition.ratePerM2,
      conditionMultiplier: 1.0,
      finishSurcharge,
      finalRatePerM2: Number(finalRate.toFixed(2)),
    };
  }

  /**
   * Calcula um ambiente completo
   */
  public static calculateEnvironment(input: EnvironmentDimensionInput): EnvironmentCalculationResult {
    const wallCount = input.wallCount ?? 1;
    const openingsDiscount = input.openingsDiscount ?? 0;
    const { grossArea, netArea } = this.calculateNetArea(input.width, input.height, openingsDiscount, wallCount);

    const coats = input.coatsCount ?? 2;
    const paint = this.calculatePaintConsumption(netArea, coats, input.finishType);
    paint.grossAreaM2 = grossArea;
    paint.openingsDiscountM2 = openingsDiscount;

    const laborCalc = this.calculateLaborRate(input.surfaceCondition, input.finishType, input.customLaborRate);
    const totalLaborCost = Number((netArea * laborCalc.finalRatePerM2).toFixed(2));

    // Materiais auxiliares (fita crepe, lixas, plástico, bandejas) ~ 12% da tinta
    const sundriesCost = Number((paint.estimatedPaintCost * 0.12).toFixed(2));
    const totalMaterialCost = Number((paint.estimatedPaintCost + sundriesCost).toFixed(2));

    const subtotal = Number((totalLaborCost + totalMaterialCost).toFixed(2));

    // Produtividade média de um pintor profissional: ~25 a 30m² de acabamento por dia útil
    const suggestedExecutionDays = Math.max(1, Math.ceil(netArea / 25));

    return {
      dimensions: {
        width: input.width,
        height: input.height,
        wallCount,
        grossAreaM2: grossArea,
        openingsDiscountM2: openingsDiscount,
        netAreaM2: netArea,
      },
      paint,
      labor: {
        baseRatePerM2: laborCalc.baseRate,
        conditionMultiplier: laborCalc.conditionMultiplier,
        finishMultiplier: laborCalc.finishSurcharge,
        finalRatePerM2: laborCalc.finalRatePerM2,
        totalLaborCost,
      },
      material: {
        paintCost: paint.estimatedPaintCost,
        sundriesCost,
        totalMaterialCost,
      },
      financialSummary: {
        subtotal,
        suggestedExecutionDays,
      },
    };
  }

  /**
   * Consolida múltiplos ambientes em um orçamento global com descontos
   */
  public static calculateFullEstimate(
    environments: EnvironmentDimensionInput[],
    discount: { type: 'PERCENTAGE' | 'FIXED'; value: number } = { type: 'PERCENTAGE', value: 0 }
  ): OverallProjectEstimate {
    const calculatedEnvs = environments.map((env) => this.calculateEnvironment(env));

    let totalNetAreaM2 = 0;
    let totalLitersNeeded = 0;
    let cans18L = 0;
    let gallons3_6L = 0;
    let quarts0_9L = 0;
    let totalLaborCost = 0;
    let totalMaterialCost = 0;
    let maxExecutionDays = 0;

    for (const env of calculatedEnvs) {
      totalNetAreaM2 += env.dimensions.netAreaM2;
      totalLitersNeeded += env.paint.totalLitersNeeded;
      cans18L += env.paint.containers.cans18L;
      gallons3_6L += env.paint.containers.gallons3_6L;
      quarts0_9L += env.paint.containers.quarts0_9L;
      totalLaborCost += env.labor.totalLaborCost;
      totalMaterialCost += env.material.totalMaterialCost;
      maxExecutionDays = Math.max(maxExecutionDays, env.financialSummary.suggestedExecutionDays);
    }

    // Dias consolidados levando em conta equipe e tempos de cura entre demãos
    const consolidatedDays = Math.max(1, Math.ceil(totalNetAreaM2 / 30) + 1);

    const grossTotal = Number((totalLaborCost + totalMaterialCost).toFixed(2));
    let discountValue = 0;

    if (discount.type === 'PERCENTAGE') {
      const percentage = Math.min(100, Math.max(0, discount.value || 0));
      discountValue = Number(((grossTotal * percentage) / 100).toFixed(2));
    } else {
      discountValue = Number(Math.min(grossTotal, Math.max(0, discount.value || 0)).toFixed(2));
    }

    const finalTotal = Number(Math.max(0, grossTotal - discountValue).toFixed(2));

    return {
      environments: calculatedEnvs,
      totals: {
        totalNetAreaM2: Number(totalNetAreaM2.toFixed(2)),
        totalLitersNeeded: Number(totalLitersNeeded.toFixed(2)),
        totalContainers: {
          cans18L,
          gallons3_6L,
          quarts0_9L,
        },
        totalLaborCost: Number(totalLaborCost.toFixed(2)),
        totalMaterialCost: Number(totalMaterialCost.toFixed(2)),
        grossTotal,
        discountValue,
        finalTotal,
        estimatedExecutionDays: consolidatedDays,
      },
    };
  }
}
export default EstimationEngine;
