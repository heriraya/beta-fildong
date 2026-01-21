import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { YTSMovie, getTMDBImageUrl, TMDBMovie, getGenreNames } from "@/lib/external-api";

interface MovieCardProps {
  movie: YTSMovie | TMDBMovie;
  type?: "yts" | "tmdb";
}

export function MovieCard({ movie, type = "yts" }: MovieCardProps) {
  const isYTS = type === "yts" || "slug" in movie;
  
  let imageUrl: string;
  let title: string;
  let year: string;
  let rating: number;
  let genres: string[];
  let slug: string;

  if (isYTS && "slug" in movie) {
    const ytsMovie = movie as YTSMovie;
    imageUrl = ytsMovie.medium_cover_image || ytsMovie.large_cover_image || "/placeholder.svg";
    title = ytsMovie.title;
    year = String(ytsMovie.year);
    rating = ytsMovie.rating;
    genres = ytsMovie.genres || [];
    slug = ytsMovie.slug;
  } else {
    const tmdbMovie = movie as TMDBMovie;
    // Use w342 for cards (smaller & faster loading than w500)
    imageUrl = getTMDBImageUrl(tmdbMovie.poster_path, "w342");
    title = tmdbMovie.title;
    year = tmdbMovie.release_date?.split("-")[0] || "";
    rating = tmdbMovie.vote_average;
    genres = getGenreNames(tmdbMovie.genre_ids || []);
    slug = `${tmdbMovie.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }

  return (
    <Link to={`/movie/${slug}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card card-hover">
        {/* Image */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Year Badge */}
        {year && (
          <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-xs">
            {year}
          </Badge>
        )}

        {/* Genre Badge */}
        {genres.length > 0 && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-secondary/80 backdrop-blur-sm text-xs">
            {genres[0]}
          </Badge>
        )}

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
            <span>{rating?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
