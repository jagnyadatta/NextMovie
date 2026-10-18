import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import TicketView from '../components/booking/TicketView';
import EmptyState from '../components/common/EmptyState';
import { FiBookmark } from 'react-icons/fi';

export const BookingDetails = () => {
  const { bookingUuid } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bookingApi.getMyBooking(bookingUuid);
        setBooking(res?.data || null);
      } catch (err) {
        console.error('Failed to load booking ticket:', err);
        setError(err.message || 'Unable to retrieve reservation');
      } finally {
        setLoading(false);
      }
    };

    if (bookingUuid) {
      fetchBooking();
    }
  }, [bookingUuid]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Generating your cinema e-ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={FiBookmark}
          title="Reservation Not Found"
          message={error || 'Could not find booking with this identifier.'}
          actionText="View My Bookings"
          actionLink="/my-bookings"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TicketView booking={booking} />
    </div>
  );
};

export default BookingDetails;
