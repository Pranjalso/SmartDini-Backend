"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  description?: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const menupages = params?.menupages as string;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [tableNumber, setTableNumber] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("upi");
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ orderNumber: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(5.0);

  // Load cart data from localStorage
  useEffect(() => {
    if (!menupages) return;
    
    let isMounted = true;
    setIsLoading(true);
    
    const loadCart = async () => {
      try {
        // Get cart quantities from localStorage
        const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
        if (!rawCart) {
          if (isMounted) {
            setLines([]);
            setIsLoading(false);
          }
          return;
        }
        
        const quantities = JSON.parse(rawCart) as Record<string, number>;
        const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        
        if (entries.length === 0) {
          if (isMounted) {
            setLines([]);
            setIsLoading(false);
          }
          return;
        }
        
        // Fetch all items that are in the cart
        const ids = entries.map(([id]) => id).join(',');
        const res = await fetch(`/api/menu/${menupages}?ids=${encodeURIComponent(ids)}`, { 
          cache: 'no-store' 
        });
        
        if (!isMounted) return;
        
        const json = await res.json();
        
        if (json?.success && Array.isArray(json.data)) {
          const mapped: CartLine[] = json.data
            .map((item: any): CartLine => ({
              id: String(item._id),
              name: item.name,
              price: item.price,
              qty: quantities[String(item._id)] || 0,
              image: item.imageUrl,
              description: item.description,
            }))
            .filter((item: CartLine) => item.qty > 0);
          
          if (isMounted) {
            setLines(mapped);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        if (isMounted) {
          setLines([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadCart();
    
    return () => {
      isMounted = false;
    };
  }, [menupages]);

  // Fetch cafe details for tax rate
  useEffect(() => {
    if (!menupages) return;
    const fetchCafeDetails = async () => {
      try {
        const res = await fetch(`/api/cafes/${menupages}/public`);
        const json = await res.json();
        if (json?.success && json.data) {
          setTaxRate(json.data.taxRate ?? 5.0);
        }
      } catch (error) {
        console.error('Error fetching cafe details:', error);
      }
    };
    fetchCafeDetails();
  }, [menupages]);

  // Load persisted checkout state
  useEffect(() => {
    try {
      if (!menupages) return;
      const raw = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (raw) {
        const saved = JSON.parse(raw) as { tableNumber?: string; paymentMethod?: "cash" | "upi" };
        if (saved.tableNumber) setTableNumber(saved.tableNumber);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
      }
    } catch {}
  }, [menupages]);

  // Persist checkout state on changes
  useEffect(() => {
    try {
      if (!menupages) return;
      const payload = { tableNumber, paymentMethod };
      window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify(payload));
    } catch {}
  }, [menupages, tableNumber, paymentMethod]);

  const uniqueItemsCount = useMemo(() => lines.length, [lines]);
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);
  const tax = useMemo(() => Math.round(subtotal * (taxRate / 100)), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const updateQuantity = useCallback((itemId: string, change: number) => {
    setLines(prev => {
      const newLines = prev.map(l => {
        if (l.id === itemId) {
          const newQty = Math.max(0, l.qty + change);
          return { ...l, qty: newQty };
        }
        return l;
      }).filter(l => l.qty > 0);
      
      // Update localStorage and notify other tabs/pages
      try {
        const quantities: Record<string, number> = {};
        newLines.forEach(l => quantities[l.id] = l.qty);
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
        
        // Dispatch a storage event to notify other tabs/pages
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: JSON.stringify(quantities),
          storageArea: localStorage
        }));
      } catch {}
      
      return newLines;
    });
  }, [menupages]);

  const removeItem = useCallback((itemId: string) => {
    setLines(prev => {
      const newLines = prev.filter(l => l.id !== itemId);
      
      // Update localStorage and notify other tabs/pages
      try {
        const quantities: Record<string, number> = {};
        newLines.forEach(l => quantities[l.id] = l.qty);
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
        
        // Dispatch a storage event to notify other tabs/pages
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: JSON.stringify(quantities),
          storageArea: localStorage
        }));
      } catch {}
      
      return newLines;
    });
  }, [menupages]);

  const placeOrder = async () => {
    if (!menupages || lines.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        tableNumber: tableNumber || "1",
        paymentMethod,
        paymentStatus: "pending" as const,
        items: lines.map(l => ({
          menuItemId: l.id,
          name: l.name,
          price: l.price,
          quantity: l.qty,
        })),
      };
      const res = await fetch(`/api/orders/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to place order");
      }
      const order = json.data;
      setSuccessOrder({ orderNumber: order.orderNumber, total: order.total });
      
      // Clear cart after successful order
      try {
        window.localStorage.removeItem(`sd:cart:${menupages}`);
        // Dispatch storage event to notify other tabs/pages
        window.dispatchEvent(new StorageEvent('storage', {
          key: `sd:cart:${menupages}`,
          newValue: null,
          storageArea: localStorage
        }));
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!menupages) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="px-4 py-3 flex items-center gap-4">
            <Link href={`/${menupages}/menu`} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Back to menu">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Checkout</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#D32F2F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : lines.length === 0 && !successOrder ? (
            <div className="text-center text-sm text-gray-500 py-10">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
              <p className="text-sm text-gray-500 mb-6">Add items from the menu to get started</p>
              <Link
                href={`/${menupages}/menu`}
                className="inline-block bg-[#D32F2F] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#B71C1C]"
              >
                Browse Menu
              </Link>
            </div>
          ) : lines.length > 0 && !successOrder ? (
            <>
              <div className="bg-[#D32F2F]/5 rounded-xl p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-[#D32F2F]">{uniqueItemsCount}</span> different items ·{" "}
                  <span className="font-semibold text-[#D32F2F]">{totalQuantity}</span> total quantity
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="font-semibold mb-3">Order Summary</h2>
                <div className="space-y-3">
                  {lines.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{item.description || ""}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <p className="font-semibold text-[#D32F2F]">₹{item.price * item.qty}</p>
                            <p className="text-xs text-gray-500">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 bg-[#D32F2F] text-white rounded-full flex items-center justify-center hover:bg-[#B71C1C]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-1 p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

             <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-semibold mb-3">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({uniqueItemsCount} {uniqueItemsCount === 1 ? 'item' : 'items'} · {totalQuantity} {totalQuantity === 1 ? 'quantity' : 'quantity'})
                  </span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({taxRate}%)</span>
                  <span className="font-medium">₹{tax}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#D32F2F]">₹{total}</span>
                  </div>
                </div>
              </div>
            </div>

              <div className="bg-gray-50 rounded-xl p-4" id="table-number-section">
                <h2 className="font-semibold mb-3">
                  Table Number <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-2">
                  <input
                    id="table-number"
                    type="text"
                    placeholder="Enter your table no."
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      if (error) setError("");
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 ${
                      error ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {error && (
                    <p className="text-xs text-red-500">⚠️ {error}</p>
                  )}
                  <p className="text-xs text-gray-500">eg. 01, 02, 03...</p>
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </>
          ) : successOrder ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Order Placed!</h2>
              <p className="text-sm text-gray-600">
                Your order number is <span className="font-semibold">#{successOrder.orderNumber}</span>.
              </p>
              <p className="text-sm text-gray-600">
                Amount payable: <span className="font-semibold">₹{successOrder.total}</span>
              </p>
              <p className="text-xs text-gray-500">
                Please keep this screen open or share the order number with the staff.
              </p>
            </div>
          ) : null}
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur border-t shadow-lg z-50 p-4">
          {!successOrder ? (
            <button
              onClick={() => {
                if (!tableNumber.trim()) {
                  setError("Please enter your table number to proceed");
                  const el = document.getElementById("table-number");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                router.push(`/${menupages}/menu/checkout/payment`);
              }}
              disabled={lines.length === 0 || submitting || !tableNumber.trim() || isLoading}
              className={`block w-full text-white text-center py-3.5 rounded-xl font-semibold transition-colors ${
                !tableNumber.trim() || lines.length === 0 || isLoading
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#D32F2F] hover:bg-[#B71C1C]"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </span>
              ) : (
                `Proceed to Payment · ₹${total}`
              )}
            </button>
          ) : (
            <Link
              href={`/${menupages}/menu`}
              className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-black"
            >
              Back to Menu
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}