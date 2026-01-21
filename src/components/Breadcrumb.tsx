import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Generate JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href 
        ? `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`
        : undefined,
    })),
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/50" />
              )}
              
              {item.href && index < items.length - 1 ? (
                <Link
                  to={item.href}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                  itemProp="item"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={`${index === items.length - 1 ? "text-foreground font-medium" : ""} flex items-center gap-1`}
                  itemProp="name"
                >
                  {index === 0 && !item.href && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </span>
              )}
              
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Helper function to generate movie breadcrumb items
export function generateMovieBreadcrumbs(
  movieTitle: string,
  genre?: { name: string; slug: string }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Beranda", href: "/" },
    { label: "Movies", href: "/movies" },
  ];

  if (genre) {
    items.push({ label: genre.name, href: `/category/${genre.slug}` });
  }

  items.push({ label: movieTitle });

  return items;
}

// Helper function to generate TV series breadcrumb items
export function generateTVSeriesBreadcrumbs(
  seriesTitle: string,
  genre?: { name: string; slug: string }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Beranda", href: "/" },
    { label: "TV Series", href: "/tvseries" },
  ];

  if (genre) {
    items.push({ label: genre.name, href: `/category/${genre.slug}` });
  }

  items.push({ label: seriesTitle });

  return items;
}

// Helper function to generate category breadcrumb items
export function generateCategoryBreadcrumbs(categoryName: string): BreadcrumbItem[] {
  return [
    { label: "Beranda", href: "/" },
    { label: "Kategori", href: "/categories" },
    { label: categoryName },
  ];
}

// Helper function to generate year archive breadcrumb items
export function generateYearBreadcrumbs(year: string): BreadcrumbItem[] {
  return [
    { label: "Beranda", href: "/" },
    { label: "Arsip Tahun" },
    { label: year },
  ];
}

// Helper function to generate person breadcrumb items
export function generatePersonBreadcrumbs(personName: string): BreadcrumbItem[] {
  return [
    { label: "Beranda", href: "/" },
    { label: "Artis" },
    { label: personName },
  ];
}

// Helper function to generate country breadcrumb items
export function generateCountryBreadcrumbs(countryName: string): BreadcrumbItem[] {
  return [
    { label: "Beranda", href: "/" },
    { label: "Negara" },
    { label: countryName },
  ];
}

// Helper function to generate play/watch breadcrumb items
export function generatePlayBreadcrumbs(
  contentType: "movie" | "series" | "drama",
  contentTitle: string,
  contentSlug: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Beranda", href: "/" },
  ];

  if (contentType === "movie") {
    items.push({ label: "Movies", href: "/movies" });
    items.push({ label: contentTitle, href: `/movie/${contentSlug}` });
  } else if (contentType === "series") {
    items.push({ label: "TV Series", href: "/tvseries" });
    items.push({ label: contentTitle, href: `/tvseries/${contentSlug}` });
  } else {
    items.push({ label: "Dramabox", href: "/dramabox" });
    items.push({ label: contentTitle, href: `/putar/${contentSlug}` });
  }

  items.push({ label: "Tonton" });

  return items;
}

export default Breadcrumb;
