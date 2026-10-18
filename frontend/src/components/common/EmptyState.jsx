import React from 'react';
import { FiFilm, FiCalendar, FiMapPin, FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No items found',
  message = "We couldn't find anything matching your criteria.",
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel-card rounded-2xl border border-white/5 my-8">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 text-2xl shadow-lg shadow-red-500/5">
        <Icon />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-md mb-6">{message}</p>
      {actionText && (actionLink ? (
        <Link
          to={actionLink}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/20"
        >
          {actionText}
        </Link>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/20"
        >
          {actionText}
        </button>
      ) : null)}
    </div>
  );
};

export default EmptyState;
