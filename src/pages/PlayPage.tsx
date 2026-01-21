import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Server, Info, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO, generateVideoSchema } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getTMDBMovieDetails, getTMDBImageUrl, GENRE_LIST } from "@/lib/external-api";
import { addToWatchHistory } from "@/lib/watch-history";
import { ShareUnlock } from "@/components/ShareUnlock";
import { PreRollAd } from "@/components/PreRollAd";

// Video embed servers using TMDB ID
const SERVERS = [
  { id: 1, name: "Server 1", embed: (tmdbId: number) => `https://vidsrc.xyz/embed/movie/${tmdbId}` },
  { id: 2, name: "Server 2", embed: (tmdbId: number) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}` },
  { id: 3, name: "Server 3", embed: (tmdbId: number) => `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1` },
  { id: 4, name: "Server 4", embed: (tmdbId: number) => `https://autoembed.to/movie/tmdb/${tmdbId}` },
];

const PlayPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract TMDB ID from slug
  const tmdbId = slug ? parseInt(slug.split("-")[0]) : null;
  const server = parseInt(searchParams.get("sv") || "1");

  const [selectedServer, setSelectedServer] = useState(server);
  const [adCompleted, setAdCompleted] = useState(false);
  const { data: movie, isLoading } = useQuery({
    queryKey: ["tmdb-movie-play", tmdbId],
    queryFn: () => getTMDBMovieDetails(tmdbId!),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  useEffect(() => {
    setSearchParams({ sv: String(selectedServer) });
  }, [selectedServer, setSearchParams]);

  // Save to watch history when movie loads
  useEffect(() => {
    if (movie && tmdbId && slug) {
      addToWatchHistory({
        id: String(tmdbId),
        type: "movie",
        title: movie.title,
        poster: getTMDBImageUrl(movie.backdrop_path || movie.poster_path, "w500"),
        slug: slug,
      });
    }
  }, [movie, tmdbId, slug]);

  const handleServerChange = (serverId: number) => {
    setSelectedServer(serverId);
  };

  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    onChange();
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const requestPlayerFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await el.requestFullscreen();
    } catch {
      // Some providers block fullscreen in nested cross-origin iframes.
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-video rounded-lg mb-6" />
          <Skeleton className="h-8 w-1/3 mb-4" />
        </div>
      </Layout>
    );
  }

  if (!movie || !tmdbId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const posterUrl = getTMDBImageUrl(movie.poster_path, "w300");
  const year = movie.release_date?.split("-")[0] || "";
  const genres = movie.genres?.map((g) => g.name) || [];

  // Generate iframe URL using TMDB ID
  const currentServer = SERVERS.find((s) => s.id === selectedServer) || SERVERS[0];
  const iframeSrc = currentServer.embed(tmdbId);


  // SEO - noindex for player pages
  const seoTitle = `Nonton ${movie.title} - Film Dong`;
  const videoSchema = generateVideoSchema({
    name: movie.title,
    description: movie.overview,
    thumbnailUrl: getTMDBImageUrl(movie.backdrop_path || movie.poster_path, "original"),
    uploadDate: movie.release_date,
    duration: movie.runtime,
    embedUrl: iframeSrc,
  });

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={movie.overview}
        canonical={`/play/${slug}`}
        noindex={true}
        schema={videoSchema}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: "Beranda", href: "/" },
            { label: "Movies", href: "/movies" },
            { label: movie.title, href: `/movie/${slug}` },
            { label: "Tonton" },
          ]} 
          className="mb-6"
        />

        {/* Title */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl">{movie.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {year && <Badge variant="secondary">{year}</Badge>}
              {movie.vote_average > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500">⭐ {movie.vote_average.toFixed(1)}</Badge>
              )}
              {movie.runtime > 0 && (
                <Badge variant="outline">{movie.runtime} min</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div
          ref={playerContainerRef}
          className="relative w-full aspect-video bg-card rounded-lg overflow-hidden shadow-2xl mb-6"
        >
          {/* Pre-Roll Ad */}
          {!adCompleted && (
            <PreRollAd onComplete={() => setAdCompleted(true)} />
          )}

          {/* Tombol fullscreen kustom di kanan atas */}
          {adCompleted && (
            <div className="absolute top-3 right-3 z-20">
              <Button
                variant="secondary"
                size="sm"
                onClick={requestPlayerFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="flex items-center gap-1.5"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
              </Button>
            </div>
          )}

          {adCompleted && (
            <iframe
              src={iframeSrc}
              className="w-full h-full"
              allowFullScreen={true}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              referrerPolicy="origin"
              title={movie.title}
            />
          )}
          {adCompleted && <ShareUnlock delaySeconds={120} />}
        </div>

        {/* Server Selection */}
        <div className="bg-card rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            Select Server
          </h3>
          <div className="flex flex-wrap gap-2">
            {SERVERS.map((srv) => (
              <Button
                key={srv.id}
                variant={selectedServer === srv.id ? "default" : "secondary"}
                size="sm"
                onClick={() => handleServerChange(srv.id)}
                className={selectedServer === srv.id ? "bg-primary text-primary-foreground" : ""}
              >
                {srv.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>How to Watch:</strong> Subtitles will appear automatically if available.
              Use Chrome for the best experience.
            </p>
            <p>
              If the player doesn't work, please try another server or reload the page.
            </p>
          </div>
        </div>

        {/* Movie Info Card */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 bg-card rounded-lg p-6">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full md:w-40 aspect-[2/3] object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="flex-1">
            <h2 className="font-display text-xl mb-2">{movie.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
              {movie.overview}
            </p>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre) => (
                  <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
              </div>
            )}
            <Button asChild variant="secondary" size="sm">
              <Link to={`/movie/${slug}`}>
                View Full Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlayPage;
