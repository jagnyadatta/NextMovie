import React from 'react';
import { FiX, FiCheckCircle, FiShield, FiAlertCircle } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const BookingSummary = ({
  show,
  selectedSeats = [],
  onRemoveSeat,
  onProceed,
  isSubmitting = false,
  error = null,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const totalSeatsCount = selectedSeats.length;

  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0
  );

  // Nominal cinema convenience fee (e.g. ₹20 per seat)
  const convenienceFee = totalSeatsCount > 0 ? totalSeatsCount * 25 : 0;
  const grandTotal = subtotal + convenienceFee;

  const handleAction = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: window.location.pathname },
      });
      return;
    }
    onProceed();
  };

  return (
    <div className="glass-panel-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Booking Summary</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            {totalSeatsCount} {totalSeatsCount === 1 ? 'Seat' : 'Seats'}
          </span>
        </div>

        {/* Show / Movie Quick Info */}
        <div className="py-4 space-y-1.5 border-b border-white/10">
          <h4 className="text-base font-bold text-white leading-tight">
            {show?.movieTitle || 'Movie'}
          </h4>
          <p className="text-xs text-slate-300">
            {show?.theatreName} • {show?.screenName}
          </p>
          <p className="text-xs text-slate-400">
            {show?.showDate} at {show?.startTime}
          </p>
        </div>

        {/* Selected Seats Chips */}
        <div className="py-4 border-b border-white/10">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Selected Seats
          </div>
          {totalSeatsCount > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.showSeatUuid}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white"
                >
                  <span className="font-bold text-red-400">
                    {seat.rowNumber}{seat.seatNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({seat.seatType})
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat)}
                    className="ml-1 text-slate-400 hover:text-rose-400"
                    title="Remove seat"
                  >
                    <FiX className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">
              Please click on available seats from the layout to select.
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="py-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Ticket Price ({totalSeatsCount} seats)</span>
            <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
          </div>
          {totalSeatsCount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Convenience & Booking Fee</span>
              <span>{formatCurrency(convenienceFee)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm">
            <span className="font-bold text-white">Total Amount</span>
            <span className="text-lg font-black text-amber-400">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
            <FiAlertCircle className="text-base shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="space-y-3">
        <button
          type="button"
          disabled={totalSeatsCount === 0 || isSubmitting}
          onClick={handleAction}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
            totalSeatsCount === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : !isAuthenticated
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-[1.02]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Confirming Reservation...</span>
            </>
          ) : !isAuthenticated ? (
            <span>Sign In to Book ({formatCurrency(grandTotal)})</span>
          ) : (
            <span>Proceed to Payment • {formatCurrency(grandTotal)}</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <FiShield className="text-emerald-500 text-xs" />
          <span>Real-time instant seat lock & encrypted checkout</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
