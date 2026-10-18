import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import movieApi from '../api/movieApi';
import theatreApi from '../api/theatreApi';
import { useCity } from '../context/CityContext';
import MovieHero from '../components/movie/MovieHero';
import MovieCard from '../components/movie/MovieCard';
import { MovieGridSkeleton, HeroSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import {
  FiFilm,
  FiMapPin,
  FiArrowRight,
  FiTv,
  FiAward,
  FiShield,
  FiZap,
  FiStar,
} from 'react-icons/fi';

export const Home = () => {
  const { currentCity, openCityModal } = useCity();

  const [recentMovies, setRecentMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recentRes, allRes, theatreRes] = await Promise.allSettled([
          movieApi.getRecent(0, 10),
          movieApi.getAll(0, 10),
          theatreApi.getByCity(currentCity, 0, 8),
        ]);

        const recents =
          recentRes.status === 'fulfilled'
            ? recentRes.value?.data?.content || []
            : [];
        const all =
          allRes.status === 'fulfilled'
            ? allRes.value?.data?.content || []
            : [];
        
        let localTheatres =
          theatreRes.status === 'fulfilled'
            ? theatreRes.value?.data?.content || []
            : [];

        // If no theatres in this specific city, load general theatres as fallback
        if (localTheatres.length === 0) {
          try {
            const generalTheatres = await theatreApi.getAll(0, 8);
            localTheatres = generalTheatres?.data?.content || [];
          } catch {
            // ignore
          }
        }

        setRecentMovies(recents);
        setAllMovies(all.length > 0 ? all : recents);
        setTheatres(localTheatres);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentCity]);

  // Featured movie for hero banner: pick first recent movie or top rated movie
  const featuredMovie = recentMovies[0] || allMovies[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        {loading ? (
          <HeroSkeleton />
        ) : featuredMovie ? (
          <MovieHero movie={featuredMovie} />
        ) : (
          <div className="w-full h-80 rounded-3xl glass-panel flex flex-col items-center justify-center p-8 text-center border border-white/10 my-6">
            <FiFilm className="text-5xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to NextMovie</h2>
            <p className="text-slate-400 text-sm max-w-md mb-4">
              Explore cinema schedules and book your favorite movies with instant live seat locking.
            </p>
            <Link
              to="/movies"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wider uppercase transition-all"
            >
              Browse All Movies
            </Link>
          </div>
        )}
      </section>

      {/* Location / Current City Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-5 rounded-2xl glass-panel-card border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-lg shrink-0">
              <FiMapPin />
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Booking Location</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>Cinemas in {currentCity}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={openCityModal}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
            >
              Change City
            </button>
            <Link
              to="/shows"
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all text-center"
            >
              Today's Shows
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Released Movies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Recently Released</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Fresh cinematic releases premiering on the silver screen this week.
            </p>
          </div>

          <Link
            to="/movies"
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors group"
          >
            <span>View All</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={5} />
        ) : recentMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {recentMovies.slice(0, 5).map((movie) => (
              <MovieCard key={movie.movieUuid} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiFilm}
            title="No Recent Movies Found"
            message="Check back soon for new blockbuster releases or browse all catalog movies."
            actionText="Explore Catalog"
            actionLink="/movies"
          />
        )}
      </section>

      {/* All Movies Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Top Blockbusters & Trending
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Critically acclaimed titles and crowd favorites.
            </p>
          </div>

          <Link
            to="/movies"
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors group"
          >
            <span>Explore Movies</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={5} />
        ) : allMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {allMovies.slice(0, 5).map((movie) => (
              <MovieCard key={movie.movieUuid} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiFilm}
            title="Movies Catalog is Empty"
            message="Movies can be seeded or imported from IMDb in the Admin Dashboard."
            actionText="Go to Movies"
            actionLink="/movies"
          />
        )}
      </section>

      {/* Active Theatres in Selected City */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Popular Cinemas in {currentCity}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top-rated multiplexes featuring IMAX, Dolby Atmos, and luxury seating.
            </p>
          </div>

          <Link
            to="/theatres"
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors group"
          >
            <span>All Cinemas</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {theatres.map((theatre) => (
            <div
              key={theatre.theatreUuid}
              className="p-5 rounded-2xl glass-panel-card border border-white/5 flex flex-col justify-between hover:border-red-500/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-sm">
                    <FiTv />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Open
                  </span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-1">
                  {theatre.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {theatre.address}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">{theatre.city}</span>
                <Link
                  to={`/shows?theatre=${theatre.theatreUuid}`}
                  className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <span>View Shows</span>
                  <FiArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>
          ))}
          {theatres.length === 0 && !loading && (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              No cinemas found in {currentCity}. Choose another city or explore all theatres.
            </div>
          )}
        </div>
      </section>

      {/* Next-Gen Cinema Experience Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 glass-panel border border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
              Why NextMovie
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              The Next Evolution of Movie Ticketing
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Enjoy cutting-edge theatre booking featuring zero wait time, real-time seat locking with database-level concurrency protection, transparent pricing, and instant mobile e-tickets.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FiZap className="text-amber-400 text-base" />
                <span>Instant Seat Lock</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FiShield className="text-emerald-400 text-base" />
                <span>Zero Double Booking</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <FiAward className="text-purple-400 text-base" />
                <span>IMAX & Atmos Quality</span>
              </div>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-red-600/10 via-amber-500/5 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
};

export default Home;
