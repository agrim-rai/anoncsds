import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { isValidEmail } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        // Check if email is valid
        if (!isValidEmail(user.email)) {
          return false;
        }

        try {
          await connectDB();
          
          // Create or update user in database
          await User.findOneAndUpdate(
            { email: user.email },
            {
              email: user.email,
              name: user.name || '',
              image: user.image || '',
            },
            { upsert: true, new: true }
          );

          return true;
        } catch (error) {
          console.error('Database error during sign in:', error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.hasVoted = dbUser.hasVoted;
          }
        } catch (error) {
          console.error('Error fetching user session data:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
});

export { handler as GET, handler as POST };