import React, { useState, useEffect } from 'react';
import api, { get, post, update, remove } from '../../service/apiService';
import { toast } from 'react-hot-toast';

// Update the interface to match the actual permission structure
interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

interface PermissionCategory {
  name: string;  // This is the resource
  permission: string[];  // This contains the permission names
}

// Updated to match actual role structure from API
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  users: Array<{
    userId: string;
    roleId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organization: string;
  roles: string[];
}

// Interface for role assignment response
interface RoleAssignment {
  userId: string;
  roleId: string;
  createdAt: string;
  updatedAt: string;
  role: Role;
  user?: {
    id: string;
    email: string;
  };
}

const RoleManagement: React.FC = () => {
  // State declarations
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState<{ name: string; description: string; permissions: string[] }>({ 
    name: '', 
    description: '', 
    permissions: [] 
  });
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingRoles, setSavingRoles] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch roles and permissions
      try {
        const rolesResponse = await api.get('/api/roles');
        if (rolesResponse?.data?.success) {
          setRoles(rolesResponse.data.data || []);
        } else {
          console.warn('Roles API returned unexpected format:', rolesResponse);
          setRoles([]);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to fetch roles');
        setRoles([]);
      }
      
      try {
        const permissionsResponse = await api.get('/api/permissions/available');
        if (permissionsResponse?.data?.success) {
          // Normalize permission categories to always show resource/action
          const categories = (permissionsResponse.data.data || []).map((cat: PermissionCategory) => ({
            ...cat,
            permission: Array.isArray(cat.permission) ? cat.permission : []
          }));
          setPermissionCategories(categories);
        } else {
          console.warn('Permissions API returned unexpected format:', permissionsResponse);
          setPermissionCategories([]);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Failed to fetch permissions');
        setPermissionCategories([]);
      }

      // Now fetch users separately
      await fetchUsers();
      
      toast.dismiss();
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load role management data');
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users using the permissions users endpoint
  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/permissions/users');
      
      if (response?.data?.success) {
        const userData = response.data.data || [];
        setUsers(userData);
        setFilteredUsers(userData);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    }
  };

  const handleUserSelect = async (user: User) => {
    if (hasChanges && !window.confirm('You have unsaved changes. Discard them?')) {
      return;
    }

    try {
      setLoading(true);
      setSelectedUser(user);
      
      // Fetch user's current roles
      const response = await api.get(`/api/roles/users/${user.id}/roles`);
      
      if (response?.data?.success) {
        // The getUserRoles endpoint returns an array of role assignments
        const userRoleIds = response.data.data.map((roleAssignment: RoleAssignment) => roleAssignment.role.id);
        setSelectedRoles(userRoleIds);
        setHasChanges(false);
      } else {
        setSelectedRoles([]);
        toast.error('Failed to fetch user roles');
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Error loading user roles');
      setSelectedRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSelection = prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId];
        
      setHasChanges(true);
      return newSelection;
    });
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      setSavingRoles(true);
      toast.loading('Saving role assignments...');
      
      // Get current role assignments
      const currentRolesResponse = await api.get(`/api/roles/users/${selectedUser.id}/roles`);
      const currentRoleIds = currentRolesResponse?.data?.data?.map((item: RoleAssignment) => item.role.id) || [];
      
      // Determine roles to add and remove
      const rolesToAdd = selectedRoles.filter(roleId => !currentRoleIds.includes(roleId));
      const rolesToRemove = currentRoleIds.filter((roleId:any) => !selectedRoles.includes(roleId));
      
      // Process role changes
      let successCount = 0;
      
      // Add new roles
      for (const roleId of rolesToAdd) {
        try {
          const response = await api.post('/api/roles/assign', { 
            userId: selectedUser.id, 
            roleId 
          });
          
          if (response.data?.success) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error assigning role ${roleId}:`, error);
        }
      }
      
      // Remove roles
      for (const roleId of rolesToRemove) {
        try {
          const response = await api.post('/api/roles/remove', { 
            userId: selectedUser.id, 
            roleId 
          });
          
          if (response.data?.success) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error removing role ${roleId}:`, error);
        }
      }
      
      toast.dismiss();
      
      // Success feedback
      if (successCount === rolesToAdd.length + rolesToRemove.length) {
        toast.success(`Updated roles for ${selectedUser.email}`);
        
        // Update the user's roles in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, roles: selectedRoles.map(id => {
                  const role = roles.find(r => r.id === id);
                  return role ? role.name : '';
                }).filter(Boolean) }
              : user
          )
        );
      } else {
        console.warn(`Updated ${successCount} out of ${rolesToAdd.length + rolesToRemove.length} role changes`);
      }
      
      setHasChanges(false);
      
      // Refresh user roles to ensure we have the latest data
      await fetchUsers();
      if (selectedUser) {
        handleUserSelect(selectedUser);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error saving roles:', error);
      toast.error('Failed to update roles');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    try {
      toast.loading('Creating role...');
      
      const response = await api.post('/api/roles', {
        name: newRoleData.name,
        description: newRoleData.description,
        permissions: newRoleData.permissions
      });
      
      toast.dismiss();
      
      if (response.data?.success) {
        // Reset form
        setCreatingRole(false);
        setNewRoleData({ name: '', description: '', permissions: [] });
        toast.success(`Role "${newRoleData.name}" created successfully`);
        
        // Refresh roles data to ensure everything is in sync
        const updatedRolesResponse = await api.get('/api/roles');
        if (updatedRolesResponse.data?.success) {
          setRoles(updatedRolesResponse.data.data || []);
        }
      } else {
        toast.error(response.data?.message || 'Failed to create role');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error creating role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      toast.error(errorMessage);
    }
  };

  // Toggle permission in new role form
  const handleTogglePermission = (permissionName: string) => {
    setNewRoleData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(name => name !== permissionName)
        : [...prev.permissions, permissionName]
    }));
  };

  // Discard unsaved changes
  const handleDiscardChanges = () => {
    if (selectedUser) {
      handleUserSelect(selectedUser);
    }
  };

  // New function to handle role deletion
  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This will remove all associated permissions and role assignments.`)) {
      return;
    }

    try {
      toast.loading(`Deleting role "${roleName}"...`);
      
      const response = await api.delete(`/api/roles/${roleId}`);
      
      toast.dismiss();
      
      if (response.data?.success) {
        toast.success(`Role "${roleName}" deleted successfully`);
        
        // Remove the deleted role from the local state
        setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
        
        // If this role was selected for a user, remove it from selectedRoles
        if (selectedUser && selectedRoles.includes(roleId)) {
          setSelectedRoles(prev => prev.filter(id => id !== roleId));
          setHasChanges(true);
        }
      } else {
        toast.error(response.data?.message || 'Failed to delete role');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error deleting role:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Role Management</h1>
          <p className="text-gray-400 mt-1">Assign roles and permissions to users</p>
        </div>
        <button 
          onClick={() => setCreatingRole(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Role
        </button>
      </div>

      {loading && !selectedUser ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users panel */}
          <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-medium text-gray-200 mb-4">Users</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#242935] text-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'bg-[#242935] text-gray-200 hover:bg-[#2e3446]'
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="font-medium">{user.email}</div>
                    <div className="flex justify-between">
                      <div className={`text-xs ${selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {user.role}
                      </div>
                      {user.roles && user.roles.length > 0 && (
                        <div className="text-xs text-green-400">{user.roles.length} roles</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  {searchTerm ? "No users match your search." : "No users available."}
                </div>
              )}
            </div>
          </div>

          {/* Roles panel */}
          <div className="md:col-span-2 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            {/* Role creation form */}
            {creatingRole && (
              <div className="bg-[#242935] p-6 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-200 mb-4">New Role</h3>
                <input
                  type="text"
                  placeholder="Role Name"
                  value={newRoleData.name}
                  onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mb-2 bg-[#1a1f2b] text-gray-200 px-3 py-2 rounded-lg focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description"
                  value={newRoleData.description}
                  onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full mb-4 bg-[#1a1f2b] text-gray-200 px-3 py-2 rounded-lg focus:ring-blue-500"
                />
                
                {permissionCategories.length > 0 ? (
                  <>
                    <p className="text-gray-200 mb-2">Permissions</p>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {permissionCategories.map((category) => (
                        <div key={category.name} className="mb-3">
                          <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase">{category.name}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {category.permission.map((permissionName) => (
                              <label key={permissionName} className="flex items-start space-x-2 bg-[#1a1f2b] p-2 rounded-md">
                                <input
                                  type="checkbox"
                                  checked={newRoleData.permissions.includes(permissionName)}
                                  onChange={() => handleTogglePermission(permissionName)}
                                  className="h-4 w-4 mt-0.5 text-blue-600 rounded"
                                />
                                <div>
                                  <div className="text-gray-200 text-sm">{permissionName}</div>
                                  {/* Optionally show resource/action breakdown if needed */}
                                  {/* <div className="text-xs text-gray-400">{category.name} / {permissionName.split('.').pop()}</div> */}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No permissions available. Please define permissions first.
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setCreatingRole(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!newRoleData.name}
                    onClick={handleCreateRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save Role
                  </button>
                </div>
              </div>
            )}

            {/* Roles table */}
            {!creatingRole && !selectedUser && (
              <div className="overflow-x-auto mb-6">
                <h2 className="text-lg font-medium text-gray-200 mb-4">Available Roles</h2>
                <table className="min-w-full text-gray-200">
                  <thead className="bg-[#242935]">
                    <tr>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Permissions</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles?.length > 0 ? roles?.map(role => (
                      <tr key={role.id} className="border-t border-gray-700">
                        <td className="px-4 py-2">{role.name}</td>
                        <td className="px-4 py-2">{role.description || "-"}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                              role.permissions.map((perm, i) => (
                                <span key={i} className="bg-blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs">
                                  {perm}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="text-red-400 hover:text-red-500 transition-colors focus:outline-none"
                            title={`Delete ${role.name} role`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                          No roles have been created yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Role assignment */}
            {selectedUser && (
                <>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            if (hasChanges && !window.confirm('You have unsaved changes. Discard them?')) {
              return;
            }
            setSelectedUser(null);
          }}
          className="p-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors focus:outline-none"
          title="Back to roles"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-medium text-gray-200">
          Assign Roles for <span className="text-blue-400">{selectedUser.email}</span>
        </h2>
      </div>
      {hasChanges && (
        <div className="flex space-x-2">
          <button
            onClick={handleDiscardChanges}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSaveRoles}
            disabled={savingRoles || !hasChanges}
            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {savingRoles ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {roles.length > 0 ? roles.map(role => (
                      <div 
                        key={role.id}
                        className="bg-[#242935] p-4 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 pt-0.5">
                            <input
                              type="checkbox"
                              id={`role-${role.id}`}
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-[#1a1f2b] border-gray-600"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor={`role-${role.id}`} className="text-gray-200 font-medium cursor-pointer">
                              {role.name}
                            </label>
                            {role.description && (
                              <p className="text-gray-400 text-sm mt-1">{role.description}</p>
                            )}
                            {role.permissions && role.permissions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-gray-400 text-xs mb-1">Permissions ({role.permissions.length}):</p>
                                <div className="flex flex-wrap gap-2">
                                  {role.permissions.map((perm, idx) => (
                                    <span 
                                      key={idx}
                                      className="bg-blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-400">
                        No roles available to assign. Please create roles first.
                      </div>
                    )}
                  </div>
                )}
                
                {hasChanges && (
                  <div className="flex justify-end">
                    <button 
                      onClick={handleSaveRoles}
                      disabled={savingRoles}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {savingRoles ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Empty state */}
            {!creatingRole && !selectedUser && roles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p>No roles have been created yet</p>
                <button 
                  onClick={() => setCreatingRole(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Role
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 

export default RoleManagement;