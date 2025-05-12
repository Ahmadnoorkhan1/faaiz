import React, { useState, useEffect } from 'react';
import api, { get, post, update, remove } from '../../service/apiService';
import { toast } from 'react-hot-toast';

interface Permission {
  id: string;
  name: string;
  type: string;
  resource: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    permission: {
      id: string;
      name: string;
      type: string;
      resource: string;
    }
  }[];
  createdAt: string;
}

interface User {
  id: string;
  userId: string;
  email: string;
  role: string;
  userRoles: {
    role: Role;
  }[];
}

const RoleManagement: React.FC = () => {
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState<{ name: string; description: string; permissions: string[] }>({ name: '', description: '', permissions: [] });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles, users and permissions
        const [rolesResponse, consultantResponse,clientResponse, permissionsResponse] = await Promise.all([
          get('/api/roles'),
          get('/api/consultants'),
          get('/api/clients'),
          get('/api/permissions')
        ] as any);
        
        // Log responses for debugging
        console.log('Roles API response:', rolesResponse);
        console.log('Consultants API response:', consultantResponse);
        console.log('Clients API response:', clientResponse);
        console.log('Permissions API response:', permissionsResponse);
        
        if (Array.isArray(rolesResponse?.data)) {
          setRoles(rolesResponse.data);
          toast.success(`Successfully loaded ${rolesResponse.data.length} roles`);
        } else {
          console.warn('Roles API returned unexpected format:', rolesResponse);
          toast.error('Roles data has an unexpected format');
          setRoles([]);
        }

        
        if (Array.isArray(consultantResponse?.data) && Array.isArray(clientResponse?.data)) {
          const consultantUsers = consultantResponse.data.map((item:any)=>item.user)
          const clientUsers = clientResponse.data.map((item:any)=>item.user);
          setUsers([...consultantUsers, ...clientUsers]);
          toast.success(`Successfully loaded ${consultantResponse.data.length} users`);
        } else {
          console.warn('Users API returned unexpected format:', consultantResponse);
          toast.error('Users data has an unexpected format');
          setUsers([]);
        }
        
        if (Array.isArray(permissionsResponse?.data)) {
          setPermissions(permissionsResponse.data);
          toast.success(`Successfully loaded ${permissionsResponse.data.length} permissions`);
        } else {
          console.warn('Permissions API returned unexpected format:', permissionsResponse);
          toast.error('Permissions data has an unexpected format');
          setPermissions([]);
        }
        
        setLoading(false);
        toast.dismiss();
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group permissions by resource for better organization
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    setSelectedRoles([]);

    try {
      const response = await get(`/api/roles/users/${userId}/roles`) as any;
      setSelectedRoles(response.data.map((userRole: any) => userRole.roleId));
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError('Failed to load user roles. Please try again.');
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      const currentRolesResponse = await get(`/api/roles/users/${selectedUser}/roles`) as any;
      const currentRoleIds = currentRolesResponse.data.map((role: any) => role.roleId);
      
      const rolesToAdd = selectedRoles.filter(roleId => !currentRoleIds.includes(roleId));
      const rolesToRemove = currentRoleIds.filter((roleId:any) => !selectedRoles.includes(roleId));
      
      for (const roleId of rolesToAdd) {
        await post('/api/roles/assign', { userId: selectedUser, roleId });
      }
      
      for (const roleId of rolesToRemove) {
        await post('/api/roles/remove', { userId: selectedUser, roleId });
      }
      
      toast.success('Roles updated successfully');
    } catch (err) {
      console.error('Error updating roles:', err);
      toast.error('Failed to update roles. Please try again.');
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await post('/api/roles', {
        name: newRoleData.name,
        description: newRoleData.description,
        permissions: newRoleData.permissions
      }) as any;
      
      setRoles([...roles, response.data]);
      setCreatingRole(false);
      setNewRoleData({ name: '', description: '', permissions: [] });
      toast.success('Role created successfully');
    } catch (err) {
      console.error('Error creating role:', err);
      toast.error('Failed to create role. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => 
   user && user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      selectedUser === user.id ? 'bg-blue-600 text-white' : 'bg-[#242935] text-gray-200 hover:bg-[#2e3446]'
                    }`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="font-medium">{user.email}</div>
                    <div className={`text-xs ${selectedUser === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {user.role}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No users found. Try adjusting your search.
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
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
                
                {Object.keys(permissionsByResource).length > 0 ? (
                  <>
                    <p className="text-gray-200 mb-2">Permissions</p>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {Object.entries(permissionsByResource).map(([resource, perms]) => (
                        <div key={resource} className="mb-3">
                          <h4 className="text-sm font-semibold text-blue-400 mb-2 uppercase">{resource}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {perms.map(permission => (
                              <label key={permission.id} className="flex items-start space-x-2 bg-[#1a1f2b] p-2 rounded-md">
                                <input
                                  type="checkbox"
                                  checked={newRoleData.permissions.includes(permission.id)}
                                  onChange={() => setNewRoleData(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.includes(permission.id)
                                      ? prev.permissions.filter(id => id !== permission.id)
                                      : [...prev.permissions, permission.id]
                                  }))}
                                  className="h-4 w-4 mt-0.5 text-blue-600 rounded"
                                />
                                <div>
                                  <div className="text-gray-200 text-sm">{permission.name}</div>
                                  {permission.description && (
                                    <div className="text-gray-400 text-xs">{permission.description}</div>
                                  )}
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
                    No permissions available. Please create permissions first.
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setCreatingRole(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!newRoleData.name}
                    onClick={handleCreateRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save Role
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full text-gray-200">
                <thead className="bg-[#242935]">
                  <tr>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} className="border-t border-gray-600">
                      <td className="px-4 py-2">{role.name}</td>
                      <td className="px-4 py-2">{role.description}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm, i) => (
                            <span key={i} className="bg-blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs">
                              {perm.permission.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2 className="text-lg font-medium text-gray-200 mb-4">Assign Roles</h2>
            {selectedUser ? (
              <>
                <div className="text-gray-400 mb-4">
                  Select roles for <span className="text-blue-400">{users.find(u => u.id === selectedUser)?.email}</span>
                </div>
                <div className="space-y-3 mb-6">
                  {roles.map(role => (
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
                              <p className="text-gray-400 text-xs mb-1">Permissions:</p>
                              <div className="flex flex-wrap gap-2">
                                {role.permissions.map((perm, idx) => (
                                  <span 
                                    key={idx}
                                    className="bg-blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs"
                                  >
                                    {perm.permission.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveRoles}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Select a user to manage roles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;