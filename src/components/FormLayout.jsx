export default function FormLayout({ children, centered = false }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white safe-area-top safe-area-bottom">
      <main
        className={
          centered
            ? 'mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 sm:px-6'
            : 'mx-auto w-full max-w-2xl px-5 py-8 sm:px-6 sm:py-14'
        }
      >
        {children}
      </main>
    </div>
  );
}
