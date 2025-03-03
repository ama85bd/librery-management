'use client';
import React, { useState } from 'react';

const page = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState(false);

  const enqueueJob = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enqueue', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        //   task: 'sendEmail', // Sample task data
        //   email: 'example@example.com',
        // }),
      });

      const data = await res.json();
      console.log('Job enqueued:', data);
    } catch (error) {
      console.error('Error enqueuing job:', error);
    }
    setLoading(false);
  };
  return (
    <div>
      <button onClick={enqueueJob} disabled={loading} className='text-white'>
        {loading ? 'Enqueuing...' : 'Enqueue Task'}
      </button>
    </div>
  );
};

export default page;
