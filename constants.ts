
import { Cake, Coupon } from './types';

export const WHATSAPP_NUMBER = '+256701690526';

export const INITIAL_CATEGORIES: string[] = [
  'Birthday',
  'Wedding',
  'Custom'
];

export const INITIAL_CAKES: Cake[] = [
  {
    id: 'farah-1',
    name: 'Farah Birthday Sparkle',
    description: 'A celebration in every bite! Fluffy vanilla sponge with colorful sprinkles and silky smooth buttercream.',
    price: 85000,
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c82536?q=80&w=1000&auto=format&fit=crop',
    category: 'Birthday'
  },
  {
    id: 'farah-2',
    name: 'Farah Bridal Elegance',
    description: 'An exquisite three-tiered masterpiece with delicate lace piping and fresh floral accents.',
    price: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164883eecd4c?q=80&w=1000&auto=format&fit=crop',
    category: 'Wedding'
  },
  {
    id: 'farah-3',
    name: 'Farah Artistic Custom',
    description: 'Your imagination, our creation. Hand-sculpted details and bespoke flavors tailored to your theme.',
    price: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?q=80&w=1000&auto=format&fit=crop',
    category: 'Custom'
  },
  {
    id: 'farah-4',
    name: 'Velvet Birthday Dream',
    description: 'Rich red velvet layers paired with our signature cream cheese frosting for the ultimate birthday indulgence.',
    price: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop',
    category: 'Birthday'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'FARAH10', discountPercent: 10 },
  { code: 'BIRTHDAY20', discountPercent: 20 }
];
