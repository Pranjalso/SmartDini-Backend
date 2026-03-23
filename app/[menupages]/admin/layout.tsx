"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import useSWR, { mutate } from "swr";
import Pusher from 'pusher-js';
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

import useLocalStorage from "@/hooks/use-local-storage";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const menupages = params?.menupages as string; 
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('admin-sound-enabled', true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [cafeDeactivated, setCafeDeactivated] = useState(false);
  const isFirstLoad = useRef(true);
  const lastCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio system and set up aggressive unlocking
  useEffect(() => {
    const unlockAudio = async () => {
      if (audioRef.current && !audioUnlocked) {
        try {
          // Play a silent or very short sound to unlock
          audioRef.current.volume = 0.9;
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioUnlocked(true);
          // Notify other tabs
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({ type: 'AUDIO_UNLOCKED' });
          }
          // Remove listeners
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          console.log("Audio system unlocked via user interaction");
        } catch (error) {
          // Still blocked
        }
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioUnlocked]);

  // Handle Visibility Change to re-trigger audio if tab comes to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !audioUnlocked) {
        // Try to unlock again if user returns to tab
        console.log("Tab became visible, checking audio unlock status...");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [audioUnlocked]);

  // Play notification sound helper
  const playNotificationSound = useCallback(async () => {
    if (!soundEnabled || !audioRef.current) return;

    try {
      // Ensure the audio is ready
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setAudioUnlocked(true);
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 5000);
      }
    } catch (err) {
      console.warn("Audio playback blocked by browser policies. Interaction needed.", err);
      setAudioUnlocked(false);
    }
  }, [soundEnabled]);

  // BroadcastChannel to prevent duplicate sound/orders across tabs/pages
  const broadcastRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!broadcastRef.current) {
      broadcastRef.current = new BroadcastChannel('admin-orders');
    }
    const channel = broadcastRef.current;
    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_ORDER' && event.data.count > lastCountRef.current) {
        lastCountRef.current = event.data.count;
        // Play sound even if background (browser allows if user ever interacted)
        playNotificationSound();
      } else if (event.data && event.data.type === 'AUDIO_UNLOCKED') {
        setAudioUnlocked(true);
      }
    };
    channel.addEventListener('message', onMessage);
    return () => channel.removeEventListener('message', onMessage);
  }, [playNotificationSound]);

  // Note: Notification sound and broadcasting logic moved to SWR onSuccess for better reliability

  // Toggle sound preference (Mute/Unmute)
  const toggleSoundPreference = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    
    // If enabling, try to play a test sound to unlock the audio context immediately
    if (newState && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.5; // lower for test
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setAudioUnlocked(true);
          console.log("Audio system explicitly unlocked via icon click");
          // Reset to full volume for actual notifications
          audioRef.current.volume = 0.9;
        }
      } catch (e) {
        console.warn("Browser still blocking audio. User needs to interact more.", e);
        setAudioUnlocked(false);
      }
    }
  };


  // Fetch stats and check subscription using SWR
  const statsUrl = menupages ? `/api/orders/${menupages}?status=pending` : null;
  const { data: statsData } = useSWR(statsUrl, {
    refreshInterval: 5000, // Faster polling (5s) for real-time dashboard
    onSuccess: (data) => {
      if (data.success && data.stats) {
        const count = data.stats.pending || 0;
        
        // Only trigger sound if the count has INCREASED
        if (!isFirstLoad.current && count > lastCountRef.current) {
          playNotificationSound();
          // Broadcast to all other tabs
          if (broadcastRef.current) {
            broadcastRef.current.postMessage({ type: 'NEW_ORDER', count: count });
          }
        }
        
        // Update the lastCountRef for comparison in next poll
        lastCountRef.current = count;
        setNewOrdersCount(count);
        isFirstLoad.current = false;
      }
    }
  });

  // Sidebar badge count (prioritize SWR data for instant reactivity)
  const currentBadgeCount = statsData?.stats?.pending ?? newOrdersCount;

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
    { label: "New Orders", href: `${base}/new-orders`, icon: Bell, badge: currentBadgeCount },
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
      {/* Hidden Audio Element for Notifications */}
      <audio 
        ref={audioRef}
        src="https://image2url.com/r2/default/audio/1773926314850-ea784a83-c3fd-40d8-88ae-b4edaafa0980.mp3" 
        preload="auto"
        className="hidden"
        onCanPlayThrough={() => console.log("Audio loaded and ready")}
        onError={(e) => console.error("Audio failed to load:", e)}
      />
      
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
              <div className="relative group">
                <button
                  onClick={toggleSoundPreference}
                  className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 mr-1 
                    ${soundEnabled && !audioUnlocked ? 'animate-pulse ring-2 ring-white/30 ring-offset-2 ring-offset-[#D92632]' : ''}`}
                  title={!audioUnlocked && soundEnabled ? "Click anywhere on the page to enable sound" : (soundEnabled ? "Mute notifications" : "Unmute notifications")}
                >
                  {soundEnabled ? (
                    <Volume2 size={18} className={`text-white ${!audioUnlocked ? 'opacity-50' : 'opacity-100'}`} />
                  ) : (
                    <VolumeX size={18} className="text-white opacity-50" />
                  )}
                </button>
                
                {/* Audio Blocked Tooltip */}
                {soundEnabled && !audioUnlocked && (
                  <div className="fixed top-16 left-auto right-4 sm:right-auto sm:left-[calc(50%+120px)] -translate-x-1/2 w-60 bg-gray-900 text-white text-[12px] p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[99999] pointer-events-none text-center border border-white/20 animate-bounce-subtle backdrop-blur-md">
                    {/* Tooltip Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45 border-l border-t border-white/20"></div>
                    
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 bg-[#D92632] rounded-full animate-ping"></div>
                      <span className="font-bold text-white text-sm">Sound is Blocked</span>
                    </div>
                    <p className="text-gray-300 leading-tight">
                      Browser prevents auto-play. 
                      <span className="block font-black text-[#FFEB3B] mt-2 text-sm uppercase tracking-widest">Click anywhere to enable</span>
                    </p>
                  </div>
                )}
              </div>

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
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -5px); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}