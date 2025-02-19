// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const db = prisma;

const client = createClient({
  url: 'redis://default:1234@172.16.1.179:6379',
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const redisClient = await client.connect();
