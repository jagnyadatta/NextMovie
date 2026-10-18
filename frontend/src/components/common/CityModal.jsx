import React, { useState } from 'react';
import Modal from './Modal';
import { useCity } from '../../context/CityContext';
import { FiMapPin, FiSearch, FiCheck } from 'react-icons/fi';

export const CityModal = () => {
  const { currentCity, setCity, cities, isCityModalOpen, closeCityModal } = useCity();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (cityName) => {
    setCity(cityName);
    setSearchTerm('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleSelect(searchTerm.trim());
    }
  };

  return (
    <Modal
      isOpen={isCityModalOpen}
      onClose={closeCityModal}
      title="Select Your City"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Shows and theatre schedules will automatically filter by your selected location.
        </p>

        {/* Search input */}
        <form onSubmit={handleCustomSubmit} className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search or enter city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm transition-all"
          />
        </form>

        {/* Cities Grid */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Popular Cities
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredCities.map((cityName) => {
              const isSelected =
                currentCity.toLowerCase() === cityName.toLowerCase();
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => handleSelect(cityName)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all border ${
                    isSelected
                      ? 'bg-red-600/20 text-red-400 border-red-500/40 font-semibold shadow-sm shadow-red-500/10'
                      : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FiMapPin className="text-xs opacity-70 shrink-0" />
                    <span className="truncate">{cityName}</span>
                  </span>
                  {isSelected && <FiCheck className="text-sm shrink-0" />}
                </button>
              );
            })}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400 mb-3">
                No matching preset city found for "{searchTerm}".
              </p>
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all"
              >
                Use "{searchTerm.trim()}" as custom city
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CityModal;
