export type SubscriptionPlan = 'Free' | 'Pro' | 'Enterprise';

export interface CreditWallet {
  credits: number;
  monthlyLimit: number;
}

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  renewalDate?: string;
  wallet: CreditWallet;
}
