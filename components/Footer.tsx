
import React from 'react';

interface FooterProps {
  onStaffClick: () => void;
  siteName: string;
  phone: string;
}

const Footer: React.FC<FooterProps> = ({ onStaffClick, siteName, phone }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-20">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div>
          <h3 className="text-white text-2xl font-serif mb-6">{siteName}</h3>
          <p className="max-w-xs mx-auto md:mx-0">Freshly generated boutique bakery experience. Handcrafted with love.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Contact</h4>
          <ul className="space-y-3">
            <li><a href={`tel:${phone}`} className="hover:text-primary-yellow transition"><i className="fa-solid fa-phone mr-2"></i> {phone}</a></li>
            <li><a href="#" className="hover:text-primary-yellow transition"><i className="fa-brands fa-whatsapp mr-2"></i> WhatsApp Order</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Manager Access</h4>
          <ul className="space-y-3">
            <li>
              <button
                onClick={onStaffClick}
                className="text-slate-500 hover:text-white text-sm transition font-black uppercase tracking-widest text-[10px]"
              >
                Staff Portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-4xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center text-[10px] font-bold uppercase tracking-widest opacity-40">
        <p>&copy; {new Date().getFullYear()} {siteName}. Created by <button onClick={() => window.location.hash = ''} className="hover:text-white transition-colors cursor-pointer outline-none">keith ltd</button>.</p>
      </div>
    </footer>
  );
};

export default Footer;
