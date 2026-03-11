"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useToast, toast, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/hooks/use-toast";

type Cafe = {
  cafeName: string;
  ownerName: string;
  email: string;
  city: string;
  location: string;
  slug: string;
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
  });
  const { toasts, dismiss } = useToast();

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
        });
      } catch (e: any) {
        toast({ title: "Failed to load", description: e.message || "Error", variant: "destructive" as any });
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

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

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Basic Details</h2>
        <p className="text-sm text-gray-500 mb-6">Update your cafe information. Name is managed by superadmin.</p>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
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
            <div className="mt-6 flex justify-end">
              <Button disabled={saving} onClick={onSave}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
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
