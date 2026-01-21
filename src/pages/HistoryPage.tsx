import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Trash2, 
  Film, 
  Tv, 
  PlayCircle, 
  Clock,
  X,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getWatchHistory,
  clearWatchHistory,
  removeFromWatchHistory,
  formatRelativeTime,
  getWatchUrl,
  type WatchHistoryItem,
  type ContentType,
} from "@/lib/watch-history";

const HistoryPage = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>(getWatchHistory());
  const [activeTab, setActiveTab] = useState<"all" | ContentType>("all");

  const filteredHistory = useMemo(() => {
    if (activeTab === "all") return history;
    return history.filter((item) => item.type === activeTab);
  }, [history, activeTab]);

  const handleRemove = (id: string, type: ContentType) => {
    removeFromWatchHistory(id, type);
    setHistory(getWatchHistory());
  };

  const handleClearAll = () => {
    clearWatchHistory();
    setHistory([]);
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4" />;
      case "tvseries":
        return <Tv className="w-4 h-4" />;
      case "dramabox":
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: ContentType) => {
    switch (type) {
      case "movie":
        return "Movie";
      case "tvseries":
        return "TV Series";
      case "dramabox":
        return "Dramabox";
    }
  };

  const getEpisodeInfo = (item: WatchHistoryItem) => {
    if (item.type === "tvseries" && item.season && item.episode) {
      return `S${item.season} E${item.episode}`;
    }
    if (item.type === "dramabox" && item.episodeNumber !== undefined) {
      return `Episode ${item.episodeNumber + 1}${item.totalEpisodes ? ` / ${item.totalEpisodes}` : ""}`;
    }
    return null;
  };

  const counts = useMemo(() => ({
    all: history.length,
    movie: history.filter(h => h.type === "movie").length,
    tvseries: history.filter(h => h.type === "tvseries").length,
    dramabox: history.filter(h => h.type === "dramabox").length,
  }), [history]);

  return (
    <Layout>
      <SEO
        title="Riwayat Tontonan - Film Dong"
        description="Lihat riwayat tontonan film, TV series, dan drama Anda di Film Dong."
        canonical="/history"
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl">Riwayat Tontonan</h1>
              <p className="text-muted-foreground">
                {history.length} item dalam riwayat
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Semua
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Hapus Semua Riwayat?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus seluruh riwayat tontonan Anda dan tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Hapus Semua
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              Semua
              <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="movie" className="gap-2">
              <Film className="w-4 h-4" />
              Movies
              <Badge variant="secondary" className="ml-1">{counts.movie}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tvseries" className="gap-2">
              <Tv className="w-4 h-4" />
              TV Series
              <Badge variant="secondary" className="ml-1">{counts.tvseries}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dramabox" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Dramabox
              <Badge variant="secondary" className="ml-1">{counts.dramabox}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <History className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Belum Ada Riwayat</h2>
                <p className="text-muted-foreground mb-6">
                  Riwayat tontonan Anda akan muncul di sini setelah menonton film, serial TV, atau drama.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <Link to="/movies">Jelajahi Movies</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/dramabox">Jelajahi Dramabox</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredHistory.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="group relative bg-card rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item.id, item.type);
                      }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    <Link to={getWatchUrl(item)} className="block">
                      {/* Poster */}
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-white gap-1">
                            {getTypeIcon(item.type)}
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                        {/* Episode Info Overlay */}
                        {getEpisodeInfo(item) && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                            <p className="text-white text-sm font-medium">
                              ▶ Lanjutkan: {getEpisodeInfo(item)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(item.watchedAt)}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HistoryPage;
