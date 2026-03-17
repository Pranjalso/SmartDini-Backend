"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Send, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import qrScanning from "@/assets/qr-scanning.jpg";

const contactSchema = z.object({
  contactNo: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  cafeLocation: z.string().min(3, "Cafe location must be at least 3 characters"),
  cafeCity: z.string().min(3, "Cafe city must be at least 3 characters"),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    contactNo: "",
    email: "",
    cafeLocation: "",
    cafeCity: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmittedRecently, setHasSubmittedRecently] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const lastSubmission = localStorage.getItem("lastContactSubmission");
    if (lastSubmission) {
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(lastSubmission) < twentyFourHours) {
        setHasSubmittedRecently(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast({
        title: "Request Sent Successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form and set submission flag - FIXED: Use correct field names
      setFormData({ 
        contactNo: "", 
        email: "", 
        cafeLocation: "", 
        cafeCity: "" 
      });
      localStorage.setItem("lastContactSubmission", Date.now().toString());
      setHasSubmittedRecently(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
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
              <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>
              
              {hasSubmittedRecently && (
                <div className="bg-blue-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
                  <div className="flex">
                    <div className="py-1"><Info className="h-5 w-5 mr-3"/></div>
                    <div>
                      <p className="font-bold">Your request has been sent</p>
                      <p className="text-sm">Thank you for your interest! We have received your message and will get back to you shortly.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactNo" className="block text-sm font-medium text-foreground mb-2">
                      Contact No. *
                    </label>
                    <Input
                      id="contactNo"
                      name="contactNo"
                      type="text"
                      required
                      value={formData.contactNo}
                      onChange={handleChange}
                      placeholder="Your contact number"
                      className={`border-border focus:border-primary ${errors?.issues.find(e => e.path[0] === 'contactNo') ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {errors?.issues.find(e => e.path[0] === 'contactNo') && (
                      <p className="text-sm text-red-500 mt-1">{errors.issues.find(e => e.path[0] === 'contactNo')?.message}</p>
                    )}
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
                      className={`border-border focus:border-primary ${errors?.issues.find(e => e.path[0] === 'email') ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {errors?.issues.find(e => e.path[0] === 'email') && (
                      <p className="text-sm text-red-500 mt-1">{errors.issues.find(e => e.path[0] === 'email')?.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="cafeLocation" className="block text-sm font-medium text-foreground mb-2">
                    Cafe Location *
                  </label>
                  <Input
                    id="cafeLocation"
                    name="cafeLocation"
                    type="text"
                    required
                    value={formData.cafeLocation}
                    onChange={handleChange}
                    placeholder="Your cafe's location"
                    className={`border-border focus:border-primary ${errors?.issues.find(e => e.path[0] === 'cafeLocation') ? 'border-red-500' : ''}`}
                    disabled={hasSubmittedRecently}
                  />
                  {errors?.issues.find(e => e.path[0] === 'cafeLocation') && (
                    <p className="text-sm text-red-500 mt-1">{errors.issues.find(e => e.path[0] === 'cafeLocation')?.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="cafeCity" className="block text-sm font-medium text-foreground mb-2">
                    Cafe City *
                  </label>
                  <Input
                    id="cafeCity"
                    name="cafeCity"
                    type="text"
                    required
                    value={formData.cafeCity}
                    onChange={handleChange}
                    placeholder="Your cafe's city"
                    className={`border-border focus:border-primary ${errors?.issues.find(e => e.path[0] === 'cafeCity') ? 'border-red-500' : ''}`}
                    disabled={hasSubmittedRecently}
                  />
                  {errors?.issues.find(e => e.path[0] === 'cafeCity') && (
                    <p className="text-sm text-red-500 mt-1">{errors.issues.find(e => e.path[0] === 'cafeCity')?.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full btn-hero group"
                  disabled={isLoading || hasSubmittedRecently}
                >
                  <Send className={`mr-2 h-5 w-5 ${isLoading ? 'animate-pulse' : 'group-hover:translate-x-1'} transition-transform`} />
                  {isLoading ? "Sending..." : hasSubmittedRecently ? "Request Sent" : "Send Request"}
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