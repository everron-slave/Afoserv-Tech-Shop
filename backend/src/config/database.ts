import { PrismaClient } from '@prisma/client';

// Create Prisma client with minimal configuration
const prisma = new PrismaClient({
  log: ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Handle SIGTERM
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;