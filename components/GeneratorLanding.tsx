
import React, { useState, useRef } from 'react';
import { SiteConfig } from '../types';

interface GeneratorLandingProps {
  onCreate: (config: SiteConfig) => void;
  isLoading: boolean;
  onBack: () => void;
}

const GeneratorLanding: React.FC<GeneratorLandingProps> = ({ onCreate, isLoading, onBack }) => {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<SiteConfig>>({
    name: 'Farah Cakes',
    phone: '+256',
    adminUser: 'admin',
    adminPass: 'password',
    adminSurname: '',
    themeColor: '#F7C04A',
    tagline: 'Crafting sweet moments, one masterpiece at a time.',
    logo: '',
    maxItems: 100 // Set default limit to 100
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w-]+/g, '')  // Remove all non-word chars
      .replace(/--+/g, '-');    // Replace multiple - with single -
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name || 'Bakery';
    onCreate({
      id: Math.random().toString(36).substr(2, 9),
      slug: slugify(name),
      name: name,
      logo: form.logo || '', 
      phone: form.phone || '',
      adminUser: form.adminUser || 'admin',
      adminPass: form.adminPass || 'password',
      adminSurname: form.adminSurname || '',
      themeColor: form.themeColor || '#F7C04A',
      tagline: form.tagline || '',
      maxItems: Number(form.maxItems) || 100
    } as SiteConfig);
  };

  return (
    <div className="min-h-screen bg-soft-bg flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-fade-up">
        <div className="p-10 md:p-14">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-yellow rounded-2xl flex items-center justify-center text-midnight">
                <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-midnight">Generator</h1>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Step {step} of 4</p>
              </div>
            </div>
            <button onClick={onBack} className="text-slate-300 hover:text-midnight transition-colors">
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-midnight">Name your bakery</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bakery Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-bold text-midnight transition-all" 
                      placeholder="e.g. Farah Cakes"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tagline</label>
                    <input 
                      type="text" 
                      className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-medium text-midnight transition-all" 
                      placeholder="Artistry in Every Bite"
                      value={form.tagline}
                      onChange={e => setForm({...form, tagline: e.target.value})}
                    />
                  </div>
                </div>
                <button type="button" onClick={handleNext} className="w-full bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-800 transition-all">Next: Branding</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-midnight">Style & Logo</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bakery Logo (Optional)</label>
                    <div className="flex items-center gap-6 p-6 bg-[#f4f7f9] rounded-2xl border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-slate-300 overflow-hidden shadow-sm">
                        {form.logo ? (
                          <img src={form.logo} className="w-full h-full object-cover" />
                        ) : (
                          <i className="fa-solid fa-image text-2xl"></i>
                        )}
                      </div>
                      <div className="space-y-2">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-midnight shadow-sm hover:shadow-md transition-all border border-slate-100"
                        >
                          {form.logo ? 'Change Logo' : 'Upload Image'}
                        </button>
                        {form.logo && (
                           <button 
                            type="button" 
                            onClick={() => setForm(prev => ({...prev, logo: ''}))}
                            className="block text-red-400 text-[9px] font-black uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
                    <div className="flex flex-wrap gap-4 p-4 bg-[#f4f7f9] rounded-2xl">
                      {['#F7C04A', '#F9A8D4', '#6EE7B7', '#93C5FD', '#FCA5A5', '#A5B4FC'].map(color => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setForm({...form, themeColor: color})}
                          style={{ backgroundColor: color }}
                          className={`w-10 h-10 rounded-full border-4 transition-all ${form.themeColor === color ? 'border-midnight scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handlePrev} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px]">Back</button>
                  <button type="button" onClick={handleNext} className="flex-[2] bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Set Contact Info</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-midnight">Contact Settings</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <input 
                      type="text" 
                      className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-bold text-midnight transition-all" 
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                    <p className="text-[9px] text-slate-400 font-medium px-1">Include country code (e.g. +256...)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handlePrev} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px]">Back</button>
                  <button type="button" onClick={handleNext} className="flex-[2] bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl">Set Manager Access</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-3xl font-serif font-bold text-midnight">Manager Login</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                      <input 
                        type="text" 
                        className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-bold text-midnight transition-all text-sm" 
                        value={form.adminUser}
                        onChange={e => setForm({...form, adminUser: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <input 
                        type="password" 
                        className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-bold text-midnight transition-all text-sm" 
                        value={form.adminPass}
                        onChange={e => setForm({...form, adminPass: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manager Surname</label>
                    <input 
                      type="text" 
                      className="w-full p-5 bg-[#f4f7f9] rounded-2xl outline-none focus:ring-2 focus:ring-primary-yellow font-bold text-midnight transition-all" 
                      placeholder="Surname"
                      value={form.adminSurname}
                      onChange={e => setForm({...form, adminSurname: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handlePrev} className="flex-1 bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px]">Back</button>
                  <button type="submit" disabled={isLoading} className="flex-[2] bg-midnight text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-800 disabled:opacity-50">
                    {isLoading ? 'Launching...' : 'Generate Website'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneratorLanding;
