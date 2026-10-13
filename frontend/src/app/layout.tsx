import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "FluxMedia — Distributed Media Processing Queue",
  description:
    "Enterprise asynchronous video transcoding pipeline powered by FastAPI, Celery, and Redis.",
  keywords: ["FFmpeg", "FastAPI", "Celery", "Redis", "Distributed Queue", "H.264", "Video Compression"],
  authors: [{ name: "FluxMedia Engineering" }],
  openGraph: {
    title: "FluxMedia — Distributed Media Processing Queue",
    description: "Decouple HTTP ingestion from FFmpeg video compression with Redis & Celery.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 transition-colors duration-150 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
