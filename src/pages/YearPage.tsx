import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar, Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb, generateYearBreadcrumbs } from "@/components/Breadcrumb";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTMDBMoviesByYear, TMDBMovie, getTMDBImageUrl, getGenreNames } from "@/lib/external-api";

const YearPage = () => {
  const { year } = useParams<{ year: string }>();
  const [page, setPage] = useState(1);

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ["tmdb-movies-year", year, page],
    queryFn: () => getTMDBMoviesByYear(year!, page),
    enabled: !!year,
  });

  const movies = moviesData?.movies || [];
  const totalPages = Math.min(moviesData?.totalPages || 1, 500);

  const seoTitle = `Film Tahun ${year} - Film Dong`;
  const seoDescription = `Nonton film rilisan tahun ${year} dengan subtitle Indonesia. Koleksi lengkap film ${year} berkualitas HD di Film Dong.`;

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/year/${year}`}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={generateYearBreadcrumbs(year || "")} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl">
                Movies from {year}
              </h1>
              <p className="text-sm text-muted-foreground">Browse all movies released in {year}</p>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TMDBMovieCard movie={movie} />
                </div>
              ))}
        </div>

        {/* Empty State */}
        {!isLoading && movies.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
            <p className="text-muted-foreground mb-6">
              No movies found for year {year}.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page + i - 2;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={page === pageNum ? "bg-primary text-primary-foreground" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// TMDB Movie Card Component
function TMDBMovieCard({ movie }: { movie: TMDBMovie }) {
  const imageUrl = getTMDBImageUrl(movie.poster_path, "w342");
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
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {year && (
          <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-xs">
            {year}
          </Badge>
        )}

        {genres.length > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-sm text-xs">
            {genres[0]}
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
            <span>{movie.vote_average?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default YearPage;