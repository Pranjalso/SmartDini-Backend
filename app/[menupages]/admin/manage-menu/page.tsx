"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { UtensilsCrossed, Image as ImageIcon, Pencil, Trash2, Check, X, ChevronDown, UploadCloud, Plus, Tag } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  editing?: boolean;
  editName?: string;
  editPrice?: number;
  editCategory?: string;
  editImageUrl?: string;
  editImageFile?: File | null;
};

const DEFAULT_CATEGORIES = ["Pizza", "Burger", "Pasta", "Drinks", "Desserts"];

const getUnsplashImage = (name: string): string => {
  const query = encodeURIComponent(name.toLowerCase());
  
  if (name.toLowerCase().includes('pizza')) {
    if (name.includes('Marinara')) return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Margherita')) return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Chicago')) return "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&h=200&fit=crop&auto=format";
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&auto=format";
  }
  
  if (name.toLowerCase().includes('burger')) {
    if (name.includes('Veggie')) return "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Turkey')) return "https://images.unsplash.com/photo-1550317138-10000687a72b?w=200&h=200&fit=crop&auto=format";
    if (name.includes('Cheese')) return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format";
    return "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&auto=format";
  }
  
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&auto=format";
};

export default function ManageMenuPage() {
  const params = useParams();
  const menupages = params?.menupages as string;
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!menupages) return;
      setLoading(true);
      setError(null);
      try {
        const [catsRes, itemsRes] = await Promise.all([
          fetch(`/api/menu/${menupages}/categories`, { cache: "no-store" }),
          fetch(`/api/menu/${menupages}`, { cache: "no-store" }),
        ]);
        const catsJson = await catsRes.json();
        const itemsJson = await itemsRes.json();
        if (catsJson?.success && Array.isArray(catsJson.data)) {
          const cats = catsJson.data.map((c: any) => c.name).filter(Boolean);
          setCategories(cats.length ? cats : DEFAULT_CATEGORIES);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        if (itemsJson?.success && Array.isArray(itemsJson.data)) {
          const items: MenuItem[] = itemsJson.data.map((it: any) => ({
            id: it._id,
            name: it.name,
            price: it.price,
            category: it.category,
            imageUrl: it.imageUrl,
          }));
          setMenu(items);
        } else {
          setMenu([]);
        }
      } catch (e: any) {
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [menupages]);
  
  const transformCloudinary = (url: string, w: number, h: number) => {
    if (!url.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}/`);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    setImgPreview(imageUrl);
    setImgFile(file);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setCategory(newCategory.trim());
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const json = await res.json();
    setUploading(false);
    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Upload failed");
    }
    return json.data.url as string;
  };

  const handleAdd = async () => {
    if (!itemName.trim() || !price || !category || !imgFile) {
      setError(!imgFile ? 'Image is required' : 'Please fill all fields');
      return;
    }
    if (Number(price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    const currentCategory = category;
    setLoading(true);
    setError(null);
    try {
      const existingSameName = menu.find(m => m.name.toLowerCase().trim() === itemName.trim().toLowerCase());
      if (existingSameName) {
        throw new Error('Item with this name already exists');
      }
      const finalImage = await uploadImage(imgFile);
      const payload = {
        name: itemName.trim(),
        price: Number(price),
        category: currentCategory,
        imageUrl: finalImage,
      };
      const res = await fetch(`/api/menu/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to create item");
      }
      const it = json.data;
      const newItem: MenuItem = {
        id: it._id,
        name: it.name,
        price: it.price,
        category: it.category,
        imageUrl: it.imageUrl,
      };
      setMenu(prev => {
        const next = [...prev, newItem];
        next.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        return next;
      });
      if (!categories.includes(newItem.category)) {
        setCategories(prev => [...prev, newItem.category]);
      }
      setItemName("");
      setPrice("");
      // keep category selected to add multiple items in same category
      setImgPreview(null);
      setImgFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      setError(e?.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = (id: number) => {
    return;
  };

  const startEdit = (id: string) => {
    setMenu(menu.map(m => m.id === id ? { 
      ...m,
      editing: true,
      editName: m.name,
      editPrice: m.price,
      editCategory: m.category,
      editImageUrl: m.imageUrl || "",
      editImageFile: null,
    } : m));
  };

  const cancelEdit = (id: string) => {
    setMenu(menu.map(m => m.id === id ? { ...m, editing: false } : m));
  };

  const saveEdit = (id: string) => {
    return;
  };

  const updateEditField = (id: string, field: string, value: string | number) => {
    setMenu(menu.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleEditImageUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    const imageUrl = URL.createObjectURL(file);
    updateEditField(id, 'editImageUrl', imageUrl);
    setMenu(menu.map(m => m.id === id ? { ...m, editImageFile: file } : m));
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu/${menupages}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to delete item");
      }
      setMenu(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const onSaveEdit = async (id: string) => {
    const item = menu.find(m => m.id === id);
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      let newImageUrl = item.editImageUrl || item.imageUrl;
      if (item.editImageFile) {
        newImageUrl = await uploadImage(item.editImageFile);
      }
      const payload: any = {
        name: item.editName || item.name,
        price: item.editPrice ?? item.price,
        category: item.editCategory || item.category,
        imageUrl: newImageUrl,
      };
      const res = await fetch(`/api/menu/${menupages}?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to update item");
      }
      const updated = json.data;
      setMenu(prev => prev.map(m => m.id === id ? {
        id: updated._id,
        name: updated.name,
        price: updated.price,
        category: updated.category,
        imageUrl: updated.imageUrl,
      } : m));
      if (!categories.includes(updated.category)) {
        setCategories(prev => [...prev, updated.category]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[800px] w-full overflow-x-hidden">
      
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Menu Management
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2 font-medium">
          Manage your restaurant menu items, prices, and categories
        </p>
      </div>

      <section className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed size={16} className="text-[#D92632]" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl text-gray-900">Add New Menu Item</h2>
        </div>

        <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full lg:w-56 h-40 sm:h-48 bg-white border-2 border-dashed border-[#FCA5A5] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group relative overflow-hidden"
            >
              {imgPreview ? (
                <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon size={20} className="text-[#D92632]" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-700 px-2 text-center">Click to upload image</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 px-2 text-center">PNG, JPG upto 10 MB</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex-1 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 ml-1">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="eg.: Margherita Pizza"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 ml-1">Price ₹</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="eg.: 149"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-gray-500 mb-1 ml-1">Category</label>
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                  <div className="relative w-full sm:flex-1">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] appearance-none text-gray-700"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {!showAddCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:text-[#D92632] hover:border-[#D92632] hover:bg-red-50 transition-all whitespace-nowrap"
                    >
                      <Plus size={16} className="text-gray-400 group-hover:text-[#D92632]" />
                      <span>New Category</span>
                    </button>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fadeIn">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="Enter category name"
                          className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-2 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:border-[#D92632] focus:ring-1 focus:ring-[#D92632] transition-all"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleAddCategory}
                          disabled={!newCategory.trim()}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddCategory(false);
                            setNewCategory("");
                          }}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAdd}
                  disabled={!itemName.trim() || !price || !category || !imgFile}
                  className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading…' : 'Save Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed size={16} className="text-[#D92632]" />
          </div>
          <h2 className="font-bold text-lg sm:text-xl text-gray-900">Current Menu Items</h2>
        </div>

        <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-[#EFA5AA]"> 
                  <th className="py-2 sm:py-3 px-3 sm:px-6 text-left text-xs sm:text-sm font-bold text-[#7f1d1d]">Item</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-[#7f1d1d]">Price</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-[#7f1d1d]">Category</th>
                  <th className="py-2 sm:py-3 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold text-[#7f1d1d]">Actions</th>
                </tr>
              </thead>
              
              <tbody className="bg-white">
                {menu.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-100 last:border-0 ${item.editing ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    
                    <td className="py-2 sm:py-3 px-3 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-offset-2 ring-[#FEE2E2]">
                          {item.editing ? (
                            item.editImageUrl ? (
                              <img 
                                src={item.editImageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getUnsplashImage(item.name);
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#FEE2E2] flex items-center justify-center relative group cursor-pointer">
                                <ImageIcon size={14} className="text-[#D92632]" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={(e) => handleEditImageUpload(item.id, e)}
                                />
                              </div>
                            )
                          ) : (
                            <img 
                              src={transformCloudinary(item.imageUrl, 80, 80)} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getUnsplashImage(item.name);
                              }}
                            />
                          )}
                        </div>
                        
                        {item.editing ? (
                          <input 
                            value={item.editName}
                            onChange={(e) => updateEditField(item.id, 'editName', e.target.value)}
                            className="w-full border border-red-300 rounded px-2 py-1 text-xs outline-none text-[#D92632]"
                            placeholder="Item name"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                      {item.editing ? (
                        <input 
                          type="number"
                          value={item.editPrice}
                          onChange={(e) => updateEditField(item.id, 'editPrice', Number(e.target.value))}
                          className="w-16 sm:w-20 mx-auto border border-red-300 rounded px-2 py-1 text-xs text-center outline-none text-[#D92632]"
                          placeholder="Price"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-gray-600">₹{item.price}</span>
                      )}
                    </td>

                    <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                      {item.editing ? (
                         <div className="relative w-24 sm:w-32 mx-auto">
                           <select
                             value={item.editCategory}
                             onChange={(e) => updateEditField(item.id, 'editCategory', e.target.value)}
                             className="w-full border border-red-300 rounded px-2 py-1 text-xs outline-none text-[#D92632] appearance-none"
                           >
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                           <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-[10px] sm:text-xs font-bold text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                          {item.category}
                        </span>
                      )}
                    </td>

                    <td className="py-2 sm:py-3 px-3 sm:px-6">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        {item.editing ? (
                          <>
                            <button 
                              onClick={() => onSaveEdit(item.id)}
                              className="bg-[#10B981] text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold hover:bg-[#059669] transition-colors whitespace-nowrap"
                              title="Save changes"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => cancelEdit(item.id)}
                              className="bg-[#EF4444] text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold hover:bg-[#DC2626] transition-colors whitespace-nowrap"
                              title="Cancel editing"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEdit(item.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D1FAE5] text-[#10B981] flex items-center justify-center hover:bg-[#A7F3D0] transition-colors"
                              title="Edit item"
                            >
                              <Pencil size={12} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => onDelete(item.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center hover:bg-[#FECACA] transition-colors"
                              title="Delete item"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
