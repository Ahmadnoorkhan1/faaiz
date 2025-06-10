import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  organization: string;
  roles: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const UserManagement: React.FC = () => {
  // State declarations
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  // User form state
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    role: 'USER',
    roleIds: [] as string[]
  });

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
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch roles and users
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

      // Fetch users using the permissions/users endpoint since it returns formatted user data
      try {
        const usersResponse = await api.get('/api/permissions/users');
        if (usersResponse?.data?.success) {
          setUsers(usersResponse.data.data || []);
          setFilteredUsers(usersResponse.data.data || []);
        } else {
          console.warn('Users API returned unexpected format:', usersResponse);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load user management data');
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    
    try {
      setLoading(true);
      
      // Fetch user's current roles
      const response = await api.get(`/api/roles/users/${user.id}/roles`);
      
      if (response?.data?.success) {
        const userRoleIds = response.data.data.map((roleAssignment: any) => roleAssignment.role.id);
        
        setUserForm({
          email: user.email,
          password: '', // Don't populate password for security
          role: user.role,
          roleIds: userRoleIds
        });
        
        setSelectedRoles(userRoleIds);
        setIsCreatingUser(false);
      } else {
        toast.error('Failed to fetch user roles');
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Error loading user roles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateUserClick = () => {
    setSelectedUser(null);
    setUserForm({
      email: '',
      password: '',
      role: 'USER',
      roleIds: []
    });
    setIsCreatingUser(true);
  };

  const handleRoleToggle = (roleId: string) => {
    setUserForm(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCreateUser = async () => {
    try {
      if (!userForm.email || !userForm.password) {
        toast.error('Email and password are required');
        return;
      }
      
      setLoading(true);
      toast.loading('Creating user...');

      // Create a user with dynamic role assignment
      const response = await api.post('/api/users', {
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        roleIds: userForm.roleIds  // This will assign the selected roles to the user
      });

      toast.dismiss();
      if (response.data?.success) {
        toast.success('User created successfully');
        setIsCreatingUser(false);
        
        // Refresh user list
        fetchInitialData();
      } else {
        toast.error(response.data?.message || 'Failed to create user');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      toast.loading('Updating user...');

      const response = await api.put(`/api/users/${selectedUser.id}`, userForm);

      toast.dismiss();
      if (response.data?.success) {
        toast.success('User updated successfully');
        
        // Refresh user list
        fetchInitialData();
      } else {
        toast.error(response.data?.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || !window.confirm(`Are you sure you want to delete user ${selectedUser.email}? This cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      toast.loading('Deleting user...');

      const response = await api.delete(`/api/users/${selectedUser.id}`);

      toast.dismiss();
      if (response.data?.success) {
        toast.success('User deleted successfully');
        setSelectedUser(null);
        
        // Refresh user list
        fetchInitialData();
      } else {
        toast.error(response.data?.message || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">User Management</h1>
          <p className="text-gray-400 mt-1">Create and manage user accounts</p>
        </div>
        <button 
          onClick={handleCreateUserClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New User
        </button>
      </div>

      {loading && !selectedUser && !isCreatingUser ? (
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
                        {user.role || 'No role'}
                      </div>
                      {user.roles && user.roles.length > 0 && (
                        <div className="text-xs text-green-400">{user.roles.length} custom roles</div>
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

          {/* User form panel */}
          <div className="md:col-span-2 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            {isCreatingUser ? (
              <div>
                <h2 className="text-lg font-medium text-gray-200 mb-4">Create New User</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-300 mb-1">Password</label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-gray-300 mb-1">Base Role</label>
                    <select
                      id="role"
                      name="role"
                      value={userForm.role}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CONSULTANT">Consultant</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>

                  {roles.length > 0 && (
                    <div>
                      <label className="block text-gray-300 mb-2">Assign Custom Roles</label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {roles.map(role => (
                          <div key={role.id} className="bg-[#242935] p-3 rounded-lg">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                <input
                                  type="checkbox"
                                  id={`role-${role.id}`}
                                  checked={userForm.roleIds.includes(role.id)}
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
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setIsCreatingUser(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateUser}
                      disabled={!userForm.email || !userForm.password}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedUser ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-200">
                    Edit User: <span className="text-blue-400">{selectedUser.email}</span>
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors focus:outline-none"
                    title="Back to users"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-gray-300 mb-1">
                      Change Password (leave blank to keep current)
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-gray-300 mb-1">Base Role</label>
                    <select
                      id="role"
                      name="role"
                      value={userForm.role}
                      onChange={handleInputChange}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CONSULTANT">Consultant</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                  
                  {roles.length > 0 && (
                    <div>
                      <label className="block text-gray-300 mb-2">Assigned Custom Roles</label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {roles.map(role => (
                          <div key={role.id} className="bg-[#242935] p-3 rounded-lg">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 pt-0.5">
                                <input
                                  type="checkbox"
                                  id={`role-${role.id}`}
                                  checked={userForm.roleIds.includes(role.id)}
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
                                    <div className="flex flex-wrap gap-1">
                                      {role.permissions.slice(0, 3).map((perm, idx) => (
                                        <span key={idx} className="bg-blue-600/20 text-blue-400 rounded-full px-2 py-0.5 text-xs">
                                          {perm}
                                        </span>
                                      ))}
                                      {role.permissions.length > 3 && (
                                        <span className="text-gray-400 text-xs">
                                          +{role.permissions.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={handleDeleteUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete User
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p>Select a user to view and edit details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;