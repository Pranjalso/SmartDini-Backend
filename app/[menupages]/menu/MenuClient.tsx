"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus } from "lucide-react";

type MenuItem = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
};

type MenuClientProps = {
  menupages: string;
  initialItems: MenuItem[];
  initialCategories: Array<{ name: string; image: string }>;
};

export default function MenuClient({ menupages, initialItems, initialCategories }: MenuClientProps) {
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>(initialCategories[0]?.name || "");
  const [uniqueItemsCount, setUniqueItemsCount] = useState(0);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [categories, setCategories] = useState<Array<{ name: string; image: string }>>(initialCategories);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [catalog, setCatalog] = useState<Array<{ id: string | number; name: string; price: number; image: string; description?: string }>>([]);
  const [fallbackLines, setFallbackLines] = useState<Array<{ id: string | number; name: string; price: number; image: string; description?: string }>>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const fallbackCatImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";

  // Load saved active category
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.sessionStorage.getItem(`sd:activeCat:${menupages}`);
        if (saved) setActiveCategory(saved);
      }
    } catch {}
  }, [menupages]);

  // Save active category
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && activeCategory) {
        window.sessionStorage.setItem(`sd:activeCat:${menupages}`, activeCategory);
      }
    } catch {}
  }, [menupages, activeCategory]);

  // Load catalog from sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem(`sd:items:${menupages}`);
        const existing = raw ? JSON.parse(raw) as Array<{ id: string | number; name: string; price: number; image: string; description?: string }> : [];
        setCatalog(existing);
        
        const rawChk = window.sessionStorage.getItem(`sd:checkoutLines:${menupages}`);
        const chk = rawChk ? JSON.parse(rawChk) as Array<{ id: string | number; name: string; price: number; image: string; description?: string }> : [];
        setFallbackLines(chk);
      }
    } catch {}
  }, [menupages]);

  // Load cart quantities from localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`sd:cart:${menupages}`) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        setQuantities(parsed);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading cart:', error);
      setIsInitialized(true);
    }
  }, [menupages]);

  // Save cart quantities to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`sd:cart:${menupages}`, JSON.stringify(quantities));
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [menupages, quantities, isInitialized]);

  // Calculate unique items count
  useEffect(() => {
    const count = Object.values(quantities).filter(qty => qty > 0).length;
    setUniqueItemsCount(count);
  }, [quantities]);

  // Load items when activeCategory changes
  useEffect(() => {
    async function loadCategory() {
      if (!activeCategory) return;
      setLoadingCategory(true);
      try {
        const res = await fetch(`/api/menu/${menupages}?category=${encodeURIComponent(activeCategory)}`, { cache: 'no-store' });
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          const mapped = json.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.imageUrl,
            description: item.description,
          })) as MenuItem[];
          setItems(mapped);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoadingCategory(false);
      }
    }
    loadCategory();
  }, [activeCategory, menupages]);

  const updateQuantity = (item: MenuItem, change: number) => {
    const id = item.id;
    setQuantities(prev => {
      const current = prev[id] || 0;
      const newQty = current + change;
      let next: Record<string | number, number>;
      
      if (newQty <= 0) {
        const { [id]: _, ...rest } = prev;
        next = rest;
      } else {
        next = { ...prev, [id]: newQty };
      }
      
      // Update catalog when adding items
      if (newQty > 0) {
        try {
          const raw = window.sessionStorage.getItem(`sd:items:${menupages}`);
          const list: Array<{ id: string | number; name: string; price: number; image: string; description?: string }> = raw ? JSON.parse(raw) : [];
          const idStr = String(id);
          const idx = list.findIndex((it) => String(it.id) === idStr);
          
          const payload = { id, name: item.name, price: item.price, image: item.image, description: item.description || '' };
          if (idx === -1) {
            list.push(payload);
          } else {
            list[idx] = payload;
          }
          
          window.sessionStorage.setItem(`sd:items:${menupages}`, JSON.stringify(list));
          setCatalog(list);
        } catch {}
      }
      
      return next;
    });
  };

  const getQuantity = (id: string | number) => quantities[id] || 0;

  // Calculate cart items from ALL categories
  const cartItems = useMemo(() => {
    const itemsWithQty = Object.entries(quantities)
      .map(([id, qty]) => {
        // First try to find in current items (already loaded)
        const inView = items.find(i => String(i.id) === String(id));
        if (inView) return { ...inView, qty };
        
        // If not found in current items, try to find in catalog (all items)
        const fromCatalog = catalog.find(c => String(c.id) === String(id));
        if (fromCatalog) {
          return {
            id: fromCatalog.id,
            name: fromCatalog.name,
            price: fromCatalog.price,
            category: '',
            image: fromCatalog.image,
            description: fromCatalog.description,
            qty
          } as MenuItem & { qty: number };
        }
        
        // Try fallback lines as last resort
        const fromFallback = fallbackLines.find(c => String(c.id) === String(id));
        if (fromFallback) {
          return {
            id: fromFallback.id,
            name: fromFallback.name,
            price: fromFallback.price,
            category: '',
            image: fromFallback.image,
            description: fromFallback.description,
            qty
          } as MenuItem & { qty: number };
        }
        
        return null;
      })
      .filter(Boolean) as Array<MenuItem & { qty: number }>;
      
    return itemsWithQty;
  }, [quantities, items, catalog, fallbackLines]);

  // Total price from ALL items in cart
  const totalPrice = useMemo(() => 
    cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 0), 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D32F2F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  <span className="text-[#D32F2F]">Smart</span>Dini
                </h1>
                <p className="text-xs text-gray-500">Scan. Order. Enjoy.</p>
              </div>
            </div>
            <Link href={`/${menupages}/menu/checkout`} className="relative">
              <div className="p-2 bg-gray-100 rounded-full">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </div>
              {uniqueItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {uniqueItemsCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-28">
          {/* Hero Banner */}
          <div className="px-4 py-3">
            <div className="bg-[#D32F2F] rounded-xl p-4 text-white">
              <p className="text-sm opacity-90">Where Menus Go Digital.</p>
              <p className="text-xs opacity-75 mt-1">Scan QR code to order</p>
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex flex-col items-center gap-1 min-w-[70px] transition-all ${
                    activeCategory === cat.name ? 'opacity-100 scale-105' : 'opacity-70'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-transparent transition-all" style={{
                    borderColor: activeCategory === cat.name ? '#D32F2F' : 'transparent'
                  }}>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackCatImg;
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {cat.name}
                  </span>
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-sm text-gray-500 py-6">No categories available.</div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 py-4">
            <h2 className="text-lg font-bold mb-3">{activeCategory || 'Menu'}</h2>
            <div className="space-y-3">
              {loadingCategory && (
                <div className="text-sm text-gray-500">Loading {activeCategory}…</div>
              )}
              {!loadingCategory && items
                .filter(item => item.category === activeCategory)
                .map((item) => {
                  const qty = getQuantity(item.id);
                  
                  return (
                    <div
                      key={String(item.id)}
                      className="flex items-center justify-between bg-white border rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {/* Item Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackCatImg;
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                          <p className="text-sm font-bold text-[#D32F2F] mt-1">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {qty === 0 ? (
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="px-6 py-2 bg-[#D32F2F] text-white rounded-lg text-sm font-medium hover:bg-[#B71C1C] transition-colors"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-semibold">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              className="w-8 h-8 bg-[#D32F2F] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-[#B71C1C]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!loadingCategory && items.filter(item => item.category === activeCategory).length === 0 && (
                <div className="text-sm text-gray-500">No items available in this category.</div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur border-t shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {uniqueItemsCount} {uniqueItemsCount === 1 ? 'Item' : 'Items'}
                </p>
                <p className="text-lg font-bold">
                  <span className="text-gray-700">Total Price: </span>
                  <span className="text-[#D32F2F]">₹{totalPrice}</span>
                </p>
              </div>
              <Link
                href={`/${menupages}/menu/checkout`}
                aria-disabled={uniqueItemsCount === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  uniqueItemsCount === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed pointer-events-none'
                    : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'
                }`}
              >
                Checkout →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}