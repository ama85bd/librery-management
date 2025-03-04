'use server';

import { hash } from 'bcryptjs';
import { db } from '../db';
import { signIn } from '@/auth';
import { headers } from 'next/headers';
import { rateLimiter } from '../ratelimit';
import { redirect } from 'next/navigation';
import { newSignUpQueue } from '@/worker/taskWorker';

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, 'email' | 'password'>
) => {
  const { email, password } = params;

  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await rateLimiter(ip, 10, 60);

  if (!success) {
    return redirect('/too-fast');
  }

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, 'Signin error');
    return { success: false, error: 'Signin error' };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, university_id, password, university_card } = params;
  const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await rateLimiter(ip, 10, 60);

  if (!success) {
    console.log('success', success);
    return redirect('/too-fast');
  }

  const existingUser = await db.users.findUnique({
    where: {
      email: email as string,
    },
  });
  if (existingUser !== null) {
    return { success: false, error: 'User already exists' };
  }

  const hashedPassword = await hash(password, 10);

  try {
    await db.users.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        university_id,
        university_card,
      },
    });

    await newSignUpQueue.add('newSignUpQueue', {
      userId: 1,
      email,
    });

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, 'Signup error');
    return { success: false, error: 'Signup error' };
  }
};
