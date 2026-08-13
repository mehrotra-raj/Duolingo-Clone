'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',             icon: '📚', label: 'Learn' },
  { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { href: '/profile',     icon: '👤', label: 'Profile' },
  { href: '/shop',        icon: '💎', label: 'Shop' },
  { href: '/settings',    icon: '⚙️',  label: 'Settings' },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        <span style={{ fontSize: 32 }}>🦜</span>
        <span className="logo-text">duolingo</span>
      </Link>
      <nav>
        {NAV.map(n => (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-item ${path === n.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
