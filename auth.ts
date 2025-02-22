import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './lib/db';
import { compare } from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.users.findUnique({
          where: {
            email: credentials?.email as string,
          },
        });

        if (user === null) return null;

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.full_name,
        } as User;
      },
    }),
  ],
});
