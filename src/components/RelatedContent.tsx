import { Link } from "react-router-dom";
import { ChevronRight, Star, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getTMDBImageUrl, TMDBMovie, TMDBTVSeries } from "@/lib/external-api";
import { DramaChinaItem } from "@/lib/dramabox-api";

interface RelatedMoviesProps {
  movies: TMDBMovie[];
  isLoading?: boolean;
}

export function RelatedMovies({ movies, isLoading }: RelatedMoviesProps) {
  if (isLoading) {
    return <RelatedSkeleton />;
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">You May Also Like</h2>
        <Link to="/movies" className="text-sm text-primary hover:underline flex items-center">
          View More <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.slice(0, 6).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

interface RelatedTVSeriesProps {
  series: TMDBTVSeries[];
  isLoading?: boolean;
}

export function RelatedTVSeries({ series, isLoading }: RelatedTVSeriesProps) {
  if (isLoading) {
    return <RelatedSkeleton />;
  }

  if (!series || series.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">You May Also Like</h2>
        <Link to="/tvseries" className="text-sm text-primary hover:underline flex items-center">
          View More <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {series.slice(0, 6).map((show) => (
          <TVSeriesCard key={show.id} series={show} />
        ))}
      </div>
    </section>
  );
}

interface RelatedDramaboxProps {
  dramas: DramaChinaItem[];
  isLoading?: boolean;
}

export function RelatedDramabox({ dramas, isLoading }: RelatedDramaboxProps) {
  if (isLoading) {
    return <RelatedSkeleton />;
  }

  if (!dramas || dramas.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">You May Also Like</h2>
        <Link to="/dramabox" className="text-sm text-primary hover:underline flex items-center">
          View More <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {dramas.slice(0, 6).map((drama) => (
          <DramaCard key={drama.bookId} drama={drama} />
        ))}
      </div>
    </section>
  );
}

// Movie Card Component
function MovieCard({ movie }: { movie: TMDBMovie }) {
  const slug = `${movie.id}-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const year = movie.release_date?.split("-")[0];
  
  return (
    <Link to={`/movie/${slug}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={getTMDBImageUrl(movie.poster_path, "w300")}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {movie.vote_average > 0 && (
            <Badge className="mb-1 bg-yellow-500/20 text-yellow-500 text-xs">
              <Star className="w-3 h-3 mr-1" fill="currentColor" />
              {movie.vote_average.toFixed(1)}
            </Badge>
          )}
          <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          {year && <p className="text-xs text-muted-foreground">{year}</p>}
        </div>
      </div>
    </Link>
  );
}

// TV Series Card Component
function TVSeriesCard({ series }: { series: TMDBTVSeries }) {
  const slug = `${series.id}-${series.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const year = series.first_air_date?.split("-")[0];
  
  return (
    <Link to={`/tvseries/${slug}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={getTMDBImageUrl(series.poster_path, "w300")}
          alt={series.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {series.vote_average > 0 && (
            <Badge className="mb-1 bg-yellow-500/20 text-yellow-500 text-xs">
              <Star className="w-3 h-3 mr-1" fill="currentColor" />
              {series.vote_average.toFixed(1)}
            </Badge>
          )}
          <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {series.name}
          </p>
          {year && <p className="text-xs text-muted-foreground">{year}</p>}
        </div>
      </div>
    </Link>
  );
}

// Drama Card Component
function DramaCard({ drama }: { drama: DramaChinaItem }) {
  const slug = `${drama.bookId}-${drama.bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  
  return (
    <Link to={`/putar/${slug}`} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={drama.coverWap}
          alt={drama.bookName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Badge variant="secondary" className="mb-1 text-xs">
            {drama.chapterCount} Ep
          </Badge>
          <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {drama.bookName}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loading Component
function RelatedSkeleton() {
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </section>
  );
}
