import { useEffect } from 'react';
import FormLayout from './FormLayout';
import { trackFormCompletedView } from '../lib/analytics';

export default function SuccessScreen() {
  useEffect(() => {
    trackFormCompletedView();
  }, []);

  return (
    <FormLayout centered>
      <div className="flex flex-1 flex-col items-center justify-center px-1 pb-24 pt-2 text-center sm:pb-10 sm:pt-0">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 sm:mb-6 sm:h-16 sm:w-16">
          <svg
            className="h-7 w-7 text-violet-600 sm:h-8 sm:w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-pretty text-[1.375rem] font-bold leading-[1.45] tracking-tight text-gray-900 sm:text-3xl sm:leading-snug">
          지원이 완료되었습니다
        </h1>
        <p className="mt-3 max-w-[17.5rem] text-[0.9375rem] leading-[1.8] tracking-tight text-gray-600 sm:mt-4 sm:max-w-md sm:text-base">
          노원유쓰캐스트 13기 신입 국원 모집에 지원해 주셔서 감사합니다.
        </p>
      </div>
    </FormLayout>
  );
}
