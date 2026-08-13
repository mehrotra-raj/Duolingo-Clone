export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 500, overflow: 'auto' }}>
      {children}
    </div>
  );
}
