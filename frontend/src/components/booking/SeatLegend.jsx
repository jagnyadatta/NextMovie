import React from 'react';
import { FiLock, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

export const SeatLegend = ({ seatPrices = {} }) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 px-6 rounded-2xl glass-panel-subtle border border-white/5 text-xs text-slate-300">
      {/* State indicators */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md border border-slate-600 bg-slate-800/80" />
        <span>Available</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-red-600 to-rose-500 border border-red-400 text-white flex items-center justify-center text-xs shadow-md shadow-red-500/30">
          <FiCheck className="text-[11px]" />
        </div>
        <span className="text-white font-medium">Selected</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-slate-900/90 border border-slate-800 text-slate-600 flex items-center justify-center text-[10px] cursor-not-allowed">
          ✕
        </div>
        <span className="text-slate-500">Booked</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-amber-950/40 border border-amber-600/50 text-amber-500 flex items-center justify-center text-[10px] cursor-not-allowed">
          <FiLock className="text-[10px]" />
        </div>
        <span className="text-amber-400">Locked</span>
      </div>

      {/* Category Price Tags */}
      {Object.keys(seatPrices).length > 0 && (
        <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-white/10">
          {Object.entries(seatPrices).map(([type, price]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-slate-400">{type}:</span>
              <span className="font-semibold text-white">{formatCurrency(price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatLegend;
