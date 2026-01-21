import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star, Flame, Clock, Sparkles, Search, Shuffle, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getDramaboxTrending,
  getDramaboxLatest,
  getDramaboxForYou,
  getDramaboxRandom,
  searchDramabox,
  DramaChinaItem,
} from "@/lib/dramabox-api";

const DramaChinaPage = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    trending: 1,
    latest: 1,
    foryou: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<DramaChinaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Trending with pagination
  const { data: trendingData, isLoading: isLoadingTrending } = useQuery({
    queryKey: ["dramabox-trending", currentPage.trending],
    queryFn: () => getDramaboxTrending(currentPage.trending),
  });

  // Latest with pagination
  const { data: latestData, isLoading: isLoadingLatest } = useQuery({
    queryKey: ["dramabox-latest", currentPage.latest],
    queryFn: () => getDramaboxLatest(currentPage.latest),
  });

  // For You with pagination
  const { data: forYouData, isLoading: isLoadingForYou } = useQuery({
    queryKey: ["dramabox-foryou", currentPage.foryou],
    queryFn: () => getDramaboxForYou(currentPage.foryou),
  });

  // Random (no pagination)
  const { data: randomData, isLoading: isLoadingRandom, refetch: refetchRandom } = useQuery({
    queryKey: ["dramabox-random"],
    queryFn: getDramaboxRandom,
  });

  // AJAX Search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchInput.length >= 2) {
      setIsSearching(true);
      setShowSearchDropdown(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchDramabox(searchInput);
          setSearchResults(results.slice(0, 10));
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchInput]);

  const handlePageChange = (tab: string, delta: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [tab]: Math.max(1, (prev[tab] || 1) + delta)
    }));
  };

  const handleSelectDrama = (drama: DramaChinaItem) => {
    const slug = `${drama.bookId}-${drama.bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    navigate(`/putar/${slug}`);
    clearSearch();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const getCoverImage = (drama: DramaChinaItem) => {
    const d = drama as any;
    return (
      d.coverWap ||
      d.bookCover ||
      d.cover ||
      d.coverImage ||
      d.poster ||
      d.image ||
      d.img ||
      d.chapterImg ||
      "/placeholder.svg"
    );
  };

  return (
    <Layout>
      <SEO
        title="Dramabox - Nonton Drama China Terbaru - Film Dong"
        description="Koleksi lengkap drama China dengan subtitle Indonesia. Streaming gratis drama Korea, China, dan Thailand di Film Dong."
        canonical="/dramabox"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl mb-2">Dramabox</h1>
          <p className="text-muted-foreground">
            Koleksi lengkap drama dengan subtitle Indonesia
          </p>
        </div>

        {/* Blur Backdrop when search is active */}
        {showSearchDropdown && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={clearSearch}
          />
        )}

        {/* Search Input - Wide like movie search */}
        <div className="relative mb-8 max-w-3xl mx-auto z-50">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Cari drama..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => searchInput.length >= 2 && setShowSearchDropdown(true)}
              className="w-full h-14 pl-12 pr-12 text-lg bg-card border-primary/30 focus:border-primary rounded-xl"
            />
            {isSearching ? (
              <Loader2 className="absolute right-14 w-5 h-5 animate-spin text-muted-foreground" />
            ) : null}
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (searchResults.length > 0 || (searchInput.length >= 2 && !isSearching)) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto z-50 shadow-lg">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map((drama) => (
                    <button
                      key={drama.bookId}
                      onClick={() => handleSelectDrama(drama)}
                      className="w-full flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                    >
                      {/* Poster */}
                      <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={getCoverImage(drama)}
                          alt={drama.bookName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/placeholder.svg") {
                              target.src = "/placeholder.svg";
                            }
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {drama.bookName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {drama.chapterCount > 0 && (
                            <span>{drama.chapterCount} Episode</span>
                          )}
                          {drama.rankVo && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                              {drama.rankVo.hotCode}
                            </span>
                          )}
                        </div>
                        {(drama as any).description && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {(drama as any).description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchInput.length >= 2 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Tidak ada drama ditemukan untuk "{searchInput}"</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Hint */}
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Ketik minimal 2 karakter untuk mencari
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flame className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="latest" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Terbaru
            </TabsTrigger>
            <TabsTrigger value="foryou" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Untuk Anda
            </TabsTrigger>
            <TabsTrigger value="random" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shuffle className="w-4 h-4 mr-2" />
              Random
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <DramaGrid dramas={trendingData || []} isLoading={isLoadingTrending} />
          </TabsContent>

          <TabsContent value="latest">
            <DramaGrid dramas={latestData || []} isLoading={isLoadingLatest} />
          </TabsContent>

          <TabsContent value="foryou">
            <DramaGrid dramas={forYouData || []} isLoading={isLoadingForYou} />
            <Pagination 
              page={currentPage.foryou} 
              onPrev={() => handlePageChange("foryou", -1)}
              onNext={() => handlePageChange("foryou", 1)}
              hasData={(forYouData?.length || 0) > 0}
            />
          </TabsContent>

          <TabsContent value="random">
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchRandom()}
                disabled={isLoadingRandom}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Acak Lagi
              </Button>
            </div>
            <DramaGrid dramas={randomData || []} isLoading={isLoadingRandom} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

function Pagination({ 
  page, 
  onPrev, 
  onNext, 
  hasData 
}: { 
  page: number; 
  onPrev: () => void; 
  onNext: () => void;
  hasData: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onPrev}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Sebelumnya
      </Button>
      <span className="text-sm text-muted-foreground">
        Halaman {page}
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onNext}
        disabled={!hasData}
      >
        Selanjutnya
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

function DramaGrid({ dramas, isLoading }: { dramas: DramaChinaItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!dramas.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Tidak ada drama yang tersedia.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {dramas.map((drama, index) => (
        <div
          key={drama.bookId}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <DramaCard drama={drama} />
        </div>
      ))}
    </div>
  );
}

function DramaCard({ drama }: { drama: DramaChinaItem }) {
  const slug = `${drama.bookId}-${drama.bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  
  // Get cover image with multiple fallbacks
  const getCoverImage = () => {
    const d = drama as any;
    return (
      d.coverWap ||
      d.bookCover ||
      d.cover ||
      d.coverImage ||
      d.poster ||
      d.image ||
      d.img ||
      d.chapterImg ||
      "/placeholder.svg"
    );
  };

  return (
    <Link to={`/putar/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={getCoverImage()}
          alt={drama.bookName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/placeholder.svg") {
              target.src = "/placeholder.svg";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {drama.bookName}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
            {drama.chapterCount > 0 && (
              <>
                <span>{drama.chapterCount} Eps</span>
                <span className="mx-1">•</span>
              </>
            )}
            {drama.rankVo && (
              <>
                <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
                <span>{drama.rankVo.hotCode}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default DramaChinaPage;
