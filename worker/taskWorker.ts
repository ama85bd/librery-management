// import config from '@/lib/config';
// import Queue from 'bull';
// // import milliseconds from "milliseconds";

// const taskQueue = new Queue('my-first-queue', {
//   redis: config.env.redisUrl,
// });

// taskQueue.process(async (job) => {
//   const { data } = job;
//   console.log('Processing job:', data);

//   // Simulate a long-running task
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   console.log('Job completed:', data);
//   return { result: 'success' };
// });

// import config from '@/lib/config';
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
const connection = new Redis('redis://default:1234@172.16.1.179:6379', {
  maxRetriesPerRequest: null, // Add this line
});
console.log('process.env.REDIS_URL!', 'redis://default:1234@172.16.1.179:6379');
export const sampleQueue = new Queue('sampleQueue', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

const worker = new Worker(
  'sampleQueue', // this is the queue name, the first string parameter we provided for Queue()
  async (job) => {
    const data = job?.data;
    console.log(data);
    console.log('Task executed successfully');
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

export default worker;
