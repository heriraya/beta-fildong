import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Film, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  getTMDBPopularMovies,
  TMDBMovie,
  getTMDBImageUrl,
  getGenreNames 
} from "@/lib/external-api";

const MoviesListPage = () => {
  const [page, setPage] = useState(1);

  // Fetch two pages to get 24+ items
  const { data: page1Data, isLoading: isLoading1, error } = useQuery({
    queryKey: ["tmdb-popular-movies", page * 2 - 1],
    queryFn: () => getTMDBPopularMovies(page * 2 - 1),
  });

  const { data: page2Data, isLoading: isLoading2 } = useQuery({
    queryKey: ["tmdb-popular-movies", page * 2],
    queryFn: () => getTMDBPopularMovies(page * 2),
  });

  const isLoading = isLoading1 || isLoading2;
  const movies = [...(page1Data?.movies || []), ...(page2Data?.movies || [])].slice(0, 24);
  const totalPages = Math.min(Math.ceil((page1Data?.totalPages || 1) / 2), 250);

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Movies" }
  ];

  return (
    <Layout>
      <SEO
        title="Nonton Film Bioskop Terbaru - Film Dong"
        description="Koleksi film bioskop populer dengan subtitle Indonesia. Streaming film Hollywood, Indonesia, dan Asia berkualitas HD gratis di Film Dong."
        canonical="/movies"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        <div className="flex items-center gap-3 mb-8">
          <Film className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl md:text-4xl">Nonton Film Bioskop Terbaru</h1>
        </div>

        {error && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Failed to load movies. Please try again later.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {isLoading
            ? Array.from({ length: 24 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

function MovieCard({ movie }: { movie: TMDBMovie }) {
  const imageUrl = getTMDBImageUrl(movie.poster_path, "w300");
  const year = movie.release_date?.split("-")[0] || "";
  const genres = getGenreNames(movie.genre_ids || []);
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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
            <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
            <span>{movie.vote_average?.toFixed(1) || "N/A"}</span>
            <span className="mx-1">•</span>
            <span>{year}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default MoviesListPage;
