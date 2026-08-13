import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import StreakChecker from '@/components/StreakChecker';

export const metadata: Metadata = {
  title: 'Duolingo Clone — Learn Spanish',
  description: 'A full-stack Duolingo clone. Learn Spanish with bite-sized lessons.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <StreakChecker />
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
