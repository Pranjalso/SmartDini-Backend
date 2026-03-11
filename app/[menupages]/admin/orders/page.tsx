"use client";

import { useState, useEffect } from "react";
import { Package, Clock, Armchair, CheckCircle, Wallet, Smartphone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ───
type OrderItem = {
  id: number; // The quantity badge number (1, 2, 4)
  name: string;
  price: number;
};

type PaymentMethod = "cash" | "upi";

type Order = {
  id: string;
  number: number;
  time: string;
  table: string;
  total: number;
  status: "pending" | "served";
  paymentMethod: PaymentMethod;
  items: OrderItem[];
};

// ─── Data ───
const PENDING_ORDERS: Order[] = [
  {
    id: "6", number: 6, time: "10:30 PM", table: "Table 001", total: 497, status: "pending", paymentMethod: "upi",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "5", number: 5, time: "10:30 PM", table: "Table 001", total: 497, status: "pending", paymentMethod: "cash",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "4", number: 4, time: "10:30 PM", table: "Table 001", total: 497, status: "pending", paymentMethod: "upi",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
];

const SERVED_ORDERS: Order[] = [
  {
    id: "3", number: 3, time: "10:30 PM", table: "Table 001", total: 497, status: "served", paymentMethod: "cash",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "2", number: 2, time: "10:30 PM", table: "Table 001", total: 497, status: "served", paymentMethod: "upi",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "1", number: 1, time: "10:30 PM", table: "Table 001", total: 497, status: "served", paymentMethod: "cash",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
];

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
  onMoveToPayment
}: { 
  order: Order; 
  onMarkAsServed?: (orderId: string) => void;
  onMoveToPayment?: (orderId: string) => void;
}) {
  const isPending = order.status === "pending";
  const paymentBadge = getPaymentBadge(order.paymentMethod);
  const PaymentIcon = paymentBadge.icon;

  const handleMarkAsServed = () => {
    if (onMarkAsServed) {
      onMarkAsServed(order.id);
    }
  };

  const handleMoveToPayment = () => {
    if (onMoveToPayment) {
      onMoveToPayment(order.id);
    }
  };

  return (
    <div className="bg-[#F3F4F6] rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
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
                Order #{order.number}
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
                <span>{order.time}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <Armchair size={12} />
                <span>{order.table}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex items-center justify-between xs:justify-end gap-3 w-full xs:w-auto mt-2 xs:mt-0">
          <span className="font-extrabold text-gray-900 text-sm sm:text-base">
            ₹{order.total}
          </span>
          
          {isPending ? (
            /* Mark as Served Button - for pending orders */
            <button
              onClick={handleMarkAsServed}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-[#10B981] text-white rounded-lg text-[10px] sm:text-xs font-bold hover:bg-[#059669] transition-colors shadow-sm whitespace-nowrap"
            >
              <CheckCircle size={12} />
              <span>Mark as Served</span>
            </button>
          ) : (
            /* Check Icon - for served orders */
            <button
              onClick={handleMoveToPayment}
              className="p-1.5 sm:p-1.5 bg-[#10B981] text-white rounded-full hover:bg-[#059669] transition-colors shadow-sm"
              title="Move to Payment Completed"
            >
              <CheckCircle size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1.5 sm:space-y-2">
        {order.items.map((item, idx) => (
          <div
            key={`${order.id}-${idx}`}
            className="bg-white rounded-xl px-3 py-2 sm:py-2.5 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="w-5 h-5 rounded bg-[#FEE2E2] text-[#D92632] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {item.id}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {item.name}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap ml-2">
              ₹{item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ───
export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const menupages = params?.menupages as string;
  
  const [pendingOrders, setPendingOrders] = useState(PENDING_ORDERS);
  const [servedOrders, setServedOrders] = useState(SERVED_ORDERS);
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

  const handleMarkAsServed = (orderId: string) => {
    // Find the order in pending orders
    const orderToMove = pendingOrders.find(order => order.id === orderId);
    
    if (orderToMove) {
      // Update the order status to served
      const updatedOrder = { ...orderToMove, status: "served" as const };
      
      // Remove from pending and add to served
      setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
      setServedOrders([updatedOrder, ...servedOrders]);
    }
  };

  const handleMoveToPayment = (orderId: string) => {
    // Find the order in served orders
    const orderToMove = servedOrders.find(order => order.id === orderId);
    
    if (orderToMove) {
      // Remove from served orders
      setServedOrders(servedOrders.filter(order => order.id !== orderId));
      
      // Store the order in sessionStorage to retrieve on payment-completed page
      sessionStorage.setItem('completedOrder', JSON.stringify(orderToMove));
      
      // Navigate to payment completed page with the correct dynamic route
      router.push(`/${menupages}/admin/payment-completed?orderId=${orderId}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full overflow-x-hidden">
      
      {/* ─── Top Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
          Orders Management
        </h2>
        
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
            <span>{pendingOrders.length} Pending</span>
          </button>
        </div>
      </div>

      {/* ─── Mobile View (Single Column) ─── */}
      <div className="block lg:hidden">
        {mobileView === "pending" ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-[#EF4444]" />
              <h3 className="font-bold text-base text-gray-900">Pending Orders</h3>
            </div>
            <div className="flex flex-col">
              {pendingOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onMarkAsServed={handleMarkAsServed}
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pending orders</p>
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
                  key={order.id} 
                  order={order} 
                  onMoveToPayment={handleMoveToPayment}
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
            <h3 className="font-bold text-base text-gray-900">Pending Orders</h3>
          </div>
          <div className="flex flex-col">
            {pendingOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onMarkAsServed={handleMarkAsServed}
              />
            ))}
            {pendingOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-[#F9FAFB] rounded-2xl">
                <Package size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending orders</p>
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
                key={order.id} 
                order={order} 
                onMoveToPayment={handleMoveToPayment}
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