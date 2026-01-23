
import React, { useState, useEffect, useRef } from 'react';
import { SiteConfig, Cake } from '../types';
import { INITIAL_CAKES, INITIAL_CATEGORIES } from '../constants';

interface SuperAdminDashboardProps {
  sites: SiteConfig[];
  onSelect: (site: SiteConfig) => void;
  onDelete: (id: string) => void;
  onUpdateSite: (config: SiteConfig) => void;
  onCreateNew: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ sites, onSelect, onDelete, onUpdateSite, onCreateNew }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'SITES' | 'DEFAULTS'>('SITES');
  const [globalCakes, setGlobalCakes] = useState<Cake[]>([]);
  const [globalCategories, setGlobalCategories] = useState<string[]>([]);
  const [isAddingCake, setIsAddingCake] = useState(false);
  const [newCake, setNewCake] = useState<Partial<Cake>>({ category: 'Birthday' });
  
  // Site Editing state
  const [editingSite, setEditingSite] = useState<SiteConfig | null>(null);
  
  const cakeImageRef = useRef<HTMLInputElement>(null);
  const siteLogoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCakes = localStorage.getItem('heaven_engine_default_cakes');
    const savedCats = localStorage.getItem('heaven_engine_default_categories');
    setGlobalCakes(savedCakes ? JSON.parse(savedCakes) : INITIAL_CAKES);
    setGlobalCategories(savedCats ? JSON.parse(savedCats) : INITIAL_CATEGORIES);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid engine credentials');
    }
  };

  const saveGlobalDefaults = (cakes: Cake[], categories: string[]) => {
    localStorage.setItem('heaven_engine_default_cakes', JSON.stringify(cakes));
    localStorage.setItem('heaven_engine_default_categories', JSON.stringify(categories));
    setGlobalCakes(cakes);
    setGlobalCategories(categories);
  };

  const handleAddGlobalCake = () => {
    if (!newCake.name || !newCake.price) return;
    const cake: Cake = {
      id: `default-${Math.random().toString(36).substr(2, 5)}`,
      name: newCake.name,
      description: newCake.description || '',
      price: Number(newCake.price),
      imageUrl: newCake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
      category: newCake.category || globalCategories[0] || 'Birthday'
    };
    const updated = [cake, ...globalCakes];
    saveGlobalDefaults(updated, globalCategories);
    setNewCake({ category: globalCategories[0] || 'Birthday' });
    setIsAddingCake(false);
  };

  const removeGlobalCake = (id: string) => {
    const updated = globalCakes.filter(c => c.id !== id);
    saveGlobalDefaults(updated, globalCategories);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cake' | 'site') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'cake') {
          setNewCake(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else if (target === 'site' && editingSite) {
          setEditingSite(prev => prev ? ({ ...prev, logo: reader.result as string }) : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getCakeCountForSite = (id: string) => {
    const saved = localStorage.getItem(`cakes_${id}`);
    if (saved) return JSON.parse(saved).length;
    return 0;
  };

  const getBaseUrl = () => window.location.origin + window.location.pathname;

  const handleSaveEditedSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSite) {
      onUpdateSite(editingSite);
      setEditingSite(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl animate-fade-up">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary-yellow rounded-2xl flex items-center justify-center text-midnight mx-auto mb-6 shadow-lg rotate-3">
              <i className="fa-solid fa-server text-2xl"></i>
            </div>
            <h1 className="text-3xl font-serif font-bold text-midnight">Engine Login</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Heaven Multi-Tenant Platform</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight border-2 border-transparent focus:border-primary-yellow transition-all"
              value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
            />
            <input 
              type="password" className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none font-bold text-midnight border-2 border-transparent focus:border-primary-yellow transition-all"
              value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            />
            {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-800 transition-all">Access Engine</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-100 px-6 md:px-16 py-6 sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-yellow rounded-xl flex items-center justify-center text-midnight shadow-sm">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <h2 className="text-xl font-bold font-serif text-midnight">Heaven Engine</h2>
          </div>
          <div className="flex bg-[#f4f7f9] p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => setActiveTab('SITES')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SITES' ? 'bg-white text-midnight shadow-sm' : 'text-slate-400 hover:text-midnight'}`}>Fleet</button>
            <button onClick={() => setActiveTab('DEFAULTS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DEFAULTS' ? 'bg-white text-midnight shadow-sm' : 'text-slate-400 hover:text-midnight'}`}>Seeds</button>
          </div>
        </div>
      </nav>

      <main className="p-6 md:p-16 flex-grow">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'SITES' ? (
            <div className="animate-fade-up">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-midnight leading-tight">Bakery Fleet</h1>
                  <p className="text-slate-400 mt-2 font-medium">Monitoring {sites.length} active boutique deployments.</p>
                </div>
                <button onClick={onCreateNew} className="bg-midnight text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <i className="fa-solid fa-plus text-lg"></i> Launch New Bakery
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {sites.map(site => (
                  <div key={site.id} className="bg-white rounded-[3.5rem] p-10 shadow-card border border-slate-50 relative group overflow-hidden animate-fade-up">
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-10 -mr-16 -mt-16 rounded-full bg-[#FEF3C7] group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="flex items-center gap-5 mb-10 relative z-10">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-card flex items-center justify-center overflow-hidden shrink-0 border border-slate-50">
                        {site.logo ? (
                          <img src={site.logo} className="w-full h-full object-cover" />
                        ) : (
                          <div style={{backgroundColor: site.themeColor}} className="w-full h-full flex items-center justify-center text-midnight font-serif font-bold italic text-3xl">
                            {site.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h3 className="text-2xl font-bold text-[#3B2F2F] truncate leading-tight">{site.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <i className="fa-solid fa-link text-[10px] text-slate-300"></i>
                          <span className="text-[11px] font-black text-[#A5B4FC] uppercase tracking-widest truncate">/{site.slug}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingSite(site)}
                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:text-midnight transition-colors flex items-center justify-center shrink-0"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    </div>

                    <div className="bg-[#f4f7f9] p-6 rounded-[2rem] mb-6">
                      <p className="text-[11px] font-black text-[#A5B4FC] uppercase tracking-widest mb-3 ml-1">Live URL</p>
                      <p className="text-[11px] text-slate-500 font-bold break-all leading-relaxed opacity-80">
                        {getBaseUrl()}#/{site.slug}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="bg-[#f4f7f9] p-8 rounded-[2rem] text-center flex flex-col items-center justify-center relative group/item">
                        <p className="text-[11px] font-black text-[#A5B4FC] uppercase tracking-widest mb-2">Items</p>
                        <div className="flex items-baseline gap-1">
                           <p className="text-4xl font-bold text-[#3B2F2F] leading-none">{getCakeCountForSite(site.id)}</p>
                           <div className="flex items-center text-[10px] font-black text-[#A5B4FC] uppercase">
                             <span className="mr-0.5">/</span>
                             <input 
                                type="number" 
                                value={site.maxItems || 100}
                                onChange={(e) => onUpdateSite({ ...site, maxItems: Number(e.target.value) })}
                                className="w-12 bg-white/50 px-1 py-0.5 rounded border border-transparent focus:border-[#A5B4FC] focus:bg-white outline-none text-center transition-all font-black text-[10px]"
                                title="Edit Item Limit"
                             />
                           </div>
                        </div>
                      </div>
                      <div className="bg-[#f4f7f9] p-8 rounded-[2rem] text-center flex flex-col items-center justify-center">
                        <p className="text-[11px] font-black text-[#A5B4FC] uppercase tracking-widest mb-2">Status</p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
                          <p className="text-[11px] font-black text-[#10B981] uppercase tracking-widest">Online</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onSelect(site)}
                        className="flex-grow bg-[#3B2F2F] text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest text-[12px] shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                      >
                        Launch Site
                      </button>
                      <button 
                        onClick={() => onDelete(site.id)}
                        className="w-20 h-20 flex items-center justify-center rounded-[1.8rem] bg-[#FFF5F5] text-[#FF9999] hover:bg-red-100 hover:text-red-500 transition-all active:scale-95 shrink-0"
                      >
                        <i className="fa-solid fa-trash-can text-2xl"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-fade-up max-w-4xl mx-auto">
               <header className="mb-12 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-midnight leading-tight">System Seeds</h1>
                  <p className="text-slate-400 mt-2 font-medium">Configure initial products for every new boutique launched.</p>
                </div>
                <button onClick={() => setIsAddingCake(true)} className="bg-midnight text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center gap-3">
                  <i className="fa-solid fa-plus"></i> Add Seed Cake
                </button>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Seed List */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                  <h3 className="text-xl font-bold font-serif mb-8 text-midnight border-b border-slate-50 pb-4">Seed Inventory</h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                    {globalCakes.length > 0 ? globalCakes.map(cake => (
                      <div key={cake.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-primary-yellow">
                        <img src={cake.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-midnight text-sm truncate">{cake.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cake.category} • UGX {cake.price.toLocaleString()}</p>
                        </div>
                        <button onClick={() => removeGlobalCake(cake.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                          <i className="fa-solid fa-circle-minus text-xl"></i>
                        </button>
                      </div>
                    )) : (
                      <p className="text-center py-20 text-slate-300 text-[10px] uppercase font-black tracking-[0.2em]">No seeds defined in system</p>
                    )}
                  </div>
                </div>

                {/* Categories & Info */}
                <div className="space-y-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                    <h3 className="text-xl font-bold font-serif mb-8 text-midnight border-b border-slate-50 pb-4">Default Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {globalCategories.map(cat => (
                        <div key={cat} className="px-5 py-2.5 bg-[#f4f7f9] text-midnight rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                          {cat}
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                      <i className="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
                      <p className="text-[11px] font-medium text-blue-800 leading-relaxed">Seeds are cloned when a new boutique is generated. Existing boutiques will not be affected by changes here.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Site Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-[200] bg-midnight/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif font-bold text-midnight">Edit Site Configuration</h3>
              <button onClick={() => setEditingSite(null)} className="text-slate-400 hover:text-midnight transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSaveEditedSite} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Section */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bakery Logo</label>
                   <div 
                    onClick={() => siteLogoRef.current?.click()}
                    className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary-yellow transition-all"
                   >
                     {editingSite.logo ? (
                       <img src={editingSite.logo} className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center p-4">
                         <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 group-hover:text-primary-yellow mb-4"></i>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Logo</p>
                       </div>
                     )}
                     <input type="file" ref={siteLogoRef} onChange={(e) => handleImageUpload(e, 'site')} className="hidden" accept="image/*" />
                   </div>
                </div>

                {/* Details Section */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bakery Name</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={editingSite.name} onChange={e => setEditingSite({...editingSite, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-medium text-sm" value={editingSite.tagline} onChange={e => setEditingSite({...editingSite, tagline: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Phone</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-xl outline-none font-bold" value={editingSite.phone} onChange={e => setEditingSite({...editingSite, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#A5B4FC] uppercase tracking-widest ml-1">Item Limit (Max Slots)</label>
                    <input type="number" className="w-full p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl outline-none font-black text-midnight" value={editingSite.maxItems || 100} onChange={e => setEditingSite({...editingSite, maxItems: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* Security Credentials */}
              <div className="bg-[#f4f7f9] p-8 rounded-[2rem] space-y-6">
                <h4 className="text-[10px] font-black text-[#A5B4FC] uppercase tracking-widest ml-1">Manager Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                    <input type="text" className="w-full p-4 bg-white rounded-xl outline-none font-bold text-sm" value={editingSite.adminUser} onChange={e => setEditingSite({...editingSite, adminUser: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input type="text" className="w-full p-4 bg-white rounded-xl outline-none font-bold text-sm" value={editingSite.adminPass} onChange={e => setEditingSite({...editingSite, adminPass: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Surname</label>
                  <input type="text" className="w-full p-4 bg-white rounded-xl outline-none font-bold text-sm" value={editingSite.adminSurname || ''} onChange={e => setEditingSite({...editingSite, adminSurname: e.target.value})} placeholder="Manager's last name" />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setEditingSite(null)} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px]">Cancel</button>
                <button type="submit" className="flex-[2] bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seed Add Modal */}
      {isAddingCake && (
        <div className="fixed inset-0 z-[200] bg-midnight/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif font-bold text-midnight">Create Seed Cake</h3>
              <button onClick={() => setIsAddingCake(false)} className="text-slate-400 hover:text-midnight transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div className="space-y-6">
               <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 group hover:border-primary-yellow transition-all">
                  <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden shadow-sm flex items-center justify-center text-slate-200">
                     {newCake.imageUrl ? <img src={newCake.imageUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-cake-candles text-3xl"></i>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => cakeImageRef.current?.click()} className="bg-midnight text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all">Upload Photo</button>
                    {newCake.imageUrl && <button onClick={() => setNewCake({...newCake, imageUrl: ''})} className="text-red-400 text-[9px] font-black uppercase tracking-widest text-center">Remove</button>}
                  </div>
                  <input type="file" ref={cakeImageRef} onChange={(e) => handleImageUpload(e, 'cake')} className="hidden" accept="image/*" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-midnight border-2 border-transparent focus:border-primary-yellow transition-all" placeholder="e.g. Classic Vanilla" value={newCake.name || ''} onChange={e => setNewCake({...newCake, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (UGX)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-midnight border-2 border-transparent focus:border-primary-yellow transition-all" placeholder="80000" value={newCake.price || ''} onChange={e => setNewCake({...newCake, price: Number(e.target.value)})} />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-midnight border-2 border-transparent focus:border-primary-yellow transition-all" value={newCake.category} onChange={e => setNewCake({...newCake, category: e.target.value})}>
                    {globalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </div>
               <button onClick={handleAddGlobalCake} className="w-full bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Add to Global Seeds
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
