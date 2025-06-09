import React, { useState, useEffect } from "react";
import { permissions } from "../../../assets/permissions";
import api from "../../../service/apiService";
import { toast } from "react-hot-toast";

const Permissions = () => {
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  
  // New state for tracking changes
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Effect to check for changes
  useEffect(() => {
    // Check if permissions have changed from original
    if (originalPermissions.length === 0 && userPermissions.length === 0) {
      setHasChanges(false);
      return;
    }
    
    if (originalPermissions.length !== userPermissions.length) {
      setHasChanges(true);
      return;
    }
    
    const sortedOriginal = [...originalPermissions].sort();
    const sortedCurrent = [...userPermissions].sort();
    
    for (let i = 0; i < sortedOriginal.length; i++) {
      if (sortedOriginal[i] !== sortedCurrent[i]) {
        setHasChanges(true);
        return;
      }
    }
    
    setHasChanges(false);
  }, [originalPermissions, userPermissions]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use our new API endpoint that fetches users with their roles
      const response = await api.get('/api/permissions/users');
      
      if (response.data?.success) {
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: any) => {
    try {
      // If there are unsaved changes
      if (hasChanges && selectedUser) {
        if (!window.confirm('You have unsaved changes. Discard them?')) {
          return;
        }
      }
      
      setLoading(true);
      setSelectedUser(user);
      
      // Fetch user's current permissions
      const response = await api.get(`/api/permissions/users/${user.id}/permissions`);
      
      if (response.data?.success) {
        const permissions = response.data.data || [];
        setUserPermissions(permissions);
        setOriginalPermissions(permissions); // Save original set
      } else {
        setUserPermissions([]);
        setOriginalPermissions([]);
        toast.error('Failed to fetch user permissions');
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setUserPermissions([]);
      setOriginalPermissions([]);
      toast.error('Error loading user permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permission: string) => {
    setUserPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleToggleAllInCategory = (categoryPermissions: string[]) => {
    setUserPermissions(prev => {
      // Check if all permissions in this category are already selected
      const allSelected = categoryPermissions.every(p => prev.includes(p));
      
      if (allSelected) {
        // Remove all permissions in this category
        return prev.filter(p => !categoryPermissions.includes(p));
      } else {
        // Add all permissions in this category that aren't already selected
        const permissionsToAdd = categoryPermissions.filter(p => !prev.includes(p));
        return [...prev, ...permissionsToAdd];
      }
    });
  };

  const handleSelectAll = () => {
    const allPermissions = permissions.flatMap(category => category.permission);
    setUserPermissions(allPermissions);
  };

  const handleClearAll = () => {
    setUserPermissions([]);
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      setSavingPermissions(true);
      
      const response = await api.post(`/api/permissions/users/${selectedUser.id}/update`, {
        permissions: userPermissions
      });
      
      if (response.data?.success) {
        toast.success('Permissions updated successfully');
        setOriginalPermissions(userPermissions); // Update original set after save
        setHasChanges(false);
      } else {
        toast.error(response.data?.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error updating permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Add a function to discard changes
  const discardChanges = () => {
    setUserPermissions([...originalPermissions]);
    setHasChanges(false);
  };

  const renderPermissionsList = () => {
    return permissions.map((category, index) => (
      <div key={index} className="border-b border-gray-700">
        <button
          onClick={() => setIsOpen(isOpen === index ? null : index)}
          className="w-full text-left px-4 py-3 flex justify-between items-center bg-transparent"
        >
          <span className="font-medium text-white">{category.name}</span>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAllInCategory(category.permission);
              }}
              className="mr-3 px-2 py-1 text-xs rounded bg-blue-900/30 text-blue-400 hover:bg-blue-800/40"
            >
              {category.permission.every(p => userPermissions.includes(p)) 
                ? 'Deselect All' 
                : 'Select All'}
            </button>
            <span
              className="transform transition-transform duration-200 text-white"
              style={{ transform: isOpen === index ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▼
            </span>
          </div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 px-4 ${isOpen === index ? "py-3" : "max-h-0"}`}>
          <div className="space-y-2">
            {category.permission.map((perm, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-800/30">
                <span className="text-gray-300">{perm}</span>
                <input
                  type="checkbox"
                  checked={userPermissions.includes(perm)}
                  onChange={() => handleTogglePermission(perm)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-[#1a1f2b] border-gray-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Updated header to show save/discard buttons only when changes exist */}
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-200">User Permissions</h1>
        <div className="flex space-x-2">
          {selectedUser && (
            <>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Clear All
              </button>
              {hasChanges && (
                <>
                  <button
                    onClick={discardChanges}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={saveUserPermissions}
                    disabled={savingPermissions}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {savingPermissions ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User selection panel */}
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
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
                    <div className={`text-xs ${selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-400'}`}>
                      {user.role}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permissions panel */}
        <div className="lg:col-span-2 bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          {selectedUser ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-200">
                  Permissions for <span className="text-blue-400">{selectedUser.email}</span>
                </h2>
                <button
                  onClick={saveUserPermissions}
                  disabled={savingPermissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {savingPermissions ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
              <div className="bg-[#242935] rounded-lg overflow-hidden">
                {renderPermissionsList()}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p>Select a user to manage permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permissions;