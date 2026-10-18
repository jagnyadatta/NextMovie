import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import showApi from '../api/showApi';
import { useCity } from '../context/CityContext';
import {
  formatDate,
  formatTime,
  toISODateString,
  formatDayName,
  formatShortDate,
} from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import { FiCalendar, FiClock, FiTv, FiFilm, FiArrowRight, FiMapPin } from 'react-icons/fi';

export const Shows = () => {
  const [searchParams] = useSearchParams();
  const theatreUuidParam = searchParams.get('theatre') || '';
  const movieUuidParam = searchParams.get('movie') || '';

  const { currentCity } = useCity();

  const [selectedDate, setSelectedDate] = useState(() => toISODateString(new Date()));
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 7-day date chips
  const dateOptions = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: toISODateString(d),
      dayName: formatDayName(d),
      shortDate: formatShortDate(d),
    };
  });

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        let res;
        if (movieUuidParam) {
          res = await showApi.getByMovie(movieUuidParam, selectedDate, 0, 50);
        } else if (theatreUuidParam) {
          res = await showApi.getByTheatre(theatreUuidParam, selectedDate, 0, 50);
        } else if (currentCity) {
          res = await showApi.getByCity(currentCity, selectedDate, 0, 50);
        } else {
          res = await showApi.getShows(selectedDate, 0, 50);
        }

        let list = res?.data?.content || [];

        // If no shows found in current city, fallback to general shows
        if (list.length === 0 && !movieUuidParam && !theatreUuidParam) {
          const generalRes = await showApi.getShows(selectedDate, 0, 50);
          list = generalRes?.data?.content || [];
        }

        setShows(list);
      } catch (err) {
        console.error('Failed to fetch shows:', err);
        setShows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [selectedDate, theatreUuidParam, movieUuidParam, currentCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Today's Showtimes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse live cinema screenings in {currentCity} and reserve the best seats instantly.
          </p>
        </div>

        {(movieUuidParam || theatreUuidParam) && (
          <Link
            to="/shows"
            className="text-xs text-red-400 hover:text-red-300 font-semibold self-start"
          >
            ← View All Shows in {currentCity}
          </Link>
        )}
      </div>

      {/* Date Selector */}
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

      {/* Shows List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass-panel-card border border-white/5 animate-pulse h-28"
            />
          ))}
        </div>
      ) : shows.length > 0 ? (
        <div className="space-y-4">
          {shows.map((show) => (
            <div
              key={show.showUuid}
              className="p-5 sm:p-6 rounded-3xl glass-panel-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/30 transition-all shadow-xl"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    {show.status || 'UPCOMING'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <FiCalendar className="text-red-400" /> {show.showDate}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white">
                  {show.movieTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FiTv className="text-red-400" /> {show.theatreName}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{show.screenName}</span>
                </div>
              </div>

              {/* Show Timing & Action */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                <div className="text-left md:text-right">
                  <div className="text-xs uppercase text-slate-400 font-semibold">
                    Showtime
                  </div>
                  <div className="text-xl font-black text-emerald-400">
                    {formatTime(show.startTime)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Ends at {formatTime(show.endTime)}
                  </div>
                </div>

                <Link
                  to={`/book/${show.showUuid}`}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Select Seats</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiCalendar}
          title="No Shows Scheduled"
          message={`No active showtimes found for ${formatDate(selectedDate)} in ${currentCity}. Check another date or browse upcoming movies.`}
          actionText="Browse Movies"
          actionLink="/movies"
        />
      )}
    </div>
  );
};

export default Shows;
