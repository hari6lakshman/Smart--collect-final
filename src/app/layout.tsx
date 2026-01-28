import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/context/app-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Collect",
  description: "AI-Powered Debt Collection Management",
  icons: {
    icon: "/favicon.ico",
  },
};

import { RouteBackground } from "@/components/RouteBackground";

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
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <RouteBackground />
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
