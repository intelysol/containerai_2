import React, { useState } from 'react';
import { CreditPackage } from '../types';
import { useCreditStore } from '../store/useCreditStore';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: CreditPackage | null;
}

export const StripePaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedPackage,
}) => {
  const { purchasePackage } = useCreditStore();
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('883');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [txRef, setTxRef] = useState('');

  if (!isOpen || !selectedPackage) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      const result = await purchasePackage(selectedPackage.id);
      setIsProcessing(false);
      if (result.success) {
        setTxRef(result.txId);
        setIsComplete(true);
      }
    }, 1200);
  };

  const handleClose = () => {
    setIsComplete(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#142B45] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#12A89D]" />
            <h3 className="font-bold text-sm tracking-tight text-white">
              Stripe Checkout — Inspection Credits
            </h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs space-y-4">
          {isComplete ? (
            /* Success confirmation */
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-[#198754] rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Payment Authorized & Fulfilled
              </h4>
              <p className="text-slate-600 max-w-xs mx-auto">
                Successfully credited <strong className="text-slate-900 font-mono-nums font-bold">{selectedPackage.credits} inspection credits</strong> to your active organization account.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-nums text-[11px] text-slate-600">
                Transaction ID: {txRef}
              </div>
              <button
                onClick={handleClose}
                className="w-full mt-4 py-2.5 bg-[#142B45] text-white rounded-lg font-semibold hover:bg-[#203F5F] transition"
              >
                Return to Wallet
              </button>
            </div>
          ) : (
            /* Stripe payment input form */
            <>
              {/* Order summary box */}
              <div className="bg-[#F5F7FA] p-3.5 rounded-xl border border-[#E5EAF0] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#142B45]">{selectedPackage.name}</div>
                  <div className="text-slate-500 text-[11px] font-mono-nums">
                    {selectedPackage.credits} Credits · ${(selectedPackage.unitPriceUSD).toFixed(2)}/credit
                  </div>
                </div>
                <div className="text-right font-mono-nums">
                  <div className="text-lg font-bold text-[#142B45]">
                    ${selectedPackage.priceUSD}
                  </div>
                  <div className="text-[10px] text-slate-400">USD</div>
                </div>
              </div>

              {/* Card inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full font-mono-nums p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#142B45]"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                      <Lock size={14} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full font-mono-nums p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#142B45]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full font-mono-nums p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#142B45]"
                    />
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg text-slate-500 text-[11px]">
                <ShieldCheck size={16} className="text-[#12A89D] shrink-0" />
                <span>
                  Encrypted Stripe 256-bit TLS connection. Credits synchronize immediately upon gateway settlement.
                </span>
              </div>

              {/* Action buttons */}
              <div className="pt-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[#142B45] text-white rounded-lg font-semibold hover:bg-[#203F5F] transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Confirming with Stripe...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ${selectedPackage.priceUSD} USD</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
