"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Clock, Armchair, Wallet, CreditCard, IndianRupee, ChevronDown, Search, Calendar } from "lucide-react";

// ─── Types ───
type OrderItem = {
  id: number;
  name: string;
  price: number;
};

type PaymentMethod = "cash" | "upi";

type Order = {
  id: string;
  orderNumber: number;
  time: string;
  date: string;
  table: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "completed" | "failed" | "refunded";
  items: OrderItem[];
};

// ─── Get today's date in YYYY-MM-DD format ───
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const TODAY = getTodayDateString();
const YESTERDAY = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
})();

// ─── Enhanced Seed Data with 15+ orders for today ───
const COMPLETED_ORDERS: Order[] = [
  // TODAY'S ORDERS - 15+ orders for today
  {
    id: "ORD001",
    orderNumber: 1245,
    time: "09:45 PM",
    date: TODAY,
    table: "Table 008",
    total: 1247,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "French Fries", price: 149 },
      { id: 3, name: "Cold Coffee", price: 119 },
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 4, name: "Brownie", price: 149 },
      { id: 1, name: "Cold Coffee", price: 119 },
      { id: 4, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "ORD002",
    orderNumber: 1244,
    time: "09:30 PM",
    date: TODAY,
    table: "Table 003",
    total: 895,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Margherita Pizza", price: 299 },
      { id: 2, name: "Garlic Bread", price: 149 },
      { id: 3, name: "Pasta Alfredo", price: 249 },
      { id: 4, name: "Soft Drink", price: 99 },
    ],
  },
  {
    id: "ORD003",
    orderNumber: 1243,
    time: "09:15 PM",
    date: TODAY,
    table: "Table 012",
    total: 567,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Veg Burger", price: 149 },
      { id: 2, name: "French Fries", price: 149 },
      { id: 3, name: "Mango Shake", price: 179 },
    ],
  },
  {
    id: "ORD004",
    orderNumber: 1242,
    time: "08:50 PM",
    date: TODAY,
    table: "Table 005",
    total: 1899,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Farmhouse Pizza", price: 399 },
      { id: 2, name: "Chicken Wings", price: 299 },
      { id: 3, name: "Caesar Salad", price: 249 },
      { id: 4, name: "Chocolate Shake", price: 179 },
      { id: 5, name: "Garlic Bread", price: 149 },
      { id: 6, name: "Brownie", price: 149 },
    ],
  },
  {
    id: "ORD005",
    orderNumber: 1241,
    time: "08:30 PM",
    date: TODAY,
    table: "Table 002",
    total: 349,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Masala Maggie", price: 89 },
      { id: 2, name: "Cold Coffee", price: 119 },
      { id: 3, name: "French Fries", price: 149 },
    ],
  },
  {
    id: "ORD006",
    orderNumber: 1240,
    time: "08:15 PM",
    date: TODAY,
    table: "Table 010",
    total: 1299,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Paneer Tikka Pizza", price: 349 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 3, name: "Chicken Burger", price: 199 },
      { id: 4, name: "French Fries", price: 149 },
      { id: 5, name: "Cold Coffee", price: 119 },
      { id: 6, name: "Brownie", price: 149 },
    ],
  },
  {
    id: "ORD007",
    orderNumber: 1239,
    time: "08:00 PM",
    date: TODAY,
    table: "Table 015",
    total: 799,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 3, name: "French Fries", price: 149 },
      { id: 4, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD008",
    orderNumber: 1238,
    time: "07:45 PM",
    date: TODAY,
    table: "Table 007",
    total: 2150,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Family Pizza", price: 599 },
      { id: 2, name: "Chicken Wings", price: 299 },
      { id: 3, name: "Garlic Bread", price: 149 },
      { id: 4, name: "Pasta Alfredo", price: 249 },
      { id: 5, name: "Brownie", price: 149 },
      { id: 6, name: "Cold Coffee", price: 119 },
      { id: 7, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD009",
    orderNumber: 1237,
    time: "07:30 PM",
    date: TODAY,
    table: "Table 001",
    total: 675,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Veg Pizza", price: 299 },
      { id: 2, name: "Garlic Bread", price: 149 },
      { id: 3, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD010",
    orderNumber: 1236,
    time: "07:15 PM",
    date: TODAY,
    table: "Table 011",
    total: 445,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "French Fries", price: 149 },
    ],
  },
  {
    id: "ORD011",
    orderNumber: 1235,
    time: "07:00 PM",
    date: TODAY,
    table: "Table 009",
    total: 988,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Margherita Pizza", price: 299 },
      { id: 2, name: "Pasta Alfredo", price: 249 },
      { id: 3, name: "Garlic Bread", price: 149 },
      { id: 4, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD012",
    orderNumber: 1234,
    time: "06:45 PM",
    date: TODAY,
    table: "Table 004",
    total: 1599,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Wings", price: 299 },
      { id: 2, name: "Chicken Wings", price: 299 },
      { id: 3, name: "Farmhouse Pizza", price: 399 },
      { id: 4, name: "Brownie", price: 149 },
    ],
  },
  {
    id: "ORD013",
    orderNumber: 1233,
    time: "06:30 PM",
    date: TODAY,
    table: "Table 014",
    total: 567,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Veg Burger", price: 149 },
      { id: 2, name: "Veg Burger", price: 149 },
      { id: 3, name: "French Fries", price: 149 },
    ],
  },
  {
    id: "ORD014",
    orderNumber: 1232,
    time: "06:15 PM",
    date: TODAY,
    table: "Table 006",
    total: 1199,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Paneer Tikka Pizza", price: 349 },
      { id: 2, name: "Garlic Bread", price: 149 },
      { id: 3, name: "Pasta Alfredo", price: 249 },
      { id: 4, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD015",
    orderNumber: 1231,
    time: "06:00 PM",
    date: TODAY,
    table: "Table 013",
    total: 895,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 3, name: "French Fries", price: 149 },
      { id: 4, name: "Mango Shake", price: 179 },
    ],
  },
  {
    id: "ORD016",
    orderNumber: 1230,
    time: "05:45 PM",
    date: TODAY,
    table: "Table 016",
    total: 1349,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Family Pizza", price: 599 },
      { id: 2, name: "Chicken Wings", price: 299 },
      { id: 3, name: "Garlic Bread", price: 149 },
      { id: 4, name: "Brownie", price: 149 },
    ],
  },
  {
    id: "ORD017",
    orderNumber: 1229,
    time: "05:30 PM",
    date: TODAY,
    table: "Table 018",
    total: 799,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "Chicken Burger", price: 199 },
      { id: 3, name: "French Fries", price: 149 },
      { id: 4, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD018",
    orderNumber: 1228,
    time: "05:15 PM",
    date: TODAY,
    table: "Table 019",
    total: 988,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Margherita Pizza", price: 299 },
      { id: 2, name: "Pasta Alfredo", price: 249 },
      { id: 3, name: "Garlic Bread", price: 149 },
      { id: 4, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD019",
    orderNumber: 1227,
    time: "05:00 PM",
    date: TODAY,
    table: "Table 020",
    total: 567,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Veg Burger", price: 149 },
      { id: 2, name: "French Fries", price: 149 },
      { id: 3, name: "Mango Shake", price: 179 },
    ],
  },
  {
    id: "ORD020",
    orderNumber: 1226,
    time: "04:45 PM",
    date: TODAY,
    table: "Table 021",
    total: 445,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "French Fries", price: 149 },
    ],
  },

  // YESTERDAY'S ORDERS - for testing other filters
  {
    id: "ORD021",
    orderNumber: 1225,
    time: "09:30 PM",
    date: YESTERDAY,
    table: "Table 008",
    total: 1247,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "French Fries", price: 149 },
      { id: 3, name: "Cold Coffee", price: 119 },
    ],
  },
  {
    id: "ORD022",
    orderNumber: 1224,
    time: "08:45 PM",
    date: YESTERDAY,
    table: "Table 012",
    total: 895,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Margherita Pizza", price: 299 },
      { id: 2, name: "Garlic Bread", price: 149 },
    ],
  },
  {
    id: "ORD023",
    orderNumber: 1223,
    time: "07:30 PM",
    date: YESTERDAY,
    table: "Table 005",
    total: 567,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Veg Burger", price: 149 },
      { id: 2, name: "French Fries", price: 149 },
    ],
  },

  // LAST 7 DAYS ORDERS
  {
    id: "ORD024",
    orderNumber: 1222,
    time: "08:00 PM",
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      return date.toISOString().split('T')[0];
    })(),
    table: "Table 015",
    total: 1299,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Paneer Tikka Pizza", price: 349 },
      { id: 2, name: "Chicken Burger", price: 199 },
    ],
  },
  {
    id: "ORD025",
    orderNumber: 1221,
    time: "07:15 PM",
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      return date.toISOString().split('T')[0];
    })(),
    table: "Table 010",
    total: 799,
    paymentMethod: "cash",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Burger", price: 199 },
      { id: 2, name: "French Fries", price: 149 },
    ],
  },

  // LAST 30 DAYS ORDERS
  {
    id: "ORD026",
    orderNumber: 1220,
    time: "07:30 PM",
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 15);
      return date.toISOString().split('T')[0];
    })(),
    table: "Table 020",
    total: 988,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Margherita Pizza", price: 299 },
      { id: 2, name: "Pasta Alfredo", price: 249 },
    ],
  },
  {
    id: "ORD027",
    orderNumber: 1219,
    time: "08:45 PM",
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 25);
      return date.toISOString().split('T')[0];
    })(),
    table: "Table 025",
    total: 1599,
    paymentMethod: "upi",
    paymentStatus: "completed",
    items: [
      { id: 1, name: "Chicken Wings", price: 299 },
      { id: 2, name: "Farmhouse Pizza", price: 399 },
    ],
  },
];

// Date filter options
type DateFilterOption = "today" | "yesterday" | "7d" | "30d";

// ─── Component for Individual Order Card ───
function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  // Group items for display
  const itemMap = new Map();
  order.items.forEach(item => {
    const key = `${item.id}-${item.name}-${item.price}`;
    if (itemMap.has(key)) {
      itemMap.set(key, { ...item, quantity: itemMap.get(key).quantity + 1 });
    } else {
      itemMap.set(key, { ...item, quantity: 1 });
    }
  });
  
  const uniqueItems = Array.from(itemMap.values());
  const totalQuantity = order.items.length;
  const remainingItems = uniqueItems.length - 2;

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
              <span className="flex-shrink-0">{order.time}</span>
              <span className="text-gray-300 flex-shrink-0">•</span>
              <span className="flex-shrink-0">{order.date}</span>
              <span className="text-gray-300 flex-shrink-0">•</span>
              <Armchair size={10} className="flex-shrink-0" />
              <span className="flex-shrink-0 truncate max-w-[70px] sm:max-w-full">{order.table}</span>
            </div>
          </div>

          {/* Payment Method Badge & Total */}
          <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
            <div className={`
              flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[8px] sm:text-xs font-bold whitespace-nowrap
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
              ₹{order.total}
            </span>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 mb-1 sm:mb-2">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-[9px] sm:text-xs font-semibold text-gray-500">
            {uniqueItems.length} items · {totalQuantity} quantity
          </span>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] sm:text-xs font-medium text-[#D92632] hover:underline flex items-center gap-0.5 sm:gap-1"
          >
            {expanded ? 'Show less' : 'View details'}
            <ChevronDown size={10} className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Collapsible Items List */}
        <div className={`space-y-1 overflow-hidden transition-all ${expanded ? 'max-h-96' : 'max-h-12 sm:max-h-14'}`}>
          {expanded ? (
            // Full detailed view
            uniqueItems.map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between text-[9px] sm:text-xs py-0.5 sm:py-1 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-[#FEE2E2] text-[#D92632] text-[7px] sm:text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {item.quantity}
                  </span>
                  <span className="font-medium text-gray-800 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-600 whitespace-nowrap ml-1 sm:ml-2">₹{item.price * item.quantity}</span>
              </div>
            ))
          ) : (
            // Compact view - first 3 items
            <>
              {uniqueItems.slice(0, 2).map((item: any, idx) => (
                <div key={idx} className="flex items-center justify-between text-[8px] sm:text-xs">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <span className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#FEE2E2] text-[#D92632] text-[6px] sm:text-[8px] font-bold flex items-center justify-center flex-shrink-0">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-gray-600 whitespace-nowrap ml-1">₹{item.price * item.quantity}</span>
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

// ─── Main Page Component ───
export default function PaymentCompletedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("today");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [orders, setOrders] = useState(COMPLETED_ORDERS);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for order from sessionStorage when component mounts
  useEffect(() => {
    const completedOrder = sessionStorage.getItem('completedOrder');
    if (completedOrder) {
      try {
        const order = JSON.parse(completedOrder);
        // Convert the order to match the Order type in this page
        const newOrder: Order = {
          id: order.id,
          orderNumber: order.number,
          time: order.time,
          date: TODAY,
          table: order.table,
          total: order.total,
          paymentMethod: order.paymentMethod === 'upi' ? 'upi' : 'cash',
          paymentStatus: "completed",
          items: order.items
        };
        
        // Add to orders list if not already there
        setOrders(prev => {
          // Check if order already exists
          const exists = prev.some(o => o.id === newOrder.id);
          if (!exists) {
            return [newOrder, ...prev];
          }
          return prev;
        });
        
        // Clear from sessionStorage
        sessionStorage.removeItem('completedOrder');
      } catch (error) {
        console.error('Error parsing completed order:', error);
      }
    }
  }, []);

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

  // Get today's date in YYYY-MM-DD format
  function getTodayDate() {
    return getTodayDateString();
  }

  // Get yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Get date from X days ago
  const getDaysAgoDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  // Handle date picker change
  const handleDatePickerChange = (date: string) => {
    setSelectedDate(date);
    setDateFilter("today");
  };

  // Filter orders based on date filter and search
  const filterOrdersByDate = () => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    const sevenDaysAgo = getDaysAgoDate(7);
    const thirtyDaysAgo = getDaysAgoDate(30);

    return orders.filter(order => {
      // First apply date filter
      let dateMatch = true;
      
      // If date picker is used (selectedDate is not today), use that date
      if (selectedDate !== today) {
        dateMatch = order.date === selectedDate;
      } else {
        // Otherwise use the dropdown filter
        switch (dateFilter) {
          case "today":
            dateMatch = order.date === today;
            break;
          case "yesterday":
            dateMatch = order.date === yesterday;
            break;
          case "7d":
            dateMatch = order.date >= sevenDaysAgo && order.date <= today;
            break;
          case "30d":
            dateMatch = order.date >= thirtyDaysAgo && order.date <= today;
            break;
          default:
            dateMatch = true;
        }
      }

      // Then apply search filter
      const searchMatch = searchTerm === "" || 
        order.orderNumber.toString().includes(searchTerm) ||
        order.table.toLowerCase().includes(searchTerm.toLowerCase());

      return dateMatch && searchMatch;
    });
  };

  const filteredOrders = filterOrdersByDate();

  // Calculate revenue statistics for filtered orders
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const cashPayments = filteredOrders
    .filter(order => order.paymentMethod === 'cash')
    .reduce((sum, order) => sum + order.total, 0);
  const upiPayments = filteredOrders
    .filter(order => order.paymentMethod === 'upi')
    .reduce((sum, order) => sum + order.total, 0);

  // Get display text for date filter
  const getDateFilterDisplay = () => {
    const today = getTodayDate();
    
    // If date picker is used (selectedDate is not today)
    if (selectedDate !== today) {
      return formatDateForDisplay(selectedDate);
    }
    
    // Otherwise use dropdown filter
    switch (dateFilter) {
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "7d": return "Last 7 Days";
      case "30d": return "Last 30 Days";
      default: return "Today";
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateFilterSelect = (option: DateFilterOption) => {
    setDateFilter(option);
    setShowDropdown(false);
    // Reset date picker to today when using dropdown filters
    setSelectedDate(getTodayDate());
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full overflow-x-hidden">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
          Payment Completed
        </h2>
        
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
              max={getTodayDate()}
              className="w-full sm:w-[150px] lg:w-[160px] pl-8 sm:pl-10 pr-2 py-1.5 sm:py-2 bg-[#F9FAFB] border border-gray-200 rounded-lg text-[10px] sm:text-xs focus:outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632]"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-[140px] lg:w-[150px] flex items-center gap-1 bg-[#FFEFEF] text-[#D92632] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors justify-between"
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
                    className={`w-full text-left px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#FFEFEF] transition-colors ${dateFilter === 'today' && selectedDate === getTodayDate() ? 'bg-[#FFEFEF] text-[#D92632] font-medium' : 'text-gray-700'}`}
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
          <p className="text-xl sm:text-3xl font-extrabold">₹{totalRevenue}</p>
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
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900">₹{cashPayments}</p>
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
          <p className="text-xl sm:text-3xl font-extrabold text-gray-900">₹{upiPayments}</p>
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
            className="w-full pl-8 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-[#F9FAFB] border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] transition-all"
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

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-400 bg-[#F9FAFB] rounded-xl sm:rounded-2xl">
            <Package size={32} className="mb-2 sm:mb-4 opacity-20" />
            <p className="text-xs sm:text-sm font-medium">No completed orders found</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}