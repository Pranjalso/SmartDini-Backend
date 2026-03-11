import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import qrScanning from "@/assets/qr-scanning.jpg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cafe: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Request Sent Successfully!",
      description: "We'll contact you within 24 hours to schedule your demo.",
    });
    
    // Reset form
    setFormData({ name: "", email: "", cafe: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="text-brand-red font-bold">Transform</span> Your Cafe?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with us to schedule a personalized demo and see how Smartdini can revolutionize your operations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form */}
          <div className="animate-on-scroll">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
              <h3 className="text-2xl font-semibold mb-6">Request a Demo</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cafe" className="block text-sm font-medium text-foreground mb-2">
                    Cafe/Restaurant Name
                  </label>
                  <Input
                    id="cafe"
                    name="cafe"
                    type="text"
                    value={formData.cafe}
                    onChange={handleChange}
                    placeholder="Your business name"
                    className="border-border focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your needs
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your current setup, number of tables, main challenges, or any specific requirements..."
                    className="border-border focus:border-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-hero group"
                >
                  <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  Send Request
                </Button>
              </form>

              {/* Quick benefits */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-semibold mb-4">What happens next?</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">1</div>
                    <span>We'll contact you within 24 hours</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">2</div>
                    <span>Schedule a personalized 30-minute demo</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">3</div>
                    <span>Get a custom quote based on your needs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info & Image */}
          <div className="space-y-8 animate-on-scroll" style={{animationDelay: "0.2s"}}>
            {/* Contact Details */}
            <div className="bg-white rounded-2xl px-8 py-5 shadow-lg border border-border">
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Us</h4>
                    <p className="text-muted-foreground">smartdini.contact@gmail.com</p>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Call Us</h4>
                    <p className="text-muted-foreground">+91 90983-43508</p>
                    <p className="text-sm text-muted-foreground">Mon-Sat, 9 AM - 9 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Support</h4>
                    <p className="text-muted-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Average demo scheduling time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="relative">
              <div className="relative rounded-2xl shadow-lg overflow-hidden w-full h-[300px]">
                <Image
                  src={qrScanning}
                  alt="QR code scanning demonstration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h4 className="text-lg font-semibold mb-1">See It in Action</h4>
                <p className="text-sm opacity-90">Live demo available 24/7</p>
              </div>
              <div className="absolute top-6 right-6">
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                  Try Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-on-scroll">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border max-w-7xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Today?</h3>
            <p className="text-muted-foreground mb-6">
              Join over 50 cafes worldwide who have transformed their operations with Smartdini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-hero py-2 px-4 text-sm">
                Get Started Now
              </button>
              <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;