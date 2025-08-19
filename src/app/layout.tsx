import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
// import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from "@/context/language-context";
import { CustomSessionProvider } from "@/components/providers/session-provider"; // ✅ Use your wrapper

export const metadata: Metadata = {
  title: "NigeriaGovHub - connecting Nigerians with Government Services",
  description: "Discover government projects and initiatives across Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen overflow-x-hidden">
        <LanguageProvider>
          {/* ✅ FIXED: Use CustomSessionProvider to ensure session is available client-side */}
          <CustomSessionProvider>
            {" "}
            {/* ✅ FIXED: Now valid client-side context */}
            <Suspense fallback={<header className="h-16" />}>
              <Header />
            </Suspense>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </CustomSessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
