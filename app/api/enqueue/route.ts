import { sampleQueue } from '@/worker/taskWorker';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    // any serializable data you want to provide for the job
    // for this example, we'll provide a message
    message: 'This is a sample job',
  };
  await sampleQueue.add('someJob', data);
  return NextResponse.json({ status: 'Message added to the queue' });
}

// export default async function handler(req: NextRequest) {
//   console.log('req.method', req.method);
//   if (req.method === 'GET') {
//     const data = {
//       // any serializable data you want to provide for the job
//       // for this example, we'll provide a message
//       message: 'This is a sample job',
//     };
//     await sampleQueue.add('someJob', data);
//     return NextResponse.json({ status: 'Message added to the queue' });
//   }
//   // if (req.method === 'POST') {
//   //   // Create a job with data from the body
//   //   // const jobData = req.body;
//   //   // // Add the job to the queue
//   //   // const job = await taskQueue.add(jobData);
//   //   // // Respond with the job id or status
//   //   // return NextResponse.json(
//   //   //   {
//   //   //     jobId: job.id,
//   //   //     message: 'Job enqueued',
//   //   //   },
//   //   //   { status: 201 }
//   //   // );
//   // } else {
//   //   return NextResponse.json(
//   //     {
//   //       error: 'Method Not Allowed dfd',
//   //     },
//   //     { status: 405 }
//   //   );
//   // }
// }
