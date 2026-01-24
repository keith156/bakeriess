import React, { useState, useRef } from 'react';
import { Cake, SiteConfig } from '../types';
import { generateDescription } from '../services/geminiService';
import { compressImage } from '../utils/imageOptimizer';

interface AddCakePageProps {
    siteConfig: SiteConfig;
    onSave: (cake: Cake) => Promise<void>;
    onCancel: () => void;
    categories: string[];
    initialData?: Partial<Cake>;
}

const AddCakePage: React.FC<AddCakePageProps> = ({
    siteConfig,
    onSave,
    onCancel,
    categories,
    initialData
}) => {
    const [formCake, setFormCake] = useState<Partial<Cake>>(initialData || { category: categories[0] || 'Birthday' });
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const cakeImageInputRef = useRef<HTMLInputElement>(null);

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
                console.error("Image compression failed", err);
                alert("Could not process image. Please try another.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const cakeData: Cake = {
            id: formCake.id || `cake-${Math.random().toString(36).substr(2, 9)}`,
            name: formCake.name || 'Unnamed Cake',
            description: formCake.description || 'Artisanal creation.',
            price: Number(formCake.price) || 0,
            imageUrl: formCake.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
            category: formCake.category || categories[0] || 'Birthday',
            siteId: siteConfig.id
        };

        try {
            await onSave(cakeData);
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#f8fafc] overflow-y-auto font-sans animate-fade-in">
            <div className="min-h-screen flex flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-midnight hover:bg-slate-100 transition-all"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h1 className="text-lg font-bold font-serif text-midnight">
                        {initialData?.id ? 'Edit Creation' : 'New Creation'}
                    </h1>
                    <div className="w-10"></div> {/* Spacer for balance */}
                </div>

                <div className="flex-grow p-6 md:p-10 max-w-2xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Photo</label>
                            <div
                                onClick={() => cakeImageInputRef.current?.click()}
                                className="aspect-square w-full bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary-yellow transition-all shadow-sm"
                            >
                                {formCake.imageUrl ? (
                                    <img src={formCake.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:bg-yellow-50 group-hover:text-primary-yellow transition-colors">
                                            <i className="fa-solid fa-camera text-2xl"></i>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-primary-yellow transition-colors">Tap to Upload</p>
                                    </div>
                                )}
                                <input type="file" ref={cakeImageInputRef} onChange={handleCakeImageUpload} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-yellow focus:ring-4 focus:ring-yellow-50 font-bold text-midnight transition-all placeholder:text-slate-200"
                                    value={formCake.name || ''}
                                    onChange={e => setFormCake({ ...formCake, name: e.target.value })}
                                    placeholder="e.g. Dreamy Velvet"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">UGX</span>
                                        <input
                                            type="number"
                                            className="w-full p-5 pl-14 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-yellow focus:ring-4 focus:ring-yellow-50 font-bold text-midnight transition-all"
                                            value={formCake.price || ''}
                                            onChange={e => setFormCake({ ...formCake, price: Number(e.target.value) })}
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-yellow focus:ring-4 focus:ring-yellow-50 font-bold text-midnight appearance-none transition-all"
                                            value={formCake.category}
                                            onChange={e => setFormCake({ ...formCake, category: e.target.value })}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <i className="fa-solid fa-chevron-down text-xs"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAiDescription}
                                        disabled={isGenerating || !formCake.name}
                                        className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-1 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fa-solid fa-wand-magic-sparkles"></i> {isGenerating ? 'Writing...' : 'Auto-Write'}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary-yellow focus:ring-4 focus:ring-yellow-50 min-h-[120px] text-sm resize-none transition-all placeholder:text-slate-200"
                                    value={formCake.description || ''}
                                    onChange={e => setFormCake({ ...formCake, description: e.target.value })}
                                    placeholder="Describe the flavors, texture, and inspiration..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="h-20"></div> {/* Spacer for bottom button */}
                    </form>
                </div>

                {/* Sticky Bottom Button */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        style={{ backgroundColor: siteConfig.themeColor }}
                        className="w-full text-midnight py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:transform-none transition-all"
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                            </span>
                        ) : (
                            initialData?.id ? 'Save Changes' : 'Launch Creation'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCakePage;
