import React, { useState } from 'react';
import { FiCalendar, FiFilm, FiTv, FiEye } from 'react-icons/fi';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BookingManager = ({ bookings = [] }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">All Customer Reservations</h3>
          <p className="text-xs text-slate-400">
            Real-time tracking of cinema bookings, seat allocations, and payment transactions.
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-panel-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Theatre & Screen</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b.bookingUuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono text-red-400 font-bold whitespace-nowrap">
                    {b.bookingUuid?.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                    {b.movieTitle}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{b.theatreName}</div>
                    <div className="text-[10px] text-slate-400">{b.screenName}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-white">
                    {b.totalSeats} seats
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-amber-400">
                    {formatCurrency(b.totalAmount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    {formatDate(b.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <FiEye className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No reservations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        title="Reservation Details"
        maxWidth="max-w-md"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Booking UUID:</span>
                <span className="font-mono text-white select-all">
                  {selectedBooking.bookingUuid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer UUID:</span>
                <span className="font-mono text-slate-300">
                  {selectedBooking.userUuid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-amber-400">
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Seats
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedBooking.seats?.map((s) => (
                  <div
                    key={s.bookingSeatUuid}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2"
                  >
                    <span className="font-bold text-white">
                      {s.rowNumber}{s.seatNumber}
                    </span>
                    <span className="text-slate-400">{formatCurrency(s.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold">
              <span className="text-white">Total Paid</span>
              <span className="text-amber-400 text-base">
                {formatCurrency(selectedBooking.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManager;
