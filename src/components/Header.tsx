import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X, Film, Home, Clapperboard, Tv, PlayCircle, LayoutGrid, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "@/components/SearchModal";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-wide hidden sm:block">
              NONTON<span className="text-primary">FILM</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link to="/movies" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <Clapperboard className="w-4 h-4" />
              Movies
            </Link>
            <Link to="/tvseries" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <Tv className="w-4 h-4" />
              TV Series
            </Link>
            <Link to="/dramabox" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <PlayCircle className="w-4 h-4" />
              Dramabox
            </Link>
            <Link to="/categories" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <LayoutGrid className="w-4 h-4" />
              Categories
            </Link>
            <Link to="/history" className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary hover:bg-primary/10 rounded-full transition-all">
              <History className="w-4 h-4" />
              History
            </Link>
          </nav>

          {/* Search & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                to="/movies"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clapperboard className="w-5 h-5" />
                Movies
              </Link>
              <Link
                to="/tvseries"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Tv className="w-5 h-5" />
                TV Series
              </Link>
              <Link
                to="/dramabox"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlayCircle className="w-5 h-5" />
                Dramabox
              </Link>
              <Link
                to="/categories"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutGrid className="w-5 h-5" />
                Categories
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History className="w-5 h-5" />
                History
              </Link>
            </div>
          </nav>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
