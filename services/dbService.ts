
import { supabase } from './supabaseClient';
import { SiteConfig, Cake, Coupon } from '../types';

/**
 * dbService provides an abstraction layer for Supabase interactions.
 * Every method is wrapped in a try-catch to handle network failures gracefully.
 */
export const dbService = {
  // --- SITES ---
  async getAllSites(): Promise<SiteConfig[]> {
    try {
      const { data, error } = await supabase.from('sites').select('*');
      if (error) {
        console.error('Database Error:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.warn('Supabase unreachable. Operating in local mode.');
      return [];
    }
  },

  async saveSite(site: SiteConfig): Promise<void> {
    try {
      const { error } = await supabase.from('sites').upsert(site);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Save Site failed (Offline):', e);
    }
  },

  async deleteSite(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Delete Site failed (Offline):', e);
    }
  },

  // --- CAKES ---
  async getCakesBySite(siteId: string): Promise<Cake[]> {
    try {
      const { data, error } = await supabase.from('cakes').select('*').eq('siteId', siteId);
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async saveCake(cake: Cake): Promise<void> {
    try {
      const { error } = await supabase.from('cakes').upsert(cake);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Save Cake failed (Offline):', e);
    }
  },

  async deleteCake(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('cakes').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Delete Cake failed (Offline):', e);
    }
  },

  // --- COUPONS ---
  async getCouponsBySite(siteId: string): Promise<Coupon[]> {
    try {
      const { data, error } = await supabase.from('coupons').select('*').eq('siteId', siteId);
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    try {
      const { error } = await supabase.from('coupons').upsert(coupon);
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Save Coupon failed (Offline):', e);
    }
  },

  async deleteCoupon(code: string, siteId: string): Promise<void> {
    try {
      const { error } = await supabase.from('coupons').delete().match({ code, siteId });
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn('Delete Coupon failed (Offline):', e);
    }
  },

  // --- CATEGORIES ---
  async getCategoriesBySite(siteId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.from('categories').select('name').eq('siteId', siteId);
      if (error) return [];
      return data?.map(d => d.name) || [];
    } catch (e) {
      return [];
    }
  },

  async updateCategories(siteId: string, categories: string[]): Promise<void> {
    try {
      await supabase.from('categories').delete().eq('siteId', siteId);
      if (categories.length > 0) {
        await supabase.from('categories').insert(
          categories.map(name => ({ name, siteId }))
        );
      }
    } catch (e) {
      console.warn('Update Categories failed (Offline):', e);
    }
  }
};
