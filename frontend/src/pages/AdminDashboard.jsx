import React, { useState, useEffect } from 'react';
import movieApi from '../api/movieApi';
import theatreApi from '../api/theatreApi';
import showApi from '../api/showApi';
import bookingApi from '../api/bookingApi';
import userApi from '../api/userApi';
import AdminStats from '../components/admin/AdminStats';
import MovieManager from '../components/admin/MovieManager';
import TheatreManager from '../components/admin/TheatreManager';
import ScreenManager from '../components/admin/ScreenManager';
import ShowManager from '../components/admin/ShowManager';
import BookingManager from '../components/admin/BookingManager';
import UserManager from '../components/admin/UserManager';
import {
  FiPieChart,
  FiFilm,
  FiTv,
  FiLayers,
  FiCalendar,
  FiBookmark,
  FiUsers,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        moviesRes,
        theatresRes,
        showsRes,
        bookingsRes,
        usersRes,
      ] = await Promise.allSettled([
        movieApi.getAll(0, 100),
        theatreApi.getAll(0, 100),
        showApi.getShows(null, 0, 100),
        bookingApi.getAllBookings(0, 100),
        userApi.getAllUsers(),
      ]);

      setMovies(
        moviesRes.status === 'fulfilled'
          ? moviesRes.value?.data?.content || []
          : []
      );
      setTheatres(
        theatresRes.status === 'fulfilled'
          ? theatresRes.value?.data?.content || []
          : []
      );
      setShows(
        showsRes.status === 'fulfilled'
          ? showsRes.value?.data?.content || []
          : []
      );
      setBookings(
        bookingsRes.status === 'fulfilled'
          ? bookingsRes.value?.data?.content || []
          : []
      );
      setUsers(
        usersRes.status === 'fulfilled' ? usersRes.value?.data || [] : []
      );
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error('Failed to load some admin datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const stats = {
    moviesCount: movies.length,
    theatresCount: theatres.length,
    showsCount: shows.length,
    bookingsCount: bookings.length,
    usersCount: users.length,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiPieChart },
    { id: 'movies', label: `Movies (${movies.length})`, icon: FiFilm },
    { id: 'theatres', label: `Theatres (${theatres.length})`, icon: FiTv },
    { id: 'screens', label: 'Screens & Seats', icon: FiLayers },
    { id: 'shows', label: `Shows (${shows.length})`, icon: FiCalendar },
    { id: 'bookings', label: `Bookings (${bookings.length})`, icon: FiBookmark },
    { id: 'users', label: `Users (${users.length})`, icon: FiUsers },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shrink-0">
            <FiShield />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              NextMovie Admin Console
            </h1>
            <p className="text-xs text-slate-400">
              Manage movies, theatres, screen layouts, showtimes, reservations, and user accounts.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllAdminData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <FiRefreshCw className={`text-xs ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AdminStats stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="glass-panel-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white">Management Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setActiveTab('movies')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-slate-300 hover:text-white transition-all flex flex-col gap-1"
                  >
                    <span className="font-bold text-red-400">Import Movie</span>
                    <span className="text-[10px] text-slate-500">Seed movies from IMDb</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('theatres')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-slate-300 hover:text-white transition-all flex flex-col gap-1"
                  >
                    <span className="font-bold text-amber-400">Add Theatre</span>
                    <span className="text-[10px] text-slate-500">Configure multiplexes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('shows')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-slate-300 hover:text-white transition-all flex flex-col gap-1"
                  >
                    <span className="font-bold text-blue-400">Schedule Show</span>
                    <span className="text-[10px] text-slate-500">Set timings & prices</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-slate-300 hover:text-white transition-all flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-400">Manage Users</span>
                    <span className="text-[10px] text-slate-500">Assign admin privileges</span>
                  </button>
                </div>
              </div>

              {/* System info */}
              <div className="glass-panel-card rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white">System Status & Endpoints</h3>
                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-black/30">
                    <span>Backend Context:</span>
                    <span className="text-emerald-400">/api/v1</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-black/30">
                    <span>Database Engine:</span>
                    <span className="text-white">PostgreSQL NextMovie</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-black/30">
                    <span>OMDb API Integration:</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-black/30">
                    <span>Concurrency Control:</span>
                    <span className="text-amber-400">Pessimistic Seat Locks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <MovieManager movies={movies} onRefresh={fetchAllAdminData} />
        )}

        {activeTab === 'theatres' && (
          <TheatreManager theatres={theatres} onRefresh={fetchAllAdminData} />
        )}

        {activeTab === 'screens' && <ScreenManager theatres={theatres} />}

        {activeTab === 'shows' && (
          <ShowManager
            shows={shows}
            movies={movies}
            theatres={theatres}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === 'bookings' && <BookingManager bookings={bookings} />}

        {activeTab === 'users' && (
          <UserManager users={users} onRefresh={fetchAllAdminData} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
