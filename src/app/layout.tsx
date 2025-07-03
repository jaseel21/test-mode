import { Montserrat } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ClientSessionProvider from "@/lib/ClientSessionProvider";
import "react-toastify/dist/ReactToastify.css";
import { LoadingProvider } from "@/context/LoadingContext";
import { AuthOptions } from "next-auth";
import ClientHeader from "@/components/ClientHeader";
import Script from "next/script";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "AIC Amal - Akode Islamic Centre Donation Platform",
  description: "Support educational initiatives and community programs through Akode Islamic Centre's official donation platform. Contribute to meaningful religious and social welfare activities.",
  keywords: "Akode Islamic Centre, AIC Amal, donations, islamic charity, community programs, education initiatives, religious trust",
  metadataBase: new URL("https://aicamal.app"),
  alternates: {
    canonical: "/",
    languages: {
      'en-US': '/en-US',
    },
  },
  openGraph: {
    title: "AIC Amal - Akode Islamic Centre Donation Platform",
    description: "Support a noble cause - Donate with Akode Islamic Centre's official platform for religious and social welfare activities.",
    url: "https://aicamal.app",
    siteName: "AIC Amal",
    images: [
      {
        url: "/og-image.jpg", // Make sure to create this image and place it in the public folder
        width: 1200,
        height: 630,
        alt: "AIC Amal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIC Amal - Akode Islamic Centre Donation Platform",
    description: "Support educational initiatives and community programs through Akode Islamic Centre's official donation platform.",
    images: ["/og-image.jpg"], // Make sure to create this image and place it in the public folder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  verification: {
    google: "D22KDDQqMs1z3nyP7JgLY1AEB5OrhZfJR9HxsbSO3-s", // Add your Google verification ID
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession(authOptions as AuthOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://aicamal.app" />
        <meta name="author" content="Akode Islamic Centre" />
        <meta name="application-name" content="AIC Amal" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta property="og:image:alt" content="Akode Islamic Centre Donation Platform" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${montserrat.className} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
        <Script id="schema-org" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Akode Islamic Centre",
              "alternateName": "AIC Amal",
              "url": "https://aicamal.app",
              "logo": "https://aicamal.app/logo.png",
              "description": "Support educational initiatives and community programs through Akode Islamic Centre's official donation platform.",
              "email": "hello@aicamal.app",
              "telephone": "+919745833399",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "India"
              },
              "sameAs": [
                "https://www.facebook.com/islamiccenterofficial/",
                "https://www.youtube.com/@akodeislamiccentre/",
                "https://instagram.com/akodeislamiccentre",
                "https://in.linkedin.com/company/aic-educational-cultural-centre",
                "https://whatsapp.com/channel/0029VaGf3bGDOQIW6U8X4u2K",
                "https://aicedu.in"
              ],
              "potentialAction": {
                "@type": "DonateAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://aicamal.app/donate"
                }
              }
            }
          `}
        </Script>
        <ClientHeader />
        <ClientSessionProvider session={session}>
          <LoadingProvider>{children}</LoadingProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}