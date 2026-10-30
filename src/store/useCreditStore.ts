import { create } from 'zustand';
import { CreditPackage, CreditTransaction } from '../types';
import { INITIAL_CREDIT_PACKAGES, INITIAL_TRANSACTIONS } from '../services/mockData';

interface CreditState {
  packages: CreditPackage[];
  transactions: CreditTransaction[];
  availableCredits: number;
  reservedCredits: number;
  totalPurchased: number;
  totalConsumed: number;
  lastSynchronized: string;
  reserveCredit: (amount: number, reference: string) => boolean;
  consumeReservedCredit: (amount: number, reference: string) => void;
  releaseReservedCredit: (amount: number) => void;
  purchasePackage: (packageId: string) => Promise<{ success: boolean; txId: string }>;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  packages: INITIAL_CREDIT_PACKAGES,
  transactions: INITIAL_TRANSACTIONS,
  availableCredits: 42,
  reservedCredits: 2,
  totalPurchased: 250,
  totalConsumed: 206,
  lastSynchronized: '2026-10-29 18:40',

  reserveCredit: (amount: number, reference: string) => {
    const { availableCredits, reservedCredits, transactions } = get();
    if (availableCredits < amount) return false;

    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: -amount,
      type: 'RESERVATION',
      reference,
      status: 'COMPLETED',
      description: `Reserved credit for container inspection (${reference})`,
    };

    set({
      availableCredits: availableCredits - amount,
      reservedCredits: reservedCredits + amount,
      transactions: [newTx, ...transactions],
    });
    return true;
  },

  consumeReservedCredit: (amount: number, reference: string) => {
    const { reservedCredits, totalConsumed, transactions } = get();
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: -amount,
      type: 'INSPECTION_CONSUMPTION',
      reference,
      status: 'COMPLETED',
      description: `Consumed credit for submitted inspection (${reference})`,
    };

    set({
      reservedCredits: Math.max(0, reservedCredits - amount),
      totalConsumed: totalConsumed + amount,
      transactions: [newTx, ...transactions],
    });
  },

  releaseReservedCredit: (amount: number) => {
    const { availableCredits, reservedCredits } = get();
    set({
      availableCredits: availableCredits + amount,
      reservedCredits: Math.max(0, reservedCredits - amount),
    });
  },

  purchasePackage: async (packageId: string) => {
    const pkg = get().packages.find((p) => p.id === packageId);
    if (!pkg) return { success: false, txId: '' };

    // Simulate instant credit replenishment
    const txId = `STRIPE_CH_${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: pkg.credits,
      type: 'PURCHASE',
      reference: txId,
      status: 'COMPLETED',
      description: `Purchased ${pkg.name} (${pkg.credits} credits) via Stripe Checkout`,
    };

    set((state) => ({
      availableCredits: state.availableCredits + pkg.credits,
      totalPurchased: state.totalPurchased + pkg.credits,
      transactions: [newTx, ...state.transactions],
      lastSynchronized: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));

    return { success: true, txId };
  },
}));
