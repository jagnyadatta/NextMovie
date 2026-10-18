import React from 'react';
import { Link } from 'react-router-dom';
import { FiFilm, FiHome } from 'react-icons/fi';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-red-500/10">
        <FiFilm />
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-2">
        404
      </h1>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-3">
        Scene Not Found
      </h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The cinematic cut you are looking for does not exist or has been moved to another reel.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
      >
        <FiHome className="text-base" />
        <span>Return to Premiere</span>
      </Link>
    </div>
  );
};

export default NotFound;
