import React from 'react';
import { FiFilm, FiTv, FiCalendar, FiBookmark, FiUsers } from 'react-icons/fi';

export const AdminStats = ({ stats }) => {
  const cards = [
    {
      title: 'Total Movies',
      value: stats.moviesCount,
      icon: FiFilm,
      color: 'from-red-600 to-rose-600',
      text: 'text-red-400',
    },
    {
      title: 'Active Theatres',
      value: stats.theatresCount,
      icon: FiTv,
      color: 'from-amber-600 to-orange-600',
      text: 'text-amber-400',
    },
    {
      title: 'Total Shows',
      value: stats.showsCount,
      icon: FiCalendar,
      color: 'from-blue-600 to-cyan-600',
      text: 'text-blue-400',
    },
    {
      title: 'Total Bookings',
      value: stats.bookingsCount,
      icon: FiBookmark,
      color: 'from-purple-600 to-indigo-600',
      text: 'text-purple-400',
    },
    {
      title: 'Registered Users',
      value: stats.usersCount,
      icon: FiUsers,
      color: 'from-emerald-600 to-teal-600',
      text: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="p-5 rounded-2xl glass-panel-card border border-white/5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{c.title}</span>
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${c.color} p-0.5 shadow-md`}
              >
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Icon className={`${c.text} text-sm`} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-white">{c.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
