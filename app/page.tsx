"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import MindMintApp from "@/components/MindMintApp";
import PricingModal from "@/components/PricingModal";
import AuthModal from "@/components/AuthModal";
import { useSubscription } from "@/lib/hooks/useSubscription";

interface PageContentProps {
  theme: "light" | "dark";
  showPricingModal: boolean;
  setShowPricingModal: (show: boolean) => void;
  toggleTheme: () => void;
}

function PageContent({ theme, showPricingModal, setShowPricingModal, toggleTheme }: PageContentProps) {
  const [showApp, setShowApp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();

  const { user, isLoading: subLoading } = useSubscription();

  useEffect(() => {
    setLoading(subLoading);
  }, [subLoading]);

  useEffect(() => {
    if (user) {
      setShowApp(true);
      setShowAuthModal(false);
    } else {
      setShowApp(false);
      if (searchParams.get('showAuth') === 'true') {
        setShowAuthModal(true);
      }
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowSlowMessage(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowSlowMessage(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        {showSlowMessage && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-white/60 text-sm">Loading taking longer than usual...</p>
            <button
              onClick={() => window.location.reload()}
              className="text-white text-xs underline mt-2 hover:text-white/80"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {!showApp ? (
        <>
          <LandingPage
            onStart={() => setShowApp(true)}
            onExample={() => setShowPricingModal(true)}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <PricingModal
            isOpen={showPricingModal}
            onClose={() => setShowPricingModal(false)}
          />
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
      ) : (
        <MindMintApp theme={theme} toggleTheme={toggleTheme} />
      )}
    </>
  );
}

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showPricingModal, setShowPricingModal] = useState(false);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <main>
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }>
        <PageContent
          theme={theme}
          showPricingModal={showPricingModal}
          setShowPricingModal={setShowPricingModal}
          toggleTheme={toggleTheme}
        />
      </Suspense>
    </main>
  );
}