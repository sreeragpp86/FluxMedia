import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FluxMedia — Distributed Media Task Queue",
  description:
    "High-throughput distributed media queue backend with FastAPI, Celery, and Redis with an Onyx & Alabaster interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
            {children}
          </main>
          <footer className="border-t border-black/5 dark:border-white/10 py-6 text-center text-xs font-mono text-zinc-400 dark:text-zinc-600">
            FluxMedia • Distributed Task Processing with FastAPI, Celery, Redis & FFmpeg
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
