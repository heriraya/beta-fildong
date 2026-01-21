// Dramabox API for Drama China
// API Base: https://api.sansekai.my.id/api/dramabox/

const API_BASE = "https://api.sansekai.my.id/api/dramabox";

// CORS Proxies for fallback
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
];

export interface DramaChinaItem {
  bookId: string;
  bookName: string;
  coverWap: string;
  chapterCount: number;
  introduction: string;
  tags: string[];
  tagV3s?: { tagId: number; tagName: string; tagEnName: string }[];
  protagonist?: string;
  isEntry?: number;
  index?: number;
  dataFrom?: string;
  cardType?: number;
  markNamesConnectKey?: string;
  bookShelfStatus?: number;
  shelfTime?: string;
  inLibrary?: boolean;
  rankVo?: { rankType: number; hotCode: string; sort: number };
}

// Helper function to fetch with CORS proxy fallback and timeout
async function fetchWithProxy(url: string, timeoutMs: number = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Try direct fetch first
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      console.log("Request timed out, trying CORS proxy...");
    } else {
      console.log("Direct fetch failed, trying CORS proxy...");
    }
  }

  // Try with CORS proxies
  for (const proxy of CORS_PROXIES) {
    const proxyController = new AbortController();
    const proxyTimeoutId = setTimeout(() => proxyController.abort(), timeoutMs);
    
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`, { signal: proxyController.signal });
      clearTimeout(proxyTimeoutId);
      if (response.ok) return response;
    } catch (error) {
      clearTimeout(proxyTimeoutId);
      console.log(`Proxy ${proxy} failed, trying next...`);
    }
  }

  throw new Error("All fetch attempts failed");
}

// Helper to normalize drama item - ensure coverWap exists
function normalizeDramaItem(item: any): DramaChinaItem {
  return {
    ...item,
    // Fallback untuk berbagai nama field cover image
    // NOTE: endpoint /randomdrama memakai `bookCover`
    coverWap:
      item.coverWap ||
      item.bookCover ||
      item.cover ||
      item.coverImage ||
      item.poster ||
      item.image ||
      item.img ||
      item.chapterImg ||
      "",
    // Fallback untuk field lainnya
    bookId: item.bookId || item.id || String(Math.random()),
    bookName: item.bookName || item.title || item.name || "Unknown",
    chapterCount: item.chapterCount || item.totalChapterNum || item.episodeCount || item.chapters || 0,
    tags: item.tags || [],
  };
}

// Helper to parse drama list from various API response formats
function parseDramaList(json: unknown): DramaChinaItem[] {
  console.log("[DramaBox] Raw API response:", json);
  
  let rawList: any[] = [];
  
  if (Array.isArray(json)) {
    rawList = json;
  } else if (Array.isArray((json as any)?.data)) {
    rawList = (json as any).data;
  } else if (Array.isArray((json as any)?.data?.list)) {
    rawList = (json as any).data.list;
  } else if (Array.isArray((json as any)?.list)) {
    rawList = (json as any).list;
  } else if ((json as any)?.data && typeof (json as any).data === 'object') {
    // Single object response - wrap in array
    rawList = [(json as any).data];
  } else if (json && typeof json === 'object' && (json as any).bookId) {
    // Single drama object
    rawList = [json];
  }
  
  if (rawList.length === 0) {
    console.log("[DramaBox] Unable to parse drama list from response");
    return [];
  }
  
  // Normalize semua item
  const normalized = rawList.map(normalizeDramaItem);
  console.log("[DramaBox] Parsed and normalized", normalized.length, "dramas");
  
  return normalized;
}

// Fetch trending dramas with pagination
export async function getDramaboxTrending(page: number = 1): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/trending?page=${page}`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching trending dramas:", error);
    return [];
  }
}

// Fetch latest dramas with pagination
export async function getDramaboxLatest(page: number = 1): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/latest?page=${page}`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching latest dramas:", error);
    return [];
  }
}

// Fetch VIP dramas
export async function getDramaboxVIP(): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/vip`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching VIP dramas:", error);
    return [];
  }
}

// Fetch For You dramas with pagination
export async function getDramaboxForYou(page: number = 1): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/foryou?page=${page}`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching for you dramas:", error);
    return [];
  }
}

// Fetch random drama
export async function getDramaboxRandom(): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/randomdrama`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching random dramas:", error);
    return [];
  }
}

// Search dramas
export async function searchDramabox(query: string): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error searching dramas:", error);
    return [];
  }
}

// Fetch dub Indonesia dramas
export async function getDramaboxDubIndo(classify: string = "terbaru"): Promise<DramaChinaItem[]> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/dubindo?classify=${classify}`);
    const json = await response.json();
    return parseDramaList(json);
  } catch (error) {
    console.error("Error fetching dub indo dramas:", error);
    return [];
  }
}

// Episode CDN & Video structure
export interface VideoPath {
  quality: number;
  videoPath: string;
  isDefault?: number;
}

export interface CdnItem {
  cdnCode: string;
  videoPathList: VideoPath[];
  isDefault?: number;
}

export interface EpisodeItem {
  chapterId: string;
  chapterIndex: number;
  chapterName: string;
  chapterImg: string;
  cdnList: CdnItem[];
}

// Fetch drama detail
export async function getDramaboxDetail(bookId: string): Promise<DramaChinaItem | null> {
  try {
    const response = await fetchWithProxy(`${API_BASE}/detail?bookId=${bookId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching drama detail:", error);
    return null;
  }
}

// Fetch episodes with CDN info
export async function getDramaboxEpisodes(bookId: string): Promise<EpisodeItem[]> {
  try {
    // NOTE: endpoint yang valid adalah /allepisode (bukan /episodes)
    const response = await fetchWithProxy(`${API_BASE}/allepisode?bookId=${bookId}`);
    const json = await response.json();

    console.log("[DramaBox] Raw allepisode response for", bookId, ":", JSON.stringify(json).slice(0, 500));

    let episodes: EpisodeItem[] = [];
    
    // Handle berbagai format response
    if (Array.isArray(json)) {
      episodes = json as EpisodeItem[];
    } else if (json && typeof json === 'object') {
      // Try different nested structures
      if (Array.isArray(json.data)) {
        episodes = json.data as EpisodeItem[];
      } else if (json.data && Array.isArray(json.data.list)) {
        episodes = json.data.list as EpisodeItem[];
      } else if (Array.isArray(json.list)) {
        episodes = json.list as EpisodeItem[];
      } else if (json.data && json.data.chapterList && Array.isArray(json.data.chapterList)) {
        episodes = json.data.chapterList as EpisodeItem[];
      } else if (json.chapterList && Array.isArray(json.chapterList)) {
        episodes = json.chapterList as EpisodeItem[];
      }
    }

    console.log("[DramaBox] Parsed episodes:", episodes.length, "items");
    
    if (episodes.length > 0 && episodes[0]) {
      console.log("[DramaBox] First episode sample:", JSON.stringify(episodes[0], null, 2));
      
      // Validasi struktur episode
      if (!episodes[0].cdnList) {
        console.warn("[DramaBox] Episode missing cdnList, attempting to fix structure");
      }
    }

    return episodes;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

// Get video URL from episode - langsung pakai default/pertama tanpa pilih kualitas
export function getVideoUrl(episode: EpisodeItem): string {
  console.log("[DramaBox] getVideoUrl called with episode:", JSON.stringify(episode, null, 2));
  
  if (!episode) {
    console.warn("[DramaBox] Episode is null/undefined");
    return "";
  }
  
  // Handle jika cdnList tidak ada atau kosong
  if (!episode.cdnList || !Array.isArray(episode.cdnList) || episode.cdnList.length === 0) {
    console.warn("[DramaBox] No cdnList found in episode");
    
    // Coba cari videoPath langsung di episode object (format alternatif)
    if ((episode as any).videoPath) {
      console.log("[DramaBox] Using direct videoPath from episode");
      return (episode as any).videoPath;
    }
    if ((episode as any).videoUrl) {
      console.log("[DramaBox] Using direct videoUrl from episode");
      return (episode as any).videoUrl;
    }
    
    return "";
  }
  
  // Cari CDN default atau pakai yang pertama
  const defaultCdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];
  console.log("[DramaBox] Selected CDN:", defaultCdn?.cdnCode);
  
  if (!defaultCdn || !defaultCdn.videoPathList || !Array.isArray(defaultCdn.videoPathList) || defaultCdn.videoPathList.length === 0) {
    console.warn("[DramaBox] No videoPathList found in CDN");
    return "";
  }
  
  // Ambil video default atau yang pertama
  // Prioritas: isDefault === 1, lalu quality tertinggi, lalu yang pertama
  let video = defaultCdn.videoPathList.find(v => v.isDefault === 1);
  
  if (!video) {
    // Sort by quality descending dan ambil yang pertama
    const sortedVideos = [...defaultCdn.videoPathList].sort((a, b) => (b.quality || 0) - (a.quality || 0));
    video = sortedVideos[0];
  }
  
  const videoUrl = video?.videoPath || "";
  console.log("[DramaBox] Final video URL:", videoUrl);
  
  return videoUrl;
}

// Search drama by tag - currently uses trending as fallback since API doesn't have direct tag search
export async function getDramaboxByTag(tag: string): Promise<DramaChinaItem[]> {
  try {
    // Try to fetch trending and filter by tag
    const allDramas: DramaChinaItem[] = [];
    
    // Fetch from multiple endpoints to get more data
    const [trending, latest, forYou, random] = await Promise.all([
      getDramaboxTrending(),
      getDramaboxLatest(),
      getDramaboxForYou(),
      getDramaboxRandom(),
    ]);
    
    allDramas.push(...trending, ...latest, ...forYou, ...random);
    
    // Remove duplicates by bookId
    const uniqueDramas = allDramas.reduce((acc, drama) => {
      if (!acc.find(d => d.bookId === drama.bookId)) {
        acc.push(drama);
      }
      return acc;
    }, [] as DramaChinaItem[]);
    
    // Filter by tag (case insensitive)
    const lowerTag = tag.toLowerCase();
    const filtered = uniqueDramas.filter(drama => 
      drama.tags?.some(t => t.toLowerCase().includes(lowerTag))
    );
    
    console.log(`[DramaBox] Found ${filtered.length} dramas with tag "${tag}"`);
    return filtered;
  } catch (error) {
    console.error("Error fetching dramas by tag:", error);
    return [];
  }
}

// Get related dramas based on tags
export async function getDramaboxRelated(currentDrama: DramaChinaItem): Promise<DramaChinaItem[]> {
  try {
    const allDramas: DramaChinaItem[] = [];
    
    // Fetch from multiple endpoints
    const [trending, latest, forYou] = await Promise.all([
      getDramaboxTrending(),
      getDramaboxLatest(),
      getDramaboxForYou(),
    ]);
    
    allDramas.push(...trending, ...latest, ...forYou);
    
    // Remove duplicates and current drama
    const uniqueDramas = allDramas.reduce((acc, drama) => {
      if (drama.bookId !== currentDrama.bookId && !acc.find(d => d.bookId === drama.bookId)) {
        acc.push(drama);
      }
      return acc;
    }, [] as DramaChinaItem[]);
    
    // Score dramas by matching tags
    const currentTags = (currentDrama.tags || []).map(t => t.toLowerCase());
    
    if (currentTags.length === 0) {
      // No tags to match, return random selection
      return uniqueDramas.slice(0, 12);
    }
    
    const scored = uniqueDramas.map(drama => {
      const dramaTags = (drama.tags || []).map(t => t.toLowerCase());
      const matchCount = currentTags.filter(tag => 
        dramaTags.some(dt => dt.includes(tag) || tag.includes(dt))
      ).length;
      return { drama, score: matchCount };
    });
    
    // Sort by score descending and take top 12
    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, 12).map(s => s.drama);
  } catch (error) {
    console.error("Error fetching related dramas:", error);
    return [];
  }
}
