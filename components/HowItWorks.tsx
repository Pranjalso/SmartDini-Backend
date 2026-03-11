import { QrCode, ShoppingCart, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    description: "Customers scan the QR code on their table to access the digital menu instantly."
  },
  {
    icon: ShoppingCart,
    title: "Browse & Order",
    description: "Browse the interactive menu, customize orders, and add items to cart with ease."
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Complete payment through secure integrated payment gateways with multiple options."
  },
  {
    icon: Truck,
    title: "Order Ready",
    description: "Receive real-time updates and get notified when the order is ready for pickup or delivery."
  }
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="text-brand-red pl-1 pr-1"><span className="smartdiniFont">Smartdini</span></span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From scan to serve in seconds. Get started with Smartdini today.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative text-center group animate-on-scroll"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Step Number and Icon */}
                <div className="relative mb-6 mx-auto w-20 h-20">
                  {/* Red Circle */}
                  <div className="w-full h-full bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Green Number Badge - Partially overlapping */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">
                    {index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting Line - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-primary/30 -z-10 transform translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-on-scroll">
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">Join 25+ of cafes already using Smartdini</p>
            <button className="btn-success">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;