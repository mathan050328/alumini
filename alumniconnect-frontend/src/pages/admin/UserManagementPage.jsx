import React, { useState, useEffect } from 'react';
import { FiEdit2, FiLock, FiUnlock, FiTrash2 } from 'react-icons/fi';
import { getUsers, suspendUser, activateUser } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'suspend' or 'activate'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter
      });
      const data = response.data || {};
      const list = Array.isArray(data) ? data : (data.content || data.users || []);
      setUsers(list);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const openConfirmDialog = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      if (actionType === 'suspend') {
        await suspendUser(selectedUser._id || selectedUser.id);
        toast.success(`User ${selectedUser.firstName} suspended successfully`);
      } else if (actionType === 'activate') {
        await activateUser(selectedUser._id || selectedUser.id);
        toast.success(`User ${selectedUser.firstName} activated successfully`);
      }
      
      // Update local state to reflect change without full reload if possible
      setUsers(users.map(u => {
        if ((u._id || u.id) === (selectedUser._id || selectedUser.id)) {
          return { ...u, status: actionType === 'suspend' ? 'Suspended' : 'Active' };
        }
        return u;
      }));
      
    } catch (error) {
      toast.error(`Failed to ${actionType} user`);
      console.error(error);
    } finally {
      setActionLoading(false);
      setIsConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case ROLES.ADMIN: return 'danger';
      case ROLES.ALUMNI: return 'primary';
      case ROLES.STUDENT: return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search users by name or email..." 
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="">All Roles</option>
            <option value={ROLES.STUDENT}>Student</option>
            <option value={ROLES.ALUMNI}>Alumni</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover bg-gray-100" src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName || '') + ' ' + (user.lastName || ''))}&background=random`} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'Suspended' ? 'danger' : 'success'}>
                        {user.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== ROLES.ADMIN && (
                        <>
                          {user.status === 'Suspended' ? (
                            <button
                              onClick={() => openConfirmDialog(user, 'activate')}
                              className="text-green-600 hover:text-green-900 mx-2"
                              title="Activate User"
                            >
                              <FiUnlock className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirmDialog(user, 'suspend')}
                              className="text-red-600 hover:text-red-900 mx-2"
                              title="Suspend User"
                            >
                              <FiLock className="h-5 w-5" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && users.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={`${actionType === 'suspend' ? 'Suspend' : 'Activate'} User`}
        message={`Are you sure you want to ${actionType} ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
        confirmText={actionType === 'suspend' ? 'Suspend' : 'Activate'}
        confirmVariant={actionType === 'suspend' ? 'danger' : 'success'}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default UserManagementPage;
