"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import './styles.css';

// Custom toast hook with professional styling
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string; title: string; description?: string; type?: 'success' | 'error' | 'info'}>>([]);

  const toast = ({ title, description, type = 'success' }: { title: string; description?: string; type?: 'success' | 'error' | 'info' }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    // Auto dismiss after 8 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, toast, dismiss };
};

interface Cafe {
  _id: string;
  cafeName: string;
  ownerName: string;
  email?: string;
  city: string;
  location: string;
  subscriptionPlan: string;
  contactNumber?: string;
  startDate: string;
  endDate: string;
  username: string;
  slug: string;
  isActive: boolean;
}

// Toast Components
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ToastViewport = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 2147483647,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
        maxWidth: 360,
        width: 'auto',
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {children}
    </div>
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
        padding: '14px 20px 14px 18px',
        borderRadius: 10,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
        animation: 'slideIn 0.25s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        minWidth: 260,
        maxWidth: 360,
        marginBottom: 0,
        pointerEvents: 'auto',
        fontFamily: 'Poppins, sans-serif',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      role="status"
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

export default function SuperAdmin() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
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
    // Auto dismiss after 8 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Dynamic data for Manage tab
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

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

  //refs for modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING WITH SWR ---
  const paramsStr = new URLSearchParams();
  if (cityFilter && cityFilter !== 'All Cities') paramsStr.set('city', cityFilter);
  if (statusFilter === 'active' || statusFilter === 'inactive') paramsStr.set('status', statusFilter);
  if (debouncedSearch) paramsStr.set('search', debouncedSearch);
  const cafesUrl = activeTab === 'manage' ? `/api/cafes?${paramsStr.toString()}` : null;

  const { data: swrData, isLoading: loading, error } = useSWR(cafesUrl, {
     revalidateOnFocus: true,
     onSuccess: (data) => {
       if (data.success && data.data && cityFilter === 'All Cities') {
         const cities = data.data
           .map((c: Cafe) => c.city)
           .filter((city: string) => city && typeof city === 'string' && city.trim() !== '')
           .map((city: string) => city.trim());
         const unique = Array.from(new Set(cities)).sort();
         setCityOptions(unique as string[]);
       }
     }
   });

   const cafes: Cafe[] = swrData?.success ? swrData.data : [];
  const stats = swrData?.stats || { total: 0, active: 0, inactive: 0 };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "❌ Failed to fetch cafes",
        description: error.message || "Please check your connection",
        type: "error"
      });
    }
  }, [error]);

  // Auto-refresh session logic
  useEffect(() => {
    const refreshSession = async () => {
      // Use relative path which works on both localhost and production
      const refreshUrl = '/api/auth/refresh';
        
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

        // Refresh Manage tab data if it exists
        if (cafesUrl) mutate(cafesUrl);
        
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

  // Toggle status
  const toggleCafeStatus = (slugValue: string, isActive: boolean) => {
    fetch(`/api/cafes/${slugValue}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    })
      .then((res) => {
        if (cafesUrl) mutate(cafesUrl);
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
      if (cafesUrl) mutate(cafesUrl);
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

  if (!isClient) {
    return null;
  }

  return (
    <>
      <ToastProvider>
        <ToastViewport>
          {toasts.map(({ id, title, description, type }) => (
            <Toast key={id} type={type} onOpenChange={(open) => !open && dismissToast(id)}>
              <ToastTitle>{title}</ToastTitle>
              {description && <ToastDescription>{description}</ToastDescription>}
              <ToastClose onClick={() => dismissToast(id)} />
            </Toast>
          ))}
        </ToastViewport>
      </ToastProvider>

      <div className="dashboard-container">
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
            onClick={() => setActiveTab('add')}
          >
            Add Cafes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`} 
            onClick={() => setActiveTab('manage')}
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
              {cityOptions.map((city: string) => (
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
                  {loading && Array.from({ length: 10 }).map((_: any, i: number) => (
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
                  {!loading && cafes.slice((page - 1) * pageSize, page * pageSize).map((cafe: Cafe) => {
                    const isExpired = cafe.subscriptionPlan !== 'Lifetime' && new Date(cafe.endDate) < new Date();
                    return (
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
                          <label className="switch" title={isExpired ? "Subscription expired. Extend plan to reactivate." : ""}>
                            <input
                              type="checkbox"
                              checked={!!cafe.isActive && !isExpired}
                              onChange={(e) => toggleCafeStatus(cafe.slug, e.target.checked)}
                              disabled={isExpired}
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
                    );
                  })}
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
      </div>
    </>
  );
}