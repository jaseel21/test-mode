// src/lib/ClientSessionProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";

interface ClientSessionProviderProps {
  session: Session | null;
  children: ReactNode;
}

export default function ClientSessionProvider({ session, children }: ClientSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}