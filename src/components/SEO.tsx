import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  type?: "website" | "video.movie" | "video.tv_show" | "article";
  image?: string;
  schema?: object;
}

const SITE_NAME = "Film Dong";
const SITE_TAGLINE = "Situs Nonton Film Series Drama";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export function SEO({
  title,
  description,
  canonical,
  noindex = false,
  type = "website",
  image,
  schema,
}: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper to set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper to set or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Set meta description
    if (description) {
      const truncatedDesc = description.length > 160 
        ? description.substring(0, 157) + "..." 
        : description;
      setMetaTag("description", truncatedDesc);
    }

    // Set canonical URL
    const canonicalUrl = canonical 
      ? `${BASE_URL}${canonical}`
      : `${BASE_URL}${window.location.pathname}`;
    setLinkTag("canonical", canonicalUrl);

    // Set robots meta
    const robotsContent = noindex ? "noindex, nofollow" : "index, follow";
    setMetaTag("robots", robotsContent);

    // Open Graph tags
    setMetaTag("og:title", title, true);
    if (description) {
      setMetaTag("og:description", description.substring(0, 160), true);
    }
    setMetaTag("og:type", type, true);
    setMetaTag("og:url", canonicalUrl, true);
    if (image) {
      setMetaTag("og:image", image, true);
    }
    setMetaTag("og:site_name", SITE_NAME, true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    if (description) {
      setMetaTag("twitter:description", description.substring(0, 160));
    }
    if (image) {
      setMetaTag("twitter:image", image);
    }

    // JSON-LD Schema
    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    }

    // Cleanup function
    return () => {
      // Reset to default title
      document.title = `${SITE_NAME} - ${SITE_TAGLINE}`;
      
      // Remove schema script if it exists
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }
    };
  }, [title, description, canonical, noindex, type, image, schema]);

  return null;
}

// Helper to generate Movie Schema with optional VideoObject for trailer
export function generateMovieSchema({
  name,
  description,
  datePublished,
  duration,
  image,
  director,
  actors,
  genre,
  rating,
  ratingCount,
  url,
  trailerUrl,
}: {
  name: string;
  description?: string;
  datePublished?: string;
  duration?: number;
  image?: string;
  director?: { name: string; url?: string };
  actors?: { name: string; url?: string }[];
  genre?: string[];
  rating?: number;
  ratingCount?: number;
  url?: string;
  trailerUrl?: string;
}) {
  const movieSchema: any = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name,
    url: url || (typeof window !== "undefined" ? window.location.href : ""),
  };

  if (description) movieSchema.description = description;
  if (datePublished) movieSchema.datePublished = datePublished;
  if (image) movieSchema.image = image;
  if (genre && genre.length > 0) movieSchema.genre = genre;

  if (duration) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    movieSchema.duration = `PT${hours}H${minutes}M`;
  }

  if (director) {
    movieSchema.director = {
      "@type": "Person",
      name: director.name,
      url: director.url,
    };
  }

  if (actors && actors.length > 0) {
    movieSchema.actor = actors.map((actor) => ({
      "@type": "Person",
      name: actor.name,
      url: actor.url,
    }));
  }

  if (rating && rating > 0) {
    movieSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: ratingCount?.toString() || "1",
    };
  }

  // Add trailer as VideoObject if available
  if (trailerUrl) {
    movieSchema.trailer = {
      "@type": "VideoObject",
      name: `${name} - Official Trailer`,
      description: description || `Watch the official trailer for ${name}`,
      thumbnailUrl: image,
      uploadDate: datePublished,
      embedUrl: trailerUrl,
    };
  }

  return movieSchema;
}

// Helper to generate TVSeries Schema with optional VideoObject for trailer
export function generateTVSeriesSchema({
  name,
  description,
  datePublished,
  numberOfSeasons,
  numberOfEpisodes,
  image,
  actors,
  genre,
  rating,
  ratingCount,
  url,
  trailerUrl,
}: {
  name: string;
  description?: string;
  datePublished?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  image?: string;
  actors?: { name: string; url?: string }[];
  genre?: string[];
  rating?: number;
  ratingCount?: number;
  url?: string;
  trailerUrl?: string;
}) {
  const tvSchema: any = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name,
    url: url || (typeof window !== "undefined" ? window.location.href : ""),
  };

  if (description) tvSchema.description = description;
  if (datePublished) tvSchema.datePublished = datePublished;
  if (image) tvSchema.image = image;
  if (genre && genre.length > 0) tvSchema.genre = genre;
  if (numberOfSeasons) tvSchema.numberOfSeasons = numberOfSeasons;
  if (numberOfEpisodes) tvSchema.numberOfEpisodes = numberOfEpisodes;

  if (actors && actors.length > 0) {
    tvSchema.actor = actors.map((actor) => ({
      "@type": "Person",
      name: actor.name,
      url: actor.url,
    }));
  }

  if (rating && rating > 0) {
    tvSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: ratingCount?.toString() || "1",
    };
  }

  // Add trailer as VideoObject if available
  if (trailerUrl) {
    tvSchema.trailer = {
      "@type": "VideoObject",
      name: `${name} - Official Trailer`,
      description: description || `Watch the official trailer for ${name}`,
      thumbnailUrl: image,
      uploadDate: datePublished,
      embedUrl: trailerUrl,
    };
  }

  return tvSchema;
}

// Helper to generate VideoObject Schema for playback pages
export function generateVideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  embedUrl,
}: {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: number;
  embedUrl?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
  };

  if (description) schema.description = description;
  if (thumbnailUrl) schema.thumbnailUrl = thumbnailUrl;
  if (uploadDate) schema.uploadDate = uploadDate;
  if (embedUrl) schema.embedUrl = embedUrl;

  if (duration) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    schema.duration = `PT${hours}H${minutes}M`;
  }

  return schema;
}

export default SEO;
