import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tv, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { MovieCardSkeleton } from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getTMDBPopularTV,
  TMDBTVSeries,
  getTMDBImageUrl,
  getGenreNames 
} from "@/lib/external-api";

const TVSeriesListPage = () => {
  const [page, setPage] = useState(1);

  // Fetch two pages to get 24+ items
  const { data: page1Data, isLoading: isLoading1, error } = useQuery({
    queryKey: ["tmdb-popular-tv-list", page * 2 - 1],
    queryFn: () => getTMDBPopularTV(page * 2 - 1),
  });

  const { data: page2Data, isLoading: isLoading2 } = useQuery({
    queryKey: ["tmdb-popular-tv-list", page * 2],
    queryFn: () => getTMDBPopularTV(page * 2),
  });

  const isLoading = isLoading1 || isLoading2;
  const series = [...(page1Data?.series || []), ...(page2Data?.series || [])].slice(0, 24);
  const totalPages = Math.min(Math.ceil((page1Data?.totalPages || 1) / 2), 250);

  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "TV Series" }
  ];

  return (
    <Layout>
      <SEO
        title="Nonton TV Series Terbaru - Film Dong"
        description="Streaming TV Series populer dengan subtitle Indonesia. Koleksi serial TV Amerika, Korea, Jepang berkualitas HD gratis di Film Dong."
        canonical="/tvseries"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        <div className="flex items-center gap-3 mb-8">
          <Tv className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl">Nonton TV Series Terbaru</h1>
        </div>

        {error && (
          <div className="text-center py-10 text-muted-foreground">
            <p>Failed to load TV series. Please try again later.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {isLoading
            ? Array.from({ length: 24 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : series.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TVSeriesCard series={item} />
                </div>
              ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center px-4">
              Page {page} of {Math.min(totalPages, 500)}
            </div>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.min(totalPages, 500)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

function TVSeriesCard({ series }: { series: TMDBTVSeries }) {
  const imageUrl = getTMDBImageUrl(series.poster_path, "w300");
  const year = series.first_air_date?.split("-")[0] || "";
  const genres = getGenreNames(series.genre_ids || []);
  const slug = `${series.id}-${series.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Link to={`/tvseries/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        <img
          src={imageUrl}
          alt={series.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <svg className="w-4 h-4 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-xs line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {series.name}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
            <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
            <span>{series.vote_average?.toFixed(1) || "N/A"}</span>
            <span className="mx-1">•</span>
            <span>{year}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TVSeriesListPage;
