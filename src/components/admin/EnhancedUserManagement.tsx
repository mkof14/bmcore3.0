import { useMemo, useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, CheckCircle, Calendar, Filter, Download, Shield, UserPlus, Edit, Trash2, Mail, Lock, Eye, EyeOff, Key, Ban, X, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminDb } from '../../lib/adminApi';
import StateCard from '../ui/StateCard';
import ErrorBanner from '../ui/ErrorBanner';
import SuccessBanner from '../ui/SuccessBanner';
import ModalShell from '../ui/ModalShell';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newThisMonth: number;
  admins: number;
  regularUsers: number;
}

interface UserDetail {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  roles?: any[];
  created_at: string;
  updated_at?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function EnhancedUserManagement() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
    admins: 0,
    regularUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admins' | 'regular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetail | null>(null);
  const [managingRolesUser, setManagingRolesUser] = useState<UserDetail | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user' as 'super_admin' | 'admin' | 'user' | 'tester' | 'guest',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const mapEdgeError = (data: any, fallback: string) => {
    const code = data?.code;
    if (code === 'UNAUTHORIZED') return 'Authentication required';
    if (code === 'FORBIDDEN') return 'Permission denied. Admin access required.';
    return data?.error || fallback;
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersResult, rolesResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('roles').select('*')
      ]);

      if (usersResult.error) throw usersResult.error;
      if (rolesResult.error) throw rolesResult.error;

      const userData = usersResult.data || [];
      setUsers(userData);
      setRoles(rolesResult.data || []);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const calculatedStats: UserStats = {
        totalUsers: userData.length,
        activeUsers: userData.length,
        newThisMonth: userData.filter(u => new Date(u.created_at) >= thisMonthStart).length,
        admins: userData.filter(u => u.is_admin).length,
        regularUsers: userData.filter(u => !u.is_admin).length,
      };

      setStats(calculatedStats);
    } catch (error) {
      setError('User data load failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (filter === 'admins') {
      filtered = users.filter(u => u.is_admin);
    } else if (filter === 'regular') {
      filtered = users.filter(u => !u.is_admin);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.email?.toLowerCase().includes(query) ||
        u.full_name?.toLowerCase().includes(query) ||
        u.first_name?.toLowerCase().includes(query) ||
        u.last_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, filter, searchQuery]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      if (!newUser.email || !newUser.password) {
        throw new Error('Email and password are required');
      }

      if (newUser.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Authentication required');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-user-create`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          full_name: newUser.full_name,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          phone: newUser.phone,
          role: newUser.role,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(mapEdgeError(data, 'User create failed'));
      }

      await loadData();
      setSelectedUsers(new Set());

      setSuccess(`User created: ${newUser.email}`);

      setNewUser({
        email: '',
        password: '',
        full_name: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'user',
      });
    } catch (err: any) {
      setError(err.message || 'User create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean, userEmail: string) => {
    if (!confirm(`${currentAdminStatus ? 'Remove admin rights from' : 'Grant admin rights to'} ${userEmail}?`)) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Authentication required');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-user-toggle-admin`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, is_admin: !currentAdminStatus }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(mapEdgeError(data, 'Admin access update failed'));
      }

      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setSuccess(`Admin access ${!currentAdminStatus ? 'granted' : 'removed'}: ${userEmail}`);
      setError('');
      loadData();
    } catch (error) {
      setError('Admin access update failed');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setSuccess('');

    try {
      const result = await adminDb({
        table: 'profiles',
        action: 'update',
        data: {
          full_name: editingUser.full_name,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          phone: editingUser.phone,
          bio: editingUser.bio,
          updated_at: new Date().toISOString(),
        },
        match: { id: editingUser.id },
      });

      if (!result.ok) throw new Error(result.error || 'User update failed');

      setSuccess('User updated');
      setTimeout(() => {
        setShowEditModal(false);
        setEditingUser(null);
        setSuccess('');
        loadData();
      }, 2000);
    } catch (error) {
      setError('User update failed');
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (!confirm(`Send password reset email to ${userEmail}?`)) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(`Password reset email sent: ${userEmail}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Password reset email failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ PERMANENTLY DELETE user ${userEmail}?\n\nThis will:\n- Delete their account\n- Remove all their data\n- Cannot be undone\n\nType "DELETE" to confirm`)) {
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Authentication required');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-user-delete`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || data?.ok === false) {
        throw new Error(mapEdgeError(data, 'User delete failed'));
      }

      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setSuccess(`User deleted: ${userEmail}`);
      setError('');
      loadData();
    } catch (error) {
      setError('User delete failed');
    }
  };

  const handleBulkExport = () => {
    if (selectedUsers.size === 0) {
      setError('Please select users first');
      return;
    }

    const selectedData = users.filter(u => selectedUsers.has(u.id));
    const csv = [
      ['Email', 'Full Name', 'First Name', 'Last Name', 'Phone', 'Admin', 'Created At'].join(','),
      ...selectedData.map(u => [
        u.email,
        u.full_name || '',
        u.first_name || '',
        u.last_name || '',
        u.phone || '',
        u.is_admin ? 'Yes' : 'No',
        new Date(u.created_at).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSuccess(`Exported ${selectedUsers.size} users`);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
  };

  const deselectAll = () => {
    setSelectedUsers(new Set());
  };

  const selectedCount = selectedUsers.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
          <Users className="h-7 w-7 text-blue-400" />
          User Management
        </h2>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Create User
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}
      {success && <SuccessBanner message={success} className="mb-4" />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-400" />
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.newThisMonth}</p>
          <p className="text-sm text-gray-600">New This Month</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <CheckCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
          <p className="text-sm text-gray-600">Administrators</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-green-400" />
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.regularUsers}</p>
          <p className="text-sm text-gray-600">Regular Users</p>
        </div>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users ({stats.totalUsers})</option>
                <option value="admins">Administrators ({stats.admins})</option>
                <option value="regular">Regular Users ({stats.regularUsers})</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedCount} selected</span>
                <button
                  onClick={handleBulkExport}
                  className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={deselectAll}
                  className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </>
            )}
            {selectedCount === 0 && filteredUsers.length > 0 && (
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Select All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <StateCard title="Loading users..." description="Fetching accounts and roles." />
        ) : filteredUsers.length === 0 ? (
          <StateCard
            title="No users found"
            description={searchQuery ? 'Try a different search term.' : 'No users are registered yet.'}
            icon={<Users className="h-10 w-10" />}
          />
        ) : (
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border transition-all ${
                  selectedUsers.has(user.id)
                    ? 'bg-blue-900/20 border-blue-600/50'
                    : 'bg-slate-50 border-slate-200 hover:border-gray-600/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900">{user.email}</h3>
                        {user.is_admin && (
                          <span className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-600/30 text-cyan-400 text-xs rounded-full flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.is_admin, user.email)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            user.is_admin
                              ? 'bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30'
                              : 'bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 hover:bg-cyan-600/30'
                          }`}
                          title={user.is_admin ? 'Remove Admin Rights' : 'Grant Admin Rights'}
                        >
                          {user.is_admin ? <Ban className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id, user.email)}
                          className="p-2 bg-yellow-600/20 border border-yellow-600/30 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Full Name</p>
                        <p className="text-gray-700">{user.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="text-gray-700">{user.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="text-gray-700">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">User ID</p>
                        <p className="text-gray-700 font-mono text-xs truncate">{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <ModalShell
          title="Create New User"
          icon={<UserPlus className="h-6 w-6 text-blue-400" />}
          onClose={() => setShowCreateModal(false)}
          panelClassName="max-w-2xl"
        >

            {error && <ErrorBanner message={error} className="mb-4" />}
            {success && <SuccessBanner message={success} className="mb-4" />}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => {
                      const firstName = e.target.value;
                      setNewUser({
                        ...newUser,
                        first_name: firstName,
                        full_name: `${firstName} ${newUser.last_name}`.trim()
                      });
                    }}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => {
                      const lastName = e.target.value;
                      setNewUser({
                        ...newUser,
                        last_name: lastName,
                        full_name: `${newUser.first_name} ${lastName}`.trim()
                      });
                    }}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (auto-filled)</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-fills from First + Last Name</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/90 border border-slate-200 rounded-lg shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  User Role & Privileges
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'super_admin', label: 'Super Admin', desc: 'Full system access', color: 'red' },
                    { value: 'admin', label: 'Administrator', desc: 'Admin panel access', color: 'cyan' },
                    { value: 'user', label: 'Regular User', desc: 'Standard member access', color: 'green' },
                    { value: 'tester', label: 'Beta Tester', desc: 'Testing features', color: 'purple' },
                    { value: 'guest', label: 'Guest', desc: 'Limited access', color: 'gray' },
                  ].map((roleOption) => (
                    <label
                      key={roleOption.value}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        newUser.role === roleOption.value
                          ? `bg-${roleOption.color}-900/30 border-${roleOption.color}-600 ring-2 ring-${roleOption.color}-500/50`
                          : 'bg-slate-50 border-slate-200 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleOption.value}
                        checked={newUser.role === roleOption.value}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                        className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{roleOption.label}</p>
                        <p className="text-xs text-gray-600">{roleOption.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setSuccess('');
                    setNewUser({
                      email: '',
                      password: '',
                      full_name: '',
                      first_name: '',
                      last_name: '',
                      phone: '',
                      role: 'user',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
        </ModalShell>
      )}

      {showEditModal && editingUser && (
        <ModalShell
          title={`Edit User: ${editingUser.email}`}
          icon={<Edit className="h-6 w-6 text-blue-400" />}
          onClose={() => setShowEditModal(false)}
          panelClassName="max-w-2xl"
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingUser.first_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.last_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editingUser.bio || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}
