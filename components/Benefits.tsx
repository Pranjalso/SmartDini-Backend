"use client";

import {
  Zap,
  Users,
  TrendingUp,
  Globe,
  ContactRound,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Faster Ordering",
    description: "QR scan reduces wait time by 30% and eliminates order errors",
    stat: "30% faster",
  },
  {
    icon: Users,
    title: "Staff Efficiency",
    description:
      "Reduce manual order taking and focus staff on food preparation and service",
    stat: "50% less workload",
  },
  {
    icon: TrendingUp,
    title: "Real-time Tracking",
    description:
      "Monitor orders, inventory, and customer preferences with live analytics",
    stat: "Live insights",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Serve international customers with automatic language detection and translation",
    stat: "15+ languages",
  },
  {
    icon: ContactRound,
    title: "Contactless Experience",
    description:
      "Safe, hygienic ordering process that customers prefer post-pandemic",
    stat: "100% contactless",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Enterprise-grade security with PCI compliance and fraud protection",
    stat: "Bank-level security",
  },
];

export default function Benefits() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Transform Your{" "}
            <span className="text-brand-red font-bold">Cafe Experience</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Smartdini delivers measurable improvements to your operations,
            customer satisfaction, and bottom line.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div key={index} className="group feature-card">
                <div className="relative">
                  <div className="w-16 h-16 bg-brand-red rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="absolute -top-2 -right-2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {benefit.stat}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
