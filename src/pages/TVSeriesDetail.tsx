import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Clock, Calendar, Play, Users, Film, Globe, ChevronRight, Youtube, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO, generateTVSeriesSchema } from "@/components/SEO";
import { Breadcrumb, generateTVSeriesBreadcrumbs } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getTMDBTVDetails,
  getTMDBTVRecommendations,
  getTMDBSimilarTV,
  getTMDBImageUrl,
  getTrailer,
  getYouTubeTrailerUrl,
  GENRE_LIST,
  COUNTRY_LIST
} from "@/lib/external-api";
import { RelatedTVSeries } from "@/components/RelatedContent";

const TVSeriesDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showTrailer, setShowTrailer] = useState(false);
  // Extract TMDB ID from slug (format: "id-title-slug")
  const tmdbId = slug ? parseInt(slug.split("-")[0]) : null;

  const { data: series, isLoading, error } = useQuery({
    queryKey: ["tmdb-tv-details", tmdbId],
    queryFn: () => getTMDBTVDetails(tmdbId!),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  // Fetch recommendations
  const { data: recommendations, isLoading: isLoadingRecs } = useQuery({
    queryKey: ["tmdb-tv-recommendations", tmdbId],
    queryFn: async () => {
      const recs = await getTMDBTVRecommendations(tmdbId!);
      if (recs.length === 0) {
        return getTMDBSimilarTV(tmdbId!);
      }
      return recs;
    },
    enabled: !!tmdbId && !isNaN(tmdbId),
  });


  // Helper functions for internal linking
  const getGenreSlug = (genreName: string): string => {
    const genre = GENRE_LIST.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    return genre?.slug || genreName.toLowerCase().replace(/\s+/g, "-");
  };

  const createPersonSlug = (id: number, name: string): string => {
    return `${id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="relative min-h-screen">
          <Skeleton className="absolute inset-0 h-[60vh]" />
          <div className="container mx-auto px-4 pt-[40vh]">
            <Skeleton className="h-12 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !series) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Series Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The TV series you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const posterUrl = getTMDBImageUrl(series.poster_path, "w342");
  const backdropUrl = getTMDBImageUrl(series.backdrop_path, "original");
  const year = series.first_air_date?.split("-")[0] || "";
  const director = series.credits?.crew?.find(c => c.job === "Executive Producer" || c.job === "Creator");
  const cast = series.credits?.cast?.slice(0, 6) || [];
  const countryCode = series.production_countries?.[0]?.iso_3166_1?.toLowerCase();
  const countryName = series.production_countries?.[0]?.name;
  
  // Get trailer
  const trailer = series.videos?.results ? getTrailer(series.videos.results) : null;
  const trailerKey = trailer?.key;
  
  // Filter out Season 0 (Specials)
  const seasons = series.seasons?.filter(s => s.season_number > 0) || [];

  // SEO Data
  const seoTitle = `${series.name}${year ? ` (${year})` : ""} - Film Dong`;
  const seoDescription = series.overview || `Nonton ${series.name} streaming dengan subtitle Indonesia di Film Dong.`;
  const seoImage = backdropUrl;

  // Generate YouTube trailer embed URL for schema
  const trailerEmbedUrl = trailerKey ? `https://www.youtube.com/embed/${trailerKey}` : undefined;

  const tvSchema = generateTVSeriesSchema({
    name: series.name,
    description: series.overview,
    datePublished: series.first_air_date,
    numberOfSeasons: series.number_of_seasons,
    numberOfEpisodes: series.number_of_episodes,
    image: seoImage,
    actors: cast.map((c) => ({
      name: c.name,
      url: `${window.location.origin}/person/${createPersonSlug(c.id, c.name)}`,
    })),
    genre: series.genres?.map((g) => g.name),
    rating: series.vote_average,
    ratingCount: series.vote_count,
    url: `${window.location.origin}/tvseries/${slug}`,
    trailerUrl: trailerEmbedUrl,
  });

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/tvseries/${slug}`}
        type="video.tv_show"
        image={seoImage}
        schema={tvSchema}
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

      {/* Hero Backdrop */}
      <div className="relative h-[60vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-[30vh] relative z-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={generateTVSeriesBreadcrumbs(
            series.name,
            series.genres?.[0] ? { name: series.genres[0].name, slug: getGenreSlug(series.genres[0].name) } : undefined
          )} 
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <img
                src={posterUrl}
                alt={series.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h1 className="font-display text-4xl md:text-5xl mb-4">{series.name}</h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {year && (
                <Link to={`/year/${year}`}>
                  <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Calendar className="w-3 h-3 mr-1" />
                    {year}
                  </Badge>
                </Link>
              )}
              {series.vote_average > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500">
                  <Star className="w-3 h-3 mr-1" fill="currentColor" />
                  {series.vote_average.toFixed(1)}
                  {series.vote_count > 0 && (
                    <span className="opacity-80">/{series.vote_count.toLocaleString()} votes</span>
                  )}
                </Badge>
              )}
              {series.number_of_seasons > 0 && (
                <Badge variant="outline">
                  <Film className="w-3 h-3 mr-1" />
                  {series.number_of_seasons} Season{series.number_of_seasons > 1 ? "s" : ""}
                </Badge>
              )}
              {series.episode_run_time?.[0] && (
                <Badge variant="outline">
                  <Clock className="w-3 h-3 mr-1" />
                  ~{series.episode_run_time[0]} min/ep
                </Badge>
              )}
            </div>

            {/* Genres with internal linking */}
            <div className="flex flex-wrap gap-2 mb-6">
              {series.genres?.map((genre) => (
                <Link key={genre.id} to={`/category/${getGenreSlug(genre.name)}`}>
                  <Badge 
                    variant="secondary"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Overview */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {series.overview}
            </p>

            {/* Creator/Director */}
            {director && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-muted-foreground">Creator:</span>
                <Link 
                  to={`/person/${createPersonSlug(director.id, director.name)}`}
                  className="text-primary hover:underline"
                >
                  {director.name}
                </Link>
              </div>
            )}

            {/* Country */}
            {countryName && countryCode && (
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Country:</span>
                <Link 
                  to={`/country/${countryCode}`}
                  className="text-primary hover:underline"
                >
                  {countryName}
                </Link>
              </div>
            )}

            {/* Watch Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to={`/watch/${slug}?s=1&e=1`}>
                  <Play className="w-5 h-5 mr-2" fill="currentColor" />
                  Watch S1 E1
                </Link>
              </Button>
              {trailerKey && (
                <Button variant="outline" size="lg" onClick={() => setShowTrailer(true)}>
                  <Youtube className="w-5 h-5 mr-2" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Seasons */}
        <section className="mt-12">
          <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Seasons
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {seasons.map((season) => (
              <Link 
                key={season.id} 
                to={`/watch/${slug}?s=${season.season_number}&e=1`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
                  <img
                    src={getTMDBImageUrl(season.poster_path, "w300")}
                    alt={season.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = posterUrl;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-sm">{season.name}</h3>
                    <p className="text-xs text-muted-foreground">{season.episode_count} Episodes</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12 mb-12">
            <h2 className="font-display text-2xl mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cast.map((actor) => (
                <Link 
                  key={actor.id}
                  to={`/person/${createPersonSlug(actor.id, actor.name)}`}
                  className="group text-center"
                >
                  <div className="relative aspect-square rounded-full overflow-hidden mb-2 mx-auto w-24 card-hover">
                    <img
                      src={getTMDBImageUrl(actor.profile_path, "w200")}
                      alt={actor.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{actor.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{actor.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related TV Series */}
        <RelatedTVSeries series={recommendations || []} isLoading={isLoadingRecs} />
      </div>
    </Layout>
  );
};

export default TVSeriesDetail;
