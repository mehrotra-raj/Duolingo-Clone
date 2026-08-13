'use client';
import { useEffect, useState, useCallback } from 'react';
import { fetchUser, fetchLearningPath } from '@/lib/api';
import type { User, LearningPath as LPath } from '@/lib/types';
import StatsBar from '@/components/StatsBar';
import LearningPath from '@/components/LearningPath';

function loadHomeData() {
  return Promise.all([fetchUser(), fetchLearningPath(1)]);
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [path, setPath] = useState<LPath | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    loadHomeData()
      .then(([u, p]) => { setUser(u); setPath(p); setError(''); })
      .catch(() => setError('Could not connect to backend. Make sure it is running on port 8000.'));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (sessionStorage.getItem('refreshHome')) {
      sessionStorage.removeItem('refreshHome');
      refresh();
    }
  }, [refresh]);

  if (error) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ margin: '16px 0 8px' }}>Backend not reachable</h2>
        <p style={{ color: '#AFAFAF' }}>{error}</p>
        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={refresh}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      <StatsBar user={user} />
      {path ? (
        <LearningPath units={path.units} hearts={user?.hearts ?? 0} />
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#AFAFAF' }}>
          <div style={{ fontSize: 48, animation: 'pulse-glow 1.5s infinite' }}>🦜</div>
          <p style={{ marginTop: 16, fontWeight: 700 }}>Loading your course...</p>
        </div>
      )}
    </div>
  );
}
