"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Custom toast hook with professional styling
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string; title: string; description?: string; type?: 'success' | 'error' | 'info'}>>([]);

  const toast = ({ title, description, type = 'success' }: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, toast, dismiss };
};

// Toast Components
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastViewport = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%',
      }}
    />
  );
};

const Toast = ({ 
  children, 
  type = 'success' 
}: { 
  children: React.ReactNode; 
  type?: 'success' | 'error' | 'info';
  onOpenChange?: (open: boolean) => void;
}) => {
  const getBackgroundColor = () => {
    switch(type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        animation: 'slideIn 0.3s ease-out',
        position: 'relative',
        width: '100%',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {children}
    </div>
  );
};

const ToastTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ 
      fontWeight: 600, 
      fontSize: '1rem', 
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {children}
    </div>
  );
};

const ToastDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ 
      fontSize: '0.9rem', 
      opacity: 0.9,
      lineHeight: 1.5
    }}>
      {children}
    </div>
  );
};

const ToastClose = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'transparent',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        opacity: 0.7,
        fontSize: '18px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
    >
      ✕
    </button>
  );
};

// Add animation styles
const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

export default function SuperAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [isInitialized, setIsInitialized] = useState(false);

  // --- PERFORMANCE OPTIMIZATION: LOAD CACHED DATA ON MOUNT ---
  useEffect(() => {
    try {
      const cachedTab = window.sessionStorage.getItem('sd:admin:activeTab') as 'add' | 'manage';
      if (cachedTab) setActiveTab(cachedTab);

      const cachedCafes = window.sessionStorage.getItem('sd:admin:cafes');
      if (cachedCafes) setCafes(JSON.parse(cachedCafes));

      const cachedStats = window.sessionStorage.getItem('sd:admin:stats');
      if (cachedStats) setStats(JSON.parse(cachedStats));
    } catch (e) {
      console.error('Error loading cached admin data:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Persist tab changes
  const handleTabChange = (tab: 'add' | 'manage') => {
    setActiveTab(tab);
    try {
      window.sessionStorage.setItem('sd:admin:activeTab', tab);
    } catch {}
  };

  const [saving, setSaving] = useState(false);
  const [cafeName, setCafeName] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plan, setPlan] = useState('demo');
  const [contactNumber, setContactNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuLink, setMenuLink] = useState('');
  const [adminLink, setAdminLink] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editSlug, setEditSlug] = useState<string>('');
  // New state variables for added fields
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPlan, setEditPlan] = useState('1');
  const [editEndDate, setEditEndDate] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editUsername, setEditUsername] = useState('');
  // New state for edit start date
  const [editStartDate, setEditStartDate] = useState('');

  // Toast state
  const [toasts, setToasts] = useState<Array<{id: string; title: string; description?: string; type?: 'success' | 'error' | 'info'}>>([]);

  const toast = ({ title, description, type = 'success' }: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Dynamic data for Manage tab
  const [cafes, setCafes] = useState<Array<any>>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>('All Cities');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Plan mapping helpers
  const planLabelFromCode = (code: string) => {
    const map: Record<string, string> = {
      demo1: 'Demo (1 Day)',
      demo: 'Demo (7 Days)',
      '1': '1 Month',
      '3': '3 Months',
      '6': '6 Months',
      '12': '12 Months',
      lifetime: 'Lifetime',
    };
    return map[code] || 'Demo (7 Days)';
  };
  const planCodeFromLabel = (label: string) => {
    const rev: Record<string, string> = {
      'Demo (1 Day)': 'demo1',
      'Demo (7 Days)': 'demo',
      '1 Month': '1',
      '3 Months': '3',
      '6 Months': '6',
      '12 Months': '12',
      'Lifetime': 'lifetime',
    };
    return rev[label] || 'demo';
  };

  // refs for modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-refresh session logic
  useEffect(() => {
    const refreshSession = async () => {
      // Use production URL if in production, otherwise relative path
      const refreshUrl = process.env.NODE_ENV === 'production' 
        ? 'https://smartdini-seven.vercel.app/api/auth/refresh' 
        : '/api/auth/refresh';
        
      try {
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          console.warn('Session refresh failed');
          // Removed auto-logout redirect as requested
        }
      } catch (err) {
        console.error('Error refreshing session:', err);
      }
    };

    // Refresh every 30 minutes
    const interval = setInterval(refreshSession, 1000 * 60 * 30);
    
    // Initial refresh on mount
    refreshSession();

    return () => clearInterval(interval);
  }, [router]);

  // Set default date on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Calculate end date when start date or plan changes
  useEffect(() => {
    if (!startDate) return;

    const date = new Date(startDate);
    
    if (plan === 'demo1') {
      date.setDate(date.getDate() + 1);
    } else if (plan === 'demo') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + parseInt(plan));
    }

    setEndDate(date.toISOString().split('T')[0]);
  }, [startDate, plan]);

  // Calculate edit end date when edit start date or edit plan changes
  useEffect(() => {
    if (!editStartDate) return;

    const date = new Date(editStartDate);
    
    if (editPlan === 'demo1') {
      date.setDate(date.getDate() + 1);
    } else if (editPlan === 'demo') {
      date.setDate(date.getDate() + 7);
    } else if (editPlan === 'lifetime') {
      date.setFullYear(date.getFullYear() + 100);
    } else {
      date.setMonth(date.getMonth() + parseInt(editPlan));
    }

    setEditEndDate(date.toISOString().split('T')[0]);
  }, [editStartDate, editPlan]);

  // Generate slug from cafe name
  const generateSlug = (name: string) => {
    const newSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    setSlug(newSlug);
  };

  // Handle cafe name change
  const handleCafeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCafeName(name);
    generateSlug(name);
  };

  // Handle form submission
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setSaving(true);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const planMap: Record<string, string> = {
      demo1: 'Demo (1 Day)',
      demo: 'Demo (7 Days)',
      '1': '1 Month',
      '3': '3 Months',
      '6': '6 Months',
      '12': '12 Months',
    };
    const payload = {
      cafeName,
      ownerName: (fd.get('ownerName') as string) || '',
      email: (fd.get('email') as string) || '',
      city: (fd.get('city') as string) || '',
      location: (fd.get('location') as string) || '',
      subscriptionPlan: planMap[plan] || 'Demo (7 Days)',
      contactNumber: (fd.get('contactNumber') as string) || '',
      startDate,
      endDate,
      username: (fd.get('username') as string) || '',
      password: (fd.get('password') as string) || '',
    };

    fetch('/api/cafes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to create cafe');
        }
        const createdSlug = data?.data?.slug || slug;
        const fallbackBase = typeof window !== 'undefined' ? window.location.origin : 'https://smartdini.com';
        setMenuLink(data.links?.menu || `${fallbackBase}/${createdSlug}/menu`);
        setAdminLink(data.links?.admin || `${fallbackBase}/${createdSlug}/admin`);
        setShowSuccess(true);
        
        // Show success toast
        toast({
          title: "✅ Cafe Added Successfully",
          description: `${cafeName} has been created with ${planMap[plan]} plan`,
          type: "success"
        });
        
        setTimeout(() => {
          document.getElementById('successMsg')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        // Refresh Manage tab data
        fetchCafes();
        
        // Reset form
        setCafeName('');
        setSlug('');
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
      })
      .catch((err) => {
        toast({
          title: "❌ Failed to create cafe",
          description: err.message || 'Unknown error',
          type: "error"
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  // Fetch cafes for Manage tab
  const fetchCafes = () => {
    // Show loading shimmer only if we have no data at all
    if (cafes.length === 0) {
      setLoading(true);
    }
    const params = new URLSearchParams();
    if (cityFilter && cityFilter !== 'All Cities') params.set('city', cityFilter);
    if (statusFilter === 'active' || statusFilter === 'inactive') params.set('status', statusFilter);
    if (debouncedSearch) params.set('search', debouncedSearch);
    const qs = params.toString() ? `?${params.toString()}` : '';
    fetch(`/api/cafes${qs}`, { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch cafes');
        const list = Array.isArray(data.data) ? data.data : [];
        setCafes(list);
        setStats(data.stats || null);
        
        // --- CACHE THE DATA ---
        try {
          window.sessionStorage.setItem('sd:admin:cafes', JSON.stringify(list));
          if (data.stats) window.sessionStorage.setItem('sd:admin:stats', JSON.stringify(data.stats));
        } catch {}

        if (cityFilter === 'All Cities') {
  // Extract cities, filter out null/undefined/empty values, and ensure they're strings
  const cities = list
    .map((c: any) => c.city)
    .filter((city: any) => city && typeof city === 'string' && city.trim() !== '')
    .map((city: string) => city.trim());
  
  // Get unique values
  const unique = Array.from(new Set(cities)).sort();
  
 
  setCityOptions(unique as string[]);
}
        setPage(1);
      })
      .catch(() => {
        setCafes([]);
        setStats({ total: 0, active: 0, inactive: 0 });
      })
      .finally(() => setLoading(false));
  };

  // Toggle status
  const toggleCafeStatus = (slugValue: string, isActive: boolean) => {
    fetch(`/api/cafes/${slugValue}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    })
      .then((res) => {
        fetchCafes();
        toast({
          title: isActive ? "✅ Cafe Activated" : "⏸️ Cafe Deactivated",
          description: `Status updated successfully`,
          type: "success"
        });
      })
      .catch(() => {
        toast({
          title: "❌ Failed to update status",
          description: "Please try again",
          type: "error"
        });
      });
  };

  // Load when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') fetchCafes();
  }, [activeTab]);

  // Refetch on filter change while in Manage tab
  useEffect(() => {
    if (activeTab === 'manage') fetchCafes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, statusFilter, debouncedSearch]);

  // Modal functions - Updated to include all fields including start date
  const openEditModal = (name: string, owner: string, city: string, email: string = '', location: string = '', currentPlan: string = '1', endDate: string = '', startDate: string = '', cafeSlug?: string, contactNumber: string = '', username: string = '') => {
    setEditName(name);
    setEditOwner(owner);
    setEditCity(city);
    setEditEmail(email);
    setEditLocation(location);
    setEditPlan(currentPlan);
    setEditEndDate(endDate);
    setEditContactNumber(contactNumber);
    setEditUsername(username);
    setEditStartDate(startDate || new Date().toISOString().split('T')[0]); // Set default if not provided
    if (cafeSlug) setEditSlug(cafeSlug);
    setShowModal(true);
  };

  const closeEditModal = () => {
    setShowModal(false);
  };

  const saveChanges = async () => {
    const btn = document.querySelector('.modal-footer .btn-primary') as HTMLButtonElement | null;
    if (btn) btn.innerHTML = 'Saving...';
    setSaving(true);
    try {
      const subscriptionPlan = planLabelFromCode(editPlan);
      const res = await fetch(`/api/cafes/${editSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cafeName: editName,
          ownerName: editOwner,
          city: editCity,
          email: editEmail,
          location: editLocation,
          subscriptionPlan,
          contactNumber: editContactNumber,
          username: editUsername,
          slug: editSlug,
          startDate: editStartDate,
          endDate: editEndDate,
        }),
      });
      if (res.status === 401) {
        router.push('/adminlogin');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update');
      }
      closeEditModal();
      fetchCafes();
      toast({
        title: "✅ Plan Extended Successfully",
        description: `${editName} now has ${subscriptionPlan} plan until ${new Date(editEndDate).toLocaleDateString()}`,
        type: "success"
      });
    } catch (e: any) {
      toast({
        title: "❌ Update Failed",
        description: e.message || 'Please try again',
        type: "error"
      });
    } finally {
      setSaving(false);
      if (btn) btn.innerHTML = 'Extend Plan';
    }
  };

  // Handle outside click for modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  if (!isInitialized) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="shimmer" style={{ width: 100, height: 20 }} />
      </div>
    );
  }

  return (
    <>
      <style>{toastStyles}</style>
      <div className="dashboard-container">
        {/* Toast Container */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
            width: '100%',
            pointerEvents: 'none',
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
                color: 'white',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                animation: 'slideIn 0.3s ease-out',
                position: 'relative',
                width: '100%',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ 
                fontWeight: 600, 
                fontSize: '1rem', 
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {toast.title}
              </div>
              {toast.description && (
                <div style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.9,
                  lineHeight: 1.5
                }}>
                  {toast.description}
                </div>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.7,
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Header */}
        <header>
          <div className="brand">
            <h2>Smart<span>dini</span></h2>
          </div>
          <div className="admin-profile">
            <span>Super Admin</span>
            <div className="admin-avatar">SA</div>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                } finally {
                  window.location.href = '/adminlogin';
                }
              }}
              className="btn-logout"
              aria-label="Logout"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Toggle Tabs */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} 
            onClick={() => handleTabChange('add')}
          >
            Add Cafes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} 
            onClick={() => handleTabChange('manage')}
          >
            Manage Cafes
          </button>
        </div>

        {/* 1. ADD CAFES SECTION */}
        <div id="section-add" className={`dashboard-section ${activeTab === 'add' ? 'active' : ''}`}>
          <div className="card">
            <form id="addCafeForm" onSubmit={handleCreateProfile}>
              <div className="form-grid">
                {/* Cafe Info */}
                <div className="form-group">
                  <label>Cafe Name</label>
                  <input 
                    type="text" 
                    id="cName" 
                    className="form-control" 
                    placeholder="e.g. Beans & Brews" 
                    value={cafeName}
                    onChange={handleCafeNameChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input name="ownerName" type="text" className="form-control" placeholder="Full Name" required />
                </div>
                {/* Added Email ID Field */}
                <div className="form-group">
                  <label>Email ID</label>
                  <input name="email" type="email" className="form-control" placeholder="owner@example.com" required />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input name="city" type="text" className="form-control" placeholder="e.g. New York" required />
                </div>
                <div className="form-group">
                  <label>Location (Full Address)</label>
                  <input name="location" type="text" className="form-control" placeholder="123 Street Name..." required />
                </div>

                {/* Subscription */}
                <div className="form-group">
                  <label>Subscription Plan</label>
                  <select 
                      id="subPlan" 
                      className="form-control" 
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      required
                    >
                      <option value="demo1">Demo (1 Day)</option>
                      <option value="demo">Demo (7 Days)</option>
                      <option value="1">1 Month</option>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                    </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    id="startDate" 
                    className="form-control" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    id="endDate" 
                    className="form-control" 
                    value={endDate}
                    readOnly 
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input name="contactNumber" type="text" className="form-control" placeholder="e.g. +91 98765 43210" required />
                </div>
                
                {/* Credentials */}
                <div className="form-group">
                  <label>Generated Slug (URL ID)</label>
                  <input 
                    type="text" 
                    id="cSlug" 
                    className="form-control" 
                    value={slug}
                    readOnly 
                    style={{ backgroundColor: '#eee', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="form-group">
                  <label>Cafe Username</label>
                  <input name="username" type="text" className="form-control" placeholder="Login Username" required />
                </div>
                <div className="form-group">
                  <label>Cafe Password</label>
                  <input name="password" type="text" className="form-control" placeholder="Login Password" required />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create New Profile'}
              </button>
            </form>

            {/* Success Message */}
            {showSuccess && (
              <div id="successMsg" className="success-box" style={{ display: 'block' }}>
                <h4><i className="fas fa-check-circle"></i> Cafe Profile Created Successfully!</h4>
                <div className="link-row">
                  <span>Menu Page:</span> <a href={menuLink} id="linkMenu" target="_blank" rel="noopener noreferrer">{menuLink}</a>
                </div>
                <div className="link-row">
                  <span>Admin Page:</span> <a href={adminLink} id="linkAdmin" target="_blank" rel="noopener noreferrer">{adminLink}</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. MANAGE CAFES SECTION */}
        <div id="section-manage" className={`dashboard-section ${activeTab === 'manage' ? 'active' : ''}`}>
          
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card total">
              <h3>{stats?.total ?? 0}</h3>
              <p>Total Cafes</p>
            </div>
            <div className="stat-card active">
              <h3>{stats?.active ?? 0}</h3>
              <p>Active Cafes</p>
            </div>
            <div className="stat-card inactive">
              <h3>{stats?.inactive ?? 0}</h3>
              <p>Inactive Cafes</p>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <input
              className="filter-select"
              placeholder="Search cafes, owner or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search cafes"
            />
            <select
              className="filter-select"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              aria-label="Filter by city"
            >
              <option>All Cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table - REDESIGNED FOR PROPER ALIGNMENT AND SCROLLING */}
          <div className="table-wrapper">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Cafe Name</th>
                    <th>Owner</th>
                    <th>Contact Number</th>
                    <th>City</th>
                    <th>Location</th>
                    <th>Plan</th>
                    <th>End Date</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                      <td><div className="cell-content shimmer" style={{height: 14}} /></td>
                    </tr>
                  ))}
                  {!loading && cafes.slice((page - 1) * pageSize, page * pageSize).map((cafe) => (
                    <tr key={cafe._id}>
                      <td><div className="cell-content">{cafe.cafeName}</div></td>
                      <td><div className="cell-content">{cafe.ownerName}</div></td>
                      <td><div className="cell-content">{cafe.contactNumber || '—'}</div></td>
                      <td><div className="cell-content">{cafe.city}</div></td>
                      <td><div className="cell-content">{cafe.location}</div></td>
                      <td><div className="cell-content">{cafe.subscriptionPlan}</div></td>
                      <td><div className="cell-content">{cafe.subscriptionPlan === 'Lifetime' ? 'Lifetime' : new Date(cafe.endDate).toISOString().split('T')[0]}</div></td>
                      <td><div className="cell-content">{cafe.username}</div></td>
                      <td>
                        <div className="status-wrapper">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!!cafe.isActive}
                              onChange={(e) => toggleCafeStatus(cafe.slug, e.target.checked)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="action-wrapper">
                          <button
                            className="btn-edit"
                            disabled={saving}
                            onClick={() =>
                              openEditModal(
                                cafe.cafeName,
                                cafe.ownerName,
                                cafe.city,
                                cafe.email || '',
                                cafe.location,
                              planCodeFromLabel(cafe.subscriptionPlan),
                                new Date(cafe.endDate).toISOString().split('T')[0],
                                new Date(cafe.startDate).toISOString().split('T')[0],
                                cafe.slug,
                                cafe.contactNumber || '',
                                cafe.username || ''
                              )
                            }
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-pencil">
                              <path d="M3 17.25V21h3.75L21 6.75 17.25 3 3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && cafes.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: 16, color: '#6b7280' }}>
                        No cafes found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  className="btn-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span className="page-info">
                  Page {page} of {Math.max(1, Math.ceil(cafes.length / pageSize))}
                </span>
                <button
                  className="btn-page"
                  onClick={() => setPage((p) => (p < Math.ceil(cafes.length / pageSize) ? p + 1 : p))}
                  disabled={page >= Math.ceil(cafes.length / pageSize)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT MODAL */}
        {showModal && (
          <div id="editModal" className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal" ref={modalRef}>
              <div className="modal-header">
                <h3>Extend Plan</h3>
                <button className="modal-close" onClick={closeEditModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="modal-form-grid">
                  {/* Row 1: Cafe Name and Owner Name */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cafe Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editOwner}
                        onChange={(e) => setEditOwner(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Email and City */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email ID</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Row 3: Location (full width) */}
                  <div className="form-row full-width">
                    <div className="form-group full-width">
                      <label>Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Full address"
                      />
                    </div>
                  </div>

                  {/* Row 4: Subscription Plan, Start Date, End Date */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Subscription Plan</label>
                      <select 
                        className="form-control" 
                        value={editPlan}
                        onChange={(e) => setEditPlan(e.target.value)}
                      >
                        <option value="demo1">Demo (1 Day)</option>
                        <option value="demo">Demo (7 Days)</option>
                        <option value="1">1 Month</option>
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="12">12 Months</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>New End Date (Auto-calculated)</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={editEndDate}
                        readOnly
                        style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editContactNumber}
                        onChange={(e) => setEditContactNumber(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label>Slug (URL ID - Changing this breaks QR codes)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/ /g, '-'))}
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeEditModal}>Cancel</button>
                <button className="btn-primary" onClick={saveChanges} disabled={saving}>{saving ? 'Saving...' : 'Extend Plan'}</button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          /* --- CSS VARIABLES & RESET --- */
          :root {
            --primary: #cb212d;
            --primary-hover: #b01c26;
            --primary-shadow: rgba(203, 33, 45, 0.35);
            --success: #22c55e;
            --success-shadow: rgba(34, 197, 94, 0.35);
            --warning: #ffc107;
            --dark: #2c3e50;
            --light-bg: #f4f7fc;
            --white: #ffffff;
            --text-gray: #6c757d;
            --border: #e2e8f0;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: var(--light-bg);
            color: var(--dark);
            font-family: 'Poppins', sans-serif;
          }

          /* --- HEADER --- */
          header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            background: var(--white);
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: var(--shadow);
          }

          .brand h2 { font-weight: 700; color: var(--dark); }
          .brand span { color: var(--primary); }
          .admin-profile { display: flex; align-items: center; gap: 10px; font-weight: 500; }
          .admin-avatar { width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .btn-logout { background: #fff; border: 1px solid var(--border); color: var(--dark); padding: 8px 12px; border-radius: 8px; cursor: pointer; }
          .btn-logout:hover { border-color: var(--primary); color: var(--primary); }

          /* --- TOGGLE TABS --- */
          .tab-container {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
            background: var(--white);
            padding: 10px;
            border-radius: 50px;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
            box-shadow: var(--shadow);
          }

          .tab-btn {
            padding: 12px 30px;
            border: none;
            background: transparent;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            border-radius: 40px;
            color: var(--text-gray);
            transition: all 0.3s ease;
          }

          .tab-btn.active {
            background-color: var(--primary);
            color: var(--white);
            box-shadow: 0 4px 15px rgba(203, 33, 45, 0.3);
          }

          /* --- SECTIONS COMMON --- */
          .dashboard-section { display: none; animation: fadeIn 0.4s ease; }
          .dashboard-section.active { display: block; }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* --- FORM STYLES (Add Cafe) --- */
          .card {
            background: var(--white);
            padding: 30px;
            border-radius: 16px;
            box-shadow: var(--shadow);
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }

          .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; color: var(--dark); }
          .form-control {
            width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; outline: none; transition: 0.3s;
            background: #fafafa;
          }
          .form-control:focus { border-color: var(--primary); background: #fff; }
          
          .btn-primary {
            background-color: var(--primary); color: white; border: none; padding: 14px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 20px; font-size: 1rem; transition: 0.3s;
          }
          .btn-primary:hover { background-color: var(--primary-hover); }
          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Success Message Area */
          .success-box {
            margin-top: 20px;
            padding: 20px;
            background: #e9f7ef;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            color: #155724;
            display: none;
          }
          .success-box h4 { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
          .link-row { margin-top: 5px; font-size: 0.9rem; }
          .link-row a { color: var(--primary); font-weight: 600; text-decoration: none; }
          .link-row span { font-weight: 600; color: #333; }

          /* --- MANAGE CAFES (Stats & Filters) --- */
          .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
          }
          .stat-card {
            background: var(--white);
            padding: 20px;
            border-radius: 12px;
            box-shadow: var(--shadow);
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .stat-card::after{
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 6px;
            background: var(--primary);
            box-shadow: 0 6px 10px -2px var(--primary-shadow);
          }
          .stat-card.active::after{
            background: var(--success);
            box-shadow: 0 6px 10px -2px var(--success-shadow);
          }
          .stat-card.inactive::after{
            background: var(--primary);
            box-shadow: 0 6px 10px -2px var(--primary-shadow);
          }
          .stat-card h3 { font-size: 2rem; color: var(--dark); margin-bottom: 5px; }
          .stat-card p { color: var(--text-gray); font-size: 0.9rem; font-weight: 500; }

          .filter-bar {
            display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;
          }
          .filter-select { padding: 10px; border-radius: 8px; border: 1px solid var(--border); min-width: 150px; }

          /* --- TABLE - REDESIGNED FOR PROPER ALIGNMENT AND SCROLLING --- */
          .table-wrapper {
            background: var(--white);
            border-radius: 12px;
            box-shadow: var(--shadow);
            overflow: hidden;
            width: 100%;
          }

          .table-scroll {
            overflow-x: auto;
            overflow-y: auto;
            max-height: 400px;
            scrollbar-width: thin;
            scrollbar-color: var(--primary) #f0f0f0;
            -ms-overflow-style: none;  /* Hide scrollbar for IE and Edge */
            scrollbar-width: none;  /* Hide scrollbar for Firefox */
          }

          /* Hide scrollbar for Chrome, Safari and Opera */
          .table-scroll::-webkit-scrollbar {
            display: none;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1200px;
            table-layout: auto;
          }

          thead {
            background: #f8f9fa;
            border-bottom: 2px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 10;
          }

          th {
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            color: var(--dark);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            background: #f8f9fa;
          }

          td {
            padding: 16px 12px;
            border-bottom: 1px solid var(--border);
            font-size: 0.9rem;
            color: #444;
            vertical-align: middle;
          }

          /* Cell content wrapper for consistent alignment */
          .cell-content {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* Status and action wrappers */
          .status-wrapper, .action-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }

          tr:hover {
            background-color: #fcfcfc;
          }

          tr:hover td {
            background-color: #fcfcfc;
          }

          /* Status Toggle Switch */
          .switch { 
            position: relative; 
            display: inline-block; 
            width: 40px; 
            height: 22px; 
            margin: 0;
          }
          
          .switch input { 
            opacity: 0; 
            width: 0; 
            height: 0; 
          }
          
          .slider { 
            position: absolute; 
            cursor: pointer; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background-color: #ccc; 
            transition: .4s; 
            border-radius: 34px; 
          }
          
          .slider:before { 
            position: absolute; 
            content: ""; 
            height: 16px; 
            width: 16px; 
            left: 3px; 
            bottom: 3px; 
            background-color: white; 
            transition: .4s; 
            border-radius: 50%; 
          }
          
          input:checked + .slider { 
            background-color: var(--success); 
          }
          
          input:checked + .slider:before { 
            transform: translateX(18px); 
          }

          .btn-edit { 
            background: #edf2f7; 
            color: #000; 
            border: none; 
            padding: 8px 12px; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-edit:hover { 
            background: #e2e8f0; 
            color: var(--primary); 
          }
          
          .btn-edit .icon-pencil { 
            width: 16px; 
            height: 16px; 
            fill: currentColor; 
            display: inline-block; 
          }

          /* Responsive table styles */
          @media (max-width: 768px) {
            .table-scroll {
              max-height: 350px;
            }
            
            th, td {
              padding: 12px 8px;
              font-size: 0.85rem;
            }
            
            .cell-content {
              max-width: 150px;
            }
          }

          /* --- MODAL (Popup) Styles --- */
          .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
            display: none; justify-content: center; align-items: center; z-index: 1000;
            padding: 20px;
          }
          .modal {
            background: var(--white); 
            width: 100%; 
            max-width: 800px; 
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            animation: modalSlideUp 0.3s ease;
            overflow: hidden;
          }

          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            color: white;
            border-bottom: none;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 600;
          }

          .modal-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            line-height: 1;
            padding: 0;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
          }

          .modal-body {
            padding: 24px;
            max-height: 70vh;
            overflow-y: auto;
          }

          .modal-form-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .form-row.full-width {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            width: 100%;
          }

          .modal .form-group {
            margin-bottom: 0;
          }

          .modal .form-group label {
            font-weight: 500;
            color: var(--dark);
            margin-bottom: 6px;
            font-size: 0.9rem;
          }

          .modal .form-control {
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 12px;
            width: 100%;
            transition: all 0.2s;
          }

          .modal .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(203, 33, 45, 0.1);
            outline: none;
          }

          .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 20px 24px;
            background: #f8f9fa;
            border-top: 1px solid var(--border);
          }

          .btn-cancel {
            background: white;
            color: var(--text-gray);
            border: 1px solid var(--border);
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-cancel:hover {
            background: #f1f1f1;
            border-color: #cbd5e0;
          }

          .modal-footer .btn-primary {
            width: auto;
            margin-top: 0;
            padding: 10px 28px;
            border-radius: 8px;
            font-weight: 500;
          }

          /* Responsive styles for modal */
          @media (max-width: 640px) {
            .form-row {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .modal {
              max-width: 95%;
            }
            
            .modal-body {
              padding: 20px;
            }
            
            .modal-footer {
              padding: 16px 20px;
              flex-direction: column-reverse;
            }
            
            .modal-footer .btn-primary,
            .btn-cancel {
              width: 100%;
            }
          }

          .pagination {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 12px;
            padding: 12px 16px;
          }
          .btn-page {
            padding: 8px 12px;
            border: 1px solid var(--border);
            background: #fff;
            border-radius: 8px;
            cursor: pointer;
          }
          .btn-page:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .page-info {
            color: var(--text-gray);
            font-size: 0.9rem;
          }
          .btn-edit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .shimmer {
            position: relative;
            background: #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
          }
          .shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150px;
            height: 100%;
            width: 150px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: shimmer 1.2s infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(0); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    </>
  );
}