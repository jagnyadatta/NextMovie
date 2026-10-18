import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiCalendar } from 'react-icons/fi';
import { formatDuration } from '../../utils/formatters';

const DEFAULT_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80',
];

export const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(
    movie?.poster && movie.poster !== 'N/A'
      ? movie.poster
      : DEFAULT_POSTERS[0]
  );

  const fallbackPoster = () => {
    setImgSrc(DEFAULT_POSTERS[1]);
  };

  const primaryGenre = movie?.genre ? movie.genre.split(',')[0].trim() : 'Action';

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden glass-panel-card hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-red-950/30">
      {/* Poster Container */}
      <Link
        to={`/movies/${movie.movieUuid}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900"
      >
        <img
          src={imgSrc}
          alt={movie.title}
          onError={fallbackPoster}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {movie.imdbRating ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold shadow-md">
              <FiStar className="text-amber-400 fill-amber-400 text-xs" />
              <span>{movie.imdbRating}</span>
            </div>
          ) : (
            <span />
          )}

          {primaryGenre && (
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-200 text-[11px] font-medium uppercase tracking-wider">
              {primaryGenre}
            </span>
          )}
        </div>

        {/* Bottom Format / Rated Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">
            {movie.language || 'English'}
          </span>
          {movie.rated && movie.rated !== 'N/A' && (
            <span className="font-medium text-slate-300 border border-white/20 px-1.5 py-0.5 rounded bg-black/40">
              {movie.rated}
            </span>
          )}
        </div>
      </Link>

      {/* Movie Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link
            to={`/movies/${movie.movieUuid}`}
            className="block text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            {movie.year && (
              <span className="flex items-center gap-1">
                <FiCalendar className="text-[11px]" /> {movie.year}
              </span>
            )}
            {movie.runtime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiClock className="text-[11px]" /> {formatDuration(movie.runtime)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/movies/${movie.movieUuid}`}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs tracking-wide text-center transition-all shadow-md shadow-red-600/20 hover:shadow-red-600/40"
        >
          Book Tickets
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
