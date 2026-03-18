"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const menupages = params?.menupages as string; 
  const router = useRouter();
  const { user, isLoading, logout, checkAuth } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isEnablingSound, setIsEnablingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);

  // Load sound preference and initialize audio object
  useEffect(() => {
    // 1. Restore sound preference (On by default)
    const savedSound = localStorage.getItem("smartdini_sound_enabled");
    setSoundEnabled(savedSound !== "false");

    // 2. Restore unlock status
    const wasUnlocked = localStorage.getItem("smartdini_audio_unlocked") === "true";
    setAudioUnlocked(wasUnlocked);

    // 3. Restore banner dismissed state
    const bannerDismissed = localStorage.getItem("smartdini_banner_dismissed") === "true";
    setIsBannerDismissed(bannerDismissed || wasUnlocked);

    // 4. Create audio element with user interaction requirement in mind
    const audio = new Audio();
    
    // Try multiple sound sources for reliability
    const soundUrls = [
      "https://xenophobic-peach-mwmg0l6pbj.edgeone.app/smartdini%20notification.mp3"
    ];
    
    let currentSourceIndex = 0;
    
    const loadNextSource = () => {
      if (currentSourceIndex < soundUrls.length) {
        audio.src = soundUrls[currentSourceIndex];
        audio.load();
        currentSourceIndex++;
      }
    };
    
    audio.addEventListener('error', () => {
      console.log('Audio source failed, trying next...');
      loadNextSource();
    });
    
    audio.volume = 0.9;
    audio.preload = "auto";
    loadNextSource();
    
    audioRef.current = audio;

    // If already unlocked from previous session, mark banner as dismissed
    if (wasUnlocked) {
      localStorage.setItem("smartdini_banner_dismissed", "true");
    }
  }, []);

  // Use SWR for sidebar stats
  const statsUrl = menupages ? `/api/orders/${menupages}?status=pending` : null;
  const { data: statsData } = useSWR(statsUrl, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  // Use SWR for subscription status
  const statusUrl = menupages ? `/api/cafes/${menupages}/public` : null;
  const { data: statusData } = useSWR(statusUrl, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const newOrdersCount = statsData?.success ? (statsData.stats?.pending || 0) : 0;
  const subscriptionExpired = !!statusData?.data?.isExpired;
  const cafeDeactivated = !!statusData?.data?.isManuallyDeactivated;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      if (menupages) {
        router.replace(`/${menupages}/adminlogin`);
      } else {
        router.replace('/adminlogin');
      }
    }
  }, [user, isLoading, router, menupages]);

  // Play notification sound helper - FIXED VERSION
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) {
      return;
    }
    
    // If not unlocked, try to play (this will fail but we catch it)
    if (!audioUnlocked) {
      return;
    }
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.5;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Notification sound played");
          })
          .catch((err) => {
            console.log("Playback failed:", err);
          });
      }
      
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 5000);
    } catch (err) {
      console.error("Sound error:", err);
    }
  }, [soundEnabled, audioUnlocked]);

  // Trigger sound when newOrdersCount increases
  useEffect(() => {
    if (newOrdersCount > lastCountRef.current) {
      playNotificationSound();
    }
    lastCountRef.current = newOrdersCount;
  }, [newOrdersCount, playNotificationSound]);

  // Toggle sound preference (Mute/Unmute) - FIXED VERSION
  const toggleSoundPreference = async () => {
    if (!audioRef.current) return;
    
    // If currently enabled, just disable
    if (soundEnabled) {
      setSoundEnabled(false);
      localStorage.setItem("smartdini_sound_enabled", "false");
      toast({
        title: "Notifications Muted",
        description: "Sound alerts are now off.",
      });
      return;
    }
    
    // If disabled, enable and try to unlock with user gesture
    setSoundEnabled(true);
    localStorage.setItem("smartdini_sound_enabled", "true");
    
    try {
      // Play a test sound to unlock (this works because of user click)
      audioRef.current.volume = 0.3;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      
      setAudioUnlocked(true);
      localStorage.setItem("smartdini_audio_unlocked", "true");
      localStorage.setItem("smartdini_banner_dismissed", "true");
      setIsBannerDismissed(true);
      
      toast({
        title: "Sound Enabled",
        description: "You'll hear notifications for new orders.",
      });
    } catch (error) {
      console.error("Failed to enable audio:", error);
      toast({
        title: "Browser Blocked Audio",
        description: "Please click the 'Enable Sound' button in the banner.",
        variant: "destructive",
      });
    }
  };

  // Dedicated handler for banner - FIXED VERSION
  const handleBannerEnableSound = async () => {
    if (!audioRef.current || isEnablingSound) return;
    
    setIsEnablingSound(true);
    
    try {
      // Set enabled first
      setSoundEnabled(true);
      localStorage.setItem("smartdini_sound_enabled", "true");
      
      // Play test sound (this works because of button click)
      audioRef.current.volume = 0.3;
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      
      // Success!
      setAudioUnlocked(true);
      localStorage.setItem("smartdini_audio_unlocked", "true");
      localStorage.setItem("smartdini_banner_dismissed", "true");
      setIsBannerDismissed(true);
      
      toast({
        title: "Sound Enabled",
        description: "You'll now hear notifications for new orders.",
      });
    } catch (err) {
      console.error("Banner enable sound failed:", err);
      toast({
        title: "Sound Enable Failed",
        description: "Please check your browser settings and try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnablingSound(false);
    }
  };

  // Handle banner dismiss
  const handleDismissBanner = () => {
    localStorage.setItem("smartdini_banner_dismissed", "true");
    setIsBannerDismissed(true);
  };

  // Don't render anything until we know the auth status
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-poppins flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FFEFEF] flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#D92632]" />
          </div>
          <h1 className="text-xl font-extrabold text-[#D92632]">SmartDini</h1>
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) return null;

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
  const brandRed = "text-[#D92632]";
  const activeBg = "bg-[#FFEFEF]";
  const activeText = "text-[#D92632]";

  // Logout handler
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
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
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-0 left-0 h-full z-50 w-64 bg-white shadow-lg lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
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
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? "" : "opacity-70"}
                  />
                  {label}

                  {badge > 0 && (
                    <span className={`absolute right-3 bg-[#D92632] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-md ${shouldPulse ? 'animate-pulse' : ''}`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

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

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Red Top Header */}
          <header className="bg-[#D92632] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shadow-md shrink-0 z-30">
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Audio Control */}
              <button
                onClick={toggleSoundPreference}
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0
                  ${soundEnabled && audioUnlocked 
                    ? "bg-white/20 text-white hover:bg-white/30" 
                    : "bg-black/20 text-white/50 hover:bg-black/30"}
                  ${shouldPulse ? 'animate-pulse scale-110' : ''}
                `}
                title={soundEnabled && audioUnlocked ? "Mute notifications" : "Unmute notifications"}
              >
                {soundEnabled && audioUnlocked ? (
                  <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                ) : (
                  <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" />
                )}
              </button>

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <User size={14} className="sm:w-[18px] sm:h-[18px] text-[#D92632]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-sm sm:text-base lg:text-lg tracking-wide truncate">
                {user?.cafeName || (typeof menupages === 'string' ? `${menupages} Admin` : 'Admin Dashboard')}
              </span>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 relative">
            {/* Audio Unlock Banner - Fixed positioning */}
            {isNewOrdersPage && !audioUnlocked && !isBannerDismissed && (
              <div className="mb-4 sm:mb-6 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 relative animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
                {/* Close Button - Top Right Corner */}
                <button 
                  onClick={handleDismissBanner}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-amber-500 hover:text-amber-600 transition-all duration-200 z-10 shadow-sm border border-amber-200"
                  title="Dismiss"
                >
                  <X size={14} className="sm:w-4 sm:h-4" strokeWidth={2} />
                </button>

                {/* Content */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pr-8 sm:pr-12">
                  {/* Icon and Text */}
                  <div className="flex items-center gap-3 sm:gap-4 text-amber-800 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-amber-200">
                      <Volume2 size={20} className="sm:w-6 sm:h-6 animate-pulse text-amber-600" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-bold text-sm sm:text-base tracking-tight text-amber-800">Enable Sound Notifications</p>
                      <p className="text-xs sm:text-sm text-amber-600/80 leading-snug max-w-md">
                        Get audio alerts for new orders. Click enable to allow browser audio.
                      </p>
                    </div>
                  </div>
                  
                  {/* Enable Button - Positioned to the right on desktop */}
                  <button 
                    onClick={handleBannerEnableSound}
                    disabled={isEnablingSound}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-600 text-white text-sm font-bold rounded-lg sm:rounded-xl hover:bg-amber-700 hover:shadow-lg transition-all duration-200 shadow-md active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed sm:ml-auto"
                  >
                    {isEnablingSound ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Enabling...</span>
                      </>
                    ) : (
                      <span>Enable Sound</span>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {cafeDeactivated ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-sm">
                  <Settings size={32} className="sm:w-10 sm:h-10 text-amber-600 animate-spin-slow" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Cafe Deactivated</h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Your cafe account has been temporarily deactivated by the system administrator. 
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl text-amber-700 text-sm sm:text-base font-semibold">
                  Please reach out to our support team to reactivate your account and resume services.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => window.location.href = 'mailto:support@smartdini.com'}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D92632] text-white font-bold rounded-lg shadow-md hover:bg-[#b51f29] transition-colors text-sm sm:text-base"
                  >
                    Contact Support
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : subscriptionExpired ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-2xl mx-auto px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                  <X size={32} className="sm:w-10 sm:h-10 text-[#D92632]" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Subscription Expired</h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Your subscription plan has ended. To continue managing your cafe and receiving orders, please contact support to renew your plan.
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-[#FFEFEF] border border-[#FECACA] rounded-lg sm:rounded-xl text-[#D92632] text-sm sm:text-base font-semibold">
                  Access to your digital menu and admin features is currently restricted.
                </div>
                <button 
                  onClick={() => window.location.href = 'mailto:support@smartdini.com'}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D92632] text-white font-bold rounded-lg shadow-md hover:bg-[#b51f29] transition-colors text-sm sm:text-base"
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