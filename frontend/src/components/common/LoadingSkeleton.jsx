import React from 'react';

export const MovieCardSkeleton = () => (
  <div className="flex flex-col rounded-2xl overflow-hidden glass-panel-card border border-white/5 animate-pulse">
    <div className="w-full aspect-[2/3] bg-slate-800/60" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-slate-700/60 rounded-md w-3/4" />
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-700/40 rounded w-1/3" />
        <div className="h-4 bg-slate-700/40 rounded w-1/4" />
      </div>
      <div className="h-9 bg-slate-700/40 rounded-xl w-full" />
    </div>
  </div>
);

export const MovieGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
);

export const HeroSkeleton = () => (
  <div className="w-full h-[450px] md:h-[550px] rounded-3xl glass-panel border border-white/5 animate-pulse p-8 md:p-12 flex flex-col justify-end space-y-4">
    <div className="h-6 bg-slate-700/50 rounded-full w-32" />
    <div className="h-10 md:h-14 bg-slate-700/60 rounded-xl w-3/4 md:w-1/2" />
    <div className="h-4 bg-slate-700/40 rounded w-2/3 max-w-xl" />
    <div className="flex gap-4 pt-4">
      <div className="h-12 bg-red-600/30 rounded-xl w-40" />
      <div className="h-12 bg-slate-700/40 rounded-xl w-36" />
    </div>
  </div>
);

export const SeatMapSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto space-y-6 animate-pulse p-6">
    <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
    <div className="space-y-3 pt-6">
      {Array.from({ length: 6 }).map((_, r) => (
        <div key={r} className="flex justify-center gap-2">
          {Array.from({ length: 10 }).map((_, c) => (
            <div key={c} className="w-8 h-8 rounded-lg bg-slate-800/50" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default MovieGridSkeleton;
