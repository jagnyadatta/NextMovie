import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import movieApi from '../api/movieApi';
import MovieCard from '../components/movie/MovieCard';
import { MovieGridSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { LANGUAGES } from '../utils/constants';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiFilm } from 'react-icons/fi';

export const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('title,asc');
  const [currentPage, setCurrentPage] = useState(0);

  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query param changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchQuery(q);
    setCurrentPage(0);
  }, [searchParams]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery.trim()) {
          res = await movieApi.search(searchQuery.trim(), currentPage, 12);
        } else if (activeLanguage && activeLanguage !== 'All') {
          res = await movieApi.getByLanguage(activeLanguage, currentPage, 12);
        } else {
          res = await movieApi.getAll(currentPage, 12, sortBy);
        }

        const pageData = res?.data;
        setMovies(pageData?.content || []);
        setTotalPages(pageData?.totalPages || 0);
        setTotalElements(pageData?.totalElements || 0);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchQuery, activeLanguage, sortBy, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(0);
  };

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Movies in Cinema
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover {totalElements} movies currently screening across top theatres.
          </p>
        </div>

        {/* Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="title,asc">Title (A - Z)</option>
              <option value="title,desc">Title (Z - A)</option>
              <option value="released,desc">Recently Released</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
          <FiFilter className="text-xs" /> Language:
        </span>
        {LANGUAGES.map((lang) => {
          const isSelected = activeLanguage === lang;
          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-white/[0.04] text-slate-300 border-white/5 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {lang}
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <MovieGridSkeleton count={10} />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.movieUuid} movie={movie} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiFilm}
          title="No Movies Found"
          message={
            searchQuery
              ? `No movie matching "${searchQuery}" was found in our directory.`
              : `No movies found for language: ${activeLanguage}.`
          }
          actionText="Clear All Filters"
          onAction={() => {
            setSearchQuery('');
            setActiveLanguage('All');
            setSearchParams({});
            setCurrentPage(0);
          }}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-white/5">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed border border-white/5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <FiChevronLeft className="text-sm" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-slate-400 font-medium px-3">
            Page <strong className="text-white">{currentPage + 1}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed border border-white/5 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <span>Next</span>
            <FiChevronRight className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;
