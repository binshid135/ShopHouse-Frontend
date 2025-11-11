"use client";
import { useEffect, useState } from 'react';
import { Eye, Search, Filter, RefreshCw, User, Mail, Phone, MapPin, Calendar, Shield, Ban, CheckCircle, Edit, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

interface UserDetail extends User {
  orders?: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const roleOptions = [
    { value: 'all', label: 'All Roles', color: 'gray' },
    { value: 'customer', label: 'Customer', color: 'blue' },
    { value: 'admin', label: 'Admin', color: 'red' },
    { value: 'moderator', label: 'Moderator', color: 'purple' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'red' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Enhance users with additional data
        const enhancedUsers = await Promise.all(
          data.map(async (user: User) => {
            const stats = await getUserStats(user.id);
            return { ...user, ...stats };
          })
        );
        setUsers(enhancedUsers);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
    return { orderCount: 0, totalSpent: 0 };
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchUsers(); // Refresh users list
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, isActive } : null);
        }
        if (editingUser?.id === userId) {
          setEditingUser(prev => prev ? { ...prev, isActive } : null);
        }
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Error updating user status');
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, role } : null);
        }
        if (editingUser?.id === userId) {
          setEditingUser(prev => prev ? { ...prev, role } : null);
        }
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Error updating user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!editingUser) return;

    setUpdatingUser(editingUser.id);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          updatedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchUsers();
        if (selectedUser?.id === editingUser.id) {
          setSelectedUser(prev => prev ? { ...prev, ...userData } : null);
        }
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Error updating user');
    } finally {
      setUpdatingUser(null);
    }
  };

 const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user? This will deactivate their account.')) {
    return;
  }

  setUpdatingUser(userId);
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    console.log('Delete response:', result);

    if (response.ok) {
      fetchUsers(); // Refresh users list
      if (selectedUser?.id === userId) {
        setShowUserModal(false);
        setSelectedUser(null);
      }
      alert('User successfully deleted');
    } else {
      alert(`Failed to delete user: ${result.error}${result.details ? ` - ${result.details}` : ''}`);
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    alert('Error deleting user');
  } finally {
    setUpdatingUser(null);
  }
};

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'customer': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery)) ||
      (user.address && user.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = roleOptions.find(opt => opt.value === role);
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(role)} flex items-center gap-1 w-fit`}>
        {getRoleIcon(role)}
        {roleConfig?.label || role}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(isActive)} flex items-center gap-1 w-fit`}>
        {isActive ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600">Manage and monitor user accounts</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'customer').length}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, phone, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        {user.orderCount || 0} orders
                      </div>
                      <div className="text-gray-500">
                        ${(user.totalSpent || 0).toFixed(2)} spent
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => fetchUserDetails(user.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  User Details
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedUser.name}</p>
                        <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">{selectedUser.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role:
                      </label>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(selectedUser.role)}
                        <select
                          value={selectedUser.role}
                          onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                          disabled={updatingUser === selectedUser.id}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                        >
                          <option value="customer">Customer</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status:
                      </label>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedUser.isActive)}
                        <button
                          onClick={() => updateUserStatus(selectedUser.id, !selectedUser.isActive)}
                          disabled={updatingUser === selectedUser.id}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            selectedUser.isActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } transition-colors`}
                        >
                          {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined: {formatDateTime(selectedUser.createdAt)}</span>
                      </div>
                      {selectedUser.updatedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Last updated: {formatDateTime(selectedUser.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">User Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{selectedUser.orderCount || 0}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">${(selectedUser.totalSpent || 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {selectedUser.orderCount ? `$${((selectedUser.totalSpent || 0) / selectedUser.orderCount).toFixed(2)}` : '$0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Avg. Order Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.floor((new Date().getTime() - new Date(selectedUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-gray-600">Days as Member</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders (if available) */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Orders</h3>
                  <div className="space-y-3">
                    {selectedUser.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">{order.itemCount} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  disabled={updatingUser === selectedUser.id}
                  className="flex items-center gap-2 px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingUser(selectedUser);
                      setShowUserModal(false);
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUser({
                    name: editingUser.name,
                    email: editingUser.email,
                    phone: editingUser.phone,
                    address: editingUser.address
                  })}
                  disabled={updatingUser === editingUser.id}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {updatingUser === editingUser.id ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}