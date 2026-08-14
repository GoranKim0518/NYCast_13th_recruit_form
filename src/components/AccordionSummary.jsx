const SUMMARY_CLASS_NAME =
  'cursor-pointer list-none rounded-xl border border-gray-200 bg-gray-50 text-left transition-colors touch-manipulation hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden';

export default function AccordionSummary({
  title,
  closedHint,
  closedAction = '펼치기',
  openAction = '접기',
  hidden = false,
}) {
  return (
    <summary
      className={
        hidden
          ? 'pointer-events-none sr-only'
          : SUMMARY_CLASS_NAME
      }
    >
      <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-3">
        <span className="min-w-0">
          <span className="block text-base font-bold text-gray-900 sm:text-lg">
            {title}
          </span>
          {closedHint && (
            <span className="mt-0.5 block text-sm text-gray-500 group-open:hidden">
              {closedHint}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500">
          <span className="group-open:hidden">{closedAction}</span>
          <span className="hidden group-open:inline">{openAction}</span>
          <svg
            className="disclosure-chevron h-5 w-5 transition-transform group-open:rotate-180"
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
      </div>
    </summary>
  );
}
