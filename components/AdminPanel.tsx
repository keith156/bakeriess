
import React, { useState, useEffect, useRef } from 'react';
import { Cake, Coupon, AdminView, SiteConfig } from '../types';
import { dbService } from '../services/dbService';
import { generateDescription } from '../services/geminiService';
import { compressImage } from '../utils/imageOptimizer';

interface AdminPanelProps {
  cakes: Cake[];
  setCakes: React.Dispatch<React.SetStateAction<Cake[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  siteConfig: SiteConfig;
  onUpdateSite: (config: SiteConfig) => void;
  onAddNewClick?: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  cakes, setCakes,
  coupons, setCoupons,
  categories, setCategories,
  onClose, siteConfig, onUpdateSite,
  onAddNewClick,
  isAuthenticated,
  setIsAuthenticated
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeView, setActiveView] = useState<AdminView | 'SETTINGS'>(AdminView.CAKES);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formCake, setFormCake] = useState<Partial<Cake>>({ category: categories[0] || 'Birthday' });
  const [formCoupon, setFormCoupon] = useState<Partial<Coupon>>({ code: '', discountPercent: 10 });
  const [newCategory, setNewCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const cakeImageInputRef = useRef<HTMLInputElement>(null);
  const currentLimit = siteConfig.maxItems || 100;
  const isAtLimit = cakes.length >= currentLimit;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const configUser = (siteConfig.adminUser || 'admin').toLowerCase();
    const configPass = siteConfig.adminPass || 'password';

    if (username.toLowerCase() === configUser && password === configPass) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect credentials. Check Engine Dashboard.');
    }
  };

  const handleSaveCake = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing && isAtLimit) {
      alert(`Capacity Reached! Contact support to upgrade.`);
      return;
    }

    setIsSaving(true);
    const cakeData: Cake = {
      id: isEditing || `cake-${Math.random().toString(36).substr(2, 9)}`,
      name: formCake.name || 'Unnamed Cake',
      description: formCake.description || 'Artisanal creation.',
      price: Number(formCake.price) || 0,
      imageUrl: formCake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
      category: formCake.category || categories[0] || 'Birthday',
      siteId: siteConfig.id
    };

    try {
      const updatedCakes = isEditing
        ? cakes.map(c => c.id === isEditing ? cakeData : c)
        : [cakeData, ...cakes];

      setCakes(updatedCakes);
      localStorage.setItem(`cakes_${siteConfig.id}`, JSON.stringify(updatedCakes));

      await dbService.saveCake(cakeData);

      setFormCake({ category: categories[0] || 'Birthday' });
      setIsEditing(null);
      setIsAddingNew(false);
    } catch (err) {
      setIsEditing(null);
      setIsAddingNew(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCake = async (id: string) => {
    // Explicit confirmation
    const confirmed = window.confirm("Are you sure you want to delete this cake? This action is permanent.");
    if (confirmed) {
      // 1. UPDATE UI IMMEDIATELY
      const updatedCakes = cakes.filter(c => c.id !== id);
      setCakes(updatedCakes);

      // 2. UPDATE LOCAL STORAGE IMMEDIATELY
      localStorage.setItem(`cakes_${siteConfig.id}`, JSON.stringify(updatedCakes));

      // 3. ATTEMPT BACKGROUND DELETE
      try {
        await dbService.deleteCake(id);
      } catch (err) {
        console.warn("Server delete failed, but item removed locally.");
      }
    }
  };

  const handleAiDescription = async () => {
    if (!formCake.name) return;
    setIsGenerating(true);
    const desc = await generateDescription(formCake.name, formCake.category || 'Bakery');
    setFormCake(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleCakeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimizedImage = await compressImage(file);
        setFormCake(prev => ({ ...prev, imageUrl: optimizedImage }));
      } catch (err) {
        console.error("Compression failed", err);
        alert("Failed to process image.");
      }
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCoupon.code) return;
    const couponData: Coupon = {
      code: formCoupon.code.toUpperCase(),
      discountPercent: Number(formCoupon.discountPercent),
      siteId: siteConfig.id
    };
    const updated = [...coupons.filter(c => c.code !== couponData.code), couponData];
    setCoupons(updated);
    localStorage.setItem(`coupons_${siteConfig.id}`, JSON.stringify(updated));
    await dbService.saveCoupon(couponData);
    setFormCoupon({ code: '', discountPercent: 10 });
  };

  const handleDeleteCoupon = async (code: string) => {
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    localStorage.setItem(`coupons_${siteConfig.id}`, JSON.stringify(updated));
    await dbService.deleteCoupon(code, siteConfig.id);
  };

  const handleAddCategory = async () => {
    if (!newCategory || categories.includes(newCategory)) return;
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem(`categories_${siteConfig.id}`, JSON.stringify(updated));
    await dbService.updateCategories(siteConfig.id, updated);
    setNewCategory('');
  };

  const handleRemoveCategory = async (cat: string) => {
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    localStorage.setItem(`categories_${siteConfig.id}`, JSON.stringify(updated));
    await dbService.updateCategories(siteConfig.id, updated);
  };

  const handleContactEngineSupport = () => {
    const message = encodeURIComponent(`Hello! My bakery ${siteConfig.name} needs more item slots.`);
    window.open(`https://wa.me/256787618537?text=${message}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-midnight flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl text-center">
          <div style={{ backgroundColor: siteConfig.themeColor }} className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center text-midnight shadow-lg"><i className="fa-solid fa-lock text-3xl"></i></div>
          <h2 className="text-3xl font-serif text-midnight mb-8 font-bold">Manager Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#f4f7f9] p-5 rounded-2xl outline-none border-2 border-transparent focus:border-primary-yellow transition-all" placeholder="Username" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#f4f7f9] p-5 rounded-2xl outline-none border-2 border-transparent focus:border-primary-yellow transition-all" placeholder="Password" />
            {loginError && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{loginError}</p>}
            <button className="w-full bg-midnight text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all">Access Dashboard</button>
            <button type="button" onClick={onClose} className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-6">Back to Shop</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden font-sans animate-fade-in">
      <aside className="w-full md:w-72 bg-white border-r border-slate-100 flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-4 mb-14">
          <div style={{ backgroundColor: siteConfig.themeColor }} className="w-12 h-12 rounded-xl flex items-center justify-center text-midnight shrink-0 overflow-hidden shadow-sm">
            {siteConfig.logo ? <img src={siteConfig.logo} className="w-full h-full object-cover" /> : <span className="font-serif font-bold italic text-lg">{siteConfig.name.charAt(0)}</span>}
          </div>
          <h2 className="text-xl font-bold font-serif text-midnight truncate">{siteConfig.name}</h2>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar md:overflow-visible mb-6">
          <button onClick={() => setActiveView(AdminView.CAKES)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === AdminView.CAKES ? 'bg-midnight text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <i className="fa-solid fa-cake-candles"></i><span>Inventory</span>
          </button>
          <button onClick={() => setActiveView(AdminView.COUPONS)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === AdminView.COUPONS ? 'bg-midnight text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <i className="fa-solid fa-ticket"></i><span>Coupons</span>
          </button>
          <button onClick={() => setActiveView('SETTINGS')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'SETTINGS' ? 'bg-midnight text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <i className="fa-solid fa-sliders"></i><span>Settings</span>
          </button>
        </nav>

        <button onClick={onClose} className="mt-auto hidden md:block text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors py-4">Exit Manager</button>
      </aside>

      <main className="flex-grow overflow-y-auto p-6 md:p-12 bg-[#f8fafc]">
        {activeView === AdminView.CAKES && (
          <div className="max-w-5xl mx-auto space-y-10 animate-fade-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="w-full md:w-auto">
                <h3 className="text-3xl font-bold text-midnight font-serif">Product Inventory</h3>
                <div className="mt-2">
                  {isAtLimit && (
                    <div className="bg-red-50 border border-red-100 p-3 px-4 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation text-red-500 text-sm"></i>
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">limit reached ({cakes.length}/{currentLimit})</span>
                      </div>
                      <button
                        onClick={handleContactEngineSupport}
                        className="bg-midnight text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <i className="fa-brands fa-whatsapp text-sm"></i> upgrade slots
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!isAtLimit && (
                <button
                  onClick={() => {
                    if (onAddNewClick) {
                      onAddNewClick();
                    } else {
                      setIsAddingNew(true);
                      setIsEditing(null);
                      setFormCake({ category: categories[0] });
                    }
                  }}
                  style={{ backgroundColor: siteConfig.themeColor }}
                  className="px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-midnight shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Add New Creation
                </button>
              )}
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {cakes.length > 0 ? cakes.map(cake => (
                <div key={cake.id} className="bg-white p-6 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-card transition-all group relative animate-fade-up">
                  <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 border border-slate-100">
                    <img src={cake.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-midnight text-xl font-serif leading-tight">{cake.name}</p>
                      <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{cake.category}</span>
                    </div>
                    <p className="text-emerald-500 font-black tracking-widest text-[11px]">UGX {cake.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <button onClick={() => { setIsEditing(cake.id); setFormCake(cake); setIsAddingNew(true); }} className="flex-grow bg-[#f4f7f9] text-midnight py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-yellow transition-all">Edit Item</button>

                    {/* FIXED DELETE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteCake(cake.id);
                      }}
                      className="w-12 h-12 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group/del cursor-pointer z-30 relative"
                      title="Delete product"
                    >
                      <i className="fa-solid fa-trash-can text-lg transition-transform group-hover/del:scale-110"></i>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-50 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                    <i className="fa-solid fa-cake-candles text-4xl"></i>
                  </div>
                  <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Your collection is empty</p>
                </div>
              )}
            </div>

            {isAddingNew && (
              <div className="fixed inset-0 z-[150] bg-midnight/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-t-[3rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl animate-fade-up relative max-h-[92vh] overflow-y-auto no-scrollbar">
                  <button onClick={() => { setIsAddingNew(false); setIsEditing(null); }} className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-300 hover:text-midnight transition-colors"><i className="fa-solid fa-times text-2xl"></i></button>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-midnight mb-6 md:mb-10 pr-10">{isEditing ? 'Update Creation' : 'Launch New Creation'}</h3>

                  {!isEditing && isAtLimit ? (
                    <div className="text-center py-10 bg-red-50 rounded-[2.5rem] border border-red-100 px-6">
                      <i className="fa-solid fa-circle-exclamation text-4xl text-red-500 mb-6"></i>
                      <p className="text-midnight font-bold mb-2">Maximum Capacity Reached</p>
                      <button onClick={handleContactEngineSupport} className="bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-3 mx-auto">
                        <i className="fa-brands fa-whatsapp text-lg"></i>
                        Contact Support
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveCake} className="space-y-6 md:space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Photo</label>
                          <div onClick={() => cakeImageInputRef.current?.click()} className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary-yellow transition-all">
                            {formCake.imageUrl ? <img src={formCake.imageUrl} className="w-full h-full object-cover" /> : <div className="text-center p-4"><i className="fa-solid fa-camera text-3xl text-slate-200 mb-3"></i><p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Upload Photo</p></div>}
                            <input type="file" ref={cakeImageInputRef} onChange={handleCakeImageUpload} className="hidden" accept="image/*" />
                          </div>
                        </div>
                        <div className="space-y-5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</label>
                            <input type="text" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight" value={formCake.name || ''} onChange={e => setFormCake({ ...formCake, name: e.target.value })} placeholder="e.g. Dreamy Velvet" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (UGX)</label>
                              <input type="number" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight" value={formCake.price || ''} onChange={e => setFormCake({ ...formCake, price: Number(e.target.value) })} placeholder="80000" required />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                              <select className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight appearance-none" value={formCake.category} onChange={e => setFormCake({ ...formCake, category: e.target.value })}>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                              <button type="button" onClick={handleAiDescription} disabled={isGenerating} className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-1 active:scale-95 transition-transform"><i className="fa-solid fa-wand-magic-sparkles"></i> {isGenerating ? 'Working...' : 'AI Magic'}</button>
                            </div>
                            <textarea className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none min-h-[100px] text-sm resize-none" value={formCake.description || ''} onChange={e => setFormCake({ ...formCake, description: e.target.value })} placeholder="Describe the flavors..."></textarea>
                          </div>
                        </div>
                      </div>
                      <button type="submit" disabled={isSaving} className="w-full bg-midnight text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 mb-4">
                        {isSaving ? 'Processing...' : isEditing ? 'Update Creation' : 'Launch Creation'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === AdminView.COUPONS && (
          <div className="max-w-2xl mx-auto space-y-10 animate-fade-up">
            <header>
              <h3 className="text-3xl font-bold text-midnight font-serif">Marketing Coupons</h3>
            </header>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
              <form onSubmit={handleSaveCoupon} className="flex flex-col md:flex-row gap-5 items-end">
                <div className="flex-grow space-y-2 w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Promo Code</label>
                  <input type="text" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-black uppercase tracking-widest" value={formCoupon.code} onChange={e => setFormCoupon({ ...formCoupon, code: e.target.value.toUpperCase() })} placeholder="FARAH20" />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount %</label>
                  <input type="number" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold" value={formCoupon.discountPercent} onChange={e => setFormCoupon({ ...formCoupon, discountPercent: Number(e.target.value) })} placeholder="20" />
                </div>
                <button type="submit" className="w-full md:w-auto bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">Save</button>
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Live Codes</h4>
              <div className="grid grid-cols-1 gap-4">
                {coupons.length > 0 ? coupons.map(cp => (
                  <div key={cp.code} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-inner"><i className="fa-solid fa-ticket"></i></div>
                      <div>
                        <p className="font-black text-midnight tracking-[0.2em] uppercase text-lg">{cp.code}</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{cp.discountPercent}% OFF ORDER</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCoupon(cp.code)} className="w-12 h-12 flex items-center justify-center text-slate-100 hover:text-red-500 transition-colors"><i className="fa-solid fa-circle-xmark text-2xl"></i></button>
                  </div>
                )) : (
                  <p className="text-center py-20 text-slate-200 font-bold uppercase tracking-[0.3em] text-[10px]">No codes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'SETTINGS' && (
          <div className="max-w-2xl mx-auto space-y-10 animate-fade-up">
            <header>
              <h3 className="text-3xl font-bold text-midnight font-serif">Boutique Configuration</h3>
            </header>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
              <h4 className="text-xl font-bold font-serif mb-8 text-midnight">Menu Categories</h4>
              <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                  {categories.map(cat => (
                    <div key={cat} className="group bg-[#f4f7f9] pl-5 pr-3 py-2.5 rounded-full border border-slate-100 flex items-center gap-3 transition-all hover:border-red-100 hover:bg-red-50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-500">{cat}</span>
                      <button onClick={() => handleRemoveCategory(cat)} className="text-slate-200 hover:text-red-500 transition-colors"><i className="fa-solid fa-circle-xmark text-lg"></i></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <input type="text" className="flex-grow p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Wedding Cakes" onKeyPress={e => e.key === 'Enter' && handleAddCategory()} />
                  <button onClick={handleAddCategory} className="bg-midnight text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Add</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
              <h4 className="text-xl font-bold font-serif mb-8 text-midnight">Public Info</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                  <input type="text" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-medium text-midnight" value={siteConfig.tagline} onChange={e => onUpdateSite({ ...siteConfig, tagline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Order Line</label>
                  <input type="text" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight" value={siteConfig.phone} onChange={e => onUpdateSite({ ...siteConfig, phone: e.target.value })} />
                </div>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-8 rounded-[2.5rem] border-4 border-dashed border-slate-100 text-slate-300 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-midnight transition-all active:scale-95">Exit Portal</button>
          </div>
        )}


      </main>
    </div>
  );
};

export default AdminPanel;
