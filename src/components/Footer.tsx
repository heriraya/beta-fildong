import { Link } from "react-router-dom";
import { Film } from "lucide-react";
import { Analytics } from "./Analytics";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      {/* Analytics Scripts */}
      <Analytics />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Film className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-wide">
              NONTON<span className="text-primary">FILM</span>
            </span>
          </Link>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6">
            Tempat terbaik untuk menonton film dan serial TV favorit Anda secara online. 
            Nikmati streaming berkualitas tinggi dengan koleksi terlengkap.
          </p>
          
          {/* Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link 
              to="/dmca" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              DMCA
            </Link>
            <span className="text-muted-foreground">-</span>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              KONTAK
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NontonFilm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
