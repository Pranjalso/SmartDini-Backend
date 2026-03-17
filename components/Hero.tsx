"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroCafe from "@/assets/hero-cafe.jpg";
import Image from "next/image";

const Hero = () => {
  return (
    <section id="home" className="relative bg-brand-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 lg:pt-12 pb-12 md:pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6 animate-fade-in text-center lg:text-left">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl font-bold leading-[1.2]">
                Transform your{" "}
                <span className="text-brand-red font-bold">cafe</span>{" "}
                <br />
                with contactless{" "}
                <span className="text-brand-red font-bold">digital</span>{" "}
                <br />
                QR Scan menus
              </h1>
              <p className="text-base md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Smartdini is the future of cafe dining.With our contactless QR-based ordering and digital menu system,your customers can simply scan,browse, order, and pay—all from their smartphones.No long queues, no delays—just faster service, smoother operations,and happier customers.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 py-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary">30%</div>
                <div className="text-sm text-muted-foreground font-medium">Faster Orders</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary">50%</div>
                <div className="text-sm text-muted-foreground font-medium">Less Wait Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary">95%</div>
                <div className="text-sm text-muted-foreground font-medium">Customer Satisfaction</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto">
                Order Your Product
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 group w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start pt-4">
              <div className="text-sm text-muted-foreground">A product proudly built by Astex</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative">
              <div className="relative rounded-2xl shadow-2xl overflow-hidden w-full h-[350px] md:h-[500px] lg:h-[550px]">
                <Image
                  src={heroCafe}
                  alt="Modern cafe with QR ordering system"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg animate-float">
                <div className="text-2xl">📱</div>
                <div className="text-xs font-semibold text-center mt-1">QR Scan</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg animate-float" style={{animationDelay: '1s'}}>
                <div className="text-2xl">⚡</div>
                <div className="text-xs font-semibold text-center mt-1">Instant</div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -z-10 top-8 right-8 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-8 -left-8 w-60 h-60 bg-secondary/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;