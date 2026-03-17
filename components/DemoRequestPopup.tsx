
"use client";

import { useState } from "react";
import { X, Send, Calendar, MapPin, Building, User, Mail, Phone } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DemoRequestPopupProps = {
  onClose: () => void;
};

const demoRequestSchema = z.object({
  cafeName: z.string().min(1, "Cafe name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(1, "City is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start date is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

export default function DemoRequestPopup({ onClose }: DemoRequestPopupProps) {
  const [formData, setFormData] = useState({
    cafeName: "",
    ownerName: "",
    email: "",
    city: "",
    location: "",
    startDate: "",
    contactNumber: "",
  });
  const [errors, setErrors] = useState<z.ZodError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getError = (path: string) => {
    return errors?.issues.find((i) => i.path[0] === path)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = demoRequestSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error);
      return;
    }
    setErrors(null);
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTimeout(() => onClose(), 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-brand-red p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Send className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Request a Demo</h2>
              <p className="text-white/80 text-sm">Fill details for a personalized walkthrough</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-hide">
          {submitStatus === "success" ? (
            <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-600">We'll get back to you within 24 hours to schedule your demo.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Cafe Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4 text-brand-red" /> Cafe Name *
                  </label>
                  <Input
                    name="cafeName"
                    placeholder="E.g. Coffee House"
                    value={formData.cafeName}
                    onChange={handleChange}
                    className={getError("cafeName") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("cafeName") && <p className="text-red-500 text-xs">{getError("cafeName")}</p>}
                </div>

                {/* Owner Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-red" /> Owner Name *
                  </label>
                  <Input
                    name="ownerName"
                    placeholder="Your Full Name"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className={getError("ownerName") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("ownerName") && <p className="text-red-500 text-xs">{getError("ownerName")}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4 text-brand-red" /> Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={getError("email") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("email") && <p className="text-red-500 text-xs">{getError("email")}</p>}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-red" /> Contact Number *
                  </label>
                  <Input
                    name="contactNumber"
                    placeholder="10 digit number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className={getError("contactNumber") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("contactNumber") && <p className="text-red-500 text-xs">{getError("contactNumber")}</p>}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-red" /> City *
                  </label>
                  <Input
                    name="city"
                    placeholder="Your City"
                    value={formData.city}
                    onChange={handleChange}
                    className={getError("city") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("city") && <p className="text-red-500 text-xs">{getError("city")}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-red" /> Location *
                  </label>
                  <Input
                    name="location"
                    placeholder="Area/Street"
                    value={formData.location}
                    onChange={handleChange}
                    className={getError("location") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("location") && <p className="text-red-500 text-xs">{getError("location")}</p>}
                </div>

                {/* Start Date */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-red" /> Preferred Start Date *
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={getError("startDate") ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {getError("startDate") && <p className="text-red-500 text-xs">{getError("startDate")}</p>}
                </div>
              </div>

              {submitStatus === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  Failed to send demo request. Please try again later.
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold h-12 text-lg shadow-lg hover:shadow-brand-red/25 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Book My Demo"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  By clicking "Book My Demo", you agree to our terms of service and privacy policy.
                </p>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
