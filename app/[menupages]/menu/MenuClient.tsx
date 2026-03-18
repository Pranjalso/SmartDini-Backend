"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Scan, QrCode } from "lucide-react";
import Image from "next/image";

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
      
      // If we already have initialItems for the initial active category, 
      // and this is the first load, we don't need to fetch immediately.
      const isInitialCategory = activeCategory === initialCategories[0]?.name;
      if (isInitialCategory && items.length > 0 && !isInitialized) {
        return;
      }

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
        {/* Header - Updated with scanner icon */}
        <header className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-gray-100 rounded-md">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-red rounded-tl-[3px]"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-red rounded-tr-[3px]"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-red rounded-bl-[3px]"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-red rounded-br-[3px]"></div>
                <QrCode className="w-7 h-7 text-gray-500" />
              </div>
              <h1 className="text-2xl font-bold text-brand-red smartdiniFont tracking-tight">SmartDini</h1>
            </div>
            <Link href={`/${menupages}/menu/checkout`} className="relative">
              <ShoppingCart className="w-7 h-7 text-black" />
              {uniqueItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                  {uniqueItemsCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-28">
          <div className="px-4 py-2">
            <div className="bg-brand-red rounded-md p-3 text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center border border-white/20">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Scan. Order. Enjoy.</h2>
                <p className="text-xs opacity-90 font-medium">Where Menus Go Digital.</p>
              </div>
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="py-2">
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex flex-col items-center gap-1.5 min-w-[60px] transition-all ${
                    activeCategory === cat.name ? "opacity-100" : "opacity-80"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-md overflow-hidden border transition-all bg-white shadow-sm ${
                    activeCategory === cat.name ? "border-brand-red" : "border-gray-200"
                  }`}>
                    <img 
                      src={cat.image} 
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackCatImg;
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium text-center ${
                    activeCategory === cat.name ? "text-brand-red font-bold" : "text-gray-600"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-sm text-gray-500 py-6 px-4">No categories available.</div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-4 pt-1 pb-4">
            <h2 className="text-lg font-bold mb-2.5 text-gray-800">{activeCategory || 'Menu'} Categories</h2>
            <div className="space-y-2">
              {loadingCategory && (
                <div className="text-sm text-gray-500 py-8 text-center">Loading {activeCategory}…</div>
              )}
              {!loadingCategory && items
                .filter(item => item.category === activeCategory)
                .map((item) => {
                  const qty = getQuantity(item.id);
                  
                  return (
                    <div
                      key={String(item.id)}
                      className="flex items-center justify-between bg-sky-50 rounded-xl p-2 shadow-[0_4px_12px_rgba(59,130,246,0.15)] border border-sky-100"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 shadow-sm bg-white">
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
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 ml-2">
                        {qty === 0 ? (
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            className="px-5 py-1.5 bg-brand-red text-white rounded-md text-[10px] font-bold hover:bg-brand-red/90 transition-colors shadow-sm"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-brand-red text-white rounded-md p-1 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item, -1)}
                              className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-white/20"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-4 text-center font-bold text-xs">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              className="w-6 h-6 bg-white/10 rounded flex items-center justify-center hover:bg-white/20"
                            >
                              <Plus className="w-3.5 h-3.5" />
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
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-brand-red" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {uniqueItemsCount} {uniqueItemsCount === 1 ? 'Item' : 'Items'} in cart
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    Total ₹{totalPrice}
                  </p>
                </div>
              </div>
              <Link
                href={`/${menupages}/menu/checkout`}
                aria-disabled={uniqueItemsCount === 0}
                className={`px-6 py-3 rounded-md font-bold transition-colors shadow-md text-base flex items-center gap-2 ${
                  uniqueItemsCount === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                    : 'bg-brand-red text-white hover:bg-brand-red/90'
                }`}
              >
                Checkout <span className="font-normal">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}