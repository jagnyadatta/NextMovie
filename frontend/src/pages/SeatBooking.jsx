import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import showApi from '../api/showApi';
import bookingApi from '../api/bookingApi';
import SeatLegend from '../components/booking/SeatLegend';
import SeatGrid from '../components/booking/SeatGrid';
import BookingSummary from '../components/booking/BookingSummary';
import { SeatMapSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { formatDate, formatTime } from '../utils/formatters';
import { FiChevronLeft, FiTv, FiCalendar, FiClock, FiFilm, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const SeatBooking = () => {
  const { showUuid } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [showSeats, setShowSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch show and seats
  const fetchShowAndSeats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [showRes, seatsRes] = await Promise.all([
        showApi.getByUuid(showUuid),
        showApi.getShowSeats(showUuid, 0, 200),
      ]);

      setShow(showRes?.data || null);
      setShowSeats(seatsRes?.data?.content || []);
    } catch (err) {
      console.error('Error fetching show or seat layout:', err);
      setError(err.message || 'Unable to load show seat layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showUuid) {
      fetchShowAndSeats();
    }
  }, [showUuid]);

  // Compute distinct seat prices for the legend
  const seatPrices = showSeats.reduce((acc, s) => {
    if (s.seatType && s.price && !acc[s.seatType]) {
      acc[s.seatType] = s.price;
    }
    return acc;
  }, {});

  // Toggle seat selection
  const handleSeatToggle = (seat) => {
    setError(null);
    const alreadySelected = selectedSeats.some(
      (s) => s.showSeatUuid === seat.showSeatUuid
    );

    if (alreadySelected) {
      setSelectedSeats(
        selectedSeats.filter((s) => s.showSeatUuid !== seat.showSeatUuid)
      );
    } else {
      if (selectedSeats.length >= 10) {
        toast.warning('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleRemoveSeat = (seatToRemove) => {
    setSelectedSeats(
      selectedSeats.filter(
        (s) => s.showSeatUuid !== seatToRemove.showSeatUuid
      )
    );
  };

  // Submit booking to backend
  const handleProceedBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat to continue.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        showUuid: showUuid,
        showSeatUuids: selectedSeats.map((s) => s.showSeatUuid),
      };

      const response = await bookingApi.createBooking(payload);
      const bookingData = response.data;

      toast.success('Seats locked & reservation created successfully!');
      navigate(`/booking/confirmation/${bookingData.bookingUuid}`);
    } catch (err) {
      const errorMsg =
        err.message || 'Selected seat is no longer available. Please choose another.';
      setError(errorMsg);
      toast.error(errorMsg);
      // Refresh seat layout so user can see which seats were locked/booked
      fetchShowAndSeats();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="h-20 bg-slate-800/40 rounded-2xl animate-pulse" />
        <SeatMapSkeleton />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={FiFilm}
          title="Show Not Available"
          message="This movie screening could not be located or has completed."
          actionText="Back to Shows"
          actionLink="/shows"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl glass-panel-card border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all shrink-0"
            title="Go Back"
          >
            <FiChevronLeft className="text-xl" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-red-500 tracking-wider">
                Booking Screen
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {show.screenName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {show.movieTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="text-slate-200 font-semibold">{show.theatreName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiCalendar className="text-red-400" /> {formatDate(show.showDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <FiClock /> {formatTime(show.startTime)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={fetchShowAndSeats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold self-start md:self-auto transition-colors"
          title="Refresh Seat Status"
        >
          <FiRefreshCw className="text-xs" />
          <span>Refresh Layout</span>
        </button>
      </div>

      {/* Main Layout: Interactive Seat Grid & Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Seat Area (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Seat State & Category Legend */}
          <SeatLegend seatPrices={seatPrices} />

          {/* Interactive Screen & Seat Layout */}
          <div className="glass-panel-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
            <SeatGrid
              showSeats={showSeats}
              selectedSeats={selectedSeats}
              onSeatToggle={handleSeatToggle}
              maxSeats={10}
            />
          </div>
        </div>

        {/* Right Sticky Booking Summary (4 cols on lg) */}
        <div className="lg:col-span-4 sticky top-24">
          <BookingSummary
            show={show}
            selectedSeats={selectedSeats}
            onRemoveSeat={handleRemoveSeat}
            onProceed={handleProceedBooking}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
