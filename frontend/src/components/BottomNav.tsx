'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', icon: '📚', label: 'Learn' },
  { href: '/leaderboard', icon: '🏆', label: 'League' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const path = usePathname();

  // Hide on lesson pages (full-screen overlay)
  if (path.startsWith('/lesson')) return null;

  return (
    <nav className="bottom-nav">
      {NAV.map(n => (
        <Link
          key={n.href}
          href={n.href}
          className={`bottom-nav-item ${path === n.href ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{n.icon}</span>
          <span className="bottom-nav-label">{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}
