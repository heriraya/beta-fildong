import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Star, Tv, Film, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getTMDBNowPlayingMovies,
  getTMDBOnTheAirTV,
  TMDBMovie,
  TMDBTVSeries,
  getTMDBImageUrl,
  getGenreNames 
} from "@/lib/external-api";
import { getDramaboxLatest, DramaChinaItem } from "@/lib/dramabox-api";

const Index = () => {
  // Film Terbaru (Now Playing)
  const { data: newMoviesData, isLoading: isLoadingNewMovies } = useQuery({
    queryKey: ["tmdb-now-playing", 1],
    queryFn: () => getTMDBNowPlayingMovies(1),
  });

  // Series Terbaru (On The Air)
  const { data: newTVData, isLoading: isLoadingNewTV } = useQuery({
    queryKey: ["tmdb-on-the-air", 1],
    queryFn: () => getTMDBOnTheAirTV(1),
  });

  const { data: dramaData, isLoading: isLoadingDrama } = useQuery({
    queryKey: ["dramabox-latest-home"],
    queryFn: () => getDramaboxLatest(1),
  });

  const newMovies = newMoviesData?.movies?.slice(0, 6) || [];
  const newTVSeries = newTVData?.series?.slice(0, 6) || [];
  const dramas = dramaData?.slice(0, 6) || [];
  const featuredMovie = newMoviesData?.movies?.[0] || null;

  // Website Schema for homepage
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Film Dong",
    url: typeof window !== "undefined" ? window.location.origin : "",
    description: "Situs nonton film bioskop, TV series, dan drama Korea terbaru dengan subtitle Indonesia.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: typeof window !== "undefined" 
          ? `${window.location.origin}/search?q={search_term_string}` 
          : "/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Layout>
      <SEO
        title="Film Dong - Situs Nonton Film Series Drama"
        description="Nonton film bioskop, TV series, dan drama Korea terbaru dengan subtitle Indonesia. Streaming gratis berkualitas HD di Film Dong."
        canonical="/"
        schema={websiteSchema}
      />
      {/* Hero Section */}
      {isLoadingNewMovies ? (
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-card">
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-12 w-36" />
                <Skeleton className="h-12 w-28" />
              </div>
            </div>
          </div>
        </section>
      ) : featuredMovie ? (
        <HeroSection movie={featuredMovie} />
      ) : null}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Visually Hidden H1 for SEO */}
        <h1 className="sr-only">Film Dong - Nonton Film, Series, dan Drama Terbaru</h1>

        {/* Film Terbaru - Now Playing */}
        <section className="mb-12" aria-labelledby="section-movies">
          <div className="flex items-center justify-between mb-6">
            <h2 id="section-movies" className="font-display text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Film Terbaru
            </h2>
            <Link to="/movies" className="text-sm text-primary hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingNewMovies
              ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : newMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TMDBMovieCard movie={movie} />
                  </div>
                ))}
          </div>
        </section>

        {/* Series Terbaru - On The Air */}
        <section className="mb-12" aria-labelledby="section-series">
          <div className="flex items-center justify-between mb-6">
            <h2 id="section-series" className="font-display text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Series Terbaru
            </h2>
            <Link to="/tvseries" className="text-sm text-primary hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingNewTV
              ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : newTVSeries.map((series, index) => (
                  <div
                    key={series.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TVSeriesCard series={series} />
                  </div>
                ))}
          </div>
        </section>

        {/* Drama China - 1 row, 5 posts */}
        <section className="mb-12" aria-labelledby="section-dramabox">
          <div className="flex items-center justify-between mb-6">
            <h2 id="section-dramabox" className="font-display text-2xl flex items-center gap-2">
              <Film className="w-6 h-6 text-primary" />
              Dramabox Terbaru
            </h2>
            <Link to="/dramabox" className="text-sm text-primary hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingDrama
              ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : dramas.map((drama, index) => (
                  <div
                    key={drama.bookId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DramaChinaCard drama={drama} />
                  </div>
                ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

// Drama China Card Component for Homepage - Compact with description
function DramaChinaCard({ drama }: { drama: DramaChinaItem }) {
  const slug = `${drama.bookId}-${drama.bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Link to={`/putar/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={drama.coverWap}
          alt={drama.bookName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {drama.bookName}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            <span>{drama.chapterCount} Eps</span>
            {drama.rankVo && (
              <>
                <span>•</span>
                <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
                <span>{drama.rankVo.hotCode}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// TMDB Movie Card Component - Compact with overview
function TMDBMovieCard({ movie }: { movie: TMDBMovie }) {
  const imageUrl = getTMDBImageUrl(movie.poster_path, "w300");
  const year = movie.release_date?.split("-")[0] || "";
  const slug = `${movie.id}-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Link to={`/movie/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={imageUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            {year && <span>{year}</span>}
            {year && movie.vote_average > 0 && <span>•</span>}
            {movie.vote_average > 0 && (
              <>
                <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
                <span>{movie.vote_average?.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// TV Series Card Component - Compact with overview
function TVSeriesCard({ series }: { series: TMDBTVSeries }) {
  const imageUrl = getTMDBImageUrl(series.poster_path, "w300");
  const year = series.first_air_date?.split("-")[0] || "";
  const slug = `${series.id}-${series.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Link to={`/tvseries/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={imageUrl}
          alt={series.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {series.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
            {year && <span>{year}</span>}
            {year && series.vote_average > 0 && <span>•</span>}
            {series.vote_average > 0 && (
              <>
                <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
                <span>{series.vote_average?.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Hero Section Component
function HeroSection({ movie }: { movie: TMDBMovie }) {
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const year = movie.release_date?.split("-")[0] || "";
  const genres = getGenreNames(movie.genre_ids || []);
  const slug = `${movie.id}-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={backdropUrl}
          alt={`${movie.title} - Film Dong`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary text-primary-foreground">
              <Film className="w-3 h-3 mr-1" />
              Film Terbaru
            </Badge>
            {year && <Badge variant="secondary">{year}</Badge>}
            {movie.vote_average > 0 && (
              <Badge variant="secondary">⭐ {movie.vote_average.toFixed(1)}</Badge>
            )}
          </div>

          <p className="font-display text-5xl sm:text-6xl md:text-7xl leading-none mb-4" aria-label={`Featured: ${movie.title}`}>
            {movie.title}
          </p>

          <p className="text-lg text-muted-foreground line-clamp-3 mb-4">
            {movie.overview}
          </p>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {genres.slice(0, 4).map((genre) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to={`/movie/${slug}`}>
                Watch Now
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to={`/movie/${slug}`}>
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Index;
