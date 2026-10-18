import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import movieApi from '../api/movieApi';
import showApi from '../api/showApi';
import { useCity } from '../context/CityContext';
import {
  formatDuration,
  formatDate,
  formatTime,
  toISODateString,
  formatDayName,
  formatShortDate,
} from '../utils/formatters';
import {
  FiStar,
  FiClock,
  FiCalendar,
  FiAward,
  FiFilm,
  FiTv,
  FiChevronRight,
  FiMapPin,
  FiInfo,
} from 'react-icons/fi';
import EmptyState from '../components/common/EmptyState';

export const MovieDetails = () => {
  const { movieUuid } = useParams();

  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);

  // Date selection for shows (default today)
  const [selectedDate, setSelectedDate] = useState(() => toISODateString(new Date()));
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(false);

  // Generate next 7 days dates array
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: toISODateString(d),
      dayName: formatDayName(d),
      shortDate: formatShortDate(d),
    };
  });

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setLoadingMovie(true);
      try {
        const res = await movieApi.getByUuid(movieUuid);
        setMovie(res?.data || null);
      } catch (err) {
        console.error('Failed to fetch movie details:', err);
      } finally {
        setLoadingMovie(false);
      }
    };
    fetchMovie();
  }, [movieUuid]);

  // Fetch shows for this movie on selectedDate
  useEffect(() => {
    const fetchShows = async () => {
      if (!movieUuid) return;
      setLoadingShows(true);
      try {
        const res = await showApi.getByMovie(movieUuid, selectedDate, 0, 50);
        setShows(res?.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch shows for movie:', err);
        setShows([]);
      } finally {
        setLoadingShows(false);
      }
    };
    fetchShows();
  }, [movieUuid, selectedDate]);

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const key = show.theatreName || 'Cinema Multiplex';
    if (!acc[key]) {
      acc[key] = {
        theatreName: show.theatreName,
        theatreUuid: show.theatreUuid,
        shows: [],
      };
    }
    acc[key].shows.push(show);
    return acc;
  }, {});

  if (loadingMovie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading cinematic experience...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={FiFilm}
          title="Movie Not Found"
          message="The requested movie details could not be found or have been removed."
          actionText="Browse All Movies"
          actionLink="/movies"
        />
      </div>
    );
  }

  const posterImg =
    movie.poster && movie.poster !== 'N/A'
      ? movie.poster
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';

  const genres = movie.genre ? movie.genre.split(',').map((g) => g.trim()) : [];

  return (
    <div className="space-y-12 pb-20">
      {/* Cinematic Hero Backdrop */}
      <div className="relative w-full overflow-hidden border-b border-white/10 bg-[#06080D]">
        {/* Blurred background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-110"
          style={{ backgroundImage: `url(${posterImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B11] via-[#080B11]/75 to-transparent" />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Poster Card */}
            <div className="w-48 sm:w-60 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden glass-panel-card border border-white/15 shadow-2xl shrink-0 mx-auto md:mx-0">
              <img
                src={posterImg}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';
                }}
              />
            </div>

            {/* Info Column */}
            <div className="flex-1 space-y-4">
              {/* Badges: Rated, Language, Year */}
              <div className="flex flex-wrap items-center gap-2">
                {movie.rated && movie.rated !== 'N/A' && (
                  <span className="px-2.5 py-0.5 rounded-md border border-white/20 bg-white/5 text-xs font-bold text-slate-200">
                    {movie.rated}
                  </span>
                )}
                {movie.language && (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                    {movie.language}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium">
                  {movie.year}
                </span>
                {movie.runtime && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <FiClock className="text-slate-500" /> {formatDuration(movie.runtime)}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 pt-1">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Ratings Grid (IMDb, Metascore, Rotten Tomatoes) */}
              <div className="flex flex-wrap items-center gap-4 py-2">
                {movie.imdbRating && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                    <FiStar className="text-amber-400 fill-amber-400 text-sm" />
                    <span className="font-bold text-amber-300 text-sm">
                      {movie.imdbRating}
                    </span>
                    <span className="text-[10px] text-slate-400">/ 10 IMDb</span>
                  </div>
                )}

                {movie.metascore && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <span className="font-bold text-emerald-400 text-sm">
                      {movie.metascore}
                    </span>
                    <span className="text-[10px] text-slate-400">Metascore</span>
                  </div>
                )}

                {movie.ratings?.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <span className="text-slate-400">{r.source}:</span>
                    <span className="font-bold text-white">{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Synopsis */}
              <div className="pt-2">
                <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1">
                  Synopsis
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                  {movie.plot && movie.plot !== 'N/A'
                    ? movie.plot
                    : 'A riveting cinematic experience premiering on premium widescreen formats.'}
                </p>
              </div>

              {/* Director & Cast */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 max-w-xl">
                {movie.director && movie.director !== 'N/A' && (
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                      Director
                    </span>
                    <span className="font-medium text-white">{movie.director}</span>
                  </div>
                )}
                {movie.actors && movie.actors !== 'N/A' && (
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px] block">
                      Starring
                    </span>
                    <span className="font-medium text-white">{movie.actors}</span>
                  </div>
                )}
              </div>

              {/* Awards / Box Office */}
              {(movie.awards || movie.boxOffice) && (
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400">
                  {movie.awards && movie.awards !== 'N/A' && (
                    <div className="flex items-center gap-1.5 text-amber-300/80">
                      <FiAward className="text-amber-400 shrink-0" />
                      <span>{movie.awards}</span>
                    </div>
                  )}
                  {movie.boxOffice && movie.boxOffice !== 'N/A' && (
                    <div>
                      <span>Box Office: </span>
                      <strong className="text-white">{movie.boxOffice}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shows / Ticket Booking Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Select Showtimes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick a date to browse available cinema halls and secure your preferred seats.
          </p>
        </div>

        {/* Date Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {dateOptions.map((opt) => {
            const isSelected = selectedDate === opt.iso;
            return (
              <button
                key={opt.iso}
                onClick={() => setSelectedDate(opt.iso)}
                className={`flex flex-col items-center py-2.5 px-4 rounded-2xl min-w-[76px] transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                    : 'bg-white/[0.04] text-slate-300 border-white/5 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {opt.dayName}
                </span>
                <span className="text-sm font-black mt-0.5">{opt.shortDate}</span>
              </button>
            );
          })}
        </div>

        {/* Shows grouped by theatre */}
        {loadingShows ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl glass-panel-card border border-white/5 animate-pulse h-32"
              />
            ))}
          </div>
        ) : Object.keys(showsByTheatre).length > 0 ? (
          <div className="space-y-4">
            {Object.values(showsByTheatre).map((theatreGroup) => (
              <div
                key={theatreGroup.theatreName}
                className="p-6 rounded-3xl glass-panel-card border border-white/10 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-sm">
                      <FiTv />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {theatreGroup.theatreName}
                      </h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <FiMapPin className="text-[10px]" /> Multiplex Hall
                      </span>
                    </div>
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {theatreGroup.shows.map((show) => (
                    <Link
                      key={show.showUuid}
                      to={`/book/${show.showUuid}`}
                      className="group flex flex-col p-3 rounded-xl bg-white/[0.04] hover:bg-gradient-to-tr hover:from-red-600 hover:to-rose-600 border border-white/10 hover:border-red-400 text-left transition-all duration-200 shadow-md hover:shadow-red-600/30 hover:scale-105"
                    >
                      <div className="text-sm font-black text-emerald-400 group-hover:text-white transition-colors">
                        {formatTime(show.startTime)}
                      </div>
                      <div className="text-[10px] text-slate-400 group-hover:text-white/80 transition-colors mt-0.5">
                        {show.screenName || 'Standard Screen'}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FiTv}
            title="No Shows Scheduled for this Date"
            message={`There are no scheduled screenings for ${formatDate(selectedDate)}. Please choose another date or view shows in other cities.`}
            actionText="Browse Today's Shows"
            onAction={() => setSelectedDate(toISODateString(new Date()))}
          />
        )}
      </section>
    </div>
  );
};

export default MovieDetails;
