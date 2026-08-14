'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLearn, IconLeaderboard, IconProfile } from './icons';

const NAV = [
  { href: '/', icon: IconLearn, label: 'Learn' },
  { href: '/leaderboard', icon: IconLeaderboard, label: 'League' },
  { href: '/profile', icon: IconProfile, label: 'Profile' },
];

export default function BottomNav() {
  const path = usePathname();
  if (path.startsWith('/lesson')) return null;

  return (
    <nav className="bottom-nav">
      {NAV.map(n => {
        const Icon = n.icon;
        const active = path === n.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon"><Icon /></span>
            <span className="bottom-nav-label">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
