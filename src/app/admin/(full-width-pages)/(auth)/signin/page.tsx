import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn | AIC Amal App - Donation Platform",
  description: "AIC Amal App SignIn - A Donation Platform from Akode Islamic Centre",
};

export default function SignIn() {
  return <SignInForm />;
}
