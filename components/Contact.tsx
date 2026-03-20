"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Clock, Send, Info, User, MapPin, Building, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import qrScanning from "@/assets/qr-scanning.jpg";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City must be at least 2 characters"),
  cafeRestaurantName: z.string().min(2, "Cafe/Restaurant name must be at least 2 characters"),
  needs: z.string().min(10, "Please describe your requirements in at least 10 characters"),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
    city: "",
    cafeRestaurantName: "",
    needs: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmittedRecently, setHasSubmittedRecently] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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
    setShowSuccessMessage(false);

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

      // Show success message below the button
      setShowSuccessMessage(true);
      
      // Reset form
      setFormData({ 
        fullName: "", 
        contactNumber: "", 
        email: "", 
        city: "", 
        cafeRestaurantName: "", 
        needs: "" 
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

  const getError = (path: string) => {
    return errors?.issues.find((i) => i.path[0] === path)?.message;
  };

  return (
    <section id="contact" className="section-padding bg-background pb-2 md:pb-32">
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name | Contact Number - in one line */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                      <User className="inline h-4 w-4 mr-2 text-brand-red" />
                      Full Name *
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`border-border focus:border-primary ${getError("fullName") ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {getError("fullName") && (
                      <p className="text-sm text-red-500 mt-1">{getError("fullName")}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="inline h-4 w-4 mr-2 text-brand-red" />
                      Contact Number *
                    </label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Your contact number"
                      className={`border-border focus:border-primary ${getError("contactNumber") ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {getError("contactNumber") && (
                      <p className="text-sm text-red-500 mt-1">{getError("contactNumber")}</p>
                    )}
                  </div>
                </div>

                {/* Email | City - in one line */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="inline h-4 w-4 mr-2 text-brand-red" />
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
                      className={`border-border focus:border-primary ${getError("email") ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {getError("email") && (
                      <p className="text-sm text-red-500 mt-1">{getError("email")}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                      <MapPin className="inline h-4 w-4 mr-2 text-brand-red" />
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Your city"
                      className={`border-border focus:border-primary ${getError("city") ? 'border-red-500' : ''}`}
                      disabled={hasSubmittedRecently}
                    />
                    {getError("city") && (
                      <p className="text-sm text-red-500 mt-1">{getError("city")}</p>
                    )}
                  </div>
                </div>

                {/* Cafe/Restaurant Name - in one line */}
                <div>
                  <label htmlFor="cafeRestaurantName" className="block text-sm font-medium text-foreground mb-2">
                    <Building className="inline h-4 w-4 mr-2 text-brand-red" />
                    Cafe/Restaurant Name *
                  </label>
                  <Input
                    id="cafeRestaurantName"
                    name="cafeRestaurantName"
                    type="text"
                    required
                    value={formData.cafeRestaurantName}
                    onChange={handleChange}
                    placeholder="Your cafe/restaurant name"
                    className={`border-border focus:border-primary ${getError("cafeRestaurantName") ? 'border-red-500' : ''}`}
                    disabled={hasSubmittedRecently}
                  />
                  {getError("cafeRestaurantName") && (
                    <p className="text-sm text-red-500 mt-1">{getError("cafeRestaurantName")}</p>
                  )}
                </div>

                {/* Tell us about your needs - in one line */}
                <div>
                  <label htmlFor="needs" className="block text-sm font-medium text-foreground mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-2 text-brand-red" />
                    Tell us about your needs *
                  </label>
                  <Textarea
                    id="needs"
                    name="needs"
                    required
                    value={formData.needs}
                    onChange={handleChange}
                    placeholder="Describe your current setup, number of tables, main challenges, or any specific requirements..."
                    rows={5}
                    className={`border-border focus:border-primary resize-none ${getError("needs") ? 'border-red-500' : ''}`}
                    disabled={hasSubmittedRecently}
                  />
                  {getError("needs") && (
                    <p className="text-sm text-red-500 mt-1">{getError("needs")}</p>
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

                {/* Success Message - Moved below the button */}
                {showSuccessMessage && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Send className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">Your request has been sent</p>
                        <p className="text-sm text-green-700 mt-0.5">
                          Thank you for your interest! We have received your message and will get back to you shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email Us</h4>
                    <p className="text-muted-foreground">smartdini.contact@gmail.com</p>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Call Us</h4>
                    <p className="text-muted-foreground">+91 90983-43508</p>
                    <p className="text-sm text-muted-foreground">Mon-Sat, 9 AM - 9 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center mr-4 flex-shrink-0">
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
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-white/30 transition-colors">
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