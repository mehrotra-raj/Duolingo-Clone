'use client';
import { useEffect, useState } from 'react';
import { fetchUser, updateUser } from '@/lib/api';

const GOALS = [5, 10, 15, 20, 30, 50];

export default function SettingsPage() {
  const [goal, setGoal] = useState(20);
  const [displayName, setDisplayName] = useState('');
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser()
      .then(user => {
        setGoal(user.daily_xp_goal);
        setDisplayName(user.display_name);
      })
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateUser({ daily_xp_goal: goal, display_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Failed to save. Is the backend running?');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
        background: value ? 'var(--duo-green)' : 'var(--duo-gray)',
        position: 'relative', transition: 'background 200ms',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 26 : 3, width: 22, height: 22,
        borderRadius: '50%', background: '#fff', transition: 'left 200ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  if (loading) {
    return (
      <div className="page-content" style={{ paddingTop: 80, textAlign: 'center', color: '#AFAFAF' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Customize your learning experience</p>

      <div className="profile-card">
        <div className="section-title" style={{ margin: '0 0 16px' }}>Display Name</div>
        <input
          className="type-input"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="profile-card">
        <div className="section-title" style={{ margin: '0 0 16px' }}>Daily XP Goal</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {GOALS.map(g => (
            <button key={g} onClick={() => setGoal(g)}
              className={`btn ${goal === g ? 'btn-green' : 'btn-gray'}`}
              style={{ padding: '10px 20px', fontSize: 15 }}>
              {g} XP
            </button>
          ))}
        </div>
      </div>

      <div className="profile-card">
        <div className="section-title" style={{ margin: '0 0 16px' }}>Preferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { label: '🔊 Sound Effects', desc: 'Coming soon — UI placeholder', value: sound, onChange: setSound },
            { label: '🔔 Streak Reminders', desc: 'Coming soon — UI placeholder', value: notifications, onChange: setNotifications },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#AFAFAF' }}>{item.desc}</div>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--duo-red)', fontWeight: 700, marginBottom: 12 }}>{error}</p>}

      <button className="btn btn-green" style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
        {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
