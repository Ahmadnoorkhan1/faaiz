import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const initSuperAdmin = async () => {
  try {
    // Check if any admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminExists) {
      console.log('🔐 No admin user found. Creating super admin...');
      
      // Generate a secure password or use environment variable
      const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create super admin user
      const superAdmin = await prisma.user.create({
        data: {
          email: process.env.SUPER_ADMIN_EMAIL || 'admin@grc.com',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log(`✅ Super admin created successfully with email: ${superAdmin.email}`);
      console.log('Please change the default password after first login!');
    } else {
      console.log('✅ Admin user already exists. Skipping super admin creation.');
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
};