'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchUser } from '@/lib/api';
import type { User } from '@/lib/types';
import TopHeader from './TopHeader';
import RightRail from './RightRail';

interface Props {
  children: React.ReactNode;
  showRail?: boolean;
}

export default function PageShell({ children, showRail = true }: Props) {
  const path = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!path.startsWith('/lesson')) {
      fetchUser().then(setUser).catch(() => {});
    }
  }, [path]);

  if (path.startsWith('/lesson')) {
    return <>{children}</>;
  }

  return (
    <div className="page-layout">
      <div className="page-main">
        <TopHeader user={user} />
        {children}
      </div>
      {showRail && <RightRail user={user} />}
    </div>
  );
}
