import React, { useState } from 'react';
import userApi from '../../api/userApi';
import { FiTrash2, FiShield, FiUserCheck, FiUserX, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

export const UserManager = ({ users = [], onRefresh }) => {
  const [updatingUuid, setUpdatingUuid] = useState(null);

  const handleRoleChange = async (userUuid, newRole) => {
    setUpdatingUuid(userUuid);
    try {
      await userApi.updateRole(userUuid, newRole);
      toast.success(`User role updated to ${newRole}`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setUpdatingUuid(null);
    }
  };

  const handleStatusChange = async (userUuid, currentStatus) => {
    setUpdatingUuid(userUuid);
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userApi.updateStatus(userUuid, newStatus);
      toast.success(`User status changed to ${newStatus}`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingUuid(null);
    }
  };

  const handleDelete = async (userUuid, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await userApi.deleteUser(userUuid);
      toast.success(`User "${name}" deleted`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Registered User Directory</h3>
          <p className="text-xs text-slate-400">
            Manage customer accounts, assign administrative privileges, and monitor account statuses.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.userUuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {u.userUuid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <FiMail className="text-slate-400 text-xs shrink-0" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <FiPhone className="text-slate-500 text-[10px]" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={u.role || 'USER'}
                      disabled={updatingUuid === u.userUuid}
                      onChange={(e) => handleRoleChange(u.userUuid, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-semibold text-amber-400 focus:outline-none focus:border-red-500"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="THEATER_ADMIN">THEATER_ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusChange(u.userUuid, u.status)}
                      disabled={updatingUuid === u.userUuid}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? <FiUserCheck /> : <FiUserX />}
                      <span>{u.status || 'ACTIVE'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(u.userUuid, u.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete User"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
