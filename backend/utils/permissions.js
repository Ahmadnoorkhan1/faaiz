/**
 * Default permissions structure matching the frontend
 */
export const defaultPermissions = [
  {
    name: "Dasboard",
    permission: ["read:analytics"]
  },
  {
    name: "Projects",
    permission: [
      "read:projects",
      "create:projects",
      "update:projects",
      "delete:projects"
    ]
  },
  {
    name: "Clients",
    permission: [
      "read:clients",
      "create:clients",
      "update:clients",
      "update:status",
      "update:invitaion",
      "create:invitaion",
      "delete:clients"
    ]
  },
  {
    name: "Consultant",
    permission: [
      "read:consultant",
      "create:consultant",
      "update:consultant",
      "delete:consultant"
    ]
  },
  {
    name: "Tasks",
    permission: [
      "read:tasks",
      "create:tasks",
      "update:tasks",
      "upadte:status",
      "update:comment",
      "delete:tasks"
    ]
  },
  {
    name: "Board",
    permission: [
      "read:board",
      "update:task"
    ]
  },
  {
    name: "Schedule",
    permission: [
      "read:chedule" // Note: typo preserved from original
    ]
  },
  {
    name: "Documents",
    permission: [
      "create:documents",
      "update:documents",
      "read:documents",
      "delete:documents"
    ]
  },
  {
    name: "RoleManagement",
    permission: [
      "create:role",
      "read:role",
      "update:role",
      "delete:role"
    ]
  },
  {
    name: "Configurations",
    permission: [
      "read:configurations",
      "create:configurations",
      "update:configurations",
      "delete:configurations",
      "read:feedback",
      "update:feedback",
      "read:permissions",
      "update:permissions",
      "read:projectplan",
      "create:projectplan",
      "update:projectplan",
      "read:projectproposal",
      "create:projectproposal",
      "update:projectproposal",
      "delete:projectproposal",
      "read:scopingform",
      "create:scopingform",
      "update:scopingform",
      "delete:scopingform",
      "read:service",
      "create:service",
      "update:service",
      "delete:service"
    ]
  }
];

// Get a flat array of all permission strings
export const getAllPermissionNames = () => {
  return defaultPermissions.flatMap(category => category.permission);
};

// Get default permissions by role
export const getDefaultPermissionsByRole = (role) => {
  const allPermissions = getAllPermissionNames();
  
  switch(role) {
    case 'ADMIN':
      return allPermissions; // Admins get all permissions
      
    case 'CLIENT':
      return [
        "read:analytics",
        "read:projects",
        "read:documents",
        "read:tasks"
      ];
      
    case 'CONSULTANT':
      return [
        "read:analytics",
        "read:projects",
        "read:documents",
        "create:documents",
        "read:tasks",
        "update:tasks",
        "read:board"
      ];
      
    default:
      return [];
  }
};

// Find which category a permission belongs to
export const getCategoryForPermission = (permissionName) => {
  const category = defaultPermissions.find(cat => 
    cat.permission.includes(permissionName)
  );
  return category ? category.name : null;
};