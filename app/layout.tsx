import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { checkInactiveUsers } from '@/worker/taskWorker';
import { CronJob } from 'cron';

const ibmPlexSans = localFont({
  src: [
    { path: '/fonts/IBMPlexSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '/fonts/IBMPlexSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: '/fonts/IBMPlexSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '/fonts/IBMPlexSans-Bold.ttf', weight: '700', style: 'normal' },
  ],
});

const bebasNeue = localFont({
  src: [
    { path: '/fonts/BebasNeue-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--bebas-neue',
});

export const metadata: Metadata = {
  title: 'BookWise',
  description:
    'BookWise is a book borrowing university library management solution.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  // after(async () => {
  //   await emailQueue.add('emailQueue', {});
  // });

  const monthlyJob = new CronJob('* * * * *', checkInactiveUsers);

  // Start the cron job
  monthlyJob.start();

  // const enqueueJob = async () => {
  //   try {
  //     const res = await fetch('/api/cronJobScheduler', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const data = await res.json();
  //     console.log('Job enqueued: layout', data);
  //   } catch (error) {
  //     console.error('Error enqueuing job:', error);
  //   }
  // };
  // enqueueJob();
  return (
    <html lang='en'>
      <SessionProvider session={session}>
        <body
          className={`${ibmPlexSans.className} ${bebasNeue.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </SessionProvider>
    </html>
  );
}
