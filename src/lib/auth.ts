import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import User from "@/models/User";
import Admin from "@/models/Admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        await connectDB();

        // Check if login is from admin route
        const isAdminLogin = (credentials as any).isAdmin === true || 
                             (credentials as any).isAdmin === 'true';

        console.log('[AUTH] Login attempt:', {
          email: credentials.email,
          isAdminLogin,
          rawIsAdmin: (credentials as any).isAdmin
        });

        // Try Admin collection first if admin login
        if (isAdminLogin) {
          console.log('[AUTH] Processing admin login');
          const admin = await Admin.findOne({ email: credentials.email }).select('+password');
          
          console.log('[AUTH] Admin lookup:', {
            found: !!admin,
            isActive: admin?.isActive,
            email: credentials.email
          });
          
          if (admin && admin.isActive) {
            const isPasswordValid = await admin.comparePassword(credentials.password);
            
            console.log('[AUTH] Password validation:', isPasswordValid);
            
            if (isPasswordValid) {
              // Update last login
              admin.lastLogin = new Date();
              await admin.save();

              console.log('[AUTH] Admin login successful');
              return {
                id: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                role: admin.role,
                userType: 'admin',
              };
            }
          }
          
          // If admin login failed, don't try customer login
          console.log('[AUTH] Admin login failed - invalid credentials');
          throw new Error("Invalid admin credentials");
        }

        // Check customer User collection
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or account is inactive");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as "customer" | "admin",
          userType: 'customer',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore - Custom user properties
        token.role = user.role;
        // @ts-ignore - Custom user properties
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - Extending session user
        session.user.id = token.id;
        // @ts-ignore - Extending session user
        session.user.role = token.role;
        // @ts-ignore - Extending session user
        session.user.userType = token.userType;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the user is already on an admin page, keep them there
      if (url.includes('/admin')) {
        return url;
      }
      // Default customer redirect
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
