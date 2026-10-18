import React, { useState, useEffect } from 'react';
import screenApi from '../../api/screenApi';
import seatApi from '../../api/seatApi';
import Modal from '../common/Modal';
import { SCREEN_TYPES } from '../../utils/constants';
import { FiPlus, FiTrash2, FiTv, FiGrid, FiLayers } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const ScreenManager = ({ theatres = [] }) => {
  const [selectedTheatreUuid, setSelectedTheatreUuid] = useState(
    theatres[0]?.theatreUuid || ''
  );
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);

  // Modals
  const [isAddScreenModalOpen, setIsAddScreenModalOpen] = useState(false);
  const [isAddSeatModalOpen, setIsAddSeatModalOpen] = useState(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [screenForm, setScreenForm] = useState({
    name: 'Audi 1',
    screenType: 'IMAX',
    totalSeats: 60,
  });

  const [seatForm, setSeatForm] = useState({
    rowNumber: 'A',
    seatNumber: '1',
    seatType: 'REGULAR',
  });

  // Auto-generate state (e.g. Rows A-E, 10 seats per row)
  const [genRows, setGenRows] = useState(6);
  const [genSeatsPerRow, setGenSeatsPerRow] = useState(10);

  useEffect(() => {
    if (theatres.length > 0 && !selectedTheatreUuid) {
      setSelectedTheatreUuid(theatres[0].theatreUuid);
    }
  }, [theatres]);

  // Fetch screens when selected theatre changes
  const fetchScreens = async () => {
    if (!selectedTheatreUuid) return;
    setLoadingScreens(true);
    try {
      const res = await screenApi.getByTheatre(selectedTheatreUuid, 0, 50);
      const list = res?.data?.content || [];
      setScreens(list);
      if (list.length > 0 && !selectedScreen) {
        setSelectedScreen(list[0]);
      } else if (list.length === 0) {
        setSelectedScreen(null);
        setSeats([]);
      }
    } catch (err) {
      toast.error('Failed to load screens');
    } finally {
      setLoadingScreens(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, [selectedTheatreUuid]);

  // Fetch seats when screen changes
  const fetchSeats = async () => {
    if (!selectedScreen) return;
    setLoadingSeats(true);
    try {
      const res = await screenApi.getSeats(selectedScreen.screenUuid, 0, 150);
      setSeats(res?.data?.content || []);
    } catch (err) {
      toast.error('Failed to load screen seats');
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (selectedScreen) {
      fetchSeats();
    }
  }, [selectedScreen]);

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheatreUuid) {
      toast.error('Please select a theatre first');
      return;
    }
    setSubmitting(true);
    try {
      await screenApi.create({
        ...screenForm,
        theatreUuid: selectedTheatreUuid,
        totalSeats: Number(screenForm.totalSeats),
      });
      toast.success('Screen created successfully!');
      setIsAddScreenModalOpen(false);
      fetchScreens();
    } catch (err) {
      toast.error(err.message || 'Failed to create screen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScreen = async (screenUuid, name) => {
    if (!window.confirm(`Delete screen "${name}"?`)) return;
    try {
      await screenApi.delete(screenUuid);
      toast.success(`Deleted screen "${name}"`);
      fetchScreens();
    } catch (err) {
      toast.error(err.message || 'Failed to delete screen');
    }
  };

  const handleCreateSingleSeat = async (e) => {
    e.preventDefault();
    if (!selectedScreen) return;
    setSubmitting(true);
    try {
      await seatApi.create({
        screenUuid: selectedScreen.screenUuid,
        rowNumber: seatForm.rowNumber.toUpperCase(),
        seatNumber: seatForm.seatNumber,
        seatType: seatForm.seatType,
      });
      toast.success(`Seat ${seatForm.rowNumber.toUpperCase()}${seatForm.seatNumber} added!`);
      setIsAddSeatModalOpen(false);
      fetchSeats();
    } catch (err) {
      toast.error(err.message || 'Failed to add seat');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to bulk generate a standard grid of seats (e.g., Rows A-F)
  const handleBulkGenerateSeats = async () => {
    if (!selectedScreen) return;
    setSubmitting(true);
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
    let createdCount = 0;
    try {
      for (let r = 0; r < Math.min(genRows, rowLetters.length); r++) {
        const row = rowLetters[r];
        const seatType = r === 0 ? 'VIP' : r <= 2 ? 'PREMIUM' : 'REGULAR';
        for (let s = 1; s <= genSeatsPerRow; s++) {
          try {
            await seatApi.create({
              screenUuid: selectedScreen.screenUuid,
              rowNumber: row,
              seatNumber: String(s),
              seatType,
            });
            createdCount++;
          } catch {
            // Ignore if already exists
          }
        }
      }
      toast.success(`Generated ${createdCount} seats for ${selectedScreen.name}!`);
      setIsAutoGenerateModalOpen(false);
      fetchSeats();
    } catch (err) {
      toast.error('Error generating layout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theatre Picker & Screen Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel-card border border-white/10">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FiTv className="text-red-500 text-lg shrink-0" />
          <div className="flex-1 sm:w-72">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Theatre
            </label>
            <select
              value={selectedTheatreUuid}
              onChange={(e) => {
                setSelectedTheatreUuid(e.target.value);
                setSelectedScreen(null);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            >
              {theatres.map((t) => (
                <option key={t.theatreUuid} value={t.theatreUuid}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsAddScreenModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all"
        >
          <FiPlus className="text-sm" />
          <span>Add Screen</span>
        </button>
      </div>

      {/* Screens Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {screens.map((screen) => {
          const isSelected = selectedScreen?.screenUuid === screen.screenUuid;
          return (
            <button
              key={screen.screenUuid}
              onClick={() => setSelectedScreen(screen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-red-600/20 text-red-400 border-red-500/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <FiLayers className="text-xs" />
              <span>{screen.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                {screen.screenType}
              </span>
            </button>
          );
        })}
        {screens.length === 0 && !loadingScreens && (
          <div className="text-xs text-slate-500 italic py-2">
            No screens configured for this theatre. Click "Add Screen" above.
          </div>
        )}
      </div>

      {/* Selected Screen Details & Seat Map */}
      {selectedScreen && (
        <div className="glass-panel-card rounded-2xl border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedScreen.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                  {selectedScreen.screenType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configured Seats: <span className="font-bold text-white">{seats.length}</span> / {selectedScreen.totalSeats} capacity
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAutoGenerateModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-600/30 transition-all"
              >
                <FiGrid className="text-xs" />
                <span>Auto-Generate Grid</span>
              </button>

              <button
                onClick={() => setIsAddSeatModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
              >
                <FiPlus className="text-xs" />
                <span>Add Single Seat</span>
              </button>

              <button
                onClick={() => handleDeleteScreen(selectedScreen.screenUuid, selectedScreen.name)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Screen"
              >
                <FiTrash2 className="text-sm" />
              </button>
            </div>
          </div>

          {/* Seat Grid Display */}
          <div className="overflow-x-auto py-4">
            <div className="min-w-max space-y-2">
              {seats.length > 0 ? (
                <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-w-3xl">
                  {seats.map((seat) => (
                    <div
                      key={seat.seatUuid}
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-center flex flex-col items-center justify-center"
                    >
                      <span className="font-bold text-xs text-white">
                        {seat.rowNumber}{seat.seatNumber}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-medium">
                        {seat.seatType}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No seats added yet. Use "Auto-Generate Grid" to instantly populate a layout (e.g. 6 rows × 10 seats).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      <Modal
        isOpen={isAddScreenModalOpen}
        onClose={() => setIsAddScreenModalOpen(false)}
        title="Add Cinema Screen"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateScreen} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Screen Name *
            </label>
            <input
              type="text"
              required
              value={screenForm.name}
              onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
              placeholder="e.g. Audi 1 / IMAX Laser"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Screen Type *
            </label>
            <select
              value={screenForm.screenType}
              onChange={(e) => setScreenForm({ ...screenForm, screenType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            >
              {SCREEN_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Total Seats Capacity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={screenForm.totalSeats}
              onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddScreenModalOpen(false)}
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
              <span>Create Screen</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Single Seat Modal */}
      <Modal
        isOpen={isAddSeatModalOpen}
        onClose={() => setIsAddSeatModalOpen(false)}
        title="Add Single Seat"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSingleSeat} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Row Letter *
              </label>
              <input
                type="text"
                required
                maxLength={2}
                value={seatForm.rowNumber}
                onChange={(e) => setSeatForm({ ...seatForm, rowNumber: e.target.value })}
                placeholder="A"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seat Number *
              </label>
              <input
                type="text"
                required
                value={seatForm.seatNumber}
                onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })}
                placeholder="1"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seat Type *
            </label>
            <select
              value={seatForm.seatType}
              onChange={(e) => setSeatForm({ ...seatForm, seatType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            >
              <option value="REGULAR">REGULAR</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="RECLINER">RECLINER</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddSeatModalOpen(false)}
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
              <span>Add Seat</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Auto-Generate Seats Modal */}
      <Modal
        isOpen={isAutoGenerateModalOpen}
        onClose={() => setIsAutoGenerateModalOpen(false)}
        title="Auto-Generate Standard Seat Grid"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Quickly generate seats for <strong>{selectedScreen?.name}</strong>. Row A will be assigned VIP, Rows B-C Premium, and remaining rows Regular.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Rows (e.g. 6 = A-F)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={genRows}
                onChange={(e) => setGenRows(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seats per Row (e.g. 10)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={genSeatsPerRow}
                onChange={(e) => setGenSeatsPerRow(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="text-xs text-amber-400 font-medium">
            Total to generate: {genRows * genSeatsPerRow} seats.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAutoGenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleBulkGenerateSeats}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Generate Layout</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScreenManager;
