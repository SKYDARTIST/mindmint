"use client";

import React, { useState } from "react";
import LandingPage from "@/components/LandingPage";
import MindMintApp from "@/components/MindMintApp";

export default function Page() {
  const [showApp, setShowApp] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  React.useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  if (!showApp) {
    return (
      <LandingPage
        onStart={() => setShowApp(true)}
        onExample={() => setShowApp(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return <MindMintApp theme={theme} toggleTheme={toggleTheme} />;
}