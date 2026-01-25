import React, { useState } from 'react';
import { useSubscription } from '@/lib/hooks/useSubscription';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromDemo?: boolean; // New prop to show demo context
}

const Icons = {
  Check: () => <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Close: () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Bolt: () => <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Star: () => <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
};

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, fromDemo = false }) => {
  const { user, plan: currentPlan, isPro: isUserPro, refresh } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly'); // Default to yearly for better value
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
      limit: "3 GENERATIONS PER DAY",
      desc: "Great for trying MindMint. Upgrade anytime for unlimited access.",
      features: [
        "3 AI generations daily",
        "Mindmaps, Flashcards, Quizzes & Summaries",
        "Save to \"My Notes\" forever",
        "600 words per input (~1 page)",
        "❌ No PDF/PNG export",
        "❌ No Infographics"
      ],
      buttonText: "Continue with Free",
      buttonSubtext: "No credit card needed",
      isPro: false
    },
    {
      name: "Pro Plan",
      price: billingCycle === 'monthly' ? "$4.99" : "$29.99",
      period: billingCycle === 'monthly' ? "/mo" : "/yr",
      limit: "UNLIMITED GENERATIONS",
      desc: "For serious students who want unlimited generations and exports.",
      features: [
        "Unlimited AI generations",
        "All features including Infographics",
        "Export to PDF & PNG (print/share)",
        "2500 words per input (~5 pages)",
        "No cooldown (instant generation)",
        "Priority support"
      ],
      buttonText: billingCycle === 'monthly' ? "Start Pro - $4.99/mo" : "Start Pro - $29.99/yr",
      buttonSubtext: "Cancel anytime",
      isPro: true,
      savings: billingCycle === 'yearly' ? "Save $30/year" : null
    }
  ];

  const MONTHLY_PRODUCT_ID = "pdt_0NV8a4IqQFGo6Q4AISD9O";
  const YEARLY_PRODUCT_ID = "pdt_0NV8aLYObcvP8DlfvROuY";
  const BASE_CHECKOUT_URL = "https://checkout.dodopayments.com/buy/";

  const handleUpgrade = () => {
    const productId = billingCycle === 'monthly' ? MONTHLY_PRODUCT_ID : YEARLY_PRODUCT_ID;
    const isTestProduct = productId.startsWith("pdt_0NVC");
    const checkoutBase = isTestProduct
      ? "https://test.checkout.dodopayments.com/buy/"
      : "https://checkout.dodopayments.com/buy/";
    const redirectUrl = encodeURIComponent(`${window.location.origin}/payment/success`);
    let paymentLink = `${checkoutBase}${productId}?quantity=1&redirect_url=${redirectUrl}`;
    if (user?.uid) {
      paymentLink += `&metadata_user_id=${user.uid}`;
    }
    window.location.href = paymentLink;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4 animate-in-fade" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#18181B] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in-zoom"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 md:p-12">
          {/* Demo Context Banner */}
          {fromDemo && (
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6 animate-in fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    You just tried Mindmap & Summary!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign up free to unlock Flashcards & Quizzes, or go Pro for unlimited everything
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Choose Your Plan</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Unlock your full study potential</p>
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

          {/* Social Proof */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-full">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white dark:border-gray-900" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white dark:border-gray-900" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 border-2 border-white dark:border-gray-900" />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Students are studying smarter with MindMint
              </span>
            </div>
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
                <span className="absolute -top-3 -right-6 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-lg shadow-amber-500/20">Save 50%</span>
              </button>
              <div
                className={`absolute inset-y-1 bg-white dark:bg-[#27272A] rounded-xl shadow-sm transition-all duration-300 ease-spring ${billingCycle === 'monthly' ? 'left-1 w-[48%]' : 'left-[51%] w-[48%]'}`}
              />
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
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

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="mt-0.5">{feature.startsWith('❌') ? '' : <Icons.Check />}</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.savings && billingCycle === 'yearly' && (
                  <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">
                        {plan.savings}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-500 font-bold">
                        6 months FREE!
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { if (plan.isPro && !isUserPro) handleUpgrade(); }}
                  disabled={(!plan.isPro && !isUserPro) || (plan.isPro && isUserPro)}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center gap-1 ${plan.isPro
                    ? (isUserPro ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/20 active:scale-[0.98]')
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-default'}`}
                >
                  <span className="flex items-center gap-2">
                    {plan.isPro && !isUserPro && <Icons.Bolt />}
                    {plan.isPro ? (isUserPro ? "Current Plan" : plan.buttonText) : plan.buttonText}
                  </span>
                  <span className="text-xs opacity-75 font-medium">{plan.buttonSubtext}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-12 overflow-x-auto">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">Feature Comparison</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-500">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-gray-500">Free</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-indigo-500">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Generations per day", free: "3", pro: "Unlimited" },
                  { feature: "Word limit per input", free: "600", pro: "2500" },
                  { feature: "Export to PDF/PNG", free: "❌", pro: "✅" },
                  { feature: "Infographics", free: "❌", pro: "✅" },
                  { feature: "Save to My Notes", free: "✅", pro: "✅" },
                  { feature: "Generation cooldown", free: "30 sec", pro: "None" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{row.free}</td>
                    <td className="text-center py-4 px-4 text-sm font-bold text-indigo-500">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col items-center gap-4">
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

      {/* Mobile Sticky CTA */}
      {!isUserPro && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 animate-in slide-in-from-bottom">
          <button
            onClick={handleUpgrade}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Icons.Bolt />
            Get Pro - {billingCycle === 'monthly' ? '$4.99/mo' : '$29.99/yr'} →
          </button>
        </div>
      )}
    </div>
  );
};

export default PricingModal;