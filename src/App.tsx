import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MovieDetail from "./pages/MovieDetail";
import PlayPage from "./pages/PlayPage";
import MoviesListPage from "./pages/MoviesListPage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import SearchPage from "./pages/SearchPage";
import YearPage from "./pages/YearPage";
import PersonPage from "./pages/PersonPage";
import CountryPage from "./pages/CountryPage";
import TVSeriesDetail from "./pages/TVSeriesDetail";
import TVSeriesListPage from "./pages/TVSeriesListPage";
import WatchPage from "./pages/WatchPage";
import DramaChinaPage from "./pages/DramaChinaPage";
import PutarPage from "./pages/PutarPage";
import DramaTagPage from "./pages/DramaTagPage";
import HistoryPage from "./pages/HistoryPage";
import DMCAPage from "./pages/DMCAPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      gcTime: 1000 * 60 * 10, // 10 menit
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/movies" element={<MoviesListPage />} />
          <Route path="/movie/:slug" element={<MovieDetail />} />
          <Route path="/play/:slug" element={<PlayPage />} />
          <Route path="/tvseries" element={<TVSeriesListPage />} />
          <Route path="/tvseries/:slug" element={<TVSeriesDetail />} />
          <Route path="/watch/:slug" element={<WatchPage />} />
          <Route path="/dramabox" element={<DramaChinaPage />} />
          <Route path="/dramabox/tag/:tag" element={<DramaTagPage />} />
          <Route path="/putar/:slug" element={<PutarPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/year/:year" element={<YearPage />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/country/:code" element={<CountryPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
