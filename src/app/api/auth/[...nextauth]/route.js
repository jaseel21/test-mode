// import { NextApiRequest, NextApiResponse } from "next";
// import NextAuth, { NextAuthOptions } from "next-auth";

// // Define and export authOptions
// export const authOptions: NextAuthOptions = {
//   providers: []
// };

// // Your NextAuth handler
// export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import admin from "firebase-admin";
import Admin from "../../../../models/Admin";
import Volunteer from "../../../../models/Volunteer"
import dbConnect from "../../../../lib/db";
import Donor from "../../../../models/Donor";
import Box from "../../../../models/Box";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        phone: { label: "Phone", type: "text" },
        role:{label:"role",type:"text"},
      },
      async authorize(credentials) {
        try {
          const userCredential = await admin.auth().verifyIdToken(credentials.idToken);
          const user = userCredential;
          console.log("✅ Firebase Verified User:", user);
      
          await dbConnect();
      
          // Check for user in different collections
          let auth = await Admin.findOne({
            $and: [
              { phone: user.phone_number },
              { role: credentials.role }
            ]
          });
          // if (!auth) auth = await Admin.findOne({ $and: [
          //   { phone: user.phone_number },
          //   { role: credentials.role }
          // ]});
          if (!auth) auth = await Volunteer.findOne({ $and: [
            { phone: user.phone_number },
            { role: credentials.role }
          ]});

          if (!auth) auth = await Donor.findOne({ $and: [
            { phone: user.phone_number },
            { role: credentials.role }
          ]});

          if (!auth) auth = await Box.findOne({ $and: [
            { phone: user.phone_number },
            { role: credentials.role }
          ]});
      
          if (!auth) {
            console.error(" No user found with phone:", user.phone_number);
            throw new Error("User not found. Please register first.");
          }
      
          // console.log("✅ Authenticated User:", auth);
      
          // ✅ Ensure phone is returned
          return {
            id: auth._id.toString(), // Convert ObjectId to string
            phone: auth.phone || user.phone_number, // Ensure phone is set
            email: auth.email || '',
            name: auth.name || 'Unknown',
            role: auth.role || 'user',
          };
        } catch (error) {
          console.error(" Error verifying Firebase token:", error);
          throw new Error("Authentication failed. Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.phone = user.phone;
            token.role = user.role; //  Ensure role is included
        }
        // console.log("JWT Token:", token); // Debugging
        return token;
    },
    async session({ session, token }) {
        if (token) {
            session.user.id = token.id;
            session.user.phone = token.phone;
            session.user.role = token.role; //  Ensure role is in session      
        }
        // console.log("Session Updated:", session); // Debugging
        return session;
    },
  }
  ,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
 
};

// Export NextAuth handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// declare module "next-auth" {
//   interface User extends IAuthUser {}
//   interface Session {
//     user: {
//       id?: string;
//       phone?: string;
//       role?: string;
//       name?: string | null;
//       email?: string | null;
//     };
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT extends ICustomJWT {}
// }



// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import admin from "firebase-admin";
// import Admin from "@/models/Admin";
// import Volunteer from "@/models/Volunteer";
// import User from "@/models/User";
// import dbConnect from "@/lib/db";
// import Donor from "@/models/Donor";
// import Box from "@/models/Box";

// // Initialize Firebase Admin SDK if not already initialized
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
//     }),
//   });
// }

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         idToken: { label: "ID Token", type: "text" },
//         phone: { label: "Phone", type: "text" },
//         role: { label: "Role", type: "text" },
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.idToken || !credentials.phone || !credentials.role) {
//             throw new Error("Missing credentials");
//           }

//           const userCredential = await admin.auth().verifyIdToken(credentials.idToken);
//           const firebaseUser = userCredential;
//           console.log("✅ Firebase Verified User:", firebaseUser);

//           await dbConnect();

//           const models = [User, Admin, Volunteer, Donor, Box];
//           let authUser = null;

//           for (const model of models) {
//             authUser = await model.findOne({
//               phone: firebaseUser.phone_number,
//               role: credentials.role,
//             }).lean().exec();
//             if (authUser) break;
//           }

//           if (!authUser) {
//             console.error("❌ No user found with phone:", firebaseUser.phone_number);
//             throw new Error("User not found. Please register first.");
//           }

//           console.log("✅ Authenticated User:", authUser);

//           return {
//             id: authUser._id.toString(),
//             phone: authUser.phone || firebaseUser.phone_number || "",
//             email: authUser.email || "",
//             name: authUser.name || "Unknown",
//             role: authUser.role || "user",
//           };
//         } catch (error) {
//           console.error("❌ Error verifying Firebase token:", error);
//           throw new Error("Authentication failed. Invalid credentials.");
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.phone = user.phone;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id;
//         session.user.phone = token.phone;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/auth/signin",
//     error: "/auth/error",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// export const dynamic = "force-dynamic";