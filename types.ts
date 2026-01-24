
export interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  siteId?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  siteId?: string;
}

export interface SiteConfig {
  id: string;
  slug: string; // URL-friendly version of the name
  name: string;
  logo: string; // Base64 or URL
  phone: string;
  adminUser: string;
  adminPass: string;
  adminSurname?: string; // Manager's surname
  themeColor: string;
  tagline: string;
  customDomain?: string; // e.g. "farahcakes.com"
  maxItems: number; // Maximum number of items allowed
}

export interface CartItem extends Cake {
  quantity: number;
}

export enum AdminView {
  DASHBOARD = 'DASHBOARD',
  CAKES = 'CAKES',
  COUPONS = 'COUPONS',
  CATEGORIES = 'CATEGORIES',
  DOMAINS = 'DOMAINS'
}
