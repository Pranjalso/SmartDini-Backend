"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useToast, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/hooks/use-toast";
import useSWR, { mutate } from "swr";

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
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalForm, setOriginalForm] = useState<Omit<Cafe, "slug"> | null>(null);
  
  const cafeUrl = slug ? `/api/cafes/${slug}/self` : null;
  const { data, isLoading: swrLoading, error: swrError } = useSWR(cafeUrl);

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
    if (data?.success) {
      const cafeData = data.data as Cafe;
      const initialForm = {
        cafeName: cafeData.cafeName,
        ownerName: cafeData.ownerName,
        email: cafeData.email,
        city: cafeData.city,
        location: cafeData.location,
        taxRate: cafeData.taxRate || 5.0,
        showTax: cafeData.showTax !== undefined ? cafeData.showTax : true,
      };
      setForm(initialForm);
      setOriginalForm(initialForm);
    }
  }, [data]);

  const loading = swrLoading && !data;

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async (updatedForm = form) => {
    if (!data?.success) return;

    // Check if anything actually changed for manual saves (Basic Details)
    if (isEditing && originalForm) {
      const hasChanged = 
        updatedForm.ownerName !== originalForm.ownerName ||
        updatedForm.email !== originalForm.email ||
        updatedForm.city !== originalForm.city ||
        updatedForm.location !== originalForm.location;
        
      if (!hasChanged) {
        toast({ title: "No changes made", description: "You haven't modified any details." });
        setIsEditing(false);
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/cafes/${slug}/self`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerName: updatedForm.ownerName,
          email: updatedForm.email,
          city: updatedForm.city,
          location: updatedForm.location,
          taxRate: Number(updatedForm.taxRate),
          showTax: Boolean(updatedForm.showTax),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to save");
      
      // Update local cache and states
      mutate(cafeUrl);
      setOriginalForm(updatedForm);
      setIsEditing(false);
      
      toast({ title: "Saved", description: "Changes have been saved" });
    } catch (e: any) {
      toast({ title: "Failed to save", description: e.message || "Error", variant: "destructive" as any });
      // Revert form if it was an auto-save that failed? 
      // For now just keep the current form so user can retry.
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalForm) {
      setForm(originalForm);
    }
    setIsEditing(false);
  };

  const handleTaxToggle = async () => {
    const newShowTax = !form.showTax;
    const updatedForm = { ...form, showTax: newShowTax };
    setForm(updatedForm);
    await onSave(updatedForm);
  };

  const handleTaxRateChange = async (val: string) => {
    const rate = parseFloat(val) || 0;
    const updatedForm = { ...form, taxRate: rate };
    setForm(updatedForm);
    // Debounce might be better for rate, but for now let's just use a blur event or similar if needed.
    // However, user asked for "no button", so I'll implement it on blur or just provide a button for the rate specifically if it's too much.
    // Actually, I'll use blur for the tax rate to avoid too many API calls.
  };

  const onTaxRateBlur = async () => {
    if (originalForm && form.taxRate !== originalForm.taxRate) {
      await onSave(form);
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
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Basic Details Card */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Basic Details</h2>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="rounded-lg border-gray-300 bg-white text-gray-700 hover:border-[#D92632] hover:bg-[#D92632] hover:text-white transition-all duration-300 px-5 font-bold shadow-sm"
              >
                Edit Details
              </Button>
            ) : (
              <div className="flex gap-2.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  className="rounded-lg border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 px-5 font-bold shadow-sm"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSave()}
                  disabled={saving}
                  className="rounded-lg bg-[#D92632] hover:bg-[#b51f29] text-white shadow-md px-6 font-bold transition-all duration-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-8 font-medium border-b border-gray-50 pb-4">Update your cafe information. Name is managed by superadmin.</p>

          <div className="space-y-6">
            <div className="group">
              <label className="text-sm mb-2 block font-bold text-gray-800">Cafe Name</label>
              <Input 
                value={form.cafeName} 
                disabled 
                className="bg-gray-50/50 border-gray-300 border-2 cursor-not-allowed opacity-80 font-bold text-gray-600 rounded-lg h-11" 
              />
              <p className="text-xs text-gray-500 mt-2 italic font-semibold flex items-center gap-1">
                <span className="text-[#D92632] font-bold">Note:-</span> "Contact superadmin to rename the cafe"
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-sm mb-2 block font-bold text-gray-800">Owner Name</label>
                <Input 
                  value={form.ownerName} 
                  onChange={onChange('ownerName')} 
                  disabled={!isEditing}
                  placeholder="Enter owner name"
                  className={`${!isEditing ? 'bg-gray-50/50 border-gray-300' : 'bg-white border-[#D92632]/40 focus:border-[#D92632] focus:ring-4 focus:ring-[#D92632]/10'} border-2 transition-all duration-300 font-bold text-gray-800 rounded-lg h-11`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-bold text-gray-800">Email Address</label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={onChange('email')} 
                  disabled={!isEditing}
                  placeholder="Enter email address"
                  className={`${!isEditing ? 'bg-gray-50/50 border-gray-300' : 'bg-white border-[#D92632]/40 focus:border-[#D92632] focus:ring-4 focus:ring-[#D92632]/10'} border-2 transition-all duration-300 font-bold text-gray-800 rounded-lg h-11`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-sm mb-2 block font-bold text-gray-800">City</label>
                <Input 
                  value={form.city} 
                  onChange={onChange('city')} 
                  disabled={!isEditing}
                  placeholder="Enter city"
                  className={`${!isEditing ? 'bg-gray-50/50 border-gray-300' : 'bg-white border-[#D92632]/40 focus:border-[#D92632] focus:ring-4 focus:ring-[#D92632]/10'} border-2 transition-all duration-300 font-bold text-gray-800 rounded-lg h-11`}
                />
              </div>
              
              <div className="group">
                <label className="text-sm mb-2 block font-bold text-gray-800">Location</label>
                <Input 
                  value={form.location} 
                  onChange={onChange('location')} 
                  disabled={!isEditing}
                  placeholder="Enter specific location"
                  className={`${!isEditing ? 'bg-gray-50/50 border-gray-300' : 'bg-white border-[#D92632]/40 focus:border-[#D92632] focus:ring-4 focus:ring-[#D92632]/10'} border-2 transition-all duration-300 font-bold text-gray-800 rounded-lg h-11`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax Management Card */}
        <div className="bg-white rounded-xl border-2 border-gray-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-900">Tax Management</h2>
          </div>
          <p className="text-sm text-gray-500 mb-8 font-medium border-b border-gray-50 pb-4">Manage how taxes are calculated for your orders.</p>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between p-5 bg-gray-50/80 rounded-xl border-2 border-gray-100 shadow-inner">
              <div className="max-w-[70%]">
                <label className="text-base font-bold text-gray-800 block">Enable Taxes</label>
                <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">Automatically show/hide tax in user's menu and checkout screens.</p>
              </div>
              <button
                onClick={handleTaxToggle}
                disabled={saving}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#D92632]/20 ${
                  form.showTax ? 'bg-[#D92632]' : 'bg-gray-400'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-500 ${
                    form.showTax ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tax Row - Only shown when showTax is true */}
            {form.showTax && (
              <div className="opacity-100 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-sm mb-2 block font-bold text-gray-800">GST / Tax Percentage (%)</label>
                    <div className="relative group max-w-xs">
                      <Input 
                        type="number" 
                        value={form.taxRate} 
                        onChange={(e) => setForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        onBlur={onTaxRateBlur}
                        min="0"
                        max="100"
                        step="0.1"
                        className="pr-12 border-2 border-gray-300 focus:border-[#D92632] focus:ring-4 focus:ring-[#D92632]/10 font-black text-lg text-gray-900 transition-all duration-300 rounded-lg h-12"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D92632] font-black text-xl select-none">%</span>
                    </div>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg sm:max-w-[40%]">
                    <p className="text-xs text-green-700 font-bold leading-relaxed">
                      💡 Pro-Tip: Changes are saved automatically. This rate applies to subtotals of all new orders.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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