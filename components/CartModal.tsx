
import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';

interface CartModalProps {
  cart: CartItem[];
  coupons: Coupon[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  whatsappNumber: string;
  themeColor: string;
  siteName: string;
}

const CartModal: React.FC<CartModalProps> = ({ cart, coupons, onClose, onRemove, onUpdateQty, whatsappNumber, themeColor, siteName }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent / 100) : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      setError('');
    } else {
      setError('Invalid coupon');
    }
  };

  const handleCheckout = () => {
    const itemsText = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
    const message = encodeURIComponent(
      `Hello ${siteName}! I'd like to place an order:\n\n${itemsText}\n\n*TOTAL: UGX ${total.toLocaleString()}*`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-midnight/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white flex flex-col shadow-4xl rounded-l-[3rem] animate-slide-in">
          <div className="p-8 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold text-midnight font-serif">Checkout</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><i className="fa-solid fa-times"></i></button>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-slate-400 py-10 font-bold uppercase text-[10px] tracking-widest">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-3xl flex gap-4">
                  <img src={item.imageUrl} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="flex-grow">
                    <p className="font-bold text-midnight text-sm">{item.name}</p>
                    <p className="text-accent-emerald text-[10px] font-black uppercase">UGX {item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <button onClick={() => onUpdateQty(item.id, -1)} className="text-slate-400">-</button>
                       <span className="text-[10px] font-black">{item.quantity}</span>
                       <button onClick={() => onUpdateQty(item.id, 1)} className="text-slate-400">+</button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500"><i className="fa-solid fa-trash-can text-sm"></i></button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 border-t space-y-6">
              <div className="flex justify-between font-bold text-xl text-midnight">
                <span>Total</span>
                <span className="text-accent-emerald">UGX {total.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                style={{ backgroundColor: themeColor }}
                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 text-midnight"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                Checkout on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
