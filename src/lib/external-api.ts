// External API integrations for YTS and TMDB

const TMDB_API_KEY = "8246cd2d69fe801310ca96b6a83ba4fc";
const TMDB_BASE = "https://api.themoviedb.org/3";

// Multiple CORS proxies to try
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?",
  "https://proxy.cors.sh/",
];

const YTS_BASE_RAW = "https://yts.bz/api/v2";

// Helper to fetch with CORS proxy fallback
async function fetchWithCorsProxy(url: string): Promise<Response> {
  // Try each proxy until one works
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) {
        return response;
      }
    } catch (e) {
      console.log(`Proxy ${proxy} failed, trying next...`);
    }
  }
  
  // Last resort: try direct fetch
  return fetch(url);
}

// Helper to build YTS URL and fetch
async function fetchYTS(endpoint: string, params: URLSearchParams): Promise<Response> {
  const url = `${YTS_BASE_RAW}/${endpoint}?${params}`;
  return fetchWithCorsProxy(url);
}

// TMDB Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  budget: number;
  revenue: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

// TV Series Types
export interface TMDBTVSeries {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  seasons: TMDBSeason[];
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  runtime: number | null;
}

// YTS Types
export interface YTSMovie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  description_intro: string;
  description_full: string;
  yt_trailer_code: string;
  language: string;
  mpa_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  torrents?: YTSTorrent[];
}

export interface YTSTorrent {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
}

// TMDB Genre Map
export const TMDB_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const GENRE_LIST = Object.entries(TMDB_GENRES).map(([id, name]) => ({
  id: parseInt(id),
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
}));

// ============= YTS API Functions =============

// List movies from YTS
export async function getYTSMovies(params?: {
  page?: number;
  limit?: number;
  query_term?: string;
  genre?: string;
  sort_by?: string;
  order_by?: string;
  minimum_rating?: number;
}): Promise<{ movies: YTSMovie[]; totalPages: number; movieCount: number }> {
  try {
    const searchParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      page: String(params?.page || 1),
    });

    if (params?.query_term) searchParams.set("query_term", params.query_term);
    if (params?.genre) searchParams.set("genre", params.genre);
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.order_by) searchParams.set("order_by", params.order_by);
    if (params?.minimum_rating) searchParams.set("minimum_rating", String(params.minimum_rating));

    const response = await fetchYTS("list_movies.json", searchParams);
    
    if (!response.ok) {
      console.error("YTS list failed:", response.status);
      return { movies: [], totalPages: 0, movieCount: 0 };
    }

    const data = await response.json();
    
    if (data.data?.movies) {
      const movieCount = data.data.movie_count || 0;
      const limit = params?.limit || 20;
      return {
        movies: data.data.movies,
        totalPages: Math.ceil(movieCount / limit),
        movieCount,
      };
    }

    return { movies: [], totalPages: 0, movieCount: 0 };
  } catch (error) {
    console.error("YTS list error:", error);
    return { movies: [], totalPages: 0, movieCount: 0 };
  }
}

// Get YTS movie details by ID
export async function getYTSMovieDetails(movieId: number): Promise<YTSMovie | null> {
  try {
    const params = new URLSearchParams({
      movie_id: String(movieId),
      with_images: "true",
      with_cast: "true",
    });

    const response = await fetchYTS("movie_details.json", params);

    if (!response.ok) {
      console.error("YTS details failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.data?.movie) {
      return data.data.movie;
    }

    return null;
  } catch (error) {
    console.error("YTS details error:", error);
    return null;
  }
}

// Search movie on YTS
export async function searchYTSMovie(title: string, year?: string): Promise<YTSMovie | null> {
  try {
    const queryTerm = year ? `${title} ${year}` : title;
    const params = new URLSearchParams({
      query_term: queryTerm,
      limit: "1",
    });

    const response = await fetchYTS("list_movies.json", params);

    if (!response.ok) {
      console.error("YTS search failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.data?.movies && data.data.movies.length > 0) {
      return data.data.movies[0];
    }

    return null;
  } catch (error) {
    console.error("YTS search error:", error);
    return null;
  }
}

// ============= TMDB API Functions =============

// Multi-search result type (movies + TV)
export interface TMDBMultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string; // for movies
  name?: string; // for TV
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // for movies
  first_air_date?: string; // for TV
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

// Search movies AND TV series on TMDB (multi-search)
export async function searchTMDBMulti(query: string, page: number = 1): Promise<{ results: TMDBMultiSearchResult[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/search/multi?${params}`);

    if (!response.ok) {
      console.error("TMDB multi search failed:", response.status);
      return { results: [], totalPages: 0 };
    }

    const data = await response.json();
    // Filter only movies and TV, exclude person
    const filtered = (data.results || []).filter(
      (r: TMDBMultiSearchResult) => r.media_type === "movie" || r.media_type === "tv"
    );
    return {
      results: filtered,
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB multi search error:", error);
    return { results: [], totalPages: 0 };
  }
}

// Search movies on TMDB
export async function searchTMDBMovies(query: string, page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/search/movie?${params}`);

    if (!response.ok) {
      console.error("TMDB search failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB search error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Search single movie on TMDB
export async function searchTMDBMovie(title: string, year?: string): Promise<TMDBMovie | null> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      query: title,
      language: "en-US",
    });

    if (year) {
      params.set("year", year);
    }

    const response = await fetch(`${TMDB_BASE}/search/movie?${params}`);

    if (!response.ok) {
      console.error("TMDB search failed:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error("TMDB search error:", error);
    return null;
  }
}

// Get movie details from TMDB with credits and videos
export async function getTMDBMovieDetails(movieId: number): Promise<TMDBMovieDetails | null> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      append_to_response: "credits,videos",
      language: "en-US",
    });

    const response = await fetch(`${TMDB_BASE}/movie/${movieId}?${params}`);

    if (!response.ok) {
      console.error("TMDB details failed:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("TMDB details error:", error);
    return null;
  }
}

// Get trending movies from TMDB (Trending Today)
export async function getTMDBTrendingMovies(page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/trending/movie/day?${params}`);

    if (!response.ok) {
      console.error("TMDB trending failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB trending error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Get popular movies from TMDB
export async function getTMDBPopularMovies(page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/movie/popular?${params}`);

    if (!response.ok) {
      console.error("TMDB popular failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB popular error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Get now playing movies from TMDB (newest/latest in theaters)
export async function getTMDBNowPlayingMovies(page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/movie/now_playing?${params}`);

    if (!response.ok) {
      console.error("TMDB now playing failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB now playing error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Get upcoming movies from TMDB
export async function getTMDBUpcomingMovies(page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/movie/upcoming?${params}`);

    if (!response.ok) {
      console.error("TMDB upcoming failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB upcoming error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// ============= TMDB TV Series Functions =============

// Get popular TV series from TMDB
export async function getTMDBPopularTV(page: number = 1): Promise<{ series: TMDBTVSeries[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/tv/popular?${params}`);

    if (!response.ok) {
      console.error("TMDB popular TV failed:", response.status);
      return { series: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      series: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB popular TV error:", error);
    return { series: [], totalPages: 0 };
  }
}

// Get on the air TV series from TMDB (airing now / newest)
export async function getTMDBOnTheAirTV(page: number = 1): Promise<{ series: TMDBTVSeries[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/tv/on_the_air?${params}`);

    if (!response.ok) {
      console.error("TMDB on the air TV failed:", response.status);
      return { series: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      series: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB on the air TV error:", error);
    return { series: [], totalPages: 0 };
  }
}

// Get airing today TV series from TMDB
export async function getTMDBAiringTodayTV(page: number = 1): Promise<{ series: TMDBTVSeries[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
    });

    const response = await fetch(`${TMDB_BASE}/tv/airing_today?${params}`);

    if (!response.ok) {
      console.error("TMDB airing today failed:", response.status);
      return { series: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      series: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB airing today error:", error);
    return { series: [], totalPages: 0 };
  }
}

// Get TV series details from TMDB
export async function getTMDBTVDetails(tvId: number): Promise<TMDBTVDetails | null> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      append_to_response: "credits,videos",
      language: "en-US",
    });

    const response = await fetch(`${TMDB_BASE}/tv/${tvId}?${params}`);

    if (!response.ok) {
      console.error("TMDB TV details failed:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("TMDB TV details error:", error);
    return null;
  }
}

// Get season details from TMDB
export async function getTMDBSeasonDetails(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetails | null> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
    });

    const response = await fetch(`${TMDB_BASE}/tv/${tvId}/season/${seasonNumber}?${params}`);

    if (!response.ok) {
      console.error("TMDB season details failed:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("TMDB season details error:", error);
    return null;
  }
}

// Get movies by genre from TMDB
export async function getTMDBMoviesByGenre(genreId: number, page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
      with_genres: String(genreId),
      sort_by: "popularity.desc",
    });

    const response = await fetch(`${TMDB_BASE}/discover/movie?${params}`);

    if (!response.ok) {
      console.error("TMDB genre movies failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB genre movies error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Get movies by year from TMDB
export async function getTMDBMoviesByYear(year: string, page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
      primary_release_year: year,
      sort_by: "popularity.desc",
    });

    const response = await fetch(`${TMDB_BASE}/discover/movie?${params}`);

    if (!response.ok) {
      console.error("TMDB year movies failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB year movies error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// TMDB Person Types
export interface TMDBPerson {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
}

// Get person details from TMDB
export async function getTMDBPersonDetails(personId: number): Promise<TMDBPerson | null> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
    });

    const response = await fetch(`${TMDB_BASE}/person/${personId}?${params}`);

    if (!response.ok) {
      console.error("TMDB person details failed:", response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("TMDB person details error:", error);
    return null;
  }
}

// Get movies by person from TMDB
export async function getTMDBPersonMovies(personId: number, page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
    });

    const response = await fetch(`${TMDB_BASE}/person/${personId}/movie_credits?${params}`);

    if (!response.ok) {
      console.error("TMDB person movies failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    // Combine cast and crew, remove duplicates, sort by popularity
    const allMovies = [...(data.cast || []), ...(data.crew || [])];
    const uniqueMovies = allMovies.reduce((acc: TMDBMovie[], movie: TMDBMovie) => {
      if (!acc.find((m) => m.id === movie.id)) {
        acc.push(movie);
      }
      return acc;
    }, []);
    
    // Sort by popularity and paginate client-side
    const sortedMovies = uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const perPage = 20;
    const startIndex = (page - 1) * perPage;
    const paginatedMovies = sortedMovies.slice(startIndex, startIndex + perPage);
    
    return {
      movies: paginatedMovies,
      totalPages: Math.ceil(sortedMovies.length / perPage),
    };
  } catch (error) {
    console.error("TMDB person movies error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// Common country codes for TMDB
export const COUNTRY_LIST = [
  { code: "US", name: "United States of America" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "RU", name: "Russia" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
];

// Get movies by country from TMDB
export async function getTMDBMoviesByCountry(countryCode: string, page: number = 1): Promise<{ movies: TMDBMovie[]; totalPages: number }> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: String(page),
      with_origin_country: countryCode,
      sort_by: "popularity.desc",
    });

    const response = await fetch(`${TMDB_BASE}/discover/movie?${params}`);

    if (!response.ok) {
      console.error("TMDB country movies failed:", response.status);
      return { movies: [], totalPages: 0 };
    }

    const data = await response.json();
    return {
      movies: data.results || [],
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error("TMDB country movies error:", error);
    return { movies: [], totalPages: 0 };
  }
}

// ============= Helper Functions =============

// TMDB Image Sizes:
// Poster: w92, w154, w185, w342, w500, w780, original
// Backdrop: w300, w780, w1280, original
// Profile: w45, w185, h632, original
export function getTMDBImageUrl(
  path: string | null,
  size: "w92" | "w154" | "w185" | "w200" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original" = "w500"
): string {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getYouTubeTrailerUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=1`;
}

export function getYouTubeThumbnail(key: string): string {
  return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
}

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map((id) => TMDB_GENRES[id]).filter(Boolean);
}

// Get director from crew
export function getDirector(crew: TMDBCrewMember[]): TMDBCrewMember | undefined {
  return crew.find((member) => member.job === "Director");
}

// Get main cast (top N)
export function getMainCast(cast: TMDBCastMember[], limit: number = 5): TMDBCastMember[] {
  return cast.slice(0, limit);
}

// Get trailer from videos
export function getTrailer(videos: TMDBVideo[]): TMDBVideo | undefined {
  return (
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube")
  );
}

// ============= Combined Movie Data =============

export interface EnhancedMovieData {
  ytsMovie: YTSMovie | null;
  tmdbMovie: TMDBMovieDetails | null;
  tmdbId: number | null;
  imdbCode: string | null;
  title: string;
  year: string;
  rating: number | null;
  runtime: number | null;
  genres: string[];
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  trailerKey: string | null;
  director: string | null;
  cast: { name: string; character: string; photo: string }[];
  country: string | null;
}

// Fetch enhanced movie data from both APIs
export async function getEnhancedMovieData(title: string, year?: string): Promise<EnhancedMovieData> {
  const cleanTitle = title
    .replace(/\s*\(\d{4}\)\s*$/, "")
    .replace(/^Nonton\s+/i, "")
    .replace(/Sub Indo$/i, "")
    .trim();

  // Search both APIs in parallel
  const [ytsResult, tmdbResult] = await Promise.all([
    searchYTSMovie(cleanTitle, year),
    searchTMDBMovie(cleanTitle, year),
  ]);

  // Get TMDB details if found
  let tmdbDetails: TMDBMovieDetails | null = null;
  if (tmdbResult) {
    tmdbDetails = await getTMDBMovieDetails(tmdbResult.id);
  }

  // Get YTS details if found
  let ytsDetails: YTSMovie | null = ytsResult;
  if (ytsResult?.id) {
    const fullDetails = await getYTSMovieDetails(ytsResult.id);
    if (fullDetails) {
      ytsDetails = fullDetails;
    }
  }

  // Extract director
  const director = tmdbDetails?.credits?.crew
    ? getDirector(tmdbDetails.credits.crew)?.name || null
    : null;

  // Extract cast
  const cast = tmdbDetails?.credits?.cast
    ? getMainCast(tmdbDetails.credits.cast, 6).map((c) => ({
        name: c.name,
        character: c.character,
        photo: getTMDBImageUrl(c.profile_path, "w200"),
      }))
    : [];

  // Get trailer
  const trailer = tmdbDetails?.videos?.results
    ? getTrailer(tmdbDetails.videos.results)
    : null;
  const trailerKey = trailer?.key || ytsDetails?.yt_trailer_code || null;

  // Get country
  const country = tmdbDetails?.production_countries?.[0]?.name || null;

  return {
    ytsMovie: ytsDetails,
    tmdbMovie: tmdbDetails,
    tmdbId: tmdbDetails?.id || null,
    imdbCode: ytsDetails?.imdb_code || null,
    title: tmdbDetails?.title || ytsDetails?.title || cleanTitle,
    year: year || tmdbDetails?.release_date?.split("-")[0] || String(ytsDetails?.year || ""),
    rating: tmdbDetails?.vote_average || ytsDetails?.rating || null,
    runtime: tmdbDetails?.runtime || ytsDetails?.runtime || null,
    genres: tmdbDetails?.genres?.map((g) => g.name) || ytsDetails?.genres || [],
    overview: tmdbDetails?.overview || ytsDetails?.description_full || "",
    posterUrl:
      getTMDBImageUrl(tmdbDetails?.poster_path) || ytsDetails?.large_cover_image || "/placeholder.svg",
    backdropUrl:
      getTMDBImageUrl(tmdbDetails?.backdrop_path, "original") ||
      ytsDetails?.background_image_original ||
      "/placeholder.svg",
    trailerKey,
    director,
    cast,
    country,
  };
}

// Get enhanced data from YTS movie (for card display)
export async function getEnhancedMovieFromYTS(ytsMovie: YTSMovie): Promise<EnhancedMovieData> {
  // Get TMDB data for additional info
  const tmdbResult = await searchTMDBMovie(ytsMovie.title, String(ytsMovie.year));
  let tmdbDetails: TMDBMovieDetails | null = null;

  if (tmdbResult) {
    tmdbDetails = await getTMDBMovieDetails(tmdbResult.id);
  }

  const director = tmdbDetails?.credits?.crew
    ? getDirector(tmdbDetails.credits.crew)?.name || null
    : null;

  const cast = tmdbDetails?.credits?.cast
    ? getMainCast(tmdbDetails.credits.cast, 6).map((c) => ({
        name: c.name,
        character: c.character,
        photo: getTMDBImageUrl(c.profile_path, "w200"),
      }))
    : [];

  const trailer = tmdbDetails?.videos?.results
    ? getTrailer(tmdbDetails.videos.results)
    : null;
  const trailerKey = trailer?.key || ytsMovie.yt_trailer_code || null;

  const country = tmdbDetails?.production_countries?.[0]?.name || null;

  return {
    ytsMovie,
    tmdbMovie: tmdbDetails,
    tmdbId: tmdbDetails?.id || null,
    imdbCode: ytsMovie.imdb_code,
    title: tmdbDetails?.title || ytsMovie.title,
    year: String(ytsMovie.year),
    rating: tmdbDetails?.vote_average || ytsMovie.rating,
    runtime: tmdbDetails?.runtime || ytsMovie.runtime,
    genres: tmdbDetails?.genres?.map((g) => g.name) || ytsMovie.genres || [],
    overview: tmdbDetails?.overview || ytsMovie.description_full || "",
    posterUrl: getTMDBImageUrl(tmdbDetails?.poster_path) || ytsMovie.large_cover_image || "/placeholder.svg",
    backdropUrl:
      getTMDBImageUrl(tmdbDetails?.backdrop_path, "original") ||
      ytsMovie.background_image_original ||
      "/placeholder.svg",
    trailerKey,
    director,
    cast,
    country,
  };
}

// ============= TMDB Recommendations =============

// Get movie recommendations
export async function getTMDBMovieRecommendations(movieId: number): Promise<TMDBMovie[]> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: "1",
    });

    const response = await fetch(`${TMDB_BASE}/movie/${movieId}/recommendations?${params}`);

    if (!response.ok) {
      console.error("TMDB movie recommendations failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.slice(0, 12) || [];
  } catch (error) {
    console.error("TMDB movie recommendations error:", error);
    return [];
  }
}

// Get similar movies as fallback
export async function getTMDBSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: "1",
    });

    const response = await fetch(`${TMDB_BASE}/movie/${movieId}/similar?${params}`);

    if (!response.ok) {
      console.error("TMDB similar movies failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.slice(0, 12) || [];
  } catch (error) {
    console.error("TMDB similar movies error:", error);
    return [];
  }
}

// Get TV series recommendations
export async function getTMDBTVRecommendations(tvId: number): Promise<TMDBTVSeries[]> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: "1",
    });

    const response = await fetch(`${TMDB_BASE}/tv/${tvId}/recommendations?${params}`);

    if (!response.ok) {
      console.error("TMDB TV recommendations failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.slice(0, 12) || [];
  } catch (error) {
    console.error("TMDB TV recommendations error:", error);
    return [];
  }
}

// Get similar TV series as fallback
export async function getTMDBSimilarTV(tvId: number): Promise<TMDBTVSeries[]> {
  try {
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY,
      language: "en-US",
      page: "1",
    });

    const response = await fetch(`${TMDB_BASE}/tv/${tvId}/similar?${params}`);

    if (!response.ok) {
      console.error("TMDB similar TV failed:", response.status);
      return [];
    }

    const data = await response.json();
    return data.results?.slice(0, 12) || [];
  } catch (error) {
    console.error("TMDB similar TV error:", error);
    return [];
  }
}
