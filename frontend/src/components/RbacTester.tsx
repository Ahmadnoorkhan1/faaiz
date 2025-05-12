import React from 'react';
// import { usePermissions } from '../hooks/usePermissions';

const RbacTester: React.FC = () => {
  // const { permissions, roles, hasPermission, hasRole, loading } = usePermissions();

  // if (loading) {
  //   return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>;
  // }

  return (
    // <div className="space-y-6 bg-[#1a1f2b] p-6 rounded-xl">
    //   <div>
    //     <h2 className="text-xl font-semibold text-gray-200 mb-4">RBAC Test Component</h2>
    //     <p className="text-gray-400">This component displays content based on your permissions.</p>
    //   </div>

    //   <div className="space-y-4">
    //     <div className="bg-[#242935] p-4 rounded-lg">
    //       <h3 className="text-lg font-medium text-gray-200 mb-2">Your Roles</h3>
    //       {roles.length > 0 ? (
    //         <div className="flex flex-wrap gap-2">
    //           {roles.map((role, index) => (
    //             <span key={index} className="bg-blue-600/20 text-blue-400 rounded-full px-3 py-1 text-sm">
    //               {role}
    //             </span>
    //           ))}
    //         </div>
    //       ) : (
    //         <p className="text-gray-400">No roles assigned</p>
    //       )}
    //     </div>

    //     <div className="bg-[#242935] p-4 rounded-lg">
    //       <h3 className="text-lg font-medium text-gray-200 mb-2">Your Permissions</h3>
    //       {permissions.length > 0 ? (
    //         <div className="flex flex-wrap gap-2">
    //           {permissions.map((permission, index) => (
    //             <span key={index} className="bg-green-600/20 text-green-400 rounded-full px-3 py-1 text-sm">
    //               {permission}
    //             </span>
    //           ))}
    //         </div>
    //       ) : (
    //         <p className="text-gray-400">No permissions assigned</p>
    //       )}
    //     </div>
    //   </div>

    //   <div className="space-y-4">
    //     <div className="bg-[#242935] p-4 rounded-lg">
    //       <h3 className="text-lg font-medium text-gray-200 mb-4">Permission-Based Content</h3>
          
    //       {hasPermission('CREATE_ROLE') && (
    //         <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg mb-3">
    //           <p className="text-green-400">You can create roles (CREATE_ROLE permission)</p>
    //         </div>
    //       )}
          
    //       {hasPermission('ASSIGN_ROLE') && (
    //         <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg mb-3">
    //           <p className="text-green-400">You can assign roles (ASSIGN_ROLE permission)</p>
    //         </div>
    //       )}
          
    //       {!hasPermission('CREATE_ROLE') && !hasPermission('ASSIGN_ROLE') && (
    //         <p className="text-gray-400">You don't have any special role management permissions</p>
    //       )}
    //     </div>

    //     <div className="bg-[#242935] p-4 rounded-lg">
    //       <h3 className="text-lg font-medium text-gray-200 mb-4">Role-Based Content</h3>
          
    //       {hasRole('ADMIN') && (
    //         <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg mb-3">
    //           <p className="text-blue-400">Admin Panel Access (ADMIN role)</p>
    //           <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    //             Access Admin Settings
    //           </button>
    //         </div>
    //       )}
          
    //       {hasRole('MANAGER') && (
    //         <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg mb-3">
    //           <p className="text-blue-400">Manager Dashboard (MANAGER role)</p>
    //           <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    //             Access Reports
    //           </button>
    //         </div>
    //       )}
          
    //       {!hasRole('ADMIN') && !hasRole('MANAGER') && (
    //         <p className="text-gray-400">You don't have any special role-based access</p>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <></>
  );
};

export default RbacTester;