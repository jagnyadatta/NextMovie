import React, { useState } from 'react';
import movieApi from '../../api/movieApi';
import Modal from '../common/Modal';
import { FiPlus, FiDownload, FiTrash2, FiStar, FiClock, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatDuration } from '../../utils/formatters';

const POPULAR_IMDB_SUGGESTIONS = [
  { title: 'Inception', id: 'tt1375666' },
  { title: 'The Dark Knight', id: 'tt0468569' },
  { title: 'Interstellar', id: 'tt0816692' },
  { title: 'Oppenheimer', id: 'tt15398776' },
  { title: 'Avengers: Endgame', id: 'tt4154796' },
  { title: 'RRR', id: 'tt8178634' },
];

export const MovieManager = ({ movies = [], onRefresh }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imdbId, setImdbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Custom movie form state
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    rated: 'PG-13',
    released: new Date().toISOString().split('T')[0],
    runtime: 140,
    genre: 'Action, Sci-Fi, Drama',
    director: '',
    writer: '',
    actors: '',
    plot: '',
    language: 'English',
    country: 'United States',
    poster: '',
    imdbRating: 8.5,
  });

  const handleImport = async (e) => {
    e.preventDefault();
    if (!imdbId.trim()) {
      toast.error('Please enter an IMDb ID (e.g. tt1375666)');
      return;
    }
    setLoading(true);
    try {
      await movieApi.importFromOmdb(imdbId.trim());
      toast.success('Movie imported from OMDb successfully!');
      setIsImportModalOpen(false);
      setImdbId('');
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to import movie');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Movie title is required');
      return;
    }
    setLoading(true);
    try {
      await movieApi.create({
        ...formData,
        year: Number(formData.year),
        runtime: Number(formData.runtime),
        imdbRating: Number(formData.imdbRating),
      });
      toast.success('Movie created successfully!');
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieUuid, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await movieApi.delete(movieUuid);
      toast.success(`Deleted "${title}"`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete movie');
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search filter */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter movies..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all"
          >
            <FiDownload className="text-sm" />
            <span>Import from IMDb</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all"
          >
            <FiPlus className="text-sm" />
            <span>Add Custom Movie</span>
          </button>
        </div>
      </div>

      {/* Movies Table */}
      <div className="glass-panel-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Year & Lang</th>
                <th className="py-3.5 px-4">Genre</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Runtime</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMovies.map((m) => (
                <tr key={m.movieUuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                        alt={m.title}
                        className="w-9 h-12 rounded object-cover bg-slate-800 shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-xs">{m.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.director || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div>{m.year || '2025'}</div>
                    <div className="text-[10px] text-slate-400">{m.language || 'English'}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">{m.genre || 'Action'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <FiStar className="text-[10px]" /> {m.imdbRating || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{formatDuration(m.runtime)}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(m.movieUuid, m.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Movie"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMovies.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No movies found. Click "Import from IMDb" or "Add Custom Movie" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Import from IMDb */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Movie from IMDb"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleImport} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter any valid IMDb ID (starting with "tt"). NextMovie will fetch all details, high-res posters, plot, cast, and ratings directly via OMDb!
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              IMDb ID
            </label>
            <input
              type="text"
              value={imdbId}
              onChange={(e) => setImdbId(e.target.value)}
              placeholder="e.g. tt1375666"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Quick preset suggestions */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_IMDB_SUGGESTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setImdbId(item.id)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {item.title} ({item.id})
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              <span>Import Movie</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Custom Movie */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Custom Movie"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateCustom} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Genre
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                placeholder="Action, Sci-Fi"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Runtime (minutes)
              </label>
              <input
                type="number"
                value={formData.runtime}
                onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                IMDb Rating (e.g. 8.6)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.imdbRating}
                onChange={(e) => setFormData({ ...formData, imdbRating: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Poster URL
            </label>
            <input
              type="url"
              value={formData.poster}
              onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Plot Synopsis
            </label>
            <textarea
              rows={3}
              value={formData.plot}
              onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
            />
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
              <span>Save Movie</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MovieManager;
