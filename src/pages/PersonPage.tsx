import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, User, Star, Film, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb, generatePersonBreadcrumbs } from "@/components/Breadcrumb";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTMDBPersonDetails, getTMDBPersonMovies, TMDBMovie, getTMDBImageUrl, getGenreNames } from "@/lib/external-api";

const PersonPage = () => {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const personId = id ? parseInt(id.split("-")[0]) : null;

  const { data: person, isLoading: personLoading } = useQuery({
    queryKey: ["tmdb-person", personId],
    queryFn: () => getTMDBPersonDetails(personId!),
    enabled: !!personId,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["tmdb-person-movies", personId, page],
    queryFn: () => getTMDBPersonMovies(personId!, page),
    enabled: !!personId,
  });

  const movies = moviesData?.movies || [];
  const totalPages = Math.min(moviesData?.totalPages || 1, 500);
  const isLoading = personLoading || moviesLoading;

  const personName = person?.name || "Artis";
  const seoTitle = `${personName} - Filmografi - Film Dong`;
  const seoDescription = person?.biography 
    ? person.biography.substring(0, 155) + "..."
    : `Daftar film yang dibintangi ${personName}. Nonton filmografi lengkap ${personName} di Film Dong.`;
  const personImage = person?.profile_path ? getTMDBImageUrl(person.profile_path, "w300") : undefined;

  // Person Schema
  const personSchema = person ? {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    image: personImage,
    description: person.biography,
    birthDate: person.birthday,
    birthPlace: person.place_of_birth,
    jobTitle: person.known_for_department,
    url: typeof window !== "undefined" ? window.location.href : ""
  } : undefined;

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/person/${id}`}
        image={personImage}
        schema={personSchema}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={generatePersonBreadcrumbs(personName)} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Person Photo */}
            {person?.profile_path && (
              <img
                src={getTMDBImageUrl(person.profile_path, "w300")}
                alt={person.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
              />
            )}
            
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl mb-2">
                {person?.name || "Loading..."}
              </h1>
              {person?.known_for_department && (
                <Badge className="mb-3 bg-primary/20 text-primary">
                  {person.known_for_department}
                </Badge>
              )}
              {person?.biography && (
                <p className="text-muted-foreground text-sm line-clamp-4 max-w-2xl">
                  {person.biography}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                {person?.birthday && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Born: {new Date(person.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {person?.place_of_birth && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="mb-6">
          <h2 className="font-display text-2xl flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-primary" />
            Filmography
          </h2>
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
              No movies found for this person.
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

export default PersonPage;