import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
// import {getServerSession} from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { AuthOptions } from "next-auth";

export const metadata: Metadata = {
  title: "SignIn | AIC Amal App - Donation Platform",
  description: "AIC Amal App SignIn - A Donation Platform from Akode Islamic Centre",
};

export default async function SignIn() {
  // const session = await getServerSession(authOptions as AuthOptions)

 


  // if ( session?.user.role==="Admin" ||"Super Admin"|| "Manager") {
  //   redirect("/admin");
  // }


  return <SignInForm />;
}
