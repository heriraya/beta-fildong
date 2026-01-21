import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Info, SkipForward, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO, generateVideoSchema } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getDramaboxDetail,
  getDramaboxEpisodes,
  getDramaboxRelated,
  getVideoUrl,
  DramaChinaItem,
} from "@/lib/dramabox-api";
import { addToWatchHistory } from "@/lib/watch-history";
import { cn } from "@/lib/utils";
import { RelatedDramabox } from "@/components/RelatedContent";
import { ShareUnlock } from "@/components/ShareUnlock";
import { PreRollAd } from "@/components/PreRollAd";

const EPISODES_PER_PAGE = 30;

const PutarPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookId = slug?.split("-")[0] || "";
  
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [adCompleted, setAdCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const currentEpisode = parseInt(searchParams.get("ep") || "0", 10);

  // Fetch drama detail
  const { data: drama, isLoading: isLoadingDrama, error: dramaError } = useQuery({
    queryKey: ["dramabox-detail", bookId],
    queryFn: () => getDramaboxDetail(bookId),
    enabled: !!bookId,
    retry: 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch episodes with CDN info
  const { data: episodes, isLoading: isLoadingEpisodes, error: episodesError } = useQuery({
    queryKey: ["dramabox-episodes", bookId],
    queryFn: () => getDramaboxEpisodes(bookId),
    enabled: !!bookId,
    retry: 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch related dramas
  const { data: relatedDramas, isLoading: isLoadingRelated } = useQuery({
    queryKey: ["dramabox-related", bookId, drama?.tags],
    queryFn: () => getDramaboxRelated(drama as DramaChinaItem),
    enabled: !!drama,
    staleTime: 1000 * 60 * 10,
  });

  const totalEpisodes = episodes?.length || drama?.chapterCount || 0;

  // Current episode data
  const currentEpisodeData = useMemo(() => {
    if (!episodes) return null;
    return episodes[currentEpisode] || null;
  }, [episodes, currentEpisode]);

  // Video URL - langsung pakai default tanpa pilih kualitas
  const videoUrl = useMemo(() => {
    if (!currentEpisodeData) return "";
    return getVideoUrl(currentEpisodeData);
  }, [currentEpisodeData]);

  // Reset error ketika episode berubah
  useEffect(() => {
    setVideoError(null);
  }, [bookId, currentEpisode]);

  // Update page when episode changes
  useEffect(() => {
    setCurrentPage(Math.floor(currentEpisode / EPISODES_PER_PAGE));
  }, [currentEpisode]);

  // Update URL when episode changes
  const handleEpisodeChange = useCallback((episode: number) => {
    setSearchParams({ ep: episode.toString() });
  }, [setSearchParams]);

  // Handle video ended for autoplay
  const handleVideoEnded = useCallback(() => {
    if (autoplayEnabled && currentEpisode < totalEpisodes - 1) {
      handleEpisodeChange(currentEpisode + 1);
    }
  }, [autoplayEnabled, currentEpisode, totalEpisodes, handleEpisodeChange]);

  // Handle next episode
  const handleNextEpisode = useCallback(() => {
    if (currentEpisode < totalEpisodes - 1) {
      handleEpisodeChange(currentEpisode + 1);
    }
  }, [currentEpisode, totalEpisodes, handleEpisodeChange]);

  // Handle previous episode
  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 0) {
      handleEpisodeChange(currentEpisode - 1);
    }
  }, [currentEpisode, handleEpisodeChange]);

  // Document title is now handled by SEO component

  // Save to watch history
  useEffect(() => {
    if (drama && bookId && slug) {
      addToWatchHistory({
        id: bookId,
        type: "dramabox",
        title: drama.bookName,
        poster: drama.coverWap || "/placeholder.svg",
        slug: slug,
        episodeNumber: currentEpisode,
        totalEpisodes: totalEpisodes,
      });
    }
  }, [drama, bookId, slug, currentEpisode, totalEpisodes]);

  // Pagination
  const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
  const startIndex = currentPage * EPISODES_PER_PAGE;
  const endIndex = Math.min(startIndex + EPISODES_PER_PAGE, totalEpisodes);
  
  const currentPageEpisodes = useMemo(() => {
    if (!episodes) {
      // Fallback to simple episode list if no CDN data
      return Array.from({ length: endIndex - startIndex }, (_, i) => ({
        index: startIndex + i,
        hasData: false,
      }));
    }
    return episodes.slice(startIndex, endIndex).map((ep, i) => ({
      ...ep,
      index: startIndex + i,
      hasData: true,
    }));
  }, [episodes, startIndex, endIndex]);

  const isLoading = isLoadingDrama || isLoadingEpisodes;
  const hasError = dramaError || episodesError;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
                {/* ShareUnlock timer starts immediately even during loading */}
                <ShareUnlock delaySeconds={120} />
              </div>
              <p className="text-center text-muted-foreground mt-4 text-sm">
                Memuat data drama...
              </p>
            </div>
            <div>
              <Skeleton className="h-10 w-full mb-4" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
            <Info className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="font-display text-3xl mb-4">Gagal Memuat Konten</h1>
          <p className="text-muted-foreground mb-6">
            Terjadi kesalahan saat memuat data. Silakan coba lagi.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()}>
              Muat Ulang
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dramabox">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dramabox
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!drama || !bookId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-3xl mb-4">Konten Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-6">
            Drama yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Button asChild>
            <Link to="/dramabox">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dramabox
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // SEO Data
  const seoTitle = `${drama.bookName} Episode ${currentEpisode + 1} - Film Dong`;
  const seoDescription = drama.introduction || `Nonton ${drama.bookName} streaming di Film Dong.`;
  const videoSchema = generateVideoSchema({
    name: `${drama.bookName} Episode ${currentEpisode + 1}`,
    description: drama.introduction,
    thumbnailUrl: drama.coverWap,
  });

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/putar/${slug}`}
        noindex={true}
        schema={videoSchema}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: "Beranda", href: "/" },
            { label: "Dramabox", href: "/dramabox" },
            { label: drama.bookName },
            { label: `Episode ${currentEpisode + 1}` },
          ]} 
          className="mb-6"
        />

        {/* Episode Badge */}
        <div className="flex items-center justify-end mb-4">
          <Badge variant="outline">Episode {currentEpisode + 1}/{totalEpisodes}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {/* Pre-Roll Ad */}
              {!adCompleted && (
                <PreRollAd onComplete={() => setAdCompleted(true)} />
              )}

              {adCompleted && videoUrl ? (
                <video
                  ref={videoRef}
                  key={`${bookId}-${currentEpisode}`}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  onEnded={handleVideoEnded}
                  onError={(e) => {
                    const videoElement = e.currentTarget;
                    const errorCode = videoElement.error?.code;
                    const errorMessage = videoElement.error?.message || "Unknown error";
                    
                    console.error("[DramaBox] Video playback error:", {
                      bookId,
                      episode: currentEpisode + 1,
                      videoUrl,
                      errorCode,
                      errorMessage,
                      networkState: videoElement.networkState,
                      readyState: videoElement.readyState,
                    });
                    
                    setVideoError(
                      "Video gagal dimuat dari server. Silakan coba lagi beberapa saat."
                    );
                  }}
                  onLoadStart={() => {
                    console.log("[DramaBox] Video loading started:", videoUrl);
                  }}
                  onCanPlay={() => {
                    console.log("[DramaBox] Video can play:", videoUrl);
                    setVideoError(null);
                  }}
                  poster={currentEpisodeData?.chapterImg}
                  className="w-full h-full"
                />
              ) : adCompleted ? (
                <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat video...</p>
                </div>
              ) : null}

              {adCompleted && videoError && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
                  <div className="text-center p-6 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                      <Info className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="text-white mb-4">{videoError}</p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setVideoError(null);
                          if (videoRef.current) {
                            videoRef.current.load();
                            videoRef.current.play().catch(() => undefined);
                          }
                        }}
                      >
                        Coba Lagi
                      </Button>
                      {currentEpisode < totalEpisodes - 1 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setVideoError(null);
                            handleNextEpisode();
                          }}
                        >
                          Episode Berikutnya
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ShareUnlock overlay - harus di paling akhir agar tampil di atas semua element */}
              {adCompleted && <ShareUnlock delaySeconds={120} />}
            </div>

            {/* Episode Navigation */}
            <div className="flex items-center justify-between bg-card rounded-lg p-4">
              <Button
                variant="outline"
                onClick={handlePrevEpisode}
                disabled={currentEpisode <= 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  variant={autoplayEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Autoplay {autoplayEnabled ? "ON" : "OFF"}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleNextEpisode}
                disabled={currentEpisode >= totalEpisodes - 1}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Drama Info */}
            <div className="bg-card rounded-lg p-6">
              <h1 className="font-display text-2xl mb-2">{drama.bookName}</h1>
              <p className="text-muted-foreground mb-2">Episode {currentEpisode + 1}</p>
              
              {drama.tags && drama.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {drama.tags.map((tag) => (
                    <Link key={tag} to={`/dramabox/tag/${encodeURIComponent(tag)}`}>
                      <Badge 
                        variant="secondary" 
                        className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground text-sm leading-relaxed">
                {drama.introduction}
              </p>

              {drama.protagonist && (
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Pemeran:</strong> {drama.protagonist}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  Jika video tidak dapat diputar, coba refresh halaman atau gunakan browser lain.
                  Autoplay akan otomatis memutar episode berikutnya saat video selesai.
                </p>
              </div>
            </div>
          </div>

          {/* Episode List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-4">
                Daftar Episode ({totalEpisodes} Episode)
              </h3>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {startIndex + 1}-{endIndex} / {totalEpisodes}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-5 gap-2">
                  {currentPageEpisodes.map((ep) => (
                    <Button
                      key={ep.index}
                      variant={ep.index === currentEpisode ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "aspect-square p-0",
                        ep.index === currentEpisode && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleEpisodeChange(ep.index)}
                    >
                      {ep.index + 1}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Drama Poster Card */}
            <div className="mt-6 bg-card rounded-lg overflow-hidden">
              <img
                src={drama.coverWap}
                alt={drama.bookName}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
        </div>

        {/* Related Dramas */}
        <RelatedDramabox dramas={relatedDramas || []} isLoading={isLoadingRelated} />
      </div>
    </Layout>
  );
};

export default PutarPage;