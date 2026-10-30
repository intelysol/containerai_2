import React, { useState } from 'react';
import { useCreditStore } from '../store/useCreditStore';
import { CreditPackage } from '../types';
import { StripePaymentModal } from '../components/StripePaymentModal';
import { 
  Coins, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Clock,
  Building2,
  RefreshCw
} from 'lucide-react';

export const CreditWalletScreen: React.FC = () => {
  const { 
    packages, 
    transactions, 
    availableCredits, 
    reservedCredits, 
    totalPurchased, 
    totalConsumed, 
    lastSynchronized 
  } = useCreditStore();

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Wallet Balance Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#142B45] via-[#203F5F] to-[#12A89D]/40 text-white shadow-md">
        <div className="flex items-center justify-between text-xs text-teal-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <Coins size={16} className="text-[#12A89D]" />
            <span>Operational Survey Wallet</span>
          </div>
          <span className="font-mono-nums text-[11px] text-slate-300">
            Synced: {lastSynchronized}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-300 font-medium">
            Available Inspection Credits
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono-nums tracking-tight mt-0.5">
            {availableCredits} <span className="text-lg font-normal text-teal-200">credits</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
          <div>
            <div className="text-[10px] text-slate-300 uppercase font-medium">Reserved</div>
            <div className="font-mono-nums font-bold text-amber-300 text-sm">{reservedCredits}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-300 uppercase font-medium">Total Consumed</div>
            <div className="font-mono-nums font-bold text-white text-sm">{totalConsumed}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-300 uppercase font-medium">Total Purchased</div>
            <div className="font-mono-nums font-bold text-white text-sm">{totalPurchased}</div>
          </div>
        </div>
      </div>

      {/* Credit Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#142B45]">
              Purchase Inspection Credit Packages
            </h3>
            <p className="text-xs text-slate-500">
              Tier pricing for independent surveyors and high-volume container depots.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-4 rounded-2xl border bg-white shadow-2xs relative flex flex-col justify-between transition ${
                pkg.popular
                  ? 'border-[#12A89D] ring-2 ring-[#12A89D]/20'
                  : 'border-[#E5EAF0] hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-[#142B45]">{pkg.name}</span>
                  {pkg.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#12A89D] border border-teal-200">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-extrabold font-mono-nums text-[#142B45]">
                    ${pkg.priceUSD}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-nums">
                    (${(pkg.unitPriceUSD).toFixed(2)} / survey)
                  </span>
                </div>

                <div className="font-mono-nums font-semibold text-xs text-[#12A89D] mt-1">
                  {pkg.credits} Full Inspections Included
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-[#12A89D] hover:bg-[#0E8C83] text-white shadow-xs'
                      : 'bg-[#142B45] hover:bg-[#203F5F] text-white'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>Purchase with Stripe</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Transaction History
            </h4>
            <p className="text-[11px] text-slate-400">
              Audit log of all inspection consumptions, credit reservations and Stripe payments.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['ALL', 'PURCHASE', 'INSPECTION_CONSUMPTION', 'RESERVATION'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-[11px] ${
                  filterType === t
                    ? 'bg-[#142B45] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Transactions' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Rows */}
        <div className="divide-y divide-slate-100">
          {filteredTxs.map((tx) => {
            const isCreditIn = tx.amount > 0;
            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCreditIn ? 'bg-emerald-50 text-[#198754]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isCreditIn ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{tx.description}</div>
                    <div className="text-[11px] text-slate-400 font-mono-nums flex items-center gap-2 mt-0.5">
                      <span>{tx.reference}</span>
                      <span>·</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-mono-nums font-bold text-sm ${
                    isCreditIn ? 'text-[#198754]' : 'text-slate-800'
                  }`}>
                    {isCreditIn ? `+${tx.amount}` : tx.amount} cr
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">
                    {tx.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        selectedPackage={selectedPackage}
      />
    </div>
  );
};
