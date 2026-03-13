"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Package, Clock, Armchair, Check, X, Wallet, Smartphone, Loader2, ChevronDown } from "lucide-react";
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
type PaymentStatus = "pending" | "completed" | "failed";

type Order = {
  _id: string;
  orderNumber: number;
  createdAt: string;
  tableNumber: string;
  total: number;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  upiId?: string;
};

export default function NewOrdersPage() {
  const params = useParams();
  const slug = params?.menupages as string;
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const fetchOrders = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/orders/${slug}?status=pending`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch orders",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds (Industry standard for kitchen)
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${slug}?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: `Order ${newStatus === 'preparing' ? 'Accepted' : 'Rejected'}`,
          description: `Order #${orders.find(o => o._id === orderId)?.orderNumber} has been ${newStatus === 'preparing' ? 'accepted and moved to preparing' : 'cancelled'}.`,
        });
        // Optimistic update
        setOrders(prev => prev.filter(o => o._id !== orderId));
        
        // Dispatch global event to refresh sidebar stats
        window.dispatchEvent(new Event('refresh-admin-stats'));
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Helper to format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const hours = Math.floor(diffMins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
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

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 size={48} className="mb-4 animate-spin opacity-20" />
        <p className="text-sm font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full overflow-x-hidden">
      {/* ─── Page Title ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            New Orders
          </h2>
          {loading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>
        <span className="text-xs sm:text-sm bg-[#FEE2E2] text-[#D92632] px-3 py-1 rounded-full font-semibold whitespace-nowrap">
          {orders.length} New
        </span>
      </div>

      {/* ─── Orders List ─── */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No new orders at the moment</p>
          </div>
        )}

        {orders.map((order) => {
          const paymentBadge = getPaymentBadge(order.paymentMethod);
          const PaymentIcon = paymentBadge.icon;
          const isUpdating = updating === order._id;
          
          const isExpanded = !!expandedOrders[order._id];
          const showExpandButton = order.items.length > 3;
          const visibleItems = showExpandButton && !isExpanded ? order.items.slice(0, 2) : order.items;
          const remainingCount = order.items.length - 2;

          return (
            <div
              key={order._id}
              className={`bg-[#F3F4F6] rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all ${isUpdating ? 'opacity-60 pointer-events-none' : ''}`}
            >
              {/* ─── Order Header ─── */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                
                {/* Left: Icon & Meta */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  {/* Icon Circle */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-[#D92632]" strokeWidth={2} />
                  </div>
                  
                  {/* Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                      <h3 className="text-gray-900 font-bold text-sm sm:text-lg truncate">
                        New Order #{order.orderNumber}
                      </h3>
                      
                      {/* Payment Method Badge */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${paymentBadge.bgColor} ${paymentBadge.textColor} text-[10px] sm:text-xs font-bold whitespace-nowrap`}>
                        <PaymentIcon size={10} strokeWidth={2.5} />
                        <span>{paymentBadge.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">
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

                {/* Right: Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 border-t lg:border-t-0 border-gray-200 pt-3 lg:pt-0">
                  <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                    ₹{order.total.toFixed(2)}
                  </span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Accept Button */}
                    <button
                      onClick={() => handleUpdateStatus(order._id, "preparing")}
                      disabled={isUpdating}
                      className="flex items-center gap-0.5 sm:gap-1.5 bg-[#10B981] hover:bg-[#059669] text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Check size={12} strokeWidth={3} />
                      <span className="sm:inline">Accept</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      onClick={() => handleUpdateStatus(order._id, "cancelled")}
                      disabled={isUpdating}
                      className="flex items-center gap-0.5 sm:gap-1.5 bg-white border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      <X size={12} strokeWidth={3} />
                      <span className="sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Order Items (White Cards) ─── */}
              <div className="space-y-1.5 sm:space-y-2">
                {visibleItems.map((item, index) => (
                  <div
                    key={`${order._id}-${item.menuItemId}-${index}`}
                    className="bg-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {/* Pink Badge Quantity */}
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#FEE2E2] text-[#D92632] text-[10px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0">
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
                
                {showExpandButton && !isExpanded && remainingCount > 0 && (
                  <div className="text-[10px] sm:text-xs text-gray-400 italic px-1">
                    +{remainingCount} more item{remainingCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* ─── Expand/Collapse Toggle ─── */}
              {showExpandButton && (
                <div className="mt-4 pt-3 border-t border-gray-200/50">
                  <button
                    onClick={() => setExpandedOrders(prev => ({ ...prev, [order._id]: !isExpanded }))}
                    className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] sm:text-xs font-bold text-[#D92632] hover:bg-[#FEE2E2]/30 rounded-lg transition-colors"
                  >
                    <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
                    <ChevronDown size={14} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}