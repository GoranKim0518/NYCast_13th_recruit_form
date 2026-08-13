import FormLayout from './FormLayout';

export default function SuccessScreen() {
  return (
    <FormLayout>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
          <svg
            className="h-8 w-8 text-violet-600"
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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          지원이 완료되었습니다
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600">
          노원유쓰캐스트 13기 신입 국원 모집에 지원 해주셔서 감사합니다. 면접
          때 만나뵐 수 있으면 좋겠습니다!
        </p>
      </div>
    </FormLayout>
  );
}
