"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Smartphone, Wallet, CheckCircle } from "lucide-react";

type PaymentMethod = "upi" | "cash";

// For Next.js 15, we need to handle params as a Promise
type PageProps = {
  params: Promise<{ menupages: string }>
}

export default async function PaymentPage({ params }: PageProps) {
  const { menupages } = await params;
  return <PaymentPageContent menupages={menupages} />;
}

function PaymentPageContent({ menupages }: { menupages: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [lines, setLines] = useState<Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }>>([]);

  // Restore checkout form state and cart lines
  useEffect(() => {
    try {
      const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      if (rawForm) {
        const saved = JSON.parse(rawForm) as { tableNumber?: string; paymentMethod?: PaymentMethod };
        if (saved.tableNumber) setTableNumber(saved.tableNumber);
        if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
      }
    } catch {}
  }, [menupages]);

  // Persist UPI ID changes
  useEffect(() => {
    try {
      const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
      const saved = rawForm ? JSON.parse(rawForm) : {};
      window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, upiId, tableNumber, paymentMethod }));
    } catch {}
  }, [menupages, upiId, tableNumber, paymentMethod]);

  // Listen to cart changes while on payment page
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== `sd:cart:${menupages}`) return;
      try {
        const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
        const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
        if (!rawCart || !rawItems) return;
        const quantities = JSON.parse(rawCart) as Record<string, number>;
        const items = JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }>;
        const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);
        const mapped: Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }> = entries
          .map(([id, qty]) => {
            const item = items.find(i => String(i.id) === String(id));
            return item ? { id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description } : null;
          })
          .filter(Boolean) as any;
        setLines(mapped);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [menupages]);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(`sd:cart:${menupages}`);
      const rawItems = window.sessionStorage.getItem(`sd:items:${menupages}`);
      const rawLines = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
      if (!rawCart) {
        setLines([]);
        return;
      }
      const quantities = JSON.parse(rawCart) as Record<string, number>;
      const entries = Object.entries(quantities).filter(([_, qty]) => qty > 0);

      const mapped: Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }> = [];
      const items = rawItems ? JSON.parse(rawItems) as Array<{ id: string; name: string; price: number; image?: string; description?: string }> : [];
      entries.forEach(([id, qty]) => {
        const item = items.find(i => String(i.id) === String(id));
        if (item) {
          mapped.push({ id: String(item.id), name: item.name, price: item.price, qty, image: item.image, description: item.description });
        }
      });

      // If some lines missing, try persisted checkout lines
      if (rawLines) {
        const persisted = JSON.parse(rawLines) as Array<{ id: string; name: string; price: number; qty: number; image?: string; description?: string }>;
        persisted.forEach((l) => {
          if (!mapped.find(m => m.id === l.id)) {
            const q = quantities[l.id] ?? l.qty;
            if (q > 0) mapped.push({ ...l, qty: q });
          }
        });
      }

      const missingIds = entries.map(([id]) => id).filter(id => !mapped.find(m => String(m.id) === String(id)));
      if (missingIds.length > 0) {
        (async () => {
          try {
            const res = await fetch(`/api/menu/${menupages}?ids=${encodeURIComponent(missingIds.join(','))}`, { cache: 'no-store' });
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
              json.data.forEach((it: any) => {
                const id = String(it._id);
                const qty = Number(quantities[id] || quantities[String(it._id)]);
                if (!mapped.find(m => String(m.id) === id) && qty > 0) {
                  mapped.push({
                    id,
                    name: it.name,
                    price: it.price,
                    qty,
                    image: it.imageUrl,
                    description: it.description,
                  });
                }
              });
            }
          } catch {}
          setLines(mapped);
        })();
      } else {
        setLines(mapped);
      }
    } catch {
      setLines([]);
    }
  }, [menupages]);

  // Derived totals
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.qty, 0), [lines]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const handlePayment = async () => {
    if (!tableNumber.trim()) {
      setError("Please enter your table number");
      return;
    }
    if (paymentMethod === 'upi' && !upiId.trim()) {
      setError("Please enter UPI ID");
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const payload = {
        tableNumber,
        paymentMethod,
        paymentStatus: "pending" as const,
        upiId: paymentMethod === 'upi' ? upiId : undefined,
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
      setPaymentComplete(true);
      try {
        window.localStorage.removeItem(`sd:cart:${menupages}`);
      } catch {}
      setTimeout(() => {
        router.push(`/${menupages}/menu`);
      }, 1800);
    } catch (e: any) {
      setError(e?.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-sm text-gray-600 mb-4">Your order has been placed</p>
            <p className="text-xs text-gray-500">Redirecting to order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="px-4 py-3 flex items-center gap-4">
            <Link href={`/${menupages}/menu`} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Payment</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* Order Total */}
          <div className="bg-[#D32F2F]/5 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-[#D32F2F]">₹{total}</p>
          </div>

          {/* Table Number */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Table Number</h2>
            <input
              type="text"
              placeholder="Enter your table no."
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                if (error) setError(null);
                try {
                  const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                  const saved = rawForm ? JSON.parse(rawForm) : {};
                  window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, tableNumber: e.target.value, paymentMethod }));
                } catch {}
              }}
              className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 ${error ? "border-red-500" : "border-gray-300"}`}
              required
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="font-semibold mb-3">Payment Method</h2>
            <div className="space-y-3">
              {/* UPI Option */}
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${
                paymentMethod === 'upi' ? 'border-[#D32F2F] bg-[#D32F2F]/5' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => {
                      const val = e.target.value as PaymentMethod;
                      setPaymentMethod(val);
                      try {
                        const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                        const saved = rawForm ? JSON.parse(rawForm) : {};
                        window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, paymentMethod: val, tableNumber }));
                      } catch {}
                    }}
                    className="w-4 h-4 text-[#D32F2F]"
                  />
                  <Smartphone className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">UPI</span>
                </div>
              </label>

              {/* Cash Only Option - Replaced COD */}
              <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${
                paymentMethod === 'cash' ? 'border-[#D32F2F] bg-[#D32F2F]/5' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => {
                      const val = e.target.value as PaymentMethod;
                      setPaymentMethod(val);
                      try {
                        const rawForm = window.sessionStorage.getItem(`sd:checkout:${menupages}`);
                        const saved = rawForm ? JSON.parse(rawForm) : {};
                        window.sessionStorage.setItem(`sd:checkout:${menupages}`, JSON.stringify({ ...saved, paymentMethod: val, tableNumber }));
                      } catch {}
                    }}
                    className="w-4 h-4 text-[#D32F2F]"
                  />
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Cash Only</span>
                </div>
              </label>
            </div>
          </div>

          {/* UPI Details - Show only if UPI selected */}
          {paymentMethod === 'upi' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-semibold mb-3">UPI Details</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g., name@okhdfcbank)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20"
                />
                <div className="grid grid-cols-3 gap-2">
                  {['gpay@okhdfcbank', 'phonepe@ybl', 'paytm@okhdfcbank'].map((id) => (
                    <button
                      key={id}
                      onClick={() => setUpiId(id)}
                      className="px-2 py-1.5 text-xs bg-white border rounded-lg hover:bg-gray-50"
                    >
                      {id.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cash Only Info */}
          {paymentMethod === 'cash' && (
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Cash Only</h3>
                  <p className="text-xs text-amber-700">
                    Please pay ₹{total} in cash at the counter or to the delivery person. 
                    Exact change is appreciated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'upi' && !upiId)}
            className="w-full bg-[#D32F2F] text-white py-4 rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay ₹${total}`
            )}
          </button>

          {error && (
            <p className="text-xs text-center text-red-600">{error}</p>
          )}

          {/* Security Note */}
          <p className="text-xs text-center text-gray-500">
            🔒 Your payment information is secure
          </p>
        </div>
      </div>
    </div>
  );
}
