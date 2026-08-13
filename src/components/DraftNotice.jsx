function formatSavedTime(date) {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RestoredDraftNotice({ onDismiss }) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3"
      role="status"
    >
      <p className="text-sm text-violet-900">
        이전에 작성하던 내용을 불러왔습니다. 이 기기에만 저장됩니다.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
      >
        닫기
      </button>
    </div>
  );
}

export function DraftSaveStatus({ lastSavedAt, onClear }) {
  if (!lastSavedAt) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
      <span>임시 저장됨 · {formatSavedTime(lastSavedAt)}</span>
      <button
        type="button"
        onClick={onClear}
        className="min-h-11 font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
      >
        작성 내용 지우기
      </button>
    </div>
  );
}
