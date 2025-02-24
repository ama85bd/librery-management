// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import config from './config';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

// Reids
// const client = createClient({
//   url: config.env.redisUrl,
// });

// client.on('error', (err) => console.log('Redis Client Error', err));

// export const redisClient = await client.connect();
