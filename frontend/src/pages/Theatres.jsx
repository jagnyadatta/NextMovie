import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import theatreApi from '../api/theatreApi';
import { useCity } from '../context/CityContext';
import { POPULAR_CITIES } from '../utils/constants';
import EmptyState from '../components/common/EmptyState';
import { FiTv, FiMapPin, FiSearch, FiArrowRight, FiShield, FiFilm } from 'react-icons/fi';

export const Theatres = () => {
  const { currentCity, setCity } = useCity();
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setSelectedCity(currentCity);
  }, [currentCity]);

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        let res;
        if (selectedCity) {
          res = await theatreApi.getByCity(selectedCity, 0, 50);
        } else {
          res = await theatreApi.getAll(0, 50);
        }
        let list = res?.data?.content || [];
        // Fallback to all theatres if city has none
        if (list.length === 0) {
          const allRes = await theatreApi.getAll(0, 50);
          list = allRes?.data?.content || [];
        }
        setTheatres(list);
      } catch (err) {
        console.error('Failed to fetch theatres:', err);
        setTheatres([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTheatres();
  }, [selectedCity]);

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    setCity(cityName);
  };

  const filteredTheatres = theatres.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.address?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.city?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Cinemas & Theatres
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover premier multiplexes, IMAX screens, and luxury auditoriums in your area.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search cinema or address..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* City Chips Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
          <FiMapPin className="text-red-400 text-xs" /> City:
        </span>
        {POPULAR_CITIES.map((c) => {
          const isSelected = selectedCity.toLowerCase() === c.toLowerCase();
          return (
            <button
              key={c}
              onClick={() => handleCitySelect(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-white/[0.04] text-slate-300 border-white/5 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Theatres Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass-panel-card border border-white/5 animate-pulse h-48"
            />
          ))}
        </div>
      ) : filteredTheatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTheatres.map((t) => (
            <div
              key={t.theatreUuid}
              className="p-6 rounded-3xl glass-panel-card border border-white/10 flex flex-col justify-between hover:border-red-500/30 transition-all group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-lg">
                    <FiTv />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      t.active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                    }`}
                  >
                    {t.active ? 'Open Now' : 'Closed'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {t.address}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <span>{t.city}, {t.state}</span>
                  {t.pincode && <span>• PIN: {t.pincode}</span>}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">IMAX • Dolby Atmos</span>
                <Link
                  to={`/shows?theatre=${t.theatreUuid}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5"
                >
                  <span>Explore Shows</span>
                  <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FiTv}
          title="No Theatres Found"
          message={`No theatres found matching your selection in ${selectedCity}.`}
          actionText="Show All Theatres"
          onAction={() => setSelectedCity('')}
        />
      )}
    </div>
  );
};

export default Theatres;
