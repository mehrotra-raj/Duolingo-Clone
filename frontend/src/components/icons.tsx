export function DuoLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#58CC02" />
      <ellipse cx="24" cy="28" rx="14" ry="12" fill="#fff" />
      <circle cx="17" cy="22" r="5" fill="#fff" stroke="#4B4B4B" strokeWidth="1.5" />
      <circle cx="31" cy="22" r="5" fill="#fff" stroke="#4B4B4B" strokeWidth="1.5" />
      <circle cx="18" cy="22" r="2.5" fill="#4B4B4B" />
      <circle cx="32" cy="22" r="2.5" fill="#4B4B4B" />
      <path d="M18 32 Q24 38 30 32" stroke="#FF9600" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M8 18 Q4 8 14 6" stroke="#58CC02" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 18 Q44 8 34 6" stroke="#58CC02" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function IconLearn() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3L1 9l4 2.18V17c0 2.5 3.5 4.5 7 4.5s7-2 7-4.5v-5.82L23 9 12 3zm0 2.5L19 9l-7 3.5L5 9l7-3.5zM6 11.5V17c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-5.5l-2 1.09V17c0 .5-1.8 1.5-4 1.5s-4-1-4-1.5v-4.41l-2-1.09z" />
    </svg>
  );
}

export function IconLeaderboard() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.4 4.8L20 8l-3.5 3.4.8 4.9L12 14.5 6.7 16.3l.8-4.9L4 8l5.6-1.2L12 2z" />
      <rect x="3" y="18" width="5" height="4" rx="1" />
      <rect x="9.5" y="15" width="5" height="7" rx="1" />
      <rect x="16" y="17" width="5" height="5" rx="1" />
    </svg>
  );
}

export function IconProfile() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function IconShop() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 4h10l1 4H6l1-4zm-2 6h14l-1.5 10H6.5L5 10zm4 2v6h2v-6H9zm4 0v6h2v-6h-2z" />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.5 4a7.5 7.5 0 01-.2 1.8l2 1.5-2 3.5-2.4-1a7.6 7.6 0 01-1.6.9l-.4 2.6H9.1l-.4-2.6a7.6 7.6 0 01-1.6-.9l-2.4 1-2-3.5 2-1.5a7.5 7.5 0 010-3.6l-2-1.5 2-3.5 2.4 1a7.6 7.6 0 011.6-.9l.4-2.6h5.8l.4 2.6a7.6 7.6 0 011.6.9l2.4-1 2 3.5-2 1.5c.1.6.2 1.2.2 1.8z" />
    </svg>
  );
}

export function IconStreak() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF9600" aria-hidden>
      <path d="M12 2C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-12zm0 18a4 4 0 010-8 4 4 0 010 8z" />
    </svg>
  );
}

export function IconHeart({ filled = true }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#FF4B4B' : 'none'} stroke="#FF4B4B" strokeWidth="2" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function IconGem() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1CB0F6" aria-hidden>
      <path d="M12 2L2 9l10 13L22 9 12 2zm0 4.5L17.5 9 12 16.5 6.5 9 12 6.5z" />
    </svg>
  );
}

export function IconXp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFC200" aria-hidden>
      <path d="M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5 2.5-7.5L2 9.5h7.5L12 2z" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconLock() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 10V7a5 5 0 00-10 0v3H5v12h14V10h-2zm-8 0V7a3 3 0 016 0v3H9z" />
    </svg>
  );
}
