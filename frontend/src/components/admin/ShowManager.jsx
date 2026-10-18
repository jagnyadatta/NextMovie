import React, { useState } from 'react';
import showApi from '../../api/showApi';
import screenApi from '../../api/screenApi';
import Modal from '../common/Modal';
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiTv, FiFilm } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatTime } from '../../utils/formatters';

export const ShowManager = ({
  shows = [],
  movies = [],
  theatres = [],
  onRefresh,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    movieUuid: movies[0]?.movieUuid || '',
    theatreUuid: theatres[0]?.theatreUuid || '',
    screenUuid: '',
    showDate: todayStr,
    startTime: '14:30:00',
    endTime: '17:15:00',
    status: 'UPCOMING',
    regularPrice: 180,
    premiumPrice: 280,
    reclinerPrice: 420,
    vipPrice: 550,
  });

  const [theatreScreens, setTheatreScreens] = useState([]);

  // When theatre selection changes in the form, load its screens
  const handleTheatreChange = async (theatreUuid) => {
    setFormData((prev) => ({ ...prev, theatreUuid, screenUuid: '' }));
    try {
      const res = await screenApi.getByTheatre(theatreUuid, 0, 50);
      const screens = res?.data?.content || [];
      setTheatreScreens(screens);
      if (screens.length > 0) {
        setFormData((prev) => ({ ...prev, screenUuid: screens[0].screenUuid }));
      }
    } catch {
      setTheatreScreens([]);
    }
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    if (theatres.length > 0) {
      handleTheatreChange(theatres[0].theatreUuid);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!formData.movieUuid) {
      toast.error('Please select a movie');
      return;
    }
    if (!formData.screenUuid) {
      toast.error('Please select a screen');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure startTime and endTime have seconds format HH:mm:ss
      let start = formData.startTime;
      if (start.length === 5) start += ':00';
      let end = formData.endTime;
      if (end.length === 5) end += ':00';

      const payload = {
        movieUuid: formData.movieUuid,
        screenUuid: formData.screenUuid,
        showDate: formData.showDate,
        startTime: start,
        endTime: end,
        status: formData.status,
        seatPrices: {
          REGULAR: Number(formData.regularPrice),
          PREMIUM: Number(formData.premiumPrice),
          RECLINER: Number(formData.reclinerPrice),
          VIP: Number(formData.vipPrice),
        },
      };

      await showApi.create(payload);
      toast.success('Show created and seats generated successfully!');
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to create show');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (showUuid, status) => {
    try {
      await showApi.updateStatus(showUuid, status);
      toast.success(`Show status changed to ${status}`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update show status');
    }
  };

  const handleDelete = async (showUuid) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await showApi.delete(showUuid);
      toast.success('Show deleted');
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete show');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Movie Schedules & Shows</h3>
          <p className="text-xs text-slate-400">
            Configure movie showtimes, screening formats, and seat pricing tiers.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all"
        >
          <FiPlus className="text-sm" />
          <span>Create Show</span>
        </button>
      </div>

      {/* Shows Table */}
      <div className="glass-panel-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Theatre & Screen</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shows.map((show) => (
                <tr key={show.showUuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white max-w-xs truncate">
                      {show.movieTitle}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{show.theatreName}</div>
                    <div className="text-[10px] text-slate-400">{show.screenName}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <FiCalendar className="text-red-400 text-xs" />
                      <span>{show.showDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono mt-0.5">
                      <FiClock className="text-[10px]" />
                      <span>{formatTime(show.startTime)} - {formatTime(show.endTime)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={show.status}
                      onChange={(e) => handleStatusChange(show.showUuid, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-semibold text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="RUNNING">RUNNING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(show.showUuid)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Show"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
              {shows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No shows scheduled. Click "Create Show" to schedule a screening.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Show Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Movie Show"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateShow} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Movie */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Movie *
              </label>
              <select
                required
                value={formData.movieUuid}
                onChange={(e) => setFormData({ ...formData, movieUuid: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="">-- Choose Movie --</option>
                {movies.map((m) => (
                  <option key={m.movieUuid} value={m.movieUuid}>
                    {m.title} ({m.year})
                  </option>
                ))}
              </select>
            </div>

            {/* Theatre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Theatre *
              </label>
              <select
                required
                value={formData.theatreUuid}
                onChange={(e) => handleTheatreChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="">-- Choose Theatre --</option>
                {theatres.map((t) => (
                  <option key={t.theatreUuid} value={t.theatreUuid}>
                    {t.name} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Screen */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Screen *
              </label>
              <select
                required
                value={formData.screenUuid}
                onChange={(e) => setFormData({ ...formData, screenUuid: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              >
                <option value="">-- Choose Screen --</option>
                {theatreScreens.map((s) => (
                  <option key={s.screenUuid} value={s.screenUuid}>
                    {s.name} ({s.screenType})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Show Date *
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time (HH:MM) *
              </label>
              <input
                type="time"
                required
                value={formData.startTime.slice(0, 5)}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value + ':00' })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Time (HH:MM) *
              </label>
              <input
                type="time"
                required
                value={formData.endTime.slice(0, 5)}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value + ':00' })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Pricing Config */}
          <div className="pt-2 border-t border-white/10">
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              Seat Pricing by Category (₹ INR)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">REGULAR</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={formData.regularPrice}
                  onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">PREMIUM</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={formData.premiumPrice}
                  onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">RECLINER</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={formData.reclinerPrice}
                  onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">VIP</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={formData.vipPrice}
                  onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Publish Show</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShowManager;
