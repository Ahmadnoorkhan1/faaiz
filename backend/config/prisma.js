import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'], // Only log errors
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test the connection
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma Client connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma Client connection failed:', error);
  });

export default prisma; 