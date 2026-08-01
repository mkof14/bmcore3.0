import { X, Shield, Calendar, Lock } from 'lucide-react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: {
    name: string;
    price: number;
    billingPeriod: 'monthly' | 'yearly';
    categories: string;
    features: string[];
  };
  isProcessing: boolean;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isProcessing
}: PaymentConfirmationModalProps) {
  if (!isOpen) return null;

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 5);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[var(--bm-surface)] to-[var(--bm-page)] rounded-2xl max-w-2xl w-full border border-gray-800 my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Confirm Your Subscription</h2>
            <p className="text-gray-400 text-sm mt-1">Review your plan details before completing payment</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{plan.name} Plan</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.categories}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">${plan.price}</div>
                <div className="text-gray-400 text-sm">/{plan.billingPeriod === 'monthly' ? 'month' : 'year'}</div>
              </div>
            </div>

            <div className="space-y-2">
              {plan.features.slice(0, 5).map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-1">●</span>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
              {plan.features.length > 5 && (
                <div className="text-sm text-gray-400 italic">
                  + {plan.features.length - 5} more features
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-semibold mb-1">5-Day Free Trial</h4>
                <p className="text-gray-300 text-sm">
                  Your trial starts today and ends on{' '}
                  <span className="font-semibold text-white">
                    {trialEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  . You can cancel anytime during the trial without being charged.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-semibold">${plan.price}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <span className="text-gray-400">Trial Period (5 days)</span>
              <span className="text-green-500 font-semibold">Free</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-white font-semibold text-lg">Due Today</span>
              <span className="text-white font-bold text-2xl">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-3 bg-gray-800/50 rounded-lg px-4">
              <span className="text-gray-400">First Payment After Trial</span>
              <span className="text-white font-semibold">${plan.price}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Secure Payment</p>
              <p>
                Your payment information is encrypted and secure. We comply with PCI-DSS standards and never store your full card details.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-400">
            <p>
              By confirming, you agree to our Terms of Service and Privacy Policy. Your subscription will automatically renew at the end of each billing period unless you cancel.
            </p>
          </div>
        </div>

        <div className="p-6 bg-gray-900 border-t border-gray-800 flex items-center justify-between gap-4 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 rounded-lg font-semibold transition-all bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Confirm & Start Trial
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
