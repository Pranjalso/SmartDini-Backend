"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useParams } from "next/navigation";
import { UtensilsCrossed, Image as ImageIcon, Pencil, Trash2, Check, X, ChevronDown, UploadCloud, Plus, Tag, Loader2 } from "lucide-react";
import useSWR, { mutate } from "swr";

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

// Skeleton Loader Component for Menu Items
const MenuItemsSkeleton = () => {
  return (
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
            {[...Array(5)].map((_, index) => (
              <tr key={`skeleton-${index}`} className="border-b border-gray-100 last:border-0">
                <td className="py-2 sm:py-3 px-3 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                  <div className="h-4 w-16 mx-auto bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                  <div className="h-6 w-20 mx-auto bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="py-2 sm:py-3 px-3 sm:px-6">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ManageMenuClient() {
  const params = useParams();
  const menupages = params?.menupages as string;

  const menuUrl = menupages ? `/api/menu/${menupages}` : null;
  const { data, isLoading: swrLoading, error: swrError } = useSWR(menuUrl);

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize local menu state with SWR data
  useEffect(() => {
    if (data?.success) {
      const formattedMenu = data.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl,
        editing: false
      }));
      setMenu(formattedMenu);
      
      // Extract unique categories
      const uniqueCats = Array.from(new Set(formattedMenu.map((m: any) => m.category))) as string[];
      setCategories(uniqueCats.length > 0 ? uniqueCats : DEFAULT_CATEGORIES);
    }
  }, [data]);

  const initialLoading = swrLoading && !data;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = async () => {
    if (!itemName || !price || !category) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = getUnsplashImage(itemName);

      // Handle image upload if a file is selected
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.url;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/menu/${menupages}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          price: parseFloat(price),
          category: category,
          imageUrl: finalImageUrl,
          isAvailable: true
        })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh cache
        mutate(menuUrl);
        
        // Reset form
        setItemName("");
        setPrice("");
        setCategory("");
        setImgPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to add item:", err);
      alert("Error adding menu item.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => {
    setMenu(menu.map(item => {
      if (item.id === id) {
        return {
          ...item,
          editing: !item.editing,
          editName: item.name,
          editPrice: item.price,
          editCategory: item.category,
          editImageUrl: item.imageUrl,
          editImageFile: null
        };
      }
      return item;
    }));
  };

  const handleEditChange = (id: string, field: string, value: any) => {
    setMenu(menu.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleEditImageChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenu(menu.map(item => {
          if (item.id === id) {
            return { ...item, editImageUrl: reader.result as string, editImageFile: file };
          }
          return item;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveEdit = async (id: string) => {
    const item = menu.find(i => i.id === id);
    if (!item) return;

    setLoading(true);
    try {
      let finalImageUrl = item.editImageUrl;

      // Handle image upload if a new file is selected during edit
      if (item.editImageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', item.editImageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalImageUrl = uploadData.url;
        }
        setUploading(false);
      }

      const res = await fetch(`/api/menu/${menupages}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          name: item.editName,
          price: item.editPrice,
          category: item.editCategory,
          imageUrl: finalImageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        mutate(menuUrl);
      }
    } catch (err) {
      console.error("Failed to save edit:", err);
      alert("Error updating menu item.");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/menu/${menupages}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        mutate(menuUrl);
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Error deleting menu item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px] w-full">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEFEF] flex items-center justify-center">
            <UtensilsCrossed className="text-[#D92632]" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Manage Menu</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update your digital items</p>
          </div>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-md border border-gray-100">
            <Loader2 className="text-[#D92632] animate-spin" size={16} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {uploading ? "Uploading Image..." : "Processing..."}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Column: Add New Item Form ─── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F3F4F6] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100 sticky top-4 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="text-[#D92632]" size={20} strokeWidth={3} />
              Add New Item
            </h3>
            
            <div className="space-y-5">
              {/* Image Upload Area */}
              <div className="relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden
                    ${imgPreview ? "border-transparent" : "border-gray-300 hover:border-[#D92632] bg-gray-50"}
                  `}
                >
                  {imgPreview ? (
                    <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <UploadCloud className="text-[#D92632]" size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>
                    </div>
                  )}
                  {imgPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Change Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Item Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Classic Margherita"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-md px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D92632]/20 focus:border-[#D92632] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-md px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D92632]/20 focus:border-[#D92632] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-md px-4 py-3 text-sm font-bold text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#D92632]/20 focus:border-[#D92632] transition-all"
                      >
                        <option value="">Select</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="new">+ Add New</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                {category === "new" && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Beverages"
                      onBlur={(e) => {
                        if (e.target.value) {
                          setCategories([...categories, e.target.value]);
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-white border border-gray-100 rounded-md px-4 py-3 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D92632]/20 focus:border-[#D92632] transition-all"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={addItem}
                disabled={loading}
                className="w-full bg-[#D92632] text-white py-4 rounded-md text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-[#b51f29] transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Menu Table ─── */}
        <div className="lg:col-span-8">
          {initialLoading ? (
            <MenuItemsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <X className="text-red-400 mb-4" size={40} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{error}</p>
            </div>
          ) : menu.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <UtensilsCrossed className="text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your menu is empty</p>
              <p className="text-gray-400 text-xs mt-2">Start adding items using the form on the left</p>
            </div>
          ) : (
            <div className="bg-[#F3F4F6] rounded-xl sm:rounded-2xl p-1 overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="bg-[#D92632] text-white">
                      <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest">Item Details</th>
                      <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest">Price</th>
                      <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest">Category</th>
                      <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {menu.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          {item.editing ? (
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-100 flex-shrink-0">
                                <img src={item.editImageUrl} alt={item.editName} className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-md">
                                  <ImageIcon size={14} className="text-white" />
                                  <input type="file" className="hidden" onChange={(e) => handleEditImageChange(item.id, e)} />
                                </label>
                              </div>
                              <input
                                type="text"
                                value={item.editName}
                                onChange={(e) => handleEditChange(item.id, "editName", e.target.value)}
                                className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#D92632]"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <span className="text-sm font-bold text-gray-900">{item.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.editing ? (
                            <div className="relative inline-block">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                value={item.editPrice}
                                onChange={(e) => handleEditChange(item.id, "editPrice", parseFloat(e.target.value))}
                                className="w-24 bg-white border border-gray-200 rounded-md pl-6 pr-2 py-2 text-sm font-bold text-center focus:outline-none focus:border-[#D92632]"
                              />
                            </div>
                          ) : (
                            <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.editing ? (
                            <div className="relative">
                              <select
                                value={item.editCategory}
                                onChange={(e) => handleEditChange(item.id, "editCategory", e.target.value)}
                                className="w-32 bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-bold appearance-none focus:outline-none focus:border-[#D92632]"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-50">
                              <Tag size={10} />
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {item.editing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(item.id)}
                                  className="w-9 h-9 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm"
                                  title="Save Changes"
                                >
                                  <Check size={18} strokeWidth={3} />
                                </button>
                                <button
                                  onClick={() => toggleEdit(item.id)}
                                  className="w-9 h-9 rounded-md bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
                                  title="Cancel Edit"
                                >
                                  <X size={18} strokeWidth={3} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleEdit(item.id)}
                                  className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
                                  title="Edit Item"
                                >
                                  <Pencil size={16} strokeWidth={2.5} />
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="w-9 h-9 rounded-md bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
                                  title="Delete Item"
                                >
                                  <Trash2 size={16} strokeWidth={2.5} />
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
          )}
        </div>
      </div>
    </div>
  );
}