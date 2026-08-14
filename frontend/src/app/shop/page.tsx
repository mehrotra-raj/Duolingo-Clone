'use client';
import { useEffect, useState } from 'react';
import { fetchUser, refillHearts } from '@/lib/api';
import type { User } from '@/lib/types';

const HEART_REFILL_PRICE = 350;

const ITEMS = [
  { id: 'streak-freeze', icon: '🛡️', name: 'Streak Freeze', desc: 'Protects your streak for one missed day', price: 10, comingSoon: true },
  { id: 'heart-refill', icon: '❤️', name: 'Heart Refill', desc: 'Refill all hearts instantly', price: HEART_REFILL_PRICE, comingSoon: false },
  { id: 'double-xp', icon: '⭐', name: 'Double XP', desc: 'Earn 2× XP for 15 minutes', price: 100, comingSoon: true },
  { id: 'legendary', icon: '🎯', name: 'Legendary Status', desc: 'Unlock special Legendary lessons', price: 600, comingSoon: true },
];

export default function ShopPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const refresh = () => fetchUser().then(setUser);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const handleBuy = async (itemId: string) => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item || item.comingSoon) {
      setMessage('Coming soon!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    if (!user || user.gems < item.price) {
      setMessage('Not enough gems!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setBuying(itemId);
    setMessage('');
    try {
      const updated = await refillHearts();
      setUser(updated);
      setMessage('Hearts refilled! ❤️');
    } catch {
      setMessage('Purchase failed. Try again.');
    } finally {
      setBuying(null);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>Loading shop...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">Spend your gems on power-ups and perks</p>

      <div className="gems-banner">
        <div className="gems-banner-icon">💎</div>
        <div>
          <div className="gems-banner-label">Your gems balance</div>
          <div className="gems-banner-value">{user?.gems ?? 0}</div>
        </div>
      </div>

      {message && (
        <p style={{ textAlign: 'center', fontWeight: 700, color: 'var(--duo-blue)', marginBottom: 16 }}>{message}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ITEMS.map(item => {
          const canAfford = (user?.gems ?? 0) >= item.price;
          return (
            <div key={item.id} className="profile-card shop-item">
              <div className="shop-item-icon">{item.icon}</div>
              <div className="shop-item-info">
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-desc">{item.desc}</div>
              </div>
              <button
                type="button"
                className={`btn ${item.comingSoon ? 'btn-gray' : canAfford ? 'btn-blue' : 'btn-gray'}`}
                style={{ padding: '10px 18px', fontSize: 14, flexShrink: 0 }}
                onClick={() => handleBuy(item.id)}
                disabled={buying === item.id}
              >
                {buying === item.id ? '...' : item.comingSoon ? 'Soon' : `💎 ${item.price}`}
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--duo-gray2)', fontSize: 13, fontWeight: 600 }}>
        Earn gems by completing lessons and maintaining your streak 🔥
      </p>
    </div>
  );
}
