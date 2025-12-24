"use client";

import React, { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import MindMintApp from "@/components/MindMintApp";
import PricingModal from "@/components/PricingModal";

export default function Page() {
  const [showApp, setShowApp] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <main>
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
        </>
      ) : (
        <MindMintApp theme={theme} toggleTheme={toggleTheme} />
      )}
    </main>
  );
}