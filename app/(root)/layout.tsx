import { auth } from '@/auth';
import Header from '@/components/Header';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import React, { ReactNode } from 'react';

const layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session) redirect('/sign-in');

  after(async () => {
    if (!session?.user?.id) return;

    const user = await db.users.findUnique({
      where: {
        id: session?.user?.id,
      },
    });

    if (
      user?.last_activity_date.toISOString().slice(0, 10) ===
      new Date().toISOString().slice(0, 10)
    )
      return;

    await db.users.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        last_activity_date: new Date(),
      },
    });
  });
  return (
    <main className='root-container'>
      <div className='mx-auto max-w-7xl'>
        <Header session={session} />
        <div className='mt-20 pb-20'>{children}</div>
      </div>
    </main>
  );
};

export default layout;
