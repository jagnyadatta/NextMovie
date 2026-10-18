import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FiBookmark, FiCalendar, FiFilm, FiTv, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings(currentPage, 10);
      const pageData = res?.data;
      setBookings(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          My Cinema Bookings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your upcoming screenings, tickets, and past reservation history.
        </p>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass-panel-card border border-white/5 animate-pulse h-36"
            />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => {
            const seatsSummary = b.seats
              ?.map((s) => `${s.rowNumber}${s.seatNumber}`)
              .join(', ');

            return (
              <div
                key={b.bookingUuid}
                className="p-6 rounded-3xl glass-panel-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/30 transition-all shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {b.bookingUuid.slice(0, 8)}...
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {b.movieTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiTv className="text-red-400" /> {b.theatreName} ({b.screenName})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="text-red-400" /> {formatDate(b.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-amber-400">
                      Seats: {seatsSummary || `${b.totalSeats} seats`}
                    </span>
                  </div>
                </div>

                {/* Right Amount & E-Ticket CTA */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="text-left md:text-right">
                    <div className="text-xs uppercase text-slate-400 font-semibold">
                      Total Paid
                    </div>
                    <div className="text-2xl font-black text-amber-400">
                      {formatCurrency(b.totalAmount)}
                    </div>
                  </div>

                  <Link
                    to={`/booking/confirmation/${b.bookingUuid}`}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <span>View Ticket</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FiBookmark}
          title="No Bookings Found"
          message="You haven't reserved any cinema tickets yet. Explore movies now to book your first premiere!"
          actionText="Explore Movies"
          actionLink="/movies"
        />
      )}

      {/* Pagination if applicable */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl bg-white/5 disabled:opacity-40 text-xs font-semibold text-slate-300"
          >
            Previous
          </button>
          <span className="text-xs text-slate-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            className="px-4 py-2 rounded-xl bg-white/5 disabled:opacity-40 text-xs font-semibold text-slate-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
