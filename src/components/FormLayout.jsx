export default function FormLayout({ children, progress = 0, progressLabel }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="min-h-dvh bg-white safe-area-top safe-area-bottom">
      <div
        className="sticky top-0 z-10 bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          className="relative h-1.5 bg-violet-100"
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel ?? '지원서 작성 진행도'}
        >
          <div
            className="h-full bg-violet-600 transition-[width] duration-300 ease-out"
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
