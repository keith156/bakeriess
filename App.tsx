import React, { useState, useEffect } from 'react';
import { Cake, CartItem, Coupon, SiteConfig } from './types';
import { INITIAL_CAKES, INITIAL_COUPONS, INITIAL_CATEGORIES } from './constants';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CakeCard from './components/CakeCard';
import AdminPanel from './components/AdminPanel';
import CartModal from './components/CartModal';
import GeneratorLanding from './components/GeneratorLanding';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AddCakePage from './components/AddCakePage';
import { dbService } from './services/dbService';
import { isKeyInvalidType } from './services/supabaseClient';

type ViewMode = 'DASHBOARD' | 'GENERATOR' | 'SITE';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [allSites, setAllSites] = useState<SiteConfig[]>([]);
  const [activeSite, setActiveSite] = useState<SiteConfig | null>(null);

  const [cakes, setCakes] = useState<Cake[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

  const [isLoading, setIsLoading] = useState(true);
  const [showConfigError, setShowConfigError] = useState(isKeyInvalidType);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAddingCake, setIsAddingCake] = useState(false); // New state for Add Page
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Initial Fetch: Load all sites
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sites = await dbService.getAllSites();
        if (sites && sites.length > 0) {
          setAllSites(sites);
          localStorage.setItem('bakery_engine_sites', JSON.stringify(sites));
        } else {
          const saved = localStorage.getItem('bakery_engine_sites');
          if (saved) setAllSites(JSON.parse(saved));
        }
      } catch (err) {
        const saved = localStorage.getItem('bakery_engine_sites');
        if (saved) setAllSites(JSON.parse(saved));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();

    const handleRouting = () => {
      const hash = window.location.hash.replace('#/', '');
      const hostname = window.location.hostname;
      const savedSites = JSON.parse(localStorage.getItem('bakery_engine_sites') || '[]');

      // 1. Check for Custom Domain Match (Priority)
      // Exclude localhost/deployment URLs if they are not specifically mapped
      const domainMatch = savedSites.find((s: SiteConfig) => s.customDomain === hostname);

      if (domainMatch) {
        setActiveSite(domainMatch);
        setViewMode('SITE');
        return;
      }

      // 2. Fallback to existing Hash Routing
      if (hash === 'generator') {
        setViewMode('GENERATOR');
      } else if (hash) {
        const found = savedSites.find((s: SiteConfig) => s.slug === hash);
        if (found) {
          setActiveSite(found);
          setViewMode('SITE');
        } else {
          setViewMode('DASHBOARD');
          window.location.hash = '';
        }
      } else {
        setViewMode('DASHBOARD');
      }
    };

    handleRouting();
    window.addEventListener('hashchange', handleRouting);
    return () => window.removeEventListener('hashchange', handleRouting);
  }, []);

  // Load Site Data: Heavily robust try-catch
  useEffect(() => {
    if (activeSite) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Attempt DB fetch - errors are caught inside dbService and returned as empty arrays
          const [dbCakes, dbCoupons, dbCategories] = await Promise.all([
            dbService.getCakesBySite(activeSite.id),
            dbService.getCouponsBySite(activeSite.id),
            dbService.getCategoriesBySite(activeSite.id)
          ]);

          const globalCakesJSON = localStorage.getItem('heaven_engine_default_cakes');
          const globalCakes = globalCakesJSON ? JSON.parse(globalCakesJSON) : INITIAL_CAKES;
          const globalCatsJSON = localStorage.getItem('heaven_engine_default_categories');
          const globalCats = globalCatsJSON ? JSON.parse(globalCatsJSON) : INITIAL_CATEGORIES;

          // Merge DB with Local Fallbacks
          if (dbCakes && dbCakes.length > 0) {
            setCakes(dbCakes);
          } else {
            const saved = localStorage.getItem(`cakes_${activeSite.id}`);
            setCakes(saved ? JSON.parse(saved) : globalCakes.map((c: any) => ({ ...c, siteId: activeSite.id })));
          }

          if (dbCoupons && dbCoupons.length > 0) {
            setCoupons(dbCoupons);
          } else {
            const saved = localStorage.getItem(`coupons_${activeSite.id}`);
            setCoupons(saved ? JSON.parse(saved) : INITIAL_COUPONS.map(c => ({ ...c, siteId: activeSite.id })));
          }

          if (dbCategories && dbCategories.length > 0) {
            setCategories(dbCategories);
          } else {
            const saved = localStorage.getItem(`categories_${activeSite.id}`);
            setCategories(saved ? JSON.parse(saved) : globalCats);
          }
        } catch (err) {
          console.warn("Fatal load error (Offline fallback activated):", err);
          const sCakes = localStorage.getItem(`cakes_${activeSite.id}`);
          if (sCakes) setCakes(JSON.parse(sCakes));
          const sCoupons = localStorage.getItem(`coupons_${activeSite.id}`);
          if (sCoupons) setCoupons(JSON.parse(sCoupons));
          const sCats = localStorage.getItem(`categories_${activeSite.id}`);
          if (sCats) setCategories(JSON.parse(sCats));
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [activeSite?.id]);

  const handleCreateSite = async (config: SiteConfig) => {
    setIsLoading(true);
    const updatedSites = [...allSites, config];
    setAllSites(updatedSites);
    localStorage.setItem('bakery_engine_sites', JSON.stringify(updatedSites));
    await dbService.saveSite(config);
    setActiveSite(config);
    window.location.hash = `#/${config.slug}`;
    setIsLoading(false);
  };

  const handleSelectSite = (site: SiteConfig) => {
    window.location.hash = `#/${site.slug}`;
  };

  const handleUpdateSite = async (updatedSite: SiteConfig) => {
    const updatedSites = allSites.map(s => s.id === updatedSite.id ? updatedSite : s);
    setAllSites(updatedSites);
    localStorage.setItem('bakery_engine_sites', JSON.stringify(updatedSites));
    if (activeSite?.id === updatedSite.id) setActiveSite(updatedSite);
    await dbService.saveSite(updatedSite);
  };

  const handleDeleteSite = async (id: string) => {
    if (confirm("Delete this bakery boutique permanently?")) {
      const updatedSites = allSites.filter(s => s.id !== id);
      setAllSites(updatedSites);
      localStorage.setItem('bakery_engine_sites', JSON.stringify(updatedSites));
      await dbService.deleteSite(id);
      if (activeSite?.id === id) window.location.hash = '';
    }
  };

  const addToCart = (cake: Cake) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === cake.id);
      if (existing) {
        return prev.map(item =>
          item.id === cake.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...cake, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // Logic to save new cake from AddCakePage
  const handleSaveNewCake = async (newCake: Cake) => {
    if (!activeSite) return;

    // Update State
    const updatedCakes = [newCake, ...cakes];
    setCakes(updatedCakes);

    // Update Local Storage
    localStorage.setItem(`cakes_${activeSite.id}`, JSON.stringify(updatedCakes));

    // Save to DB
    await dbService.saveCake(newCake);

    // Close page and return to Admin
    setIsAddingCake(false);
    setIsAdminOpen(true); // Re-open admin panel so they can see it
  };

  const ConfigErrorOverlay = () => (
    <div className="fixed inset-0 z-[500] bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-lg w-full bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary-yellow"></div>
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <h2 className="text-3xl font-serif font-bold text-midnight mb-4">Offline Mode</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The database is currently unreachable. You can continue using the app in <strong>Local Mode</strong>. Your changes will be saved to your browser and synced when the connection is restored.
        </p>
        <button
          onClick={() => setShowConfigError(false)}
          className="w-full bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-800 transition-all"
        >
          Proceed to Boutique
        </button>
      </div>
    </div>
  );

  if (viewMode === 'DASHBOARD') {
    return (
      <>
        {showConfigError && <ConfigErrorOverlay />}
        <SuperAdminDashboard
          sites={allSites}
          onSelect={handleSelectSite}
          onDelete={handleDeleteSite}
          onUpdateSite={handleUpdateSite}
          onCreateNew={() => { window.location.hash = '#/generator'; }}
        />
      </>
    );
  }

  if (viewMode === 'GENERATOR') {
    return (
      <GeneratorLanding
        onCreate={handleCreateSite}
        isLoading={isLoading}
        onBack={() => { window.location.hash = ''; }}
      />
    );
  }

  if (!activeSite) return null;

  // Render Add Cake Page Full Screen if active
  if (isAddingCake) {
    return (
      <AddCakePage
        siteConfig={activeSite}
        onSave={handleSaveNewCake}
        onCancel={() => {
          setIsAddingCake(false);
          setIsAdminOpen(true); // Return to admin panel if cancelled
        }}
        categories={categories}
      />
    );
  }

  const displayCategories = ['All', ...categories];
  const filteredCakes = cakes.filter(cake => {
    const matchesCategory = activeCategory === 'All' || cake.category === activeCategory;
    const matchesSearch = cake.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className={`min-h-screen flex flex-col bg-soft-bg transition-all duration-500 animate-fade-in ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {isLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
          <div style={{ borderColor: activeSite.themeColor }} className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        cartCount={cartCount}
        siteName={activeSite.name}
        logo={activeSite.logo}
        themeColor={activeSite.themeColor}
      />

      <main className="flex-grow pt-16">
        <section className="bg-white px-6 pt-20 pb-8 relative overflow-hidden text-center">
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-midnight mb-4 font-serif leading-tight">
              {activeSite.tagline || 'What are we baking today?'}
            </h1>
            <p className="text-slate-muted text-lg font-medium mb-10 max-w-2xl mx-auto">
              Fresh artisanal treats from <span className="font-bold text-midnight">{activeSite.name}</span>.
            </p>

            <div className="max-w-md mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Search for cakes or pastries"
                className="w-full bg-[#f4f7f9] border-2 border-transparent rounded-full pl-12 pr-6 py-3.5 text-xs focus:bg-white focus:border-primary-yellow outline-none transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1">
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={activeCategory === cat ? { backgroundColor: activeSite.themeColor, color: '#3B2F2F', borderColor: activeSite.themeColor } : {}}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'shadow-lg border-transparent' : 'bg-white text-slate-400 border-[#eef2f5] hover:border-slate-300'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-midnight font-serif">Today's Specials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
            {filteredCakes.map((cake) => (
              <CakeCard key={cake.id} cake={cake} onAddToCart={addToCart} themeColor={activeSite.themeColor} />
            ))}
          </div>
        </section>
      </main>

      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-[50]">
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: activeSite.themeColor }}
            className="w-full text-midnight py-5 rounded-[2rem] font-black shadow-2xl flex items-center justify-between px-8 transition-all active:scale-95 group border-b-4 border-black/10"
          >
            <div className="flex items-center gap-4">
              <span className="bg-midnight text-white w-8 h-8 rounded-full text-[12px] flex items-center justify-center font-black">
                {cartCount}
              </span>
              <span className="uppercase text-[11px] tracking-[0.1em] font-black">View Cart</span>
            </div>
            <span className="font-black text-base">UGX {cartTotal.toLocaleString()}</span>
          </button>
        </div>
      )}

      <Footer onStaffClick={() => setIsAdminOpen(true)} siteName={activeSite.name} phone={activeSite.phone} />

      {isCartOpen && (
        <CartModal
          cart={cart}
          coupons={coupons}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQuantity}
          whatsappNumber={activeSite.phone}
          themeColor={activeSite.themeColor}
          siteName={activeSite.name}
        />
      )}

      {isAdminOpen && (
        <AdminPanel
          cakes={cakes} setCakes={setCakes}
          coupons={coupons} setCoupons={setCoupons}
          categories={categories} setCategories={setCategories}
          onClose={() => setIsAdminOpen(false)}
          siteConfig={activeSite}
          onUpdateSite={handleUpdateSite}
          onAddNewClick={() => {
            setIsAdminOpen(false);
            setIsAddingCake(true);
          }}
          isAuthenticated={isAdminAuthenticated}
          setIsAuthenticated={setIsAdminAuthenticated}
        />
      )}
    </div>
  );
};

export default App;
