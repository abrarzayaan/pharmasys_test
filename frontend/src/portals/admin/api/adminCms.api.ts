import api from '../../../api/axios';

export interface HeroBannerSlide {
  id: number;
  badge_tag: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  target_url: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  type: 'main_hero' | 'side_top' | 'side_bottom_left' | 'side_bottom_right';
}

export interface AnnouncementBarConfig {
  id: number;
  text: string;
  bg_theme: 'emerald' | 'indigo' | 'rose' | 'amber' | 'midnight';
  is_active: boolean;
  cta_text?: string;
  cta_url?: string;
}

const CMS_HERO_STORAGE_KEY = 'pharmasys_cms_hero_banners_v1';
const CMS_ANNOUNCEMENT_STORAGE_KEY = 'pharmasys_cms_announcement_v1';

const defaultHeroBanners: HeroBannerSlide[] = [
  {
    id: 1,
    type: 'main_hero',
    badge_tag: '⚡ BUY 1 GET 1 FREE',
    headline: 'Multivitamin & Essential Supplements',
    subheadline: 'Authentic medicines and healthcare essentials delivered directly to your doorstep.',
    cta_text: 'Get Yours Today',
    target_url: '/products',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    type: 'side_top',
    badge_tag: 'Up to 45% OFF',
    headline: 'Get Healthy With Exclusive Medical Product Deals!',
    subheadline: 'Verified prescription and OTC deals',
    cta_text: 'View Offers',
    target_url: '/products?filter=hot_deals',
    image_url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&auto=format&fit=crop&q=80',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 3,
    type: 'side_bottom_left',
    badge_tag: '15% OFF',
    headline: "Women's Wellness Gummies",
    subheadline: 'Daily essential nutrition',
    cta_text: 'Shop',
    target_url: '/products',
    image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 4,
    type: 'side_bottom_right',
    badge_tag: 'FLAT 20% OFF',
    headline: 'Premium Skincare Essentials',
    subheadline: 'Dermatologist tested care',
    cta_text: 'Explore',
    target_url: '/products',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80',
    sort_order: 4,
    is_active: true,
  },
];

const defaultAnnouncement: AnnouncementBarConfig = {
  id: 1,
  text: 'Due to high medicine demand, orders are processed with priority express delivery across Bangladesh.',
  bg_theme: 'midnight',
  is_active: true,
  cta_text: 'Track Order',
  cta_url: '/account/orders',
};

// Helper for local storage read/write
const getStoredHeroBanners = (): HeroBannerSlide[] => {
  try {
    const raw = localStorage.getItem(CMS_HERO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultHeroBanners;
};

const saveStoredHeroBanners = (items: HeroBannerSlide[]) => {
  try {
    localStorage.setItem(CMS_HERO_STORAGE_KEY, JSON.stringify(items));
  } catch {}
};

const getStoredAnnouncement = (): AnnouncementBarConfig => {
  try {
    const raw = localStorage.getItem(CMS_ANNOUNCEMENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultAnnouncement;
};

const saveStoredAnnouncement = (item: AnnouncementBarConfig) => {
  try {
    localStorage.setItem(CMS_ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(item));
  } catch {}
};

// Helper to sanitize slide objects from API or Storage
const sanitizeSlide = (slide: any, index: number): HeroBannerSlide => ({
  id: Number(slide?.id) || Date.now() + index,
  type: ['main_hero', 'side_top', 'side_bottom_left', 'side_bottom_right'].includes(slide?.type)
    ? slide.type
    : index === 0
    ? 'main_hero'
    : index === 1
    ? 'side_top'
    : index === 2
    ? 'side_bottom_left'
    : 'side_bottom_right',
  badge_tag: String(slide?.badge_tag || '⚡ SPECIAL OFFER'),
  headline: String(slide?.headline || 'Essential Pharmacy Stock'),
  subheadline: String(slide?.subheadline || 'Authentic medicines delivered to your doorstep.'),
  cta_text: String(slide?.cta_text || 'Shop Now'),
  target_url: String(slide?.target_url || '/products'),
  image_url: String(slide?.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'),
  sort_order: Number(slide?.sort_order) || index + 1,
  is_active: slide?.is_active !== false,
});

export const adminCmsApi = {
  // Hero Banners
  getHeroBanners: async (): Promise<HeroBannerSlide[]> => {
    try {
      const res = await api.get('/admin/cms/hero-banners/');
      const data = res.data;
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      if (rawList.length > 0) {
        return rawList.map(sanitizeSlide);
      }
    } catch {}

    const stored = getStoredHeroBanners();
    const list = Array.isArray(stored) && stored.length > 0 ? stored : defaultHeroBanners;
    return list.map(sanitizeSlide);
  },

  createHeroBanner: async (payload: Omit<HeroBannerSlide, 'id'>): Promise<HeroBannerSlide> => {
    try {
      const res = await api.post('/admin/cms/hero-banners/', payload);
      if (res.data && res.data.id) return res.data;
    } catch {}
    const list = getStoredHeroBanners();
    const newSlide: HeroBannerSlide = {
      ...payload,
      id: Date.now(),
    };
    const updated = [newSlide, ...list];
    saveStoredHeroBanners(updated);
    return newSlide;
  },

  updateHeroBanner: async (id: number, payload: Partial<HeroBannerSlide>): Promise<HeroBannerSlide> => {
    try {
      const res = await api.patch(`/admin/cms/hero-banners/${id}/`, payload);
      if (res.data) return res.data;
    } catch {}
    const list = getStoredHeroBanners();
    const updated = list.map((item) => (item.id === id ? { ...item, ...payload } : item));
    saveStoredHeroBanners(updated);
    return updated.find((item) => item.id === id)!;
  },

  deleteHeroBanner: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/admin/cms/hero-banners/${id}/`);
    } catch {}
    const list = getStoredHeroBanners();
    const updated = list.filter((item) => item.id !== id);
    saveStoredHeroBanners(updated);
    return true;
  },

  // Announcement Bar
  getAnnouncementBar: async (): Promise<AnnouncementBarConfig> => {
    try {
      const res = await api.get('/admin/cms/announcement/');
      if (res.data && res.data.text) return res.data;
    } catch {}
    return getStoredAnnouncement();
  },

  updateAnnouncementBar: async (payload: Partial<AnnouncementBarConfig>): Promise<AnnouncementBarConfig> => {
    try {
      const res = await api.post('/admin/cms/announcement/', payload);
      if (res.data && res.data.text) return res.data;
    } catch {}
    const current = getStoredAnnouncement();
    const updated = { ...current, ...payload };
    saveStoredAnnouncement(updated);
    return updated;
  },
};
