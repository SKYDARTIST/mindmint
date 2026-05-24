"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { isPublicDemoMode } from "@/lib/publicDemoMode";

const LandingPage = dynamic(() => import("@/components/LandingPage"), {
  loading: () => <LoadingSpinner />
});
const MindMintApp = dynamic(() => import("@/components/MindMintApp"), {
  loading: () => <LoadingSpinner />
});
const AuthModal = dynamic(() => import("@/components/AuthModal"));

const DEMO_MODE = isPublicDemoMode();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);
import { useSubscription } from "@/lib/hooks/useSubscription";

interface PageContentProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function PageContent({ theme, toggleTheme }: PageContentProps) {
  const [showApp, setShowApp] = useState(false);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const searchParams = useSearchParams();

  const { user, isLoading: subLoading } = useSubscription();

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }
    setLoading(subLoading);
  }, [subLoading]);

  useEffect(() => {
    if (DEMO_MODE) return;
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
            onStart={() => {
              if (DEMO_MODE || user) {
                setShowApp(true);
              } else {
                setShowAuthModal(true);
              }
            }}
            demoMode={DEMO_MODE}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          {!DEMO_MODE && (
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
          )}
        </>
      ) : (
        <MindMintApp theme={theme} toggleTheme={toggleTheme} />
      )}
    </>
  );
}

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
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
          toggleTheme={toggleTheme}
        />
      </Suspense>
    </main>
  );
}
