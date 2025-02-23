'use server';

import { hash } from 'bcryptjs';
import { db } from '../db';
import { signIn } from '@/auth';

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, 'email' | 'password'>
) => {
  const { email, password } = params;

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
  const { full_name, email, university_id, password, university_card } = params;

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
        full_name,
        email,
        password: hashedPassword,
        university_id,
        university_card,
      },
    });

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error) {
    console.log(error, 'Signup error');
    return { success: false, error: 'Signup error' };
  }
};
