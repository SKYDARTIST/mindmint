import React, { useState } from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Icons = {
  Check: () => <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Close: () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Bolt: () => <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
};

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { user, plan: currentPlan, isPro: isUserPro, refresh } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refresh) {
      setIsRefreshing(true);
      try {
        await refresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  if (!isOpen) return null;

  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      limit: "3 generations per day",
      desc: "Perfect for casual learners and quick study sessions.",
      features: [
        "3 generations per day",
        "Up to 600 words per input",
        "Standard templates",
        "Light & Dark mode"
      ],
      buttonText: "Current Plan",
      isPro: false
    },
    {
      name: "Pro Plan",
      price: billingCycle === 'monthly' ? "$4.99" : "$29.99",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      limit: "Unlimited generations",
      desc: "Maximum productivity for power users and students.",
      features: [
        "Unlimited generations",
        "Up to 2500 words per input",
        "Advanced infographics",
        "High-fidelity PDF/PNG exports",
        "Exclusive premium layouts",
        "Priority AI generation"
      ],
      buttonText: "Upgrade to Pro",
      isPro: true
    }
  ];

  // Dodo Payments Checkout Links (Product IDs only)
  const MONTHLY_PRODUCT_ID = "pdt_0NVCGUqA58DkDL5nDjIuH"; // Test product
  const YEARLY_PRODUCT_ID = "pdt_0NV8aLYObcvP8DlfvROuY"; // Live product
  const BASE_CHECKOUT_URL = "https://test.checkout.dodopayments.com/buy/"; // Using test subdomain for monthly test

  const handleUpgrade = () => {
    const productId = billingCycle === 'monthly' ? MONTHLY_PRODUCT_ID : YEARLY_PRODUCT_ID;
    const isTestProduct = productId === MONTHLY_PRODUCT_ID;
    const checkoutBase = isTestProduct
      ? "https://test.checkout.dodopayments.com/buy/"
      : "https://checkout.dodopayments.com/buy/";

    // Build redirect URL dynamically based on current origin
    const redirectUrl = encodeURIComponent(`${window.location.origin}/payment/success`);

    let paymentLink = `${checkoutBase}${productId}?quantity=1&redirect_url=${redirectUrl}`;

    // Inject Supabase User ID as metadata if available
    if (user?.id) {
      // Dodo Payments requires metadata_ prefix for static payment links
      // We include both user_id and supabase_user_id for maximum compatibility
      paymentLink += `&metadata_user_id=${user.id}&metadata_supabase_user_id=${user.id}`;
    }

    window.location.href = paymentLink;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4 animate-in-fade" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#18181B] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in-zoom"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 md:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Simple, Factual Pricing.</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Choose the plan that fits your study needs.</p>
              {user?.email && (
                <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-white/5 w-fit rounded-lg border border-gray-200 dark:border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logged in as:</span>
                  <span className="text-[10px] font-black text-gray-900 dark:text-white truncate max-w-[150px]">{user.email}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <Icons.Close />
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 dark:bg-[#202023] p-1 rounded-2xl flex relative">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white shadow-xl shadow-amber-500/10' : 'text-gray-500'}`}
              >
                Yearly
                <span className="absolute -top-3 -right-6 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-lg shadow-amber-500/20">Best Value</span>
              </button>
              <div
                className={`absolute inset-y-1 bg-white dark:bg-[#27272A] rounded-xl shadow-sm transition-all duration-300 ease-spring ${billingCycle === 'monthly' ? 'left-1 w-[48%]' : 'left-[51%] w-[48%]'}`}
              />
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl border transition-all ${plan.isPro
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-xl dark:shadow-indigo-500/5'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1C1C1F]'}`}
              >
                {plan.isPro && (
                  <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/30">
                    Recommended
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 dark:text-gray-400 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-indigo-500 font-bold mt-2 uppercase tracking-widest">{plan.limit}</p>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium leading-relaxed">
                  {plan.desc}
                </p>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icons.Check />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => { if (plan.isPro && !isUserPro) handleUpgrade(); }}
                  disabled={(!plan.isPro && !isUserPro) || (plan.isPro && isUserPro)}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${plan.isPro
                    ? (isUserPro ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/20 active:scale-[0.98]')
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-default'}`}
                >
                  {plan.isPro && !isUserPro && <Icons.Bolt />}
                  {plan.isPro ? (isUserPro ? "Current Plan" : plan.buttonText) : "Current Plan"}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
            <p className="text-center text-xs text-gray-400 font-medium">
              Already paid but still seeing Free? Try refreshing your account.
            </p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-8 py-3 rounded-2xl bg-indigo-500/10 text-indigo-500 text-sm font-black transition-all flex items-center gap-2 group ${isRefreshing ? 'opacity-50 cursor-default' : 'hover:bg-indigo-500/20 active:scale-95'}`}
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Subscription Status
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 font-medium">
              No long-term commitment. Cancel anytime. Secure payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;