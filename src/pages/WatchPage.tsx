import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Server, Info, Play, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO, generateVideoSchema } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getTMDBTVDetails, 
  getTMDBSeasonDetails,
  getTMDBImageUrl 
} from "@/lib/external-api";
import { addToWatchHistory } from "@/lib/watch-history";
import { ShareUnlock } from "@/components/ShareUnlock";
import { PreRollAd } from "@/components/PreRollAd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Video embed servers for TV series
const SERVERS = [
  { id: 1, name: "Server 1", embed: (tmdbId: number, s: number, e: number) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${s}/${e}` },
  { id: 2, name: "Server 2", embed: (tmdbId: number, s: number, e: number) => `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}&ds_lang=de` },
  { id: 3, name: "Server 3", embed: (tmdbId: number, s: number, e: number) => `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}` },
  { id: 4, name: "Server 4", embed: (tmdbId: number, s: number, e: number) => `https://autoembed.to/tv/tmdb/${tmdbId}-${s}-${e}` },
];

const WatchPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract TMDB ID from slug
  const tmdbId = slug ? parseInt(slug.split("-")[0]) : null;
  const currentSeason = parseInt(searchParams.get("s") || "1");
  const currentEpisode = parseInt(searchParams.get("e") || "1");
  const server = parseInt(searchParams.get("sv") || "1");

  const [selectedServer, setSelectedServer] = useState(server);
  const [adCompleted, setAdCompleted] = useState(false);
  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ["tmdb-tv-watch", tmdbId],
    queryFn: () => getTMDBTVDetails(tmdbId!),
    enabled: !!tmdbId && !isNaN(tmdbId),
  });

  // Fetch season details for episodes
  const { data: seasonData, isLoading: isLoadingSeason } = useQuery({
    queryKey: ["tmdb-season", tmdbId, currentSeason],
    queryFn: () => getTMDBSeasonDetails(tmdbId!, currentSeason),
    enabled: !!tmdbId && !isNaN(tmdbId) && currentSeason > 0,
  });

  useEffect(() => {
    const params: Record<string, string> = {
      s: String(currentSeason),
      e: String(currentEpisode),
      sv: String(selectedServer),
    };
    setSearchParams(params);
  }, [selectedServer, currentSeason, currentEpisode, setSearchParams]);

  // Dynamic title - removed, using SEO component now

  // Save to watch history
  useEffect(() => {
    if (series && tmdbId && slug) {
      addToWatchHistory({
        id: String(tmdbId),
        type: "tvseries",
        title: series.name,
        poster: getTMDBImageUrl(series.backdrop_path || series.poster_path, "w500"),
        slug: slug,
        season: currentSeason,
        episode: currentEpisode,
      });
    }
  }, [series, tmdbId, slug, currentSeason, currentEpisode]);

  const handleServerChange = (serverId: number) => {
    setSelectedServer(serverId);
  };

  const handleSeasonChange = (season: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("s", season);
    newParams.set("e", "1"); // Reset to episode 1 when changing season
    setSearchParams(newParams);
  };

  const handleEpisodeChange = (episode: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("e", String(episode));
    setSearchParams(newParams);
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

  const isLoading = isLoadingSeries || isLoadingSeason;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full aspect-video rounded-lg mb-6" />
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!series || !tmdbId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-6">The series you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </Layout>
    );
  }

  const posterUrl = getTMDBImageUrl(series.poster_path, "w300");
  const year = series.first_air_date?.split("-")[0] || "";
  const episodes = seasonData?.episodes || [];
  const currentEpisodeData = episodes.find(ep => ep.episode_number === currentEpisode);
  
  // Filter out Season 0 (Specials)
  const seasons = series.seasons?.filter(s => s.season_number > 0) || [];

  // Generate iframe URL
  const currentServer = SERVERS.find((s) => s.id === selectedServer) || SERVERS[0];
  const iframeSrc = currentServer.embed(tmdbId, currentSeason, currentEpisode);


  // SEO - noindex for player pages
  const seoTitle = `Nonton ${series.name} S${currentSeason}E${currentEpisode} - Film Dong`;
  const videoSchema = generateVideoSchema({
    name: `${series.name} Season ${currentSeason} Episode ${currentEpisode}`,
    description: currentEpisodeData?.overview || series.overview,
    thumbnailUrl: getTMDBImageUrl(currentEpisodeData?.still_path || series.backdrop_path, "original"),
    duration: currentEpisodeData?.runtime,
    embedUrl: iframeSrc,
  });
  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={currentEpisodeData?.overview || series.overview}
        canonical={`/watch/${slug}`}
        noindex={true}
        schema={videoSchema}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: "Beranda", href: "/" },
            { label: "TV Series", href: "/tvseries" },
            { label: series.name, href: `/tvseries/${slug}` },
            { label: `S${currentSeason} E${currentEpisode}` },
          ]} 
          className="mb-6"
        />

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="font-display text-2xl md:text-3xl">{series.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Season {currentSeason}</Badge>
              <Badge variant="secondary">Episode {currentEpisode}</Badge>
              {year && <Badge variant="outline">{year}</Badge>}
              {series.vote_average > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500">⭐ {series.vote_average.toFixed(1)}</Badge>
              )}
            </div>
          </div>
          
          {/* Season Selector */}
          <Select value={String(currentSeason)} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={String(season.season_number)}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              title={`${series.name} S${currentSeason}E${currentEpisode}`}
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

        {/* Episode List */}
        <div className="bg-card rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            Episodes - Season {currentSeason}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {episodes.map((episode) => (
              <Button
                key={episode.id}
                variant={currentEpisode === episode.episode_number ? "default" : "secondary"}
                size="sm"
                onClick={() => handleEpisodeChange(episode.episode_number)}
                className={currentEpisode === episode.episode_number ? "bg-primary text-primary-foreground" : ""}
              >
                EP {episode.episode_number}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Episode Info */}
        {currentEpisodeData && (
          <div className="bg-card rounded-lg p-4 mb-6">
            <div className="flex gap-4">
              {currentEpisodeData.still_path && (
                <img
                  src={getTMDBImageUrl(currentEpisodeData.still_path, "w300")}
                  alt={currentEpisodeData.name}
                  className="w-40 aspect-video object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div>
                <h4 className="font-semibold mb-1">
                  E{currentEpisodeData.episode_number}: {currentEpisodeData.name}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {currentEpisodeData.overview || "No description available."}
                </p>
                {currentEpisodeData.runtime && (
                  <Badge variant="outline" className="mt-2">
                    {currentEpisodeData.runtime} min
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

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

        {/* Series Info Card */}
        <div className="mt-8 flex flex-col md:flex-row gap-6 bg-card rounded-lg p-6">
          <img
            src={posterUrl}
            alt={series.name}
            className="w-full md:w-40 aspect-[2/3] object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="flex-1">
            <h2 className="font-display text-xl mb-2">{series.name}</h2>
            <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
              {series.overview}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {series.genres?.map((genre) => (
                <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
              ))}
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link to={`/tvseries/${slug}`}>
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

export default WatchPage;
