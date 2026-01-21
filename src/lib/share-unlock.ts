const STORAGE_KEY = "film_dong_share_unlock";
const UNLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

interface UnlockData {
  timestamp: number;
}

export const isUnlocked = (): boolean => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    const parsed: UnlockData = JSON.parse(data);
    const now = Date.now();
    
    // Check if 24 hours have passed
    if (now - parsed.timestamp > UNLOCK_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const setUnlocked = (): void => {
  const data: UnlockData = {
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getShareUrl = (): string => {
  return window.location.origin;
};

export const shareToWhatsApp = (): void => {
  const url = getShareUrl();
  const text = `Watch free movies and series on Film Dong! 🎬\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  setUnlocked();
};

export const shareToFacebook = (): void => {
  const url = getShareUrl();
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  setUnlocked();
};

export const shareToTwitter = (): void => {
  const url = getShareUrl();
  const text = "Watch free movies and series on Film Dong! 🎬";
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  setUnlocked();
};
