"use client";

import { useEffect, useMemo, useState } from "react";
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

  // Load persisted checkout state (industry-standard UX to avoid losing form state)
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

  // Persist current cart lines for robust restoration across navigation
  useEffect(() => {
    try {
      if (!menupages) return;
      window.sessionStorage.setItem(`sd:checkoutLines:${menupages}`, JSON.stringify(lines));
    } catch {}
  }, [menupages, lines]);

  useEffect(() => {
    try {
      if (!menupages) return;
      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
      const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
      if (!rawCart || !rawItems) return;
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      const items = JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }>;
      const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
      const mapped: CartLine[] = entries
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item = items.find(i => String(i.id) === String(id));
          return item ? { id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description } : null;
        })
        .filter(Boolean) as CartLine[];
      const missingIds = entries
        .map(([id]) => id)
        .filter(id => !mapped.find(m => String(m.id) === String(id)));
      if (missingIds.length === 0) {
        setLines(mapped);
      } else {
        // Fallback: fetch only missing ids to populate items
        (async () => {
          try {
            const res = await fetch(`/api/menu/${menupages}?ids=${encodeURIComponent(missingIds.join(','))}`, { cache: 'no-store' });
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
              const complete: CartLine[] = [...mapped];
              json.data.forEach((it: any) => {
                const id = String(it._id);
                const qty = Number(quantities[id] || quantities[String(it._id)]);
                if (!complete.find(m => String(m.id) === id) && qty > 0) {
                  complete.push({
                    id,
                    name: it.name,
                    price: it.price,
                    qty,
                    image: it.imageUrl,
                    description: it.description,
                  });
                }
              });
              setLines(complete);
              // Update sessionStorage catalog for next time
              try {
                const updated = complete.map(it => ({ id: it.id, name: it.name, price: it.price, image: it.image, description: it.description || '' }));
                window.sessionStorage.setItem(`sd:items:${menupages}`, JSON.stringify(updated));
              } catch {}
            } else {
              setLines(mapped);
            }
          } catch {
            setLines(mapped);
          }
        })();
      }
    } catch {
      setLines([]);
    }
  }, [menupages]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!menupages) return;
      if (e.key !== `sd:cart:${menupages}`) return;
      try {
        const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
        const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
        const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
        if (!rawCart || !rawItems) {
          // Try restoring from persisted checkout lines if item catalog is missing
          if (rawLines) {
            const quantities = JSON.parse(rawCart || '{}') as Record<string, number>;
            const saved = JSON.parse(rawLines) as CartLine[];
            const merged = saved
              .map(l => ({ ...l, qty: quantities[l.id] ?? l.qty }))
              .filter(l => (quantities[l.id] ?? l.qty) > 0);
            setLines(merged);
          } else {
            setLines([]);
          }
          return;
        }
        const quantities = JSON.parse(rawCart) as Record<string, number>;
        const items = JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }>;
        const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        const mapped: CartLine[] = entries
          .map(([id, qty]) => {
            const item = items.find(i => String(i.id) === String(id));
            return item ? { id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description } : null;
          })
          .filter(Boolean) as CartLine[];
        setLines(mapped);
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [menupages]);

  const uniqueItemsCount = useMemo(() => lines.length, [lines]);
  const totalQuantity = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    [lines]
  );
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

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
      try {
        window.localStorage.removeItem(`sd:cart:${menupages}`);
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
          {lines.length === 0 && !successOrder && (
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
          )}

          {lines.length > 0 && !successOrder && (
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
                              onClick={() => {
                                const newLines = lines.map(l => l.id === item.id ? { ...l, qty: Math.max(0, l.qty - 1) } : l).filter(l => l.qty > 0);
                                setLines(newLines);
                                try {
                                  const next: Record<string, number> = {};
                                  newLines.forEach(l => next[l.id] = l.qty);
                                  window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(next));
                                } catch {}
                              }}
                              className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => {
                                const newLines = lines.map(l => l.id === item.id ? { ...l, qty: l.qty + 1 } : l);
                                setLines(newLines);
                                try {
                                  const next: Record<string, number> = {};
                                  newLines.forEach(l => next[l.id] = l.qty);
                                  window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(next));
                                } catch {}
                              }}
                              className="w-7 h-7 bg-[#D32F2F] text-white rounded-full flex items-center justify-center hover:bg-[#B71C1C]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                const newLines = lines.filter(l => l.id !== item.id);
                                setLines(newLines);
                                try {
                                  const next: Record<string, number> = {};
                                  newLines.forEach(l => next[l.id] = l.qty);
                                  window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(next));
                                } catch {}
                              }}
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
                    <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
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
          )}

          {successOrder && (
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
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur border-t shadow-lg z-50 p-4">
          {!successOrder ? (
            <button
              onClick={(e) => {
                if (!tableNumber.trim()) {
                  e.preventDefault();
                  setError("Please enter your table number to proceed");
                  const el = document.getElementById("table-number");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                try {
                  const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                  const saved = rawForm ? JSON.parse(rawForm) : {};
                  window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, tableNumber }));
                } catch {}
                router.push(`/${menupages}/menu/checkout/payment`);
              }}
              disabled={lines.length === 0 || submitting || !tableNumber.trim()}
              className={`block w-full text-white text-center py-3.5 rounded-xl font-semibold transition-colors ${
                !tableNumber.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-[#D32F2F] hover:bg-[#B71C1C]"
              }`}
              aria-disabled={lines.length === 0 || submitting || !tableNumber.trim()}
            >
              Proceed to Payment · ₹{total}
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
