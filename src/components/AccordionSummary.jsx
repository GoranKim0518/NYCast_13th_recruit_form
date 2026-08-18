const SUMMARY_CLASS_NAME =
  'flex min-h-12 w-full cursor-default items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors touch-manipulation hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 [@media(hover:hover)_and_(pointer:fine)]:cursor-pointer';

export default function AccordionSummary({
  title,
  closedHint,
  closedAction = '펼치기',
  openAction = '접기',
  isOpen = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={SUMMARY_CLASS_NAME}
      aria-expanded={isOpen}
      onClick={onClick}
    >
      <span className="min-w-0">
        <span className="block text-pretty text-base font-bold tracking-tight text-gray-900 sm:text-lg">
          {title}
        </span>
        {closedHint && !isOpen && (
          <span className="mt-0.5 block text-sm text-gray-500">{closedHint}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500">
        <span>{isOpen ? openAction : closedAction}</span>
        <svg
          className={`disclosure-chevron h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  );
}
