"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useToast, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/hooks/use-toast";

type Cafe = {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  slug: string;
  taxRate: number;
  showTax: boolean;
};

export default function SettingsPage() {
  const params = useParams();
  const slug = (params?.menupages as string) || "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [form, setForm] = useState<Omit<Cafe, "slug">>({
    cafeName: "",
    ownerName: "",
    email: "",
    city: "",
    location: "",
    taxRate: 5.0,
    showTax: true,
  });
  const { toast, toasts, dismiss } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cafes/${slug}/self`, { credentials: 'include' });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Failed to load");
        const data = json.data as Cafe;
        setCafe(data);
        setForm({
          cafeName: data.cafeName,
          ownerName: data.ownerName,
          email: data.email,
          city: data.city,
          location: data.location,
          taxRate: typeof data.taxRate === 'number' ? data.taxRate : 0,
          showTax: typeof data.showTax === 'boolean' ? data.showTax : false,
        });
      } catch (e: any) {
        toast({ title: "Failed to load", description: e.message || "Error", variant: "destructive" as any });
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug, toast]);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async () => {
    if (!cafe) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cafes/${slug}/self`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerName: form.ownerName,
          email: form.email,
          city: form.city,
          location: form.location,
          taxRate: Number(form.taxRate),
          showTax: Boolean(form.showTax),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save");
      setCafe(json.data);
      toast({ title: "Saved", description: "Changes have been saved" });
    } catch (e: any) {
      toast({ title: "Failed to save", description: e.message || "Error", variant: "destructive" as any });
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <ToastProvider>
        <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6 shadow-sm">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
          
          <div className="space-y-6">
            {/* Basic Details Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Tax Card Skeleton */}
            <div className="mt-8 bg-white rounded-xl border p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-56 mb-6 animate-pulse"></div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Basic Details</h2>
        <p className="text-sm text-gray-500 mb-6">Update your cafe information. Name is managed by superadmin.</p>

        <>
          <div className="space-y-4">
            <div>
              <label className="text-sm mb-1 block font-medium text-gray-700">Cafe Name</label>
              <Input value={form.cafeName} disabled />
              <p className="text-xs text-gray-400 mt-1">Contact superadmin to rename the cafe.</p>
            </div>
            <div>
              <label className="text-sm mb-1 block font-medium text-gray-700">Owner Name</label>
              <Input value={form.ownerName} onChange={onChange('ownerName')} />
            </div>
            <div>
              <label className="text-sm mb-1 block font-medium text-gray-700">Email</label>
              <Input type="email" value={form.email} onChange={onChange('email')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block font-medium text-gray-700">City</label>
                <Input value={form.city} onChange={onChange('city')} />
              </div>
              <div>
                <label className="text-sm mb-1 block font-medium text-gray-700">Location</label>
                <Input value={form.location} onChange={onChange('location')} />
              </div>
            </div>
          </div>

          {/* Tax Management Card */}
          <div className="mt-8 bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-1">Tax Management</h2>
            <p className="text-sm text-gray-500 mb-6">Manage how taxes are calculated for your orders.</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Taxes</label>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle to show/hide tax in user's menu and checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, showTax: !prev.showTax }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    form.showTax ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.showTax ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Tax Row - Only shown when showTax is true */}
              {form.showTax && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-sm mb-1 block font-medium text-gray-700">GST / Tax Percentage (%)</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={form.taxRate} 
                      onChange={(e) => setForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">This rate will be applied to the subtotal of every new order when taxes are enabled.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg"
              className="px-10 shadow-md bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all active:scale-95"
              disabled={saving} 
              onClick={onSave}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Changes...
                </span>
              ) : 'Save Changes'}
            </Button>
          </div>
        </>
      </div>
      {toasts.map(function ({ id, title, description, ...props }) {
        return (
          <Toast key={id} {...(props as any)}>
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  );
}