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
import EmailTemplate from '@/components/EmailTemplate';
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { Resend } from 'resend';

const connection = new Redis('redis://default:1234@172.16.1.179:6379', {
  maxRetriesPerRequest: null, // Add this line
});
const resend = new Resend(process.env.RESEND_TOKEN);

export const sampleQueue = new Queue('sampleQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if the job fails
    backoff: {
      type: 'exponential', // Exponential backoff for retries
      delay: 5000, // Exponential backoff for retries
    },
  },
});

export const emailQueue = new Queue('emailQueue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if the job fails
    backoff: {
      type: 'exponential', // Exponential backoff for retries
      delay: 5000, // Exponential backoff for retries
    },
  },
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  await resend.emails.send({
    from: 'Task Spice <hello.taskspice.com>',
    to: email,
    subject: subject,
    react: EmailTemplate({ message: message }),
  });
};

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
