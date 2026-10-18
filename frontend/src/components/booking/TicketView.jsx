import React from 'react';
import { FiCheckCircle, FiCalendar, FiClock, FiMapPin, FiPrinter, FiFilm, FiDownload } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const TicketView = ({ booking }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const seatsList = booking.seats || [];
  const seatLabels = seatsList.map((s) => `${s.rowNumber}${s.seatNumber}`).join(', ');

  return (
    <div className="max-w-2xl mx-auto my-8">
      {/* Success banner if confirmed/pending */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-emerald-500/10">
          <FiCheckCircle />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Booking Confirmed!</h2>
        <p className="text-slate-400 text-sm mt-1">
          Your cinema seats have been reserved. Please show this e-ticket at the theatre entrance.
        </p>
      </div>

      {/* Cinematic Ticket Card with Perforation */}
      <div className="relative rounded-3xl overflow-hidden glass-dropdown border border-white/10 shadow-2xl">
        
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-xl">
              <FiFilm />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest font-bold opacity-80">
                Official E-Ticket
              </div>
              <div className="text-xl font-black tracking-tight">NextMovie Cinema</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md border border-white/20">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Movie Title & Booking ID */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-red-400">
                Movie
              </div>
              <h3 className="text-2xl font-black text-white mt-0.5">
                {booking.movieTitle}
              </h3>
            </div>
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Booking ID
              </div>
              <div className="font-mono text-sm text-amber-400 font-bold tracking-wider">
                {booking.bookingUuid ? booking.bookingUuid.slice(0, 13) : 'NXM-89241'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-white/10 text-xs">
            <div>
              <div className="text-slate-400 flex items-center gap-1 mb-1">
                <FiMapPin className="text-red-400" /> Theatre
              </div>
              <div className="font-semibold text-white truncate">{booking.theatreName}</div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center gap-1 mb-1">
                <FiFilm className="text-red-400" /> Screen
              </div>
              <div className="font-semibold text-white">{booking.screenName}</div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center gap-1 mb-1">
                <FiCalendar className="text-red-400" /> Date
              </div>
              <div className="font-semibold text-white">
                {formatDate(booking.createdAt)}
              </div>
            </div>

            <div>
              <div className="text-slate-400 flex items-center gap-1 mb-1">
                <FiClock className="text-red-400" /> Seats
              </div>
              <div className="font-bold text-amber-400 text-sm">
                {seatLabels || `${booking.totalSeats} Seats`}
              </div>
            </div>
          </div>

          {/* Seat breakdown table */}
          {seatsList.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Seat Details
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {seatsList.map((seat, i) => (
                  <div
                    key={seat.bookingSeatUuid || i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <span className="font-bold text-white">
                      Seat {seat.rowNumber}{seat.seatNumber}
                    </span>
                    <span className="text-slate-400">{formatCurrency(seat.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perforated Stub Divider */}
          <div className="relative py-2 flex items-center justify-between">
            <div className="absolute -left-10 w-8 h-8 rounded-full bg-[#080B11] border-r border-white/10" />
            <div className="w-full border-b-2 border-dashed border-white/15 mx-2" />
            <div className="absolute -right-10 w-8 h-8 rounded-full bg-[#080B11] border-l border-white/10" />
          </div>

          {/* Barcode representation & Total */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="space-y-1 text-center sm:text-left">
              {/* Decorative digital barcode */}
              <div className="flex items-center gap-1 h-12 bg-white/5 p-2 rounded-lg justify-center sm:justify-start">
                <div className="w-1 h-full bg-white/70" />
                <div className="w-2 h-full bg-white/90" />
                <div className="w-0.5 h-full bg-white/40" />
                <div className="w-1.5 h-full bg-white/80" />
                <div className="w-0.5 h-full bg-white/30" />
                <div className="w-2.5 h-full bg-white/90" />
                <div className="w-1 h-full bg-white/60" />
                <div className="w-2 h-full bg-white/80" />
                <div className="w-0.5 h-full bg-white/50" />
                <div className="w-3 h-full bg-white/90" />
                <div className="w-1 h-full bg-white/70" />
                <div className="w-2 h-full bg-white/80" />
                <div className="w-0.5 h-full bg-white/40" />
                <div className="w-1.5 h-full bg-white/80" />
                <div className="w-2 h-full bg-white/90" />
              </div>
              <div className="text-[10px] font-mono text-slate-500 tracking-widest">
                {booking.bookingUuid}
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xs text-slate-400 uppercase font-semibold">
                Total Amount Paid
              </div>
              <div className="text-3xl font-black text-amber-400">
                {formatCurrency(booking.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-sm transition-all flex items-center gap-2"
        >
          <FiPrinter className="text-base" />
          <span>Print / Save Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/20 transition-all"
        >
          View All My Bookings
        </Link>

        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TicketView;
