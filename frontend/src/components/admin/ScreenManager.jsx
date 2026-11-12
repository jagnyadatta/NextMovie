import React, { useState, useEffect, useMemo } from 'react';
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
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Modals
  const [isAddScreenModalOpen, setIsAddScreenModalOpen] = useState(false);
  const [isAddSeatModalOpen, setIsAddSeatModalOpen] = useState(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replaceExistingSeats, setReplaceExistingSeats] = useState(false);

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

  // Auto-generate state (e.g. Rows A-J, 18 seats per row = 180 seats)
  const [genRows, setGenRows] = useState(10);
  const [genSeatsPerRow, setGenSeatsPerRow] = useState(18);

  // Group seats by row for cinema grid layout
  const groupedRows = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      const row = seat.rowNumber?.toUpperCase() || 'A';
      if (!map[row]) {
        map[row] = [];
      }
      map[row].push(seat);
    });

    const sortedRowKeys = Object.keys(map).sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return a.localeCompare(b);
    });

    return sortedRowKeys.map((key) => {
      const sortedSeats = [...map[key]].sort((a, b) => {
        const numA = parseInt(String(a.seatNumber).replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.seatNumber).replace(/\D/g, ''), 10) || 0;
        if (numA !== numB) return numA - numB;
        return String(a.seatNumber).localeCompare(String(b.seatNumber));
      });
      return { rowNumber: key, rowSeats: sortedSeats };
    });
  }, [seats]);

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
      const res = await screenApi.getSeats(selectedScreen.screenUuid, 0, 500);
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

  const handleDeleteSeat = async (seatUuid, label) => {
    if (!window.confirm(`Delete seat ${label}?`)) return;
    try {
      await seatApi.delete(seatUuid);
      toast.success(`Deleted seat ${label}`);
      fetchSeats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete seat');
    }
  };

  // Dedicated bulk seat generation via backend API
  const handleBulkGenerateSeats = async () => {
    if (!selectedScreen) return;
    if (submitting) return; // Prevent duplicate simultaneous requests
    setSubmitting(true);
    try {
      const res = await seatApi.bulkGenerate({
        screenUuid: selectedScreen.screenUuid,
        totalRows: Number(genRows),
        seatsPerRow: Number(genSeatsPerRow),
        replaceExisting: replaceExistingSeats,
      });

      const data = res?.data;
      const createdCount = data?.totalSeatsCreated ?? 0;
      const existingCount = data?.totalSeatsExisting ?? 0;
      const totalConfigured = data?.totalSeatsConfigured ?? (createdCount + existingCount);

      if (createdCount === 0 && existingCount > 0) {
        toast.info(
          `All ${existingCount} seats already exist for ${selectedScreen.name}. No new seats were created.`
        );
      } else {
        toast.success(
          `Successfully generated ${createdCount} seats for ${selectedScreen.name}! (${totalConfigured} total configured)`
        );
      }

      setIsAutoGenerateModalOpen(false);

      // If backend returned the full seat list, update state immediately; also re-fetch for complete sync
      if (Array.isArray(data?.seats) && data.seats.length > 0) {
        setSeats(data.seats);
      } else {
        await fetchSeats();
      }
    } catch (err) {
      toast.error(err.message || 'Error generating seat layout');
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
            {loadingSeats ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading screen seats...</span>
              </div>
            ) : groupedRows.length > 0 ? (
              <div className="min-w-max flex flex-col items-center space-y-6">
                {/* Cinema Screen Curved Bar */}
                <div className="w-full max-w-xl flex flex-col items-center">
                  <div className="w-full h-2 rounded-[100%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50" />
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400 mt-2">
                    SCREEN THIS WAY
                  </span>
                </div>

                {/* Seat Rows */}
                <div className="space-y-2">
                  {groupedRows.map(({ rowNumber, rowSeats }) => (
                    <div key={rowNumber} className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                        {rowNumber}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rowSeats.map((seat) => {
                          let typeBadge = 'border-white/10 bg-slate-900 text-slate-200';
                          if (seat.seatType === 'VIP') {
                            typeBadge = 'border-amber-500/40 bg-amber-950/30 text-amber-300';
                          } else if (seat.seatType === 'PREMIUM') {
                            typeBadge = 'border-blue-500/40 bg-blue-950/30 text-blue-300';
                          } else if (seat.seatType === 'RECLINER') {
                            typeBadge = 'border-purple-500/40 bg-purple-950/30 text-purple-300';
                          }

                          return (
                            <div
                              key={seat.seatUuid}
                              className={`group relative px-2.5 py-1.5 rounded-lg border text-center transition-all ${typeBadge}`}
                              title={`Row ${seat.rowNumber} Seat ${seat.seatNumber} (${seat.seatType})`}
                            >
                              <div className="font-bold text-[11px] leading-tight">
                                {seat.rowNumber}{seat.seatNumber}
                              </div>
                              <div className="text-[8px] uppercase tracking-wider opacity-70">
                                {seat.seatType}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteSeat(seat.seatUuid, `${seat.rowNumber}${seat.seatNumber}`)}
                                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] shadow hover:bg-rose-500"
                                title="Delete Seat"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <span className="w-6 text-center text-xs font-bold text-slate-400 shrink-0">
                        {rowNumber}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-amber-500/40 bg-amber-950/40" />
                    <span>VIP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-blue-500/40 bg-blue-950/40" />
                    <span>PREMIUM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-purple-500/40 bg-purple-950/40" />
                    <span>RECLINER</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-white/10 bg-slate-900" />
                    <span>REGULAR</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                No seats added yet. Use "Auto-Generate Grid" to instantly populate a layout (e.g. 10 rows × 18 seats = 180 seats).
              </div>
            )}
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
        onClose={() => !submitting && setIsAutoGenerateModalOpen(false)}
        title="Auto-Generate Standard Seat Grid"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Auto-generate seats for <strong>{selectedScreen?.name}</strong> (Capacity:{' '}
            <strong className="text-white">{selectedScreen?.totalSeats || 'N/A'}</strong>). Row A will be assigned VIP, Rows B-C Premium, and remaining rows Regular.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Rows (1-26, e.g. 10 = A-J)
              </label>
              <input
                type="number"
                min="1"
                max="26"
                value={genRows}
                disabled={submitting}
                onChange={(e) => setGenRows(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seats per Row (1-50, e.g. 18)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={genSeatsPerRow}
                disabled={submitting}
                onChange={(e) => setGenSeatsPerRow(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-white/10">
            <span className="text-slate-300">
              Total to generate: <strong className="text-amber-400 font-bold">{genRows * genSeatsPerRow}</strong> seats
            </span>
            {selectedScreen?.totalSeats && genRows * genSeatsPerRow > selectedScreen.totalSeats && (
              <span className="text-rose-400 font-semibold text-[11px]">
                Exceeds capacity ({selectedScreen.totalSeats})
              </span>
            )}
          </div>

          {seats.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/10 text-xs space-y-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={replaceExistingSeats}
                  disabled={submitting}
                  onChange={(e) => setReplaceExistingSeats(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span>Replace existing {seats.length} configured seats</span>
              </label>
              <p className="text-[10px] text-slate-500 pl-5">
                {replaceExistingSeats
                  ? 'Existing seats will be cleared and replaced with this fresh layout.'
                  : 'Existing seats will be preserved; only missing seats will be created.'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsAutoGenerateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting || (selectedScreen?.totalSeats && genRows * genSeatsPerRow > selectedScreen.totalSeats)}
              onClick={handleBulkGenerateSeats}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>{submitting ? 'Generating...' : 'Generate Layout'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScreenManager;
