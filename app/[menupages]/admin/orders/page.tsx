"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Clock, Armchair, CheckCircle, Wallet, Smartphone, Loader2, ChevronDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───
type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type PaymentMethod = "cash" | "upi";
type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
};

// Helper to get payment method badge styles
const getPaymentBadge = (method: PaymentMethod) => {
  if (method === "upi") {
    return {
      icon: Smartphone,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      label: "UPI"
    };
  } else {
    return {
      icon: Wallet,
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      label: "Cash"
    };
  }
};

// ─── Component for Individual Card ───
function OrderCard({ 
  order, 
  onMarkAsServed,
  onMoveToPayment,
  isUpdating
}: { 
  order: Order; 
  onMarkAsServed?: (orderId: string) => void;
  onMoveToPayment?: (orderId: string) => void;
  isUpdating?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPreparing = order.orderStatus === "preparing" || order.orderStatus === "ready";
  const paymentBadge = getPaymentBadge(order.paymentMethod);
  const PaymentIcon = paymentBadge.icon;
  
  const showExpandButton = order.items.length > 3;
  const visibleItems = showExpandButton && !expanded ? order.items.slice(0, 2) : order.items;
  const remainingCount = order.items.length - 2;

  const handleMarkAsServed = () => {
    if (onMarkAsServed) {
      onMarkAsServed(order._id);
    }
  };

  const handleMoveToPayment = () => {
    if (onMoveToPayment) {
      onMoveToPayment(order._id);
    }
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-[#F3F4F6] rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 w-full xs:w-auto">
          {/* Icon Circle */}
          <div className="w-10 h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-[#D92632]" strokeWidth={2} />
          </div>
          
          {/* Text Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                Order #{order.orderNumber}
              </h4>
              
              {/* Payment Method Badge - Beside ID */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${paymentBadge.bgColor} ${paymentBadge.textColor} text-[10px] font-bold whitespace-nowrap`}>
                <PaymentIcon size={10} strokeWidth={2.5} />
                <span>{paymentBadge.label}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatTime(order.createdAt)}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Armchair size={12} />
                <span>{order.tableNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between xs:justify-end gap-3 w-full xs:w-auto mt-2 xs:mt-0">
          <span className="font-extrabold text-gray-900 text-sm sm:text-base">
            ₹{order.total.toFixed(2)}
          </span>
          
          {isPreparing ? (
            /* Mark as Served Button - for preparing orders */
            <button
              onClick={handleMarkAsServed}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#10B981] text-white rounded-lg text-[10px] sm:text-xs font-bold hover:bg-[#059669] transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              <CheckCircle size={12} />
              <span>Mark as Served</span>
            </button>
          ) : (
            /* Check Icon - for served orders */
            <button
              onClick={handleMoveToPayment}
              disabled={isUpdating}
              className="p-1.5 sm:p-1.5 bg-[#10B981] text-white rounded-full hover:bg-[#059669] transition-colors shadow-sm disabled:opacity-50"
              title="Move to Payment Completed"
            >
              <CheckCircle size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 sm:space-y-2">
        {visibleItems.map((item, idx) => (
          <div
            key={`${order._id}-${idx}`}
            className="bg-white rounded-xl px-3 py-2 sm:py-2.5 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-5 h-5 rounded bg-[#FEE2E2] text-[#D92632] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {item.quantity}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap ml-2">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        
        {showExpandButton && !expanded && remainingCount > 0 && (
          <div className="text-[10px] sm:text-xs text-gray-400 italic px-1">
            +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Expand/Collapse Toggle */}
      {showExpandButton && (
        <div className="mt-3 pt-3 border-t border-gray-200/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] sm:text-xs font-bold text-[#D92632] hover:bg-[#FEE2E2]/30 rounded-lg transition-colors"
          >
            <span>{expanded ? 'Show Less' : 'View Details'}</span>
            <ChevronDown size={14} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ───
export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.menupages as string;
  const { toast } = useToast();
  
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [servedOrders, setServedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"pending" | "served">("pending");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!slug) return;
    try {
      // Fetch both preparing/ready and served orders - only those that haven't paid yet
      const [preparingRes, servedRes] = await Promise.all([
        fetch(`/api/orders/${slug}?status=preparing,ready&paymentStatus=pending`),
        fetch(`/api/orders/${slug}?status=served&paymentStatus=pending`)
      ]);
      
      const preparingData = await preparingRes.json();
      const servedData = await servedRes.json();
      
      if (preparingData.success) setPendingOrders(preparingData.data || []);
      if (servedData.success) setServedOrders(servedData.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOrders();
    // Poll for active orders every 15 seconds
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleMarkAsServed = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "served" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Order Served",
          description: `Order #${pendingOrders.find(o => o._id === orderId)?.orderNumber} marked as served.`,
        });
        // Move order locally
        const orderToMove = pendingOrders.find(o => o._id === orderId);
        if (orderToMove) {
          setPendingOrders(prev => prev.filter(o => o._id !== orderId));
          setServedOrders(prev => [{ ...orderToMove, orderStatus: "served" }, ...prev]);
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "completed" }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Payment Completed",
          description: `Order #${servedOrders.find(o => o._id === orderId)?.orderNumber} moved to payment completed.`,
        });
        // Remove order locally
        setServedOrders(prev => prev.filter(o => o._id !== orderId));
      } else {
        throw new Error(data.message || "Failed to update payment status");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && pendingOrders.length === 0 && servedOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={48} className="mb-4 animate-spin opacity-20" />
        <p className="text-sm font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full overflow-x-hidden">
      
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Orders Management
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
        
        {/* Summary Badges - Clickable on Mobile */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileView("served")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              mobileView === "served" && isMobile
                ? 'bg-[#059669] text-white' 
                : 'bg-[#D1FAE5] text-[#059669]'
            }`}
          >
            <CheckCircle size={16} />
            <span>{servedOrders.length} Served</span>
          </button>
          <button
            onClick={() => setMobileView("pending")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              mobileView === "pending" && isMobile
                ? 'bg-[#EF4444] text-white' 
                : 'bg-[#FFEDD5] text-[#EF4444]'
            }`}
          >
            <Clock size={16} />
            <span>{pendingOrders.length} Preparing</span>
          </button>
        </div>
      </div>

      {/* ─── Mobile View (Single Column) ─── */}
      <div className="block lg:hidden">
        {mobileView === "pending" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-[#EF4444]" />
              <h3 className="font-bold text-base text-gray-900">Preparing Orders</h3>
            </div>
            <div className="flex flex-col">
              {pendingOrders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onMarkAsServed={handleMarkAsServed}
                  isUpdating={updatingId === order._id}
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders in preparation</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-[#059669]" />
              <h3 className="font-bold text-base text-gray-900">Served Orders</h3>
            </div>
            <div className="flex flex-col">
              {servedOrders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onMoveToPayment={handleMoveToPayment}
                  isUpdating={updatingId === order._id}
                />
              ))}
              {servedOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No served orders</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Desktop View (Two Column Layout) ─── */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        
        {/* Column 1: Pending */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-[#EF4444]" />
            <h3 className="font-bold text-base text-gray-900">Preparing Orders</h3>
          </div>
          <div className="flex flex-col">
            {pendingOrders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onMarkAsServed={handleMarkAsServed}
                isUpdating={updatingId === order._id}
              />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No orders in preparation</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Served */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-[#059669]" />
            <h3 className="font-bold text-base text-gray-900">Served Orders</h3>
          </div>
          <div className="flex flex-col">
            {servedOrders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order} 
                onMoveToPayment={handleMoveToPayment}
                isUpdating={updatingId === order._id}
              />
            ))}
            {servedOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No served orders</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}