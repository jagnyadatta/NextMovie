import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiCalendar, FiPlay, FiInfo, FiAward } from 'react-icons/fi';
import { formatDuration } from '../../utils/formatters';

export const MovieHero = ({ movie }) => {
  if (!movie) return null;

  const backdrop =
    movie.poster && movie.poster !== 'N/A'
      ? movie.poster
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80';

  const genres = movie.genre ? movie.genre.split(',').map((g) => g.trim()) : ['Cinema'];

  return (
    <div className="relative w-full h-[500px] md:h-[620px] rounded-3xl overflow-hidden glass-panel border border-white/10 my-6 shadow-2xl">
      {/* Background Poster / Backdrop with blur and darken */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 filter blur-xs"
        style={{ backgroundImage: `url(${backdrop})` }}
      />

      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080B11] via-[#080B11]/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-black/60" />

      {/* Hero Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-end pb-12 md:pb-16 max-w-2xl">
        {/* Tagline / Featured Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/40 backdrop-blur-md">
            Featured Premiere
          </span>
          {movie.language && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-slate-300 bg-white/10 backdrop-blur-md">
              {movie.language}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4 drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Metadata badges: Rating, Year, Duration, Genre */}
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mb-4">
          {movie.imdbRating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              <FiStar className="fill-amber-400 text-amber-400" />
              <span>{movie.imdbRating} / 10 IMDb</span>
            </div>
          )}

          {movie.year && (
            <span className="flex items-center gap-1 font-medium">
              <FiCalendar /> {movie.year}
            </span>
          )}

          {movie.runtime && (
            <span className="flex items-center gap-1 font-medium">
              <FiClock /> {formatDuration(movie.runtime)}
            </span>
          )}

          {movie.rated && movie.rated !== 'N/A' && (
            <span className="px-2 py-0.5 rounded border border-white/20 text-xs font-semibold bg-black/40">
              {movie.rated}
            </span>
          )}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((g) => (
            <span
              key={g}
              className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Synopsis / Plot */}
        <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 max-w-xl drop-shadow">
          {movie.plot && movie.plot !== 'N/A'
            ? movie.plot
            : 'Experience this cinematic masterpiece exclusively on the big screen with Dolby Atmos and IMAX crystal projection.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/movies/${movie.movieUuid}`}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 transition-all flex items-center gap-2"
          >
            <FiPlay className="text-lg fill-white" />
            <span>Book Tickets</span>
          </Link>

          <Link
            to={`/movies/${movie.movieUuid}`}
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm sm:text-base backdrop-blur-md transition-all flex items-center gap-2"
          >
            <FiInfo className="text-lg" />
            <span>More Info</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
