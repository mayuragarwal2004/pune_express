import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import db from '../../../../db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      const existingUser = await db('users').where({ email: user.email }).first();

      if (!existingUser) {
        // If user doesn't exist, add them to the database
        await db('users').insert({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          provider_id: account.providerAccountId,
          role: 'subscriber', // Default role, can be customized
          created_at: new Date(),
          updated_at: new Date(),
          last_login: new Date(),
          is_active: true,
        });
      } else {
        // Update last login timestamp
        await db('users').where({ email: user.email }).update({
          last_login: new Date(),
          updated_at: new Date(),
        });
      }

      return true;
    },
  },
};

export default NextAuth(authOptions);
