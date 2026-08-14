'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DuoLogo, IconLearn, IconLeaderboard, IconProfile, IconShop, IconSettings } from './icons';

const NAV = [
  { href: '/', icon: IconLearn, label: 'Learn', accent: 'learn' },
  { href: '/leaderboard', icon: IconLeaderboard, label: 'Leaderboard', accent: 'league' },
  { href: '/profile', icon: IconProfile, label: 'Profile', accent: 'profile' },
  { href: '/shop', icon: IconShop, label: 'Shop', accent: 'shop' },
  { href: '/settings', icon: IconSettings, label: 'More', accent: 'more' },
];

export default function Sidebar() {
  const path = usePathname();
  if (path.startsWith('/lesson')) return null;

  return (
    <aside className="sidebar">
      <Link href="/" className="sidebar-logo">
        <DuoLogo size={40} />
        <span className="logo-text">duolingo</span>
      </Link>

      <p className="sidebar-section-label">Menu</p>
      <nav className="sidebar-nav">
        {NAV.map(n => {
          const Icon = n.icon;
          const active = path === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`nav-item nav-item--${n.accent} ${active ? 'active' : ''}`}
            >
              <span className="nav-icon-wrap">
                <Icon />
              </span>
              <span className="nav-label">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-super-card">
          <div className="sidebar-super-glow" aria-hidden />
          <div className="sidebar-super-icon">✨</div>
          <p className="sidebar-super-title">Super Duolingo</p>
          <p className="sidebar-super-desc">Unlimited hearts, no ads, and personalized practice.</p>
          <button type="button" className="sidebar-super-btn">Try for free</button>
        </div>
      </div>
    </aside>
  );
}
