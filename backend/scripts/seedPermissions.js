import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // User Management Permissions
  { name: 'users.create', description: 'Create new users', resource: 'users', action: 'create' },
  { name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
  { name: 'users.update', description: 'Update user information', resource: 'users', action: 'update' },
  { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
  
  // Role Management Permissions
  { name: 'roles.create', description: 'Create new roles', resource: 'roles', action: 'create' },
  { name: 'roles.read', description: 'View roles', resource: 'roles', action: 'read' },
  { name: 'roles.update', description: 'Update role information', resource: 'roles', action: 'update' },
  { name: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
  
  // Permission Management Permissions
  { name: 'permissions.create', description: 'Create new permissions', resource: 'permissions', action: 'create' },
  { name: 'permissions.read', description: 'View permissions', resource: 'permissions', action: 'read' },
  { name: 'permissions.update', description: 'Update permission information', resource: 'permissions', action: 'update' },
  { name: 'permissions.delete', description: 'Delete permissions', resource: 'permissions', action: 'delete' },
  
  // Project Management Permissions
  { name: 'projects.create', description: 'Create new projects', resource: 'projects', action: 'create' },
  { name: 'projects.read', description: 'View projects', resource: 'projects', action: 'read' },
  { name: 'projects.update', description: 'Update project information', resource: 'projects', action: 'update' },
  { name: 'projects.delete', description: 'Delete projects', resource: 'projects', action: 'delete' },
  
  // Client Management Permissions
  { name: 'clients.create', description: 'Create new clients', resource: 'clients', action: 'create' },
  { name: 'clients.read', description: 'View clients', resource: 'clients', action: 'read' },
  { name: 'clients.update', description: 'Update client information', resource: 'clients', action: 'update' },
  { name: 'clients.delete', description: 'Delete clients', resource: 'clients', action: 'delete' },
  
  // Consultant Management Permissions
  { name: 'consultants.create', description: 'Create new consultants', resource: 'consultants', action: 'create' },
  { name: 'consultants.read', description: 'View consultants', resource: 'consultants', action: 'read' },
  { name: 'consultants.update', description: 'Update consultant information', resource: 'consultants', action: 'update' },
  { name: 'consultants.delete', description: 'Delete consultants', resource: 'consultants', action: 'delete' },
  
  // Document Management Permissions
  { name: 'documents.create', description: 'Upload new documents', resource: 'documents', action: 'create' },
  { name: 'documents.read', description: 'View documents', resource: 'documents', action: 'read' },
  { name: 'documents.update', description: 'Update document information', resource: 'documents', action: 'update' },
  { name: 'documents.delete', description: 'Delete documents', resource: 'documents', action: 'delete' },
  
  // Task Management Permissions
  { name: 'tasks.create', description: 'Create new tasks', resource: 'tasks', action: 'create' },
  { name: 'tasks.read', description: 'View tasks', resource: 'tasks', action: 'read' },
  { name: 'tasks.update', description: 'Update task information', resource: 'tasks', action: 'update' },
  { name: 'tasks.delete', description: 'Delete tasks', resource: 'tasks', action: 'delete' },
  
  // Proposal Management Permissions
  { name: 'proposals.create', description: 'Create new proposals', resource: 'proposals', action: 'create' },
  { name: 'proposals.read', description: 'View proposals', resource: 'proposals', action: 'read' },
  { name: 'proposals.update', description: 'Update proposal information', resource: 'proposals', action: 'update' },
  { name: 'proposals.delete', description: 'Delete proposals', resource: 'proposals', action: 'delete' },
  
  // Service Management Permissions
  { name: 'services.create', description: 'Create new services', resource: 'services', action: 'create' },
  { name: 'services.read', description: 'View services', resource: 'services', action: 'read' },
  { name: 'services.update', description: 'Update service information', resource: 'services', action: 'update' },
  { name: 'services.delete', description: 'Delete services', resource: 'services', action: 'delete' }
];

const roles = [
  {
    name: 'Admin',
    description: 'Full system access with all permissions',
    permissions: permissions.map(p => p.name)
  },
  {
    name: 'Manager',
    description: 'Management access with limited administrative permissions',
    permissions: [
      'projects.create', 'projects.read', 'projects.update',
      'clients.create', 'clients.read', 'clients.update',
      'consultants.read', 'consultants.update',
      'tasks.create', 'tasks.read', 'tasks.update',
      'proposals.create', 'proposals.read', 'proposals.update',
      'documents.create', 'documents.read', 'documents.update',
      'services.read'
    ]
  },
  {
    name: 'Consultant',
    description: 'Consultant access for project work',
    permissions: [
      'projects.read',
      'clients.read',
      'tasks.read', 'tasks.update',
      'proposals.read',
      'documents.create', 'documents.read', 'documents.update',
      'services.read'
    ]
  },
  {
    name: 'Client',
    description: 'Client access for viewing projects and documents',
    permissions: [
      'projects.read',
      'tasks.read',
      'proposals.read',
      'documents.read',
      'services.read'
    ]
  }
];

async function seedData() {
  try {
    console.log('Starting permission seeding...');
    
    // Create permissions
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission
      });
    }
    
    console.log(`✅ Created ${permissions.length} permissions`);
    
    // Create roles
    for (const role of roles) {
      await prisma.roleDefinition.upsert({
        where: { name: role.name },
        update: {
          description: role.description,
          permissions: role.permissions
        },
        create: {
          name: role.name,
          description: role.description,
          permissions: role.permissions
        }
      });
    }
    
    console.log(`✅ Created ${roles.length} roles`);
    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
