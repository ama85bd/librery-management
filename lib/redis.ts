import { createClient } from 'redis';
import config from './config';

const client = createClient({
  url: config.env.redisUrl,
});

client.on('error', (err) => console.log('Redis Client Error', err));

export const redis = await client.connect();
