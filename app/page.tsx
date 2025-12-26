"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import MindMintApp from "@/components/MindMintApp";
import PricingModal from "@/components/PricingModal";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase/client";

function PageContent({ theme, setTheme, showPricingModal, setShowPricingModal, toggleTheme }: any) {
  const [showApp, setShowApp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setShowApp(true);
      } else if (searchParams.get('showAuth') === 'true') {
        setShowAuthModal(true);
      }
      setLoading(false);
    };
    checkUser();
  }, [searchParams]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
            onUpgrade={() => {
              setShowApp(true);
              setShowPricingModal(false);
            }}
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
          setTheme={setTheme}
          showPricingModal={showPricingModal}
          setShowPricingModal={setShowPricingModal}
          toggleTheme={toggleTheme}
        />
      </Suspense>
    </main>
  );
}