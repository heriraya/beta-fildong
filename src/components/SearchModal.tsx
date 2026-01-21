import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Star, Film, Tv } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchTMDBMulti, getTMDBImageUrl, TMDBMultiSearchResult } from "@/lib/external-api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMultiSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      setIsLoading(true);

      debounceRef.current = setTimeout(async () => {
        try {
          const data = await searchTMDBMulti(query);
          setResults(data.results.slice(0, 12));
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSelect = (item: TMDBMultiSearchResult) => {
    const title = item.media_type === "movie" ? item.title : item.name;
    const slug = `${item.id}-${(title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    
    if (item.media_type === "movie") {
      navigate(`/movie/${slug}`);
    } else {
      navigate(`/tvseries/${slug}`);
    }
    handleClose();
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-3xl mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search movies & TV series..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-12 text-lg bg-card border-primary/30 focus:border-primary rounded-xl"
            />
            {isLoading ? (
              <Loader2 className="absolute right-14 w-5 h-5 animate-spin text-muted-foreground" />
            ) : null}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </form>

        {/* Results */}
        {(results.length > 0 || (query.length >= 2 && !isLoading)) && (
          <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-border">
                {results.map((item) => {
                  const title = item.media_type === "movie" ? item.title : item.name;
                  const date = item.media_type === "movie" ? item.release_date : item.first_air_date;
                  const year = date?.split("-")[0];
                  
                  return (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                    >
                      {/* Poster */}
                      <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                        {item.poster_path ? (
                          <img
                            src={getTMDBImageUrl(item.poster_path, "w200")}
                            alt={title || ""}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.media_type === "movie" ? (
                              <Film className="w-6 h-6 text-muted-foreground" />
                            ) : (
                              <Tv className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex-shrink-0 ${
                              item.media_type === "movie" 
                                ? "border-primary/50 text-primary" 
                                : "border-blue-500/50 text-blue-500"
                            }`}
                          >
                            {item.media_type === "movie" ? (
                              <><Film className="w-3 h-3 mr-1" />Movie</>
                            ) : (
                              <><Tv className="w-3 h-3 mr-1" />TV</>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {year && <span>{year}</span>}
                          {item.vote_average > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                              {item.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {item.overview && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {item.overview}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query.length >= 2 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No results found for "{query}"</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Hint */}
        {query.length < 2 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search movies & TV series
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
