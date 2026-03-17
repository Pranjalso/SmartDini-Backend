"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/auth/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username: user, password: pass }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.message || "Invalid credentials");
          setLoading(false);
          return;
        }
        router.push("/admin");
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    })();
  };

  return (
    <div className="min-h-screen lg:min-h-[100dvh] bg-background flex items-center justify-center px-4">
      <form
        onSubmit={onLogin}
        className="w-full max-w-md md:max-w-lg bg-card rounded-2xl md:rounded-3xl border-2 border-gray-200 p-6 md:p-8 shadow-lg mx-auto"
      >
        <div className="text-3xl font-bold text-center mb-1">
          <span className="text-primary">Smart</span>dini
        </div>
        <div className="text-center text-xs tracking-wide text-muted-foreground mb-6">
          SUPER ADMIN PORTAL
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <input 
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 h-11 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Enter admin username"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <input 
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 h-11 pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Toggle password"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 border-2 border-primary/20 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Access Dashboard"}
          </Button>
          {error && (
            <div className="text-sm text-red-600 font-medium mt-2">
              {error}
            </div>
          )}

          <div className="text-xs text-right">
            <a className="text-primary font-medium hover:underline" href="#">
              Forgot Password?
            </a>
          </div>
        </div>

        <div className="text-[10px] text-center text-gray-500 border-t border-gray-200 pt-4 mt-6">
          © 2026 Smartdini. All rights reserved.
        </div>
      </form>
    </div>
  );
}