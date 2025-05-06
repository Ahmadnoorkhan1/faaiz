import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';

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
  email: string;
  role: string;
  userRoles: {
    role: Role;
  }[];
}

// Dummy data for UI preview
const DUMMY_ROLES: Role[] = [
  {
    id: 'r1',
    name: 'Admin',
    description: 'Full system access',
    permissions: [
      { permission: { id: 'p1', name: 'Manage Users', type: 'WRITE', resource: 'User' } },
      { permission: { id: 'p2', name: 'View Reports', type: 'READ', resource: 'Reports' } }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'r2',
    name: 'Consultant',
    description: 'Can manage assigned tasks',
    permissions: [
      { permission: { id: 'p3', name: 'View Tasks', type: 'READ', resource: 'Tasks' } }
    ],
    createdAt: new Date().toISOString()
  }
];

const DUMMY_USERS: User[] = [
  { id: 'u1', email: 'alice@example.com', role: 'Admin', userRoles: [{ role: DUMMY_ROLES[0] }] },
  { id: 'u2', email: 'bob@example.com', role: 'Consultant', userRoles: [{ role: DUMMY_ROLES[1] }] }
];

// Dummy flat permissions list for new-role form & direct assignment
const DUMMY_PERMISSIONS = DUMMY_ROLES.reduce(
  (acc, role) => [...acc, ...role.permissions],
  [] as Role['permissions']
);

const RoleManagement: React.FC = () => {
  // States for creating roles and direct permission assignment
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState<{ name: string; description: string; permissions: string[] }>({ name: '', description: '', permissions: [] });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  // Initialize with dummy data
  const [roles, setRoles] = useState<Role[]>(DUMMY_ROLES);
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Commented out real API calls for dummy preview
        // const [rolesResponse, usersResponse] = await Promise.all([
        //   api.get('/api/roles'),
        //   api.get('/api/consultants')
        // ]);
        // setRoles(rolesResponse.data.data || []);
        // setUsers(usersResponse.data.data || []);
        // Load dummy data instead
        setRoles(DUMMY_ROLES);
        setUsers(DUMMY_USERS);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dummy data:', err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserSelect = async (userId: string) => {
    setSelectedUser(userId);
    setSelectedRoles([]);

    try {
      // Get user roles
      // Commented out real API call
      // const response = await api.get(`/api/roles/users/${userId}/roles`);
      // const userRoles = response.data.data || [];
      // setSelectedRoles(userRoles.map((userRole: any) => userRole.role.id));
      // Use dummy userRoles
      const user = DUMMY_USERS.find(u => u.id === userId);
      setSelectedRoles(user?.userRoles.map(ur => ur.role.id) || []);
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
      // For each selected role, check if it's already assigned
      const user = users.find(u => u.id === selectedUser);
      const existingRoleIds = user?.userRoles?.map(ur => ur.role.id) || [];

      // Add new roles
      const rolesToAdd = selectedRoles.filter(roleId => !existingRoleIds.includes(roleId));
      
      // Remove roles
      const rolesToRemove = existingRoleIds.filter(roleId => !selectedRoles.includes(roleId));

      // Perform operations
      await Promise.all([
        ...rolesToAdd.map(roleId => 
          api.post(`/api/roles/users/${selectedUser}/roles`, { roleId })
        ),
        ...rolesToRemove.map(roleId => 
          api.delete(`/api/roles/users/${selectedUser}/roles/${roleId}`)
        )
      ]);

      alert('Roles updated successfully');
    } catch (err) {
      console.error('Error updating roles:', err);
      setError('Failed to update roles. Please try again.');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          {/* Users Panel */}
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

          {/* Roles Panel */}
          <div className="md:col-span-2 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            {/* New Role Form */}
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
                <p className="text-gray-200 mb-1">Permissions</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {DUMMY_PERMISSIONS.map((p, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newRoleData.permissions.includes(p.permission.id)}
                        onChange={() => setNewRoleData(prev => ({
                          ...prev,
                          permissions: prev.permissions.includes(p.permission.id)
                            ? prev.permissions.filter(id => id !== p.permission.id)
                            : [...prev.permissions, p.permission.id]
                        }))}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-200">{p.permission.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setCreatingRole(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!newRoleData.name}
                    onClick={() => {
                      const id = 'r' + Date.now();
                      const newPerms = DUMMY_PERMISSIONS.filter(p => newRoleData.permissions.includes(p.permission.id));
                      const roleObj: Role = {
                        id,
                        name: newRoleData.name,
                        description: newRoleData.description,
                        permissions: newPerms,
                        createdAt: new Date().toISOString()
                      };
                      setRoles(prev => [...prev, roleObj]);
                      setCreatingRole(false);
                      setNewRoleData({ name: '', description: '', permissions: [] });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save Role
                  </button>
                </div>
              </div>
            )}
            {/* Roles Overview Table */}
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
            {/* Direct Permissions Panel for users without roles */}
            {selectedUser && selectedRoles.length === 0 && (
              <div className="bg-[#242935] p-4 rounded-lg mb-6">
                <p className="text-gray-200 mb-2">Permissions Only</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DUMMY_PERMISSIONS.map((p, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p.permission.id)}
                        onChange={() => setSelectedPermissions(prev => prev.includes(p.permission.id) ? prev.filter(id => id !== p.permission.id) : [...prev, p.permission.id])}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-200">{p.permission.name}</span>
                    </label>
                  ))}
                </div>
                <button onClick={() => alert('Permissions assigned')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Save Permissions
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