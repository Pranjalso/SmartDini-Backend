"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Benefits from "@/components/Benefits";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimations from "@/components/ScrollAnimations";

export default function HomeClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [pathname, searchParams]);

  return (
    <div className="min-h-screen">
      <ScrollAnimations />
      <Header />
      <main>
        <div id="home"><Hero /></div>
        <div id="how-it-works"><HowItWorks /></div>
        <div id="features"><Features /></div>
        <div id="benefits"><Benefits /></div>
        <div id="pricing"><Pricing /></div>
        <div id="testimonials"><Testimonials /></div>
        <div id="contact"><Contact /></div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
