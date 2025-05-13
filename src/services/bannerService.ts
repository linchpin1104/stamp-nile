
import type { Banner } from '@/types';
import { mockBanners as initialMockBanners } from '@/lib/mock-data';

const BANNERS_STORAGE_KEY = 'mockBanners';

const getStoredBanners = (): Banner[] => {
  if (typeof window === 'undefined') {
    return initialMockBanners; // Return initial mock data during SSR or if localStorage is not available
  }
  const storedBannersString = localStorage.getItem(BANNERS_STORAGE_KEY);
  if (storedBannersString) {
    try {
      return JSON.parse(storedBannersString);
    } catch (error) {
      console.error("Error parsing banners from localStorage:", error);
      // Fallback to initial mock and update localStorage
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(initialMockBanners));
      return initialMockBanners;
    }
  } else {
    // Initialize localStorage with mock data if nothing is stored
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(initialMockBanners));
    return initialMockBanners;
  }
};

const saveStoredBanners = (banners: Banner[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
  }
};

export const getBanners = async (): Promise<Banner[]> => {
  // Simulate async operation
  return Promise.resolve(getStoredBanners());
};

export const getActiveBanners = async (): Promise<Banner[]> => {
  const allBanners = await getBanners();
  return allBanners.filter(banner => banner.isActive).sort((a, b) => a.order - b.order);
};

export const getBannerById = async (id: string): Promise<Banner | null> => {
  const banners = await getBanners();
  return banners.find(banner => banner.id === id) || null;
};

export const createBanner = async (bannerData: Omit<Banner, 'id'>): Promise<Banner> => {
  const banners = await getBanners();
  const newBanner: Banner = {
    ...bannerData,
    id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  };
  const updatedBanners = [...banners, newBanner];
  saveStoredBanners(updatedBanners);
  return newBanner;
};

export const updateBanner = async (bannerId: string, bannerData: Partial<Omit<Banner, 'id'>>): Promise<Banner | null> => {
  let banners = await getBanners();
  const bannerIndex = banners.findIndex(b => b.id === bannerId);
  if (bannerIndex === -1) {
    return null;
  }
  banners[bannerIndex] = { ...banners[bannerIndex], ...bannerData };
  saveStoredBanners(banners);
  return banners[bannerIndex];
};

export const deleteBanner = async (bannerId: string): Promise<boolean> => {
  let banners = await getBanners();
  const updatedBanners = banners.filter(b => b.id !== bannerId);
  if (banners.length === updatedBanners.length) {
    return false; // Banner not found
  }
  saveStoredBanners(updatedBanners);
  return true;
};
