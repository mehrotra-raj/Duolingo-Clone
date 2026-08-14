import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import PageShell from '@/components/PageShell';
import StreakChecker from '@/components/StreakChecker';

export const metadata: Metadata = {
  title: 'Duolingo — Learn Spanish',
  description: 'Learn Spanish with bite-sized lessons. Fun, free, and effective.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <StreakChecker />
          <Sidebar />
          <div className="main-content">
            <PageShell>{children}</PageShell>
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
