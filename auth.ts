import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getUserRole } from '@/app/config/authConfig';

export const SESSION_MAX_AGE = 3600;

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { hd: 'deblock.com' } },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email;
      if (!email?.endsWith('@deblock.com')) return false;
      if (!getUserRole(email)) return false;
      return true;
    },
    redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    jwt({ token, profile }) {
      if (profile?.email) {
        token.role = getUserRole(profile.email) ?? 'viewer';
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.maxAge = SESSION_MAX_AGE;
      return session;
    },
  },
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE, updateAge: 0 },
});
