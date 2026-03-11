"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Bell,
  ClipboardList,
  UtensilsCrossed,
  Menu,
  X,
  User,
  CheckCircle,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const menupages = params?.menupages; // Add default if needed
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fallback if params aren't ready yet
  const base = menupages ? `/${menupages}/admin` : "/admin";

  const navItems = [
    { label: "Dashboard", href: base, icon: LayoutDashboard },
    { label: "New Orders", href: `${base}/new-orders`, icon: Bell },
    { label: "Orders", href: `${base}/orders`, icon: ClipboardList },
    { label: "Payment Completed", href: `${base}/payment-completed`, icon: CheckCircle },
    { label: "Manage Menu", href: `${base}/manage-menu`, icon: UtensilsCrossed },
    { label: "Settings", href: `${base}/settings`, icon: Settings }, 
  ];

  // Brand Colors
  const brandRed = "text-[#D92632]"; // The Red Text Color
  const activeBg = "bg-[#FFEFEF]";   // The Pink Active Background
  const activeText = "text-[#D92632]"; // The Red Active Text

  // Logout handler
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {
      // ignore
    } finally {
      const slug = typeof menupages === 'string' ? menupages : Array.isArray(menupages) ? menupages[0] : '';
      router.replace(slug ? `/${slug}/adminlogin` : '/adminlogin');
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Poppins]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed lg:static top-0 left-0 h-full z-50 w-64 bg-white shadow-lg lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Logo Area - White bg, Red Text */}
          <div className="px-8 py-8 flex items-center justify-between">
            <h1 className={`text-2xl font-extrabold tracking-wider ${brandRed}`}>
              SMARTDINI
            </h1>
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map(({ label, href, icon: Icon }) => {
              const isActive = href === base ? pathname === base : pathname.startsWith(href);
              
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? `${activeBg} ${activeText} shadow-sm` 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}
                  `}
                >
                  {/* Icon styling based on layout */}
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? "" : "opacity-70"}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-gray-100 mt-auto">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-[#D92632] transition-all duration-200 group disabled:opacity-60"
            >
              <LogOut 
                size={20} 
                strokeWidth={2} 
                className="opacity-70 group-hover:opacity-100 group-hover:text-[#D92632] transition-colors"
              />
              <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ─── Main Content Wrapper ─── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Red Top Header */}
          <header className="bg-[#D92632] px-6 py-4 flex items-center gap-4 shadow-md shrink-0 z-30">
            <button
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                <User size={18} className="text-[#D92632]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">
                {typeof menupages === 'string' ? `${menupages} Admin` : 'Admin Dashboard'}
              </span>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
