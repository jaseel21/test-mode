import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp | AIC Amal App - Donation Platform",
  description: "This is SignUp AIC Amal App",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
