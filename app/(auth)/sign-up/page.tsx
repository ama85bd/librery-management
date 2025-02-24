'use client';

import AuthForm from '@/components/AuthForm';
import { signUp } from '@/lib/actions/auth';
import { signUpSchema } from '@/lib/validations';

const Page = () => (
  <AuthForm
    type='SIGN_UP'
    schema={signUpSchema}
    defaultValues={{
      email: '',
      password: '',
      fullName: '',
      university_id: '',
      university_card: '',
    }}
    onSubmit={signUp}
  />
);

export default Page;
