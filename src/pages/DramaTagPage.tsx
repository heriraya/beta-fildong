import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Tag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { getDramaboxByTag, DramaChinaItem } from "@/lib/dramabox-api";
import { useEffect } from "react";

const DramaTagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag || "");

  const { data: dramas, isLoading } = useQuery({
    queryKey: ["dramabox-tag", decodedTag],
    queryFn: () => getDramaboxByTag(decodedTag),
    enabled: !!decodedTag,
  });

  // Update document title
  useEffect(() => {
    if (decodedTag) {
      document.title = `Tag: ${decodedTag} - Dramabox`;
    }
    return () => {
      document.title = "Movie Streaming";
    };
  }, [decodedTag]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="pl-0 mb-4">
            <Link to="/dramabox">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dramabox
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl">{decodedTag}</h1>
              <p className="text-muted-foreground">
                Koleksi drama dengan tag "{decodedTag}"
              </p>
            </div>
          </div>
        </div>

        {/* Drama Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : !dramas?.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Tidak ada drama dengan tag ini.</p>
            <Button asChild className="mt-4">
              <Link to="/dramabox">Jelajahi Dramabox</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
        )}
      </div>
    </Layout>
  );
};

function DramaCard({ drama }: { drama: DramaChinaItem }) {
  const slug = `${drama.bookId}-${drama.bookName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Link to={`/putar/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={drama.coverWap}
          alt={drama.bookName}
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
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-xs">
          {drama.chapterCount} Eps
        </Badge>

        {drama.tags?.[0] && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-sm text-xs">
            {drama.tags[0]}
          </Badge>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {drama.bookName}
          </h3>
          {drama.rankVo && (
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              <span>{drama.rankVo.hotCode}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default DramaTagPage;
