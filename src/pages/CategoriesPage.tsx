import { Link } from "react-router-dom";
import { ArrowLeft, Folder, Film } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { GENRE_LIST } from "@/lib/external-api";

const CategoriesPage = () => {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Kategori" }
  ];
  return (
    <Layout>
      <SEO
        title="Kategori Film - Film Dong"
        description="Jelajahi film berdasarkan genre. Temukan film Action, Comedy, Drama, Horror, Romance, dan lainnya di Film Dong."
        canonical="/categories"
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl">Semua Genre Film</h1>
              <p className="text-sm text-muted-foreground">
                Jelajahi film berdasarkan genre favorit Anda
              </p>
            </div>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {GENRE_LIST.map((genre, index) => (
            <Link
              key={genre.id}
              to={`/category/${genre.slug}`}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary to-muted card-hover">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)),transparent_70%)]" />
                </div>

                {/* Icon */}
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                  <Film className="w-5 h-5 text-primary" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {genre.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
