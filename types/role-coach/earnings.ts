export type EarningsStatus =
  | "paid"
  | "pending"
  | "failed"
  | "refunded";

export interface EarningsClient {
  id: string | null;
  name: string;
  email: string | null;
}

export interface EarningsServiceInfo {
  id: string | null;
  name: string | null;
  sessionType: string | null;
}

export interface CoachEarning {
  id: string;
  sessionId: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  client: EarningsClient;
  service: EarningsServiceInfo;
  amount: number;
  platformFee: number;
  netPayout: number;
  currency: string;
  status: EarningsStatus;
  stripePaymentIntentId: string | null;
  paidAt: string | null;
}

export interface CoachEarningsSummary {
  totalEarned: number;
  pendingPayout: number;
  totalSessions: number;
  paidSessions: number;
  pendingSessions: number;
  currency: string;
}

export interface MonthlyEarning {
  month: string;
  totalEarned: number;
  platformFee: number;
  sessionCount: number;
}

export interface CoachPayoutInfo {
  stripeConnected: boolean;
  stripeAccountId: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}