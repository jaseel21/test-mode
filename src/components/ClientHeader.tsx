"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/users-section/home/Header";

export default function ClientHeader() {
  const pathname = usePathname();

  // Do not render Header on the /app-about page
  if (pathname === "/app-about") {
    return null;
  }
  if (pathname === "/mobile-donation") {
    return null;
  }

  return <Header />;
}