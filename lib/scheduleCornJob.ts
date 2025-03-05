import { emailQueue } from '@/worker/taskWorker';

// Schedule a job with cron syntax
export const scheduleJob = async () => {
  await emailQueue.add('emailQueue', {});

  console.log('Cron jobs scheduled!');
};
