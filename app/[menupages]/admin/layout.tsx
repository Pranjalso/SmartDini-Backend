"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import useSWR, { mutate } from "swr";
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
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const menupages = params?.menupages as string; 
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [cafeDeactivated, setCafeDeactivated] = useState(false);
  const isFirstLoad = useRef(true);
  const lastCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio object
  useEffect(() => {
    // Industry standard notification sound (clean bell)
    const audio = new Audio("https://image2url.com/r2/default/audio/1773926314850-ea784a83-c3fd-40d8-88ae-b4edaafa0980.mp3");
    audio.volume = 0.9;
    audio.preload = "auto";
    audioRef.current = audio;

    // Check if already unlocked (some browsers might allow it if previously interacted)
    const checkUnlock = async () => {
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        setAudioUnlocked(true);
      } catch (e) {
        setAudioUnlocked(false);
      }
    };
    checkUnlock();
  }, []);

  // Play notification sound helper
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioUnlocked || !audioRef.current) {
      console.log("Sound skipped: Enabled:", soundEnabled, "Unlocked:", audioUnlocked);
      return;
    }
    
    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Audio playback blocked by browser:", e);
          setAudioUnlocked(false);
        });
      }
      
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 5000);
    } catch (err) {
      console.error("Sound execution error:", err);
    }
  }, [soundEnabled, audioUnlocked]);

  // Trigger sound when newOrdersCount increases
  useEffect(() => {
    if (isFirstLoad.current) return;
    
    if (newOrdersCount > lastCountRef.current) {
      playNotificationSound();
    }
    lastCountRef.current = newOrdersCount;
  }, [newOrdersCount, playNotificationSound]);

  // Function to unlock audio (triggered by user click)
  const handleUnlockAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setAudioUnlocked(true);
          setSoundEnabled(true);
          console.log("Audio system unlocked successfully");
        })
        .catch((err) => {
          console.error("Failed to unlock audio:", err);
          setAudioUnlocked(false);
        });
    }
  };

  // Toggle sound preference (Mute/Unmute)
  const toggleSoundPreference = () => {
    if (!audioUnlocked) {
      handleUnlockAudio();
    } else {
      setSoundEnabled(!soundEnabled);
    }
  };

  // Fetch stats and check subscription using SWR
  const statsUrl = menupages ? `/api/orders/${menupages}?status=pending` : null;
  const { data: statsData } = useSWR(statsUrl, {
    refreshInterval: 10000, // Industry standard polling for real-time dashboard
    onSuccess: (data) => {
      if (data.success && data.stats) {
        setNewOrdersCount(data.stats.pending || 0);
        isFirstLoad.current = false;
      }
    }
  });

  const statusUrl = menupages ? `/api/cafes/${menupages}/public` : null;
  const { data: statusData } = useSWR(statusUrl, {
    refreshInterval: 30000, // Less frequent check for cafe status/subscription
    onSuccess: (data) => {
      if (data.success && data.data) {
        setSubscriptionExpired(!!data.data.isExpired);
        setCafeDeactivated(!!data.data.isManuallyDeactivated);
      }
    }
  });

  useEffect(() => {
    const handleRefresh = () => {
      if (statsUrl) mutate(statsUrl);
      if (statusUrl) mutate(statusUrl);
    };

    window.addEventListener('refresh-admin-stats', handleRefresh);
    return () => window.removeEventListener('refresh-admin-stats', handleRefresh);
  }, [statsUrl, statusUrl]);

  // Fallback if params aren't ready yet
  const base = menupages ? `/${menupages}/admin` : "/admin";
  const isNewOrdersPage = pathname === `${base}/new-orders`;

  const navItems = [
    { label: "Dashboard", href: base, icon: LayoutDashboard },
    { label: "New Orders", href: `${base}/new-orders`, icon: Bell, badge: newOrdersCount },
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
    <div className="min-h-screen bg-[#F5F5F5] font-poppins">
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
            {navItems.map(({ label, href, icon: Icon, badge }: any) => {
              const isActive = href === base ? pathname === base : pathname.startsWith(href);
              
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    relative flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
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

                  {/* Sidebar Badge (New Orders Count) */}
                  {badge > 0 && (
                    <span className={`absolute right-3 bg-[#D92632] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-md ${shouldPulse ? 'animate-pulse' : ''}`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
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
              {/* Audio Control */}
              <button
                onClick={toggleSoundPreference}
                className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 mr-1 ${!audioUnlocked ? 'animate-pulse ring-2 ring-white/30 ring-offset-2 ring-offset-[#D92632]' : ''}`}
                title={!audioUnlocked ? "Click to enable sound system" : (soundEnabled ? "Mute notifications" : "Unmute notifications")}
              >
                {soundEnabled && audioUnlocked ? (
                  <Volume2 size={18} className="text-white" />
                ) : (
                  <VolumeX size={18} className={`text-white ${!audioUnlocked ? 'opacity-100' : 'opacity-60'}`} />
                )}
              </button>

              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                <User size={18} className="text-[#D92632]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg tracking-wide">
                {typeof menupages === 'string' ? `${menupages} Admin` : 'Admin Dashboard'}
              </span>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            {cafeDeactivated ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
                  <Settings size={40} className="text-amber-600 animate-spin-slow" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">Cafe Deactivated</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Your cafe account has been temporarily deactivated by the system administrator. 
                  </p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-semibold">
                  Please reach out to our support team to reactivate your account and resume services.
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.location.href = 'mailto:support@smartdini.com'}
                    className="px-8 py-3 bg-[#D92632] text-white font-bold rounded-lg shadow-md hover:bg-[#b51f29] transition-colors"
                  >
                    Contact Support
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : subscriptionExpired ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                  <X size={40} className="text-[#D92632]" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">Subscription Expired</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Your subscription plan has ended. To continue managing your cafe and receiving orders, please contact support to renew your plan.
                  </p>
                </div>
                <div className="p-4 bg-[#FFEFEF] border border-[#FECACA] rounded-xl text-[#D92632] font-semibold">
                  Access to your digital menu and admin features is currently restricted.
                </div>
                <button 
                  onClick={() => window.location.href = 'mailto:support@smartdini.com'}
                  className="px-8 py-3 bg-[#D92632] text-white font-bold rounded-lg shadow-md hover:bg-[#b51f29] transition-colors"
                >
                  Renew Subscription
                </button>
              </div>
            ) : children}
          </main>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
