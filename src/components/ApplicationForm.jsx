import { useForm } from 'react-hook-form';
import { sanitizeFormData } from '../lib/sanitize';
import { submitApplication } from '../lib/supabase';
import {
  trackFormSubmitted,
  trackPositionSelected,
  trackStepCompleted,
} from '../lib/analytics';
import {
  buildSubmissionPayload,
  defaultValues,
  EMAIL_REGEX,
  PHONE_REGEX,
  POSITIONS,
  URL_REGEX,
} from '../utils/formConfig';
import FormLayout from './FormLayout';
import InfoBox from './InfoBox';
import RadioGroup from './RadioGroup';
import TextInput, { TextAreaInput } from './TextInput';

function requiredRule(message) {
  return {
    required: message,
    validate: (value) => {
      if (typeof value === 'string' && value.trim().length === 0) {
        return message;
      }
      return true;
    },
  };
}

function sanitizeRule(value) {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  if (/<[^>]*>/i.test(trimmed) || /<script/i.test(trimmed)) {
    return 'HTML 또는 Script 태그는 입력할 수 없습니다.';
  }
  return true;
}

export default function ApplicationForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues,
    mode: 'onBlur',
  });

  const position = watch('position');

  const onSubmit = async (rawData) => {
    const data = sanitizeFormData(rawData);
    const payload = buildSubmissionPayload(data);

    try {
      await submitApplication(payload);
      trackFormSubmitted(true);
      trackStepCompleted('submit', true);
      onSuccess();
    } catch (err) {
      setError('root', {
        message:
          err.message ||
          '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  };

  const handlePositionChange = (e) => {
    trackPositionSelected(e.target.value);
    trackStepCompleted('position_selected', true);
  };

  return (
    <FormLayout>
      <header className="mb-10 space-y-4 text-center">
        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
          노원유쓰캐스트 13기 신입 국원 모집 지원서
        </h1>
        <p className="text-base font-semibold text-gray-800">
          노원유쓰캐스트: 노원의 이야기를 기록하다
        </p>
        <p className="text-base leading-relaxed text-gray-600">
          노원유쓰캐스트 13기 신입 국원을 모집합니다. 아래 지원서를 작성해
          주세요.
        </p>
      </header>

      <section className="mb-10 space-y-4">
        <p className="text-base text-gray-800">
          <span aria-hidden="true">📍</span>{' '}
          <strong>노원유쓰캐스트 13기 신입 국원 모집</strong>
        </p>
        <InfoBox>
          <ul className="list-disc space-y-2 pl-5 text-base text-gray-700">
            <li>
              <strong>모집 기간:</strong> 공지에 따름
            </li>
            <li>
              <strong>지원 자격:</strong> 노원구 및 인근 지역 청년
            </li>
            <li>
              <strong>지원 분야:</strong> PD, 홍보마케터, 디자이너
            </li>
          </ul>
        </InfoBox>
        <p className="text-sm text-gray-500">
          ※ 표시(<span className="text-red-500">*</span>)가 있는 항목은
          필수입니다.
        </p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <fieldset className="space-y-8">
          <legend className="sr-only">공통 정보</legend>

          <TextInput
            id="name"
            label="이름"
            required
            placeholder="홍길동"
            error={errors.name?.message}
            register={register}
            registerOptions={{
              ...requiredRule('이름을 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="birth_date"
            label="생년월일"
            required
            hint="예: 2000.01.01 또는 2000-01-01"
            placeholder="2000.01.01"
            error={errors.birth_date?.message}
            register={register}
            registerOptions={{
              ...requiredRule('생년월일을 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="academic_info"
            label="학교명/전공학과/학번(입학년도)"
            required
            placeholder="○○대학교 미디어학과 / 24학번"
            error={errors.academic_info?.message}
            register={register}
            registerOptions={{
              ...requiredRule('학교 정보를 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="residence"
            label="거주지"
            required
            placeholder="서울특별시 노원구"
            error={errors.residence?.message}
            register={register}
            registerOptions={{
              ...requiredRule('거주지를 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="activity_location"
            label="활동하는 곳"
            required
            placeholder="학교, 동아리, 카페 등"
            error={errors.activity_location?.message}
            register={register}
            registerOptions={{
              ...requiredRule('활동하는 곳을 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="phone"
            label="연락처"
            required
            hint="010-XXXX-XXXX 형식으로 입력해 주세요."
            placeholder="010-1234-5678"
            error={errors.phone?.message}
            register={register}
            registerOptions={{
              ...requiredRule('연락처를 입력해 주세요.'),
              pattern: {
                value: PHONE_REGEX,
                message: '010-XXXX-XXXX 형식으로 입력해 주세요.',
              },
              validate: sanitizeRule,
            }}
          />

          <TextInput
            id="email"
            label="E-mail 주소"
            required
            type="email"
            placeholder="example@email.com"
            error={errors.email?.message}
            register={register}
            registerOptions={{
              ...requiredRule('이메일을 입력해 주세요.'),
              pattern: {
                value: EMAIL_REGEX,
                message: '올바른 이메일 형식을 입력해 주세요.',
              },
              validate: sanitizeRule,
            }}
          />

          <RadioGroup
            name="position"
            label="지원분야"
            required
            options={POSITIONS}
            error={errors.position?.message}
            register={register}
            registerOptions={{
              ...requiredRule('지원분야를 선택해 주세요.'),
            }}
            onChange={handlePositionChange}
          />

          <TextAreaInput
            id="inspiration_source"
            label="[공통] 평소 새로운 아이디어나 기획, 디자인의 영감은 주로 어디서 얻으시나요?"
            required
            placeholder="영감을 얻는 경로, 습관, 매체 등을 자유롭게 작성해 주세요."
            error={errors.inspiration_source?.message}
            register={register}
            registerOptions={{
              ...requiredRule('영감의 출처를 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />
        </fieldset>

        {position === 'PD' && (
          <fieldset className="space-y-8 border-t border-gray-100 pt-8">
            <legend className="mb-2 text-lg font-bold text-gray-900">
              PD 지원 항목
            </legend>

            <TextInput
              id="pd_strategy"
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              placeholder="전략 및 개선점을 작성해 주세요."
              error={errors.pd_strategy?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_idea"
              label="'노원구'를 기반으로 만들어보고 싶은 영상 콘텐츠 프로그램 아이디어"
              required
              placeholder="프로그램 아이디어를 작성해 주세요."
              error={errors.pd_idea?.message}
              register={register}
              registerOptions={{
                ...requiredRule('프로그램 아이디어를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />

            <TextInput
              id="pd_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              placeholder="Premiere, Final Cut, CapCut 등"
              error={errors.pd_tools?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextAreaInput
              id="pd_experience"
              label="콘텐츠 제작 및 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요."
              error={errors.pd_experience?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_comment"
              label="마무리 한마디"
              placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
              error={errors.pd_comment?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.pd_inflow_channel?.message}
              register={register}
              registerOptions={{
                ...requiredRule('유입 경로를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />
          </fieldset>
        )}

        {position === '홍보마케터' && (
          <fieldset className="space-y-8 border-t border-gray-100 pt-8">
            <legend className="mb-2 text-lg font-bold text-gray-900">
              홍보마케터 지원 항목
            </legend>

            <TextInput
              id="mkt_strategy"
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              placeholder="전략 및 개선점을 작성해 주세요."
              error={errors.mkt_strategy?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              placeholder="Canva, Photoshop, Meta Ads 등"
              error={errors.mkt_tools?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextAreaInput
              id="mkt_experience"
              label="콘텐츠 제작 및 홍보 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요."
              error={errors.mkt_experience?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_comment"
              label="마무리 한마디"
              placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
              error={errors.mkt_comment?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.mkt_inflow_channel?.message}
              register={register}
              registerOptions={{
                ...requiredRule('유입 경로를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />
          </fieldset>
        )}

        {position === '디자이너' && (
          <fieldset className="space-y-8 border-t border-gray-100 pt-8">
            <legend className="mb-2 text-lg font-bold text-gray-900">
              디자이너 지원 항목
            </legend>

            <TextInput
              id="des_challenge"
              label="노원유쓰캐스트에서 가장 도전해보고 싶은 디자인 작업은 무엇인가요?"
              placeholder="브랜딩, SNS 콘텐츠, 영상 그래픽 등"
              error={errors.des_challenge?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="des_portfolio_url"
              label="디자이너 포트폴리오 제출"
              required
              hint="http:// 또는 https:// 로 시작하는 URL을 입력해 주세요."
              placeholder="https://portfolio.example.com"
              error={errors.des_portfolio_url?.message}
              register={register}
              registerOptions={{
                ...requiredRule('포트폴리오 URL을 입력해 주세요.'),
                pattern: {
                  value: URL_REGEX,
                  message:
                    'http:// 또는 https:// 로 시작하는 URL을 입력해 주세요.',
                },
                validate: sanitizeRule,
              }}
            />

            <TextInput
              id="des_comment"
              label="마무리 한마디"
              placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
              error={errors.des_comment?.message}
              register={register}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="des_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.des_inflow_channel?.message}
              register={register}
              registerOptions={{
                ...requiredRule('유입 경로를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />
          </fieldset>
        )}

        {errors.root && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 w-full rounded-lg bg-violet-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '제출 중...' : '지원서 제출하기'}
        </button>
      </form>
    </FormLayout>
  );
}
