import React, { useState } from 'react';
import theatreApi from '../../api/theatreApi';
import Modal from '../common/Modal';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiMapPin, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

export const TheatreManager = ({ theatres = [], onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    latitude: 19.076,
    longitude: 72.8777,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Theatre name and address are required');
      return;
    }

    // Backend validates 6-digit Indian pincode
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      toast.error('Pincode must be a valid 6-digit Indian PIN code (e.g. 400001)');
      return;
    }

    setLoading(true);
    try {
      await theatreApi.create({
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      });
      toast.success('Theatre created successfully!');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        latitude: 19.076,
        longitude: 72.8777,
      });
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to create theatre');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (theatreUuid, currentStatus) => {
    try {
      await theatreApi.updateStatus(theatreUuid, !currentStatus);
      toast.success('Theatre status updated');
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update theatre status');
    }
  };

  const handleDelete = async (theatreUuid, name) => {
    if (!window.confirm(`Are you sure you want to delete theatre "${name}"?`)) return;
    try {
      await theatreApi.delete(theatreUuid);
      toast.success(`Deleted theatre "${name}"`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete theatre');
    }
  };

  const filteredTheatres = theatres.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.city?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search theatres or city..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all"
        >
          <FiPlus className="text-sm" />
          <span>Add New Theatre</span>
        </button>
      </div>

      {/* Theatres Table */}
      <div className="glass-panel-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Theatre Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">State & PIN</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTheatres.map((t) => (
                <tr key={t.theatreUuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                    {t.name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <FiMapPin className="text-red-400 text-xs shrink-0" />
                      <span>{t.city}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">
                      {t.address}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>{t.state}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.pincode}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(t.theatreUuid, t.active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        t.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-700/30 text-slate-400 border-slate-600/30'
                      }`}
                    >
                      {t.active ? <FiToggleRight className="text-sm" /> : <FiToggleLeft className="text-sm" />}
                      <span>{t.active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(t.theatreUuid, t.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Theatre"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTheatres.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No theatres found. Click "Add New Theatre" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Theatre Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Cinema Theatre"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Theatre Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. PVR ICON: Phoenix Palladium"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 462, Senapati Bapat Marg, Lower Parel"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pincode (6 digits) *
              </label>
              <input
                type="text"
                required
                pattern="^[1-9][0-9]{5}$"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="400001"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Create Theatre</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TheatreManager;
