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
import { CronJob } from 'cron';
import { db } from '@/lib/db';

type UserState = 'non-active' | 'active';

type InitialData = {
  email: string;
  fullName: string;
};

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

export const newSignUpQueue = new Queue('newSignUpQueue', {
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

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db.users.findUnique({
    where: {
      email: email,
    },
  });

  if (user === null) return 'non-active';

  const currentDate = new Date();

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  const lastActiveDate = new Date(user.last_activity_date);
  if (lastActiveDate <= oneMonthAgo) {
    return 'non-active';
  }
  return 'active';
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

// Worker for sending emails new SignUp
const newSignUpWorker = new Worker(
  'newSignUpQueue',
  async (job) => {
    const { userId, email } = job.data;
    console.log(`Sending email to ${email} for user ${userId}`);

    // Send an email
    await sendEmail(email, 'Subject', 'Message');
  },
  { connection }
);

// Worker for sending emails
const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { userId, email } = job.data;
    console.log(`Sending email to ${email} for user ${userId}`);

    // Send an email
    await sendEmail(email);
  },
  { connection }
);

// Function to check for inactive users and add jobs to the queue
const checkInactiveUsers = async () => {
  // Simulate fetching inactive users from your database
  // Replace this with your actual database query
  const inactiveUsers = [
    {
      id: 1,
      email: 'user1@example.com',
      lastActive: '2023-09-01T00:00:00.000Z',
    },
    {
      id: 2,
      email: 'user2@example.com',
      lastActive: '2023-09-15T00:00:00.000Z',
    },
  ];

  // Get the current date
  const currentDate = new Date();

  // Calculate the date one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  // Filter users who have been inactive for the last one month
  const usersToNotify = inactiveUsers.filter((user) => {
    const lastActiveDate = new Date(user.lastActive);
    return lastActiveDate < oneMonthAgo;
  });

  // Add a job for each inactive user
  usersToNotify.forEach((user) => {
    emailQueue.add('emailQueue', {
      userId: user.id,
      email: user.email,
    });
  });
};

// Schedule the job to run on the 1st of every month at 9:00 AM
const monthlyJob = new CronJob('0 9 1 * *', checkInactiveUsers);

// Start the cron job
monthlyJob.start();

export { worker, emailWorker, newSignUpWorker };
