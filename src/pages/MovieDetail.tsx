import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, Play, Star, Clock, Calendar, Globe, User, Tag,
  ChevronRight, Film, Clapperboard, Users, X, Youtube
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO, generateMovieSchema } from "@/components/SEO";
import { Breadcrumb, generateMovieBreadcrumbs } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTMDBMovieDetails,
  getTMDBMovieRecommendations,
  getTMDBSimilarMovies,
  getTMDBImageUrl,
  getDirector,
  getMainCast,
  getTrailer,
  getYouTubeTrailerUrl,
  GENRE_LIST,
  COUNTRY_LIST,
} from "@/lib/external-api";
import { RelatedMovies } from "@/components/RelatedContent";

const MovieDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  // Extract TMDB ID from slug (format: {id}-{title-slug})
  const tmdbId = slug ? parseInt(slug.split("-")[0]) : null;

  // Fetch TMDB movie details
  const { data: movie, isLoading } = useQuery({
    queryKey: ["tmdb-movie-details", tmdbId],
    queryFn: () => getTMDBMovieDetails(tmdbId!),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  // Fetch recommendations
  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ["tmdb-movie-recommendations", tmdbId],
    queryFn: async () => {
      const recs = await getTMDBMovieRecommendations(tmdbId!);
      if (recs.length === 0) {
        return getTMDBSimilarMovies(tmdbId!);
      }
      return recs;
    },
    enabled: !!tmdbId && !isNaN(tmdbId),
  });


  // Helper to get genre slug
  const getGenreSlug = (genreName: string) => {
    const genre = GENRE_LIST.find((g) => g.name === genreName);
    return genre?.slug || genreName.toLowerCase().replace(/\s+/g, "-");
  };

  // Helper to create person slug
  const createPersonSlug = (id: number, name: string) => {
    return `${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-[50vh] rounded-lg mb-8" />
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-72 aspect-[2/3] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!movie) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
          <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const posterUrl = getTMDBImageUrl(movie.poster_path, "w342");
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const year = movie.release_date?.split("-")[0] || "";
  const genres = movie.genres || [];
  const countryData = movie.production_countries?.[0];
  const country = countryData?.name || "";
  const countryCode = countryData?.iso_3166_1 || "";
  
  const directorData = movie.credits?.crew ? getDirector(movie.credits.crew) : null;
  const director = directorData?.name || null;
  const directorId = directorData?.id;
  
  const castData = movie.credits?.cast 
    ? getMainCast(movie.credits.cast, 6)
    : [];
  const cast = castData.map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    photo: getTMDBImageUrl(c.profile_path, "w200"),
  }));
  
  const trailer = movie.videos?.results ? getTrailer(movie.videos.results) : null;
  const trailerKey = trailer?.key;

  // Generate SEO data
  const seoTitle = `${movie.title}${year ? ` (${year})` : ""} - Film Dong`;
  const seoDescription = movie.overview || `Nonton ${movie.title} streaming dengan subtitle Indonesia di Film Dong.`;
  const seoImage = getTMDBImageUrl(movie.backdrop_path || movie.poster_path, "original");
  
  // Generate YouTube trailer embed URL for schema
  const trailerEmbedUrl = trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : undefined;

  const movieSchema = generateMovieSchema({
    name: movie.title,
    description: movie.overview,
    datePublished: movie.release_date,
    duration: movie.runtime,
    image: seoImage,
    director: directorData ? { 
      name: directorData.name, 
      url: `${window.location.origin}/person/${createPersonSlug(directorData.id, directorData.name)}` 
    } : undefined,
    actors: castData.map((c) => ({
      name: c.name,
      url: `${window.location.origin}/person/${createPersonSlug(c.id, c.name)}`,
    })),
    genre: genres.map((g) => g.name),
    rating: movie.vote_average,
    ratingCount: movie.vote_count,
    url: `${window.location.origin}/movie/${slug}`,
    trailerUrl: trailerEmbedUrl,
  });

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/movie/${slug}`}
        type="video.movie"
        image={seoImage}
        schema={movieSchema}
      />

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur - click to close */}
          <div 
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={() => setShowTrailer(false)}
          />
          <div className="relative w-full max-w-4xl aspect-video z-10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setShowTrailer(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <iframe
              src={getYouTubeTrailerUrl(trailerKey)}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {/* Hero Background */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 -mt-80 relative z-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={generateMovieBreadcrumbs(
            movie.title,
            genres[0] ? { name: genres[0].name, slug: getGenreSlug(genres[0].name) } : undefined
          )} 
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-full md:w-72">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {genres.slice(0, 3).map((genre) => (
                  <Link key={genre.id} to={`/category/${getGenreSlug(genre.name)}`}>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer transition-colors">
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>
              <h1 className="font-display text-4xl md:text-5xl leading-tight">{movie.title}</h1>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {year && (
                <Link to={`/year/${year}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </Link>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.runtime} min</span>
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span>
                    {movie.vote_average.toFixed(1)}
                    {movie.vote_count > 0 && (
                      <span className="text-muted-foreground">/{movie.vote_count.toLocaleString()} votes</span>
                    )}
                  </span>
                </div>
              )}
              {country && countryCode && (
                <Link to={`/country/${countryCode.toLowerCase()}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>{country}</span>
                </Link>
              )}
            </div>

            {/* Movie Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-card/50 rounded-lg border border-border">
              {director && directorId && (
                <div className="flex items-start gap-2">
                  <Clapperboard className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Director</span>
                    <Link 
                      to={`/person/${createPersonSlug(directorId, director)}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {director}
                    </Link>
                  </div>
                </div>
              )}
              {cast.length > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Cast</span>
                    <span className="text-sm line-clamp-2">
                      {cast.map((c, i) => (
                        <span key={c.id}>
                          <Link 
                            to={`/person/${createPersonSlug(c.id, c.name)}`}
                            className="hover:text-primary transition-colors"
                          >
                            {c.name}
                          </Link>
                          {i < cast.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
              {genres.length > 0 && (
                <div className="flex items-start gap-2">
                  <Film className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Genre</span>
                    <span className="text-sm">
                      {genres.map((g, i) => (
                        <span key={g.id}>
                          <Link 
                            to={`/category/${getGenreSlug(g.name)}`}
                            className="hover:text-primary transition-colors"
                          >
                            {g.name}
                          </Link>
                          {i < genres.length - 1 && ", "}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
              {year && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Release Year</span>
                    <Link 
                      to={`/year/${year}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {year}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cast Avatars */}
            {cast.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Main Cast
                </h3>
                <div className="flex flex-wrap gap-3">
                  {cast.map((actor) => (
                    <Link 
                      key={actor.id} 
                      to={`/person/${createPersonSlug(actor.id, actor.name)}`}
                      className="flex flex-col items-center w-20 group"
                    >
                      <img
                        src={actor.photo}
                        alt={actor.name}
                        className="w-16 h-16 rounded-full object-cover bg-muted group-hover:ring-2 group-hover:ring-primary transition-all"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      <span className="text-xs text-center mt-1 line-clamp-1 group-hover:text-primary transition-colors">{actor.name}</span>
                      <span className="text-xs text-muted-foreground text-center line-clamp-1">
                        {actor.character}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Synopsis
                </h3>
                <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to={`/play/${slug}`}>
                  <Play className="w-5 h-5 mr-2" fill="currentColor" />
                  Watch Now
                </Link>
              </Button>
              {trailerKey && (
                <Button variant="outline" size="lg" onClick={() => setShowTrailer(true)}>
                  <Youtube className="w-5 h-5 mr-2" />
                  Watch Trailer
                </Button>
              )}
              <Button variant="secondary" size="lg">
                Add to Watchlist
              </Button>
            </div>

            {/* Tags/Genres */}
            {genres.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Link key={genre.id} to={`/category/${getGenreSlug(genre.name)}`}>
                      <Badge variant="secondary" className="text-xs hover:bg-primary/20 cursor-pointer transition-colors">
                        {genre.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Movies */}
        <RelatedMovies movies={recommendations || []} isLoading={isLoadingRecs} />
      </div>
    </Layout>
  );
};

export default MovieDetail;
