export default function FormLayout({ children }) {
  return (
    <div className="min-h-dvh bg-white safe-area-top safe-area-bottom">
      <div className="h-1.5 bg-violet-600" aria-hidden="true" />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
