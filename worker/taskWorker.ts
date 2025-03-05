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
import { db } from '@/lib/db';

// type UserState = 'non-active' | 'active';

// type InitialData = {
//   email: string;
//   fullName: string;
// };

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

const sendEmail = async (email: string, subject: string, message: string) => {
  console.log('sendEmail', email);
  await resend.emails.send({
    from: 'Task Spice <tech@taskspice.com>',
    to: email,
    subject: subject || 'subject',
    react: EmailTemplate({ message: message || 'message' }),
  });
};

// const getUserState = async (email: string): Promise<UserState> => {
//   const user = await db.users.findUnique({
//     where: {
//       email: email,
//     },
//   });

//   if (user === null) return 'non-active';

//   const currentDate = new Date();

//   const oneMonthAgo = new Date();
//   oneMonthAgo.setMonth(currentDate.getMonth() - 1);

//   const lastActiveDate = new Date(user.last_activity_date);
//   if (lastActiveDate <= oneMonthAgo) {
//     return 'non-active';
//   }
//   return 'active';
// };

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
    console.log(`Sending email to ${email} for user ${userId} newSignUpQueue`);

    // Send an email
    await sendEmail(email, 'subject newSignUpQueue', 'message newSignUpQueue ');
  },
  { connection }
);

// Worker for sending emails
const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    const { userId, email } = job.data;
    console.log(`Sending email to ${email} for user ${userId} emailQueue`);

    // Send an email
    await sendEmail(
      email,
      'We missed you',
      'We missed you! Come back again to see more'
    );
  },
  { connection }
);

// Function to check for inactive users and add jobs to the queue
export const checkInactiveUsers = async () => {
  const users = await db.users.findMany();

  // Calculate the date one month ago

  // Filter users who have been inactive for the last one month
  const usersToNotify = users.filter((user) => {
    const targetTime = new Date(user.last_activity_date); // Convert string to Date object

    // Get the current time
    const currentTime = new Date();

    // Calculate the difference between target time and current time in milliseconds
    const timeDifference = currentTime.getTime() - targetTime.getTime();

    // Convert the difference from milliseconds to minutes
    const minutesRemaining = timeDifference / (1000 * 60);
    return minutesRemaining > 43833;
  });

  //Add a job for each inactive user
  usersToNotify.forEach((user) => {
    emailQueue.add('emailQueue', {
      userId: user.id,
      email: user.email,
    });
  });
};

export { worker, emailWorker, newSignUpWorker };
