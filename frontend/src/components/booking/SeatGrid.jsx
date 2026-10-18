import React, { useMemo } from 'react';
import { FiLock, FiCheck } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';

export const SeatGrid = ({
  showSeats = [],
  selectedSeats = [],
  onSeatToggle,
  maxSeats = 10,
}) => {
  // Group seats by rowNumber
  const rows = useMemo(() => {
    const map = {};
    showSeats.forEach((seat) => {
      const row = seat.rowNumber || 'A';
      if (!map[row]) {
        map[row] = [];
      }
      map[row].push(seat);
    });

    // Sort row keys (A, B, C...)
    const sortedRowKeys = Object.keys(map).sort();

    // In each row, sort seats by seatNumber numeric/alphanumeric
    const result = [];
    sortedRowKeys.forEach((key) => {
      const sortedSeats = [...map[key]].sort((a, b) => {
        const numA = parseInt(a.seatNumber.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.seatNumber.replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        return a.seatNumber.localeCompare(b.seatNumber);
      });
      result.push({ rowNumber: key, seats: sortedSeats });
    });

    return result;
  }, [showSeats]);

  const isSelected = (seat) =>
    selectedSeats.some((s) => s.showSeatUuid === seat.showSeatUuid);

  return (
    <div className="w-full flex flex-col items-center select-none py-6 overflow-x-auto">
      {/* Cinema Screen Curved Bar */}
      <div className="w-full max-w-2xl flex flex-col items-center mb-12">
        <div className="w-full h-3 rounded-[100%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50" />
        <div className="cinema-screen-glow w-full h-8 max-w-xl opacity-40 -mt-2" />
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400 mt-2">
          SCREEN THIS WAY
        </span>
      </div>

      {/* Seat Layout Rows */}
      <div className="space-y-3 min-w-max px-4">
        {rows.map(({ rowNumber, seats }) => (
          <div key={rowNumber} className="flex items-center gap-3">
            {/* Left Row Identifier */}
            <div className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
              {rowNumber}
            </div>

            {/* Row Seats */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {seats.map((seat, index) => {
                const selected = isSelected(seat);
                const isBooked = seat.status === 'BOOKED';
                const isLocked = seat.status === 'LOCKED';
                const isAvailable = seat.status === 'AVAILABLE';

                // Mid aisle gap every 6 or 8 seats
                const hasAisleGap = index > 0 && index % 6 === 0;

                // Color code by seat type if available
                let typeStyles = 'border-slate-700 bg-slate-800/80 text-slate-300';
                if (seat.seatType === 'VIP') {
                  typeStyles = 'border-amber-600/40 bg-amber-950/20 text-amber-200';
                } else if (seat.seatType === 'RECLINER') {
                  typeStyles = 'border-purple-600/40 bg-purple-950/20 text-purple-200';
                } else if (seat.seatType === 'PREMIUM') {
                  typeStyles = 'border-blue-600/40 bg-blue-950/20 text-blue-200';
                }

                return (
                  <React.Fragment key={seat.showSeatUuid}>
                    {hasAisleGap && <div className="w-4 sm:w-6" />}
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onSeatToggle(seat)}
                      title={`Row ${seat.rowNumber} Seat ${seat.seatNumber} (${seat.seatType}) - ${formatCurrency(seat.price)}`}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] font-semibold transition-all duration-150 flex items-center justify-center border ${
                        selected
                          ? 'bg-gradient-to-tr from-red-600 to-rose-500 border-red-400 text-white shadow-lg shadow-red-600/40 scale-110 z-10'
                          : isBooked
                          ? 'bg-slate-900/90 border-slate-800/60 text-slate-700 cursor-not-allowed opacity-60'
                          : isLocked
                          ? 'bg-amber-950/40 border-amber-600/50 text-amber-500 cursor-not-allowed'
                          : `${typeStyles} hover:scale-110 hover:border-red-400 hover:text-white cursor-pointer`
                      }`}
                    >
                      {selected ? (
                        <FiCheck className="text-xs" />
                      ) : isLocked ? (
                        <FiLock className="text-[10px]" />
                      ) : isBooked ? (
                        <span className="text-[10px]">✕</span>
                      ) : (
                        <span>{seat.seatNumber}</span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right Row Identifier */}
            <div className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
              {rowNumber}
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="py-12 text-slate-400 text-sm">
          No seat layout found for this screen.
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
