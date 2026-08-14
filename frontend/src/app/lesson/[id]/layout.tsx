export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lesson-overlay">
      {children}
    </div>
  );
}
