import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusGrid 2.0 — AI-Powered Campus Placement Platform',
  description: 'Placement intelligence platform for students, TPO, recruiters, and mentors. Zero-cost free-tier architecture with real-time notices, STAR-method AI mock interviews, and multi-round hiring pipeline tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
