// pages/api/startCronJobs.js

import { scheduleJob } from '@/lib/scheduleCornJob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Cron jobs scheduled successfully req');
    await scheduleJob(); // Trigger the scheduling of cron jobs
    return NextResponse.json(
      {
        message: 'Cron jobs scheduled successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: 'Failed to schedule cron jobs',
      },
      { status: 500 }
    );
  }
}
