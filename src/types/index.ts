import { SurfaceCondition, FinishType } from '../services/EstimationEngine';

export type UserRole = 'ADMIN' | 'MANAGER' | 'PAINTER';

export type EstimateStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED';

export type Language = 'pt' | 'en' | 'es';

export interface Company {
  id: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  defaultTerms: string;
  warrantyDays: number;
  currency: string;
  laborRatePerM2Base?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyId: string;
  twoFactorEnabled: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF ou CNPJ
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  companyId: string;
  createdAt: string;
}

export interface EnvironmentItem {
  id: string;
  name: string;
  width: number;
  height: number;
  wallCount: number;
  openingsDiscount: number;
  coatsCount: number;
  surfaceCondition: SurfaceCondition;
  finishType: FinishType;
  paintColorName: string;
  paintColorHex: string;
  paintBrand: string;
  netAreaM2: number;
  paintLitersNeeded: number;
  cans18L: number;
  gallons3_6L: number;
  quarts0_9L: number;
  laborCost: number;
  materialCost: number;
  subtotal: number;
  originalPhotoUrl?: string;
  simulatedPhotoUrl?: string;
  notes?: string;
}

export interface Estimate {
  id: string;
  code: string; // Ex: ORC-2026-001
  companyId: string;
  customerId: string;
  userId: string;
  title: string;
  status: EstimateStatus;
  notes?: string;
  
  // Financeiro
  totalLabor: number;
  totalMaterial: number;
  subtotal: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  finalTotal: number;

  // Prazos e Condições
  estimatedDays: number;
  validityDays: number;
  paymentTerms: string;
  scheduledStartDate?: string;

  // Assinatura e Auditoria
  signedAt?: string;
  signedByName?: string;
  signedByDocument?: string;
  signatureImage?: string; // Base64
  signatureIp?: string;
  signatureSha256?: string;
  signedPdfCloudUrl?: string;
  remindersSentCount: number;
  lastReminderSentAt?: string;

  environments: EnvironmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  estimateId?: string;
  userId?: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
  estimateId?: string;
}
