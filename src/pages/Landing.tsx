


import { useState, useEffect } from "react";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";


export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [menuOpen]);

  return (
    <div
      className={`min-h-screen grain-text text-foreground flex flex-col md:flex-row relative font-sans ${
        menuOpen ? "overflow-hidden h-dvh" : "overflow-x-hidden"
      }`}
    >
      
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${'/NEWBG.jpg'})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 3/4 Main Content Area */}
      <main className="w-full md:w-3/4 flex flex-col px-8 md:px-16 py-10 h-dvh overflow-y-auto">
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <Hero />
        <Footer />
      </main>

      
    </div>
  );
}
