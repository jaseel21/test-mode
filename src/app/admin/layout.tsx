import { Outfit } from "next/font/google";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "@/lib/Context/SessionContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthOptions } from "next-auth";
import { redirect } from "next/navigation";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions as AuthOptions);

  if (!session || !["Super Admin", "Manager", "Admin"].includes(session?.user?.role)) {
    redirect("/auth/admin/sign-in");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${outfit.variable} bg-white dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}