import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiLock, FiUnlock, FiTrash2, FiUpload, FiDownload, FiFileText, FiCheckCircle, FiAlertTriangle, FiX, FiKey } from 'react-icons/fi';
import { getUsers, suspendUser, activateUser, resetUserPassword, deleteUser, bulkImportUsers, downloadUsersTemplate } from '../../api/adminApi';
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

  // Bulk Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: Math.max(0, currentPage - 1),
        size: itemsPerPage,
        search: searchTerm?.trim() || undefined,
        role: roleFilter || undefined
      });
      const data = response.data || {};
      let list = Array.isArray(data) ? data : (data.content || data.users || []);
      
      // Client-side safeguard filtering
      if (searchTerm?.trim()) {
        const q = searchTerm.toLowerCase().trim();
        list = list.filter(u => 
          (u.fullName || '').toLowerCase().includes(q) || 
          (u.email || '').toLowerCase().includes(q) ||
          (u.rollNumber || '').toLowerCase().includes(q)
        );
      }
      if (roleFilter) {
        list = list.filter(u => u.role === roleFilter || u.role === `ROLE_${roleFilter}`);
      }

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
      const displayName = selectedUser.fullName || selectedUser.firstName || 'User';
      if (actionType === 'suspend') {
        await suspendUser(selectedUser.id);
        toast.success(`User ${displayName} suspended successfully`);
      } else if (actionType === 'activate') {
        await activateUser(selectedUser.id);
        toast.success(`User ${displayName} activated successfully`);
      } else if (actionType === 'resetPassword') {
        await resetUserPassword(selectedUser.id);
        toast.success(`Password for ${displayName} reset to default (Password@123)`);
      } else if (actionType === 'delete') {
        await deleteUser(selectedUser.id);
        toast.success(`User ${displayName} deleted successfully`);
        setUsers(users.filter(u => u.id !== selectedUser.id));
        return;
      }
      
      // Update local state to reflect change without full reload if possible
      setUsers(users.map(u => {
        if (u.id === selectedUser.id) {
          return { 
            ...u, 
            isActive: actionType === 'activate',
            status: actionType === 'suspend' ? 'Suspended' : 'Active' 
          };
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

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadUsersTemplate();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_import_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV Template downloaded');
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);

    setImporting(true);
    setImportResult(null);
    try {
      const res = await bulkImportUsers(formData);
      setImportResult(res.data);
      if (res.data.createdCount > 0 && res.data.skippedCount > 0) {
        toast.info(`Import finished: ${res.data.createdCount} created, ${res.data.skippedCount} skipped.`);
      } else if (res.data.createdCount > 0) {
        toast.success(`Import complete! ${res.data.createdCount} user(s) created.`);
      } else {
        toast.warn(`No new users created. ${res.data.skippedCount} existing/duplicate records were skipped.`);
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage all students, alumni, and administrator accounts</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FiDownload className="w-4 h-4 text-gray-500" />
            Download CSV Template
          </button>
          <button
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <FiUpload className="w-4 h-4" />
            Bulk Import Users (CSV)
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search users by name, roll no, or email..." 
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
                    Roll No / College ID
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
                {users.map((user) => {
                  const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                  const avatar = user.profilePictureUrl || user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                  const isUserActive = user.isActive !== undefined ? user.isActive : (user.status !== 'Suspended');

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover bg-gray-100" src={avatar} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{displayName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.rollNumber ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {user.rollNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={!isUserActive ? 'danger' : 'success'}>
                          {!isUserActive ? 'Suspended' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role !== ROLES.ADMIN && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openConfirmDialog(user, 'resetPassword')}
                              className="text-amber-600 hover:text-amber-800 p-1 hover:bg-amber-50 rounded transition-colors"
                              title="Reset Password to Default (Password@123)"
                            >
                              <FiKey className="h-4 w-4" />
                            </button>
                            {!isUserActive ? (
                              <button
                                onClick={() => openConfirmDialog(user, 'activate')}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                                title="Activate User"
                              >
                                <FiUnlock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => openConfirmDialog(user, 'suspend')}
                                className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-50 rounded transition-colors"
                                title="Suspend User"
                              >
                                <FiLock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openConfirmDialog(user, 'delete')}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete User Account"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
        title={
          actionType === 'delete' ? 'Delete User Account' :
          (actionType === 'resetPassword' ? 'Reset User Password' :
          `${actionType === 'suspend' ? 'Suspend' : 'Activate'} User`)
        }
        message={
          actionType === 'delete'
            ? `Are you sure you want to permanently delete ${selectedUser?.fullName || selectedUser?.rollNumber || 'this user'}? All associated profile data will be permanently removed.`
            : (actionType === 'resetPassword'
              ? `Reset password for ${selectedUser?.fullName || selectedUser?.email} to default (Password@123)? The user will be required to create a new password on their next login.`
              : `Are you sure you want to ${actionType} ${selectedUser?.fullName || selectedUser?.email || 'this user'}?`)
        }
        confirmText={
          actionType === 'delete' ? 'Delete Permanently' :
          (actionType === 'resetPassword' ? 'Reset Password' :
          (actionType === 'suspend' ? 'Suspend' : 'Activate'))
        }
        confirmVariant={(actionType === 'suspend' || actionType === 'delete') ? 'danger' : (actionType === 'resetPassword' ? 'warning' : 'success')}
        isLoading={actionLoading}
      />

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <FiUpload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bulk Import Institutional Accounts</h3>
                <p className="text-xs text-gray-500">Upload college-issued CSV list of students & alumni</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 mb-4">
              <p className="font-semibold mb-1">Expected CSV columns:</p>
              <code className="block bg-white p-1.5 rounded border border-indigo-200 font-mono text-[11px]">
                rollNumber, fullName, email, role, department, graduationYear
              </code>
              <p className="mt-1 text-gray-600">
                Default password for all imported accounts will be <span className="font-semibold text-indigo-900">Password@123</span> (hashed with BCrypt). Users will be prompted to set their private password on their first login.
              </p>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer bg-gray-50 hover:bg-indigo-50/30 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImportFile(file);
                      setImportResult(null);
                    }
                  }}
                />
                <FiFileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                {importFile ? (
                  <div>
                    <p className="text-sm font-medium text-indigo-700">{importFile.name}</p>
                    <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Click to select CSV file</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop your exported Excel/CSV here</p>
                  </div>
                )}
              </div>

              {importResult && (
                <div className="bg-gray-50 border rounded-xl p-4 text-xs space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-green-700">✓ Created: {importResult.createdCount}</span>
                    <span className="text-amber-700">⚠️ Skipped / Duplicates: {importResult.skippedCount}</span>
                    <span className="text-gray-600">Total: {importResult.totalProcessed}</span>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="text-red-600 pt-1 border-t space-y-0.5">
                      <p className="font-semibold">Notes:</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                  {importResult.createdUsers?.length > 0 && (
                    <div className="text-gray-700 pt-1 border-t space-y-0.5">
                      <p className="font-semibold text-gray-900">Imported Users:</p>
                      {importResult.createdUsers.map((u, i) => (
                        <p key={i}>• {u}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!importFile || importing}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {importing ? 'Importing...' : 'Upload & Provision Accounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
