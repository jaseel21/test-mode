import CredentialsProvider from "next-auth/providers/credentials";
import admin from "firebase-admin";
import Admin from "@/models/Admin";
import Volunteer from "@/models/Volunteer";
import User from "@/models/User";
import dbConnect from "@/lib/db";
import Donor from "@/models/Donor";
import Box from "@/models/Box";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
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
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.idToken || !credentials.phone || !credentials.role) {
            throw new Error("Missing credentials");
          }

          const userCredential = await admin.auth().verifyIdToken(credentials.idToken);
          const firebaseUser = userCredential;
          console.log("✅ Firebase Verified User:", firebaseUser);

          await dbConnect();

          // Check for user in different collections
          let auth = await User.findOne({
            $and: [
              { phone: firebaseUser.phone_number },
              { role: credentials.role },
            ],
          }).lean().exec();
          
          if (!auth)
            auth = await Admin.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            }).lean().exec();
            
          if (!auth)
            auth = await Volunteer.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            }).lean().exec();
            
          if (!auth)
            auth = await Donor.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            }).lean().exec();
            
          if (!auth)
            auth = await Box.findOne({
              $and: [
                { phone: firebaseUser.phone_number },
                { role: credentials.role },
              ],
            }).lean().exec();

          if (!auth) {
            console.error(" No user found with phone:", firebaseUser.phone_number);
            throw new Error("User not found. Please register first.");
          }

          console.log("✅ Authenticated User:", auth);

          // Return user object with required fields
          return {
            id: auth._id.toString(), // Convert ObjectId to string
            phone: auth.phone || firebaseUser.phone_number || "", 
            email: auth.email || "",
            name: auth.name || "Unknown",
            role: auth.role || "user",
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.phone = token.phone;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;