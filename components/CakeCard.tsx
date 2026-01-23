
import React from 'react';
import { Cake } from '../types';

interface CakeCardProps {
  cake: Cake;
  onAddToCart: (cake: Cake) => void;
  themeColor: string;
}

const CakeCard: React.FC<CakeCardProps> = ({ cake, onAddToCart, themeColor }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-soft border border-slate-50 overflow-hidden flex flex-col group hover:shadow-card transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={cake.imageUrl} 
          alt={cake.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm text-accent-emerald text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm border border-slate-100/50">
            {cake.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col flex-grow">
        <h3 className="font-bold text-midnight text-xl font-serif mb-2">
          {cake.name}
        </h3>
        
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-6 font-medium">
          {cake.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between gap-4">
           <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Price</p>
              <p className="text-accent-emerald font-black text-lg">
                UGX {cake.price.toLocaleString()}
              </p>
           </div>
           
           <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(cake); }}
              className="bg-midnight text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-midnight/10 flex items-center gap-2"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              Add to Order
            </button>
        </div>
      </div>
    </div>
  );
};

export default CakeCard;
