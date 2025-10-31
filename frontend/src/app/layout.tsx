// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CSV Upload System",
  description:
    "A sleek frontend interface for uploading and managing CSV data — built with Next.js and Tailwind CSS.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* CHANGE: Removed 'justify-center' from body to allow content to start at the top. 
        The component itself will be centered via 'mx-auto'.
      */}
      <body className="font-sans antialiased min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
        {/* CHANGE: Removed 'items-center justify-center' for standard page flow. */}
        <main className="w-full flex-grow p-6 sm:p-10">
          {children}
        </main>
      </body>
    </html>
  );
}