export const permissions = [
  // Users
  { name: "Read Users", key: "read:users" },
  { name: "Create Users", key: "write:users" },
  { name: "Update Users", key: "update:users" },
  { name: "Delete Users", key: "delete:users" },

  // Roles
  { name: "Read Roles", key: "read:roles" },
  { name: "Create Roles", key: "write:roles" },
  { name: "Update Roles", key: "update:roles" },
  { name: "Delete Roles", key: "delete:roles" },

  // Permissions
  { name: "Read Permissions", key: "read:permissions" },
  { name: "Create Permissions", key: "write:permissions" },
  { name: "Update Permissions", key: "update:permissions" },
  { name: "Delete Permissions", key: "delete:permissions" },

  //Projects
  { name: "Read Projects", key: "read:Projects" },
  { name: "Create Projects", key: "write:Projects" },
  { name: "Update Projects", key: "update:Projects" },
  { name: "Delete Projects", key: "delete:Projects" },

  //Tasks
  { name: "Read Tasks", key: "read:Tasks" },
  { name: "Create Tasks", key: "write:Tasks" },
  { name: "Update Tasks", key: "update:Tasks" },
  { name: "Delete Tasks", key: "delete:Tasks" },

  //Clients
  { name: "Read Clients", key: "read:Clients" },
  { name: "Create Clients", key: "write:Clients" },
  { name: "Update Clients", key: "update:Clients" },
  { name: "Delete Clients", key: "delete:Clients" },

  //Consultants
  { name: "Read Consultants", key: "read:Consultants" },
  { name: "Create Consultants", key: "write:Consultants" },
  { name: "Update Consultants", key: "update:Consultants" },
  { name: "Delete Consultants", key: "delete:Consultants" },

  //Calls
  { name: "Read Calls", key: "read:Calls" },
  { name: "Create Calls", key: "write:Calls" },
  { name: "Update Calls", key: "update:Calls" },
  { name: "Delete Calls", key: "delete:Calls" },


  //Documents
  { name: "Read Documents", key: "read:Documents" },
  { name: "Create Documents", key: "write:Documents" },
  { name: "Update Documents", key: "update:Documents" },
  { name: "Delete Documents", key: "delete:Documents" },

  //Configurations
  { name: "Read Configurations", key: "read:Configurations" },
  { name: "Create Configurations", key: "write:Configurations" },
  { name: "Update Configurations", key: "update:Configurations" },
  { name: "Delete Configurations", key: "delete:Configurations" },

  // Role Assignments
  { name: "Assign Roles to Users", key: "assign:roles" },
  { name: "Remove Roles from Users", key: "unassign:roles" },

  // Profile
  { name: "Read Profile", key: "read:profile" },
  { name: "Update Profile", key: "update:profile" },

  // Dashboard
  { name: "View Dashboard", key: "read:dashboard" }

  
];




export type UserRole = "ADMIN" | "CONSULTANT" | "CLIENT";

export function getPermissionsByRole(role: UserRole): string[] {
  switch (role) {
    case "ADMIN":
      return permissions.map((p) => p.key);

    case "CONSULTANT":
      return [
        "read:Projects",
        "read:Tasks", "write:Tasks", "update:Tasks", "delete:Tasks",
        "read:Clients",
        "read:Consultants", "update:Consultants",
        "read:Calls", "write:Calls", "update:Calls", "delete:Calls",
        "read:Documents", "write:Documents", "update:Documents", "delete:Documents",
        "read:profile", "update:profile",
        "read:dashboard"
      ];

    case "CLIENT":
      return [
        "read:Projects",
        "read:Tasks",
        "read:Documents",
        "read:Calls",
        "read:profile", "update:profile",
        "read:dashboard"
      ];

    default:
      return [];
  }
}
