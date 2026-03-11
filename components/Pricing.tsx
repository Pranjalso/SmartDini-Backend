import { Check, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Basic Plan",
    price: "$29",
    period: "/month",
    description: "Perfect for small cafes getting started",
    features: [
      "Digital Menu Page",
      "QR Code Generation", 
      "Basic Order Management",
      "Payment Processing",
      "Admin Dashboard",
      "Email Support",
      "Basic Analytics"
    ],
    limitations: [
      "Smartdini Watermark",
      "Basic customization only",
      "Standard support"
    ],
    popular: false,
    cta: "Start Basic Plan"
  },
  {
    name: "Premium Plan",
    price: "$79",
    period: "/month",
    description: "Complete solution with your branding",
    features: [
      "Everything in Basic",
      "Custom Branding (No Watermark)",
      "AI Health Analysis",
      "Pre-order System",
      "Multi-language Menus",
      "Advanced Analytics",
      "Customer Insights",
      "Priority Support",
      "Custom Integrations",
      "Staff Training"
    ],
    limitations: [],
    popular: true,
    cta: "Go Premium"
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    period: "",
    description: "For restaurant chains and large establishments",
    features: [
      "Everything in Premium",
      "Multi-location Management",
      "Dedicated Account Manager",
      "Custom Development",
      "API Access",
      "White-label Solution",
      "Advanced Security",
      "24/7 Priority Support",
      "Onboarding Assistance",
      "Custom Hardware Integration"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales",
    custom: true
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, <span className="text-brand-red font-bold">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your restaurant needs. Start with basics or scale to enterprise solutions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 md:gap-6 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 animate-on-scroll ${
                plan.popular
                  ? "border-primary bg-white shadow-2xl lg:scale-105"
                  : "border-border bg-white shadow-lg hover:shadow-xl"
              } ${plan.custom ? "lg:mt-4" : ""}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-6 py-2 rounded-full flex items-center space-x-2 shadow-lg">
                    <Crown className="h-4 w-4" />
                    <span className="font-semibold text-sm">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-lg text-muted-foreground ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-lg flex items-center">
                  <Star className="h-5 w-5 text-secondary mr-2" />
                  Included Features
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="font-medium text-muted-foreground mb-2">Limitations:</h5>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-center text-sm text-muted-foreground">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full mr-3"></div>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-3 text-base font-semibold ${
                  plan.popular
                    ? "btn-hero"
                    : plan.custom 
                    ? "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                }`}
                variant={plan.popular ? "default" : plan.custom ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center text-muted-foreground animate-on-scroll">
          <p>All plans include setup assistance and access to our knowledge base.</p>
          <p className="mt-2">
            Need a custom solution?{" "}
            <Link href="#contact" className="text-primary hover:underline">
              Contact our team
            </Link>{" "}
            for enterprise options.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;