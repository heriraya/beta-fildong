// Watch History Management
const HISTORY_KEY = "watch_history";
const MAX_HISTORY_ITEMS = 100;

export type ContentType = "movie" | "tvseries" | "dramabox";

export interface WatchHistoryItem {
  id: string;
  type: ContentType;
  title: string;
  poster: string;
  slug: string;
  watchedAt: number;
  // For TV Series
  season?: number;
  episode?: number;
  episodeTitle?: string;
  // For Dramabox
  episodeNumber?: number;
  totalEpisodes?: number;
}

// Get all history items
export function getWatchHistory(): WatchHistoryItem[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as WatchHistoryItem[];
  } catch {
    return [];
  }
}

// Add or update history item
export function addToWatchHistory(item: Omit<WatchHistoryItem, "watchedAt">): void {
  try {
    const history = getWatchHistory();
    
    // Remove existing entry with same ID and type
    const filteredHistory = history.filter(
      (h) => !(h.id === item.id && h.type === item.type)
    );
    
    // Add new item at the beginning
    const newItem: WatchHistoryItem = {
      ...item,
      watchedAt: Date.now(),
    };
    
    filteredHistory.unshift(newItem);
    
    // Limit history size
    const limitedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Failed to save watch history:", error);
  }
}

// Remove item from history
export function removeFromWatchHistory(id: string, type: ContentType): void {
  try {
    const history = getWatchHistory();
    const filteredHistory = history.filter(
      (h) => !(h.id === id && h.type === type)
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error("Failed to remove from watch history:", error);
  }
}

// Clear all history
export function clearWatchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear watch history:", error);
  }
}

// Get history by type
export function getWatchHistoryByType(type: ContentType): WatchHistoryItem[] {
  return getWatchHistory().filter((h) => h.type === type);
}

// Format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

// Get watch URL based on type
export function getWatchUrl(item: WatchHistoryItem): string {
  switch (item.type) {
    case "movie":
      return `/play/${item.slug}`;
    case "tvseries":
      return `/watch/${item.slug}?s=${item.season || 1}&e=${item.episode || 1}`;
    case "dramabox":
      return `/putar/${item.slug}?ep=${item.episodeNumber || 0}`;
    default:
      return "/";
  }
}
