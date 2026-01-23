
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
  siteName: string;
  logo?: string;
  themeColor: string;
}

const Navbar: React.FC<NavbarProps> = ({ onCartClick, cartCount, siteName, logo, themeColor }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 flex justify-center py-3 px-4 md:px-6`}>
      <div className={`max-w-4xl w-full flex items-center justify-between transition-all duration-300 px-6 py-2.5 rounded-full ${
        isScrolled ? 'glass shadow-soft border border-white' : 'bg-white shadow-soft'
      }`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div 
            style={{ backgroundColor: themeColor }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-midnight transition-transform group-hover:rotate-12 shadow-sm"
          >
            {logo ? <img src={logo} className="w-full h-full object-cover rounded-full" /> : <span className="font-serif font-bold italic text-base">{siteName.charAt(0)}</span>}
          </div>
          <span className="text-lg font-serif text-midnight font-bold tracking-tight">{siteName}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onCartClick}
            className="flex items-center gap-2.5 bg-midnight text-white px-5 py-2 rounded-full hover:bg-slate-800 transition active:scale-95 relative"
          >
            <i className="fa-solid fa-cart-shopping text-xs"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Checkout</span>
            {cartCount > 0 && (
              <span 
                style={{ backgroundColor: themeColor }}
                className="text-midnight w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-midnight -ml-1"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
