"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Package, Clock, Armchair, Wallet, CreditCard, IndianRupee, ChevronDown, Search, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useSWR, { mutate } from "swr";

// ─── Types ───
type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type PaymentMethod = "cash" | "upi";

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  items: OrderItem[];
};

// ─── Get today's date in YYYY-MM-DD format ───
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Date filter options
type DateFilterOption = "today" | "yesterday" | "7d" | "30d";

// ─── Component for Individual Order Card ───
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const showExpandButton = order.items.length > 3;
  const remainingItems = order.items.length - 2;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className="flex items-start gap-2 sm:gap-3 w-full">
          {/* Icon Circle */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
            <Package size={14} className="text-[#D92632]" strokeWidth={2} />
          </div>
          
          {/* Order Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 text-xs sm:text-base truncate max-w-[120px] sm:max-w-full">
                Order #{order.orderNumber}
              </h4>
              <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[8px] sm:text-[10px] font-bold whitespace-nowrap">
                {order.paymentStatus}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500 font-medium mt-0.5 sm:mt-1 whitespace-nowrap">
              <Clock size={10} className="flex-shrink-0" />
              <span className="flex-shrink-0">{formatTime(order.createdAt)}</span>
              <span className="text-gray-300 flex-shrink-0">•</span>
              <span className="flex-shrink-0">{formatDate(order.createdAt)}</span>
              <span className="text-gray-300 flex-shrink-0">•</span>
              <Armchair size={10} className="flex-shrink-0" />
              <span className="flex-shrink-0 truncate max-w-[70px] sm:max-w-full">{order.tableNumber}</span>
            </div>
          </div>

          {/* Payment Method Badge & Total */}
          <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
            <div className={`
              flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-md text-[8px] sm:text-xs font-bold whitespace-nowrap
              ${order.paymentMethod === 'upi'
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-amber-100 text-amber-700'}
            `}>
              {order.paymentMethod === 'upi' ? (
                <CreditCard size={10} />
              ) : (
                <Wallet size={10} />
              )}
              {order.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
            </div>
            <span className="font-extrabold text-gray-900 text-xs sm:text-lg">
              ₹{order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-white rounded-md sm:rounded-xl p-2 sm:p-3 mb-1 sm:mb-2">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-semibold text-gray-500">
            {order.items.length} items · {totalQuantity} quantity
          </span>
          {showExpandButton && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-[9px] sm:text-xs font-medium text-[#D92632] hover:underline flex items-center gap-0.5 sm:gap-1"
            >
              {expanded ? 'Show less' : 'View details'}
              <ChevronDown size={10} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        {/* Collapsible Items List */}
        <div className={`space-y-1 overflow-hidden transition-all ${(!showExpandButton || expanded) ? 'max-h-96' : 'max-h-12 sm:max-h-14'}`}>
          {(!showExpandButton || expanded) ? (
            // Full detailed view (or all items if 3 or less)
            order.items.map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] sm:text-xs py-0.5 sm:py-1 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-[#FEE2E2] text-[#D92632] text-[7px] sm:text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {item.quantity}
                  </span>
                  <span className="font-medium text-gray-800 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-600 whitespace-nowrap ml-1 sm:ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            // Compact view - first 2 items
            <>
              {order.items.slice(0, 2).map((item: any, idx) => (
                <div key={idx} className="flex items-center justify-between text-[8px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#FEE2E2] text-[#D92632] text-[6px] sm:text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-gray-600 whitespace-nowrap ml-1">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {remainingItems > 0 && (
                <div className="text-[9px] sm:text-xs text-gray-400 italic mt-0.5">
                  +{remainingItems} more item{remainingItems > 1 ? 's' : ''}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Skeleton Loader ───
const OrdersSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#F3F4F6] rounded-2xl p-4 mb-4 shadow-sm h-32">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page Component ───
export default function PaymentCompletedPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate the URL based on filters
  const getOrdersUrl = () => {
    if (!slug) return null;
    let url = `/api/orders/${slug}?paymentStatus=completed`;
    
    const today = getTodayDateString();
    if (selectedDate !== today) {
      url += `&date=${selectedDate}`;
    } else {
      const date = new Date();
      if (dateFilter === "yesterday") {
        date.setDate(date.getDate() - 1);
        url += `&date=${date.toISOString().split('T')[0]}`;
      } else if (dateFilter === "7d") {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        url += `&startDate=${start.toISOString()}&endDate=${new Date().toISOString()}`;
      } else if (dateFilter === "30d") {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        url += `&startDate=${start.toISOString()}&endDate=${new Date().toISOString()}`;
      } else {
        url += `&date=${today}`;
      }
    }
    return url;
  };

  const ordersUrl = getOrdersUrl();
  const { data, isLoading: swrLoading } = useSWR(ordersUrl, (url: string) => fetch(url).then(res => res.json()), {
    refreshInterval: 60000, // Poll every 60s
    revalidateOnFocus: true,
  });

  const orders = data?.success ? (data.data as Order[]) : [];
  const loading = swrLoading;

  // Handle order transition if orderIdParam is present
  useEffect(() => {
    const markAsPaid = async () => {
      if (orderIdParam && slug) {
        try {
          const res = await fetch(`/api/orders/${slug}?id=${orderIdParam}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "completed" }),
          });
          const data = await res.json();
          if (data.success) {
            toast({
              title: "Payment Confirmed",
              description: `Order #${data.data.orderNumber} marked as completed.`,
            });
            // Re-fetch orders
            mutate(ordersUrl);
          }
        } catch (err) {
          console.error("Failed to mark order as paid:", err);
        }
      }
    };
    markAsPaid();
  }, [orderIdParam, slug, ordersUrl, toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date picker change
  const handleDatePickerChange = (date: string) => {
    setSelectedDate(date);
    setDateFilter("today");
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    return searchTerm === "" || 
      order.orderNumber.toString().includes(searchTerm) ||
      order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate revenue statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const cashPayments = filteredOrders
    .filter(order => order.paymentMethod === 'cash')
    .reduce((sum, order) => sum + order.total, 0);
  const upiPayments = filteredOrders
    .filter(order => order.paymentMethod === 'upi')
    .reduce((sum, order) => sum + order.total, 0);

  // Get display text for date filter
  const getDateFilterDisplay = () => {
    const today = getTodayDateString();
    if (selectedDate !== today) {
      return new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    switch (dateFilter) {
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "7d": return "Last 7 Days";
      case "30d": return "Last 30 Days";
      default: return "Today";
    }
  };

  const handleDateFilterSelect = (option: DateFilterOption) => {
    setDateFilter(option);
    setShowDropdown(false);
    setSelectedDate(getTodayDateString());
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full overflow-x-hidden">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Payment Completed
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
        
        {/* Filter Section - Date Picker + Dropdown in same row */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Date Picker */}
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-gray-500" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDatePickerChange(e.target.value)}
              max={getTodayDateString()}
              className="w-full sm:w-[150px] lg:w-[160px] pl-8 sm:pl-10 pr-2 py-1.5 sm:py-2 bg-[#F9FAFB] border border-gray-200 rounded-md text-[10px] sm:text-xs focus:outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632]"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] lg:w-[150px] flex items-center gap-1 bg-[#FFEFEF] text-[#D92632] px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-[10px] sm:text-xs font-bold border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors justify-between"
            >
              <span className="truncate">{getDateFilterDisplay()}</span>
              <ChevronDown size={12} strokeWidth={3} className={`flex-shrink-0 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-36 sm:w-40 lg:w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="py-0.5 sm:py-1">
                  <button
                    onClick={() => handleDateFilterSelect("today")}
                    className={`w-full text-left px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#FFEFEF] transition-colors ${dateFilter === 'today' && selectedDate === getTodayDateString() ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'}`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateFilterSelect("yesterday")}
                    className={`w-full text-left px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#FFEFEF] transition-colors ${dateFilter === 'yesterday' ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'}`}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleDateFilterSelect("7d")}
                    className={`w-full text-left px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#FFEFEF] transition-colors ${dateFilter === '7d' ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'}`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleDateFilterSelect("30d")}
                    className={`w-full text-left px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#FFEFEF] transition-colors ${dateFilter === '30d' ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'}`}
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Revenue Stats Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-[#D92632] to-[#B71C1C] rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium opacity-90">Total Revenue</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <IndianRupee size={16} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs opacity-75 mt-0.5 sm:mt-1">from {filteredOrders.length} completed orders</p>
        </div>

        {/* Cash Payments */}
        <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Cash Payment</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Wallet size={16} className="text-amber-600" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900">₹{cashPayments.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
            {filteredOrders.filter(o => o.paymentMethod === 'cash').length} cash orders
          </p>
        </div>

        {/* UPI Payments */}
        <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">UPI Payment</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard size={16} className="text-purple-600" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900">₹{upiPayments.toFixed(2)}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
            {filteredOrders.filter(o => o.paymentMethod === 'upi').length} UPI orders
          </p>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order # or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-[#F9FAFB] border border-gray-200 rounded-md sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] transition-all"
          />
        </div>
      </div>

      {/* ─── Orders List ─── */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="font-bold text-base sm:text-lg text-gray-900">
            Successful Orders
          </h3>
          <span className="text-[10px] sm:text-sm text-gray-500">
            {filteredOrders.length} orders
          </span>
        </div>

        {loading && filteredOrders.length === 0 ? (
          <OrdersSkeleton />
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-400 bg-[#F9FAFB] rounded-xl sm:rounded-2xl">
            <Package size={32} className="mb-2 sm:mb-4 opacity-20" />
            <p className="text-xs sm:text-sm font-medium">No completed orders found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
