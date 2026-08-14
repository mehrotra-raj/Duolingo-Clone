'use client';
import { useEffect, useState, useCallback } from 'react';
import { fetchUser, fetchLearningPath } from '@/lib/api';
import type { User, LearningPath as LPath } from '@/lib/types';
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

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h2>Backend not reachable</h2>
        <p>{error}</p>
        <button type="button" className="btn btn-green" onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-content">
      {path ? (
        <LearningPath units={path.units} hearts={user?.hearts ?? 0} />
      ) : (
        <div className="loading-state">
          <div className="loading-mascot">🦜</div>
          <p>Loading your course...</p>
        </div>
      )}
    </div>
  );
}
