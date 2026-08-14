import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DraftSaveStatus, RestoredDraftNotice } from './DraftNotice';
import { useFormAnalytics } from '../hooks/useFormAnalytics';
import { useFormCache } from '../hooks/useFormCache';
import { sanitizeFormData } from '../lib/sanitize';
import { getInitialFormValues } from '../lib/formCache';
import { submitApplication } from '../lib/supabase';
import {
  trackDraftCleared,
  trackDraftRestored,
  trackFormSubmitted,
  trackPositionSelected,
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
import RadioGroup from './RadioGroup';
import RecruitmentNotice from './RecruitmentNotice';
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

function fieldBlur(onFieldBlur, fieldName) {
  return () => onFieldBlur(fieldName);
}

export default function ApplicationForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    getValues,
    getFieldState,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: getInitialFormValues(),
    mode: 'onBlur',
  });

  const position = watch('position');

  const {
    isRestored,
    lastSavedAt,
    dismissRestoredNotice,
    clearDraft,
    clearCacheOnSubmit,
  } = useFormCache(watch);

  const { setSectionRef, onFieldBlur, onSubmitAttempt, onSubmitFailed } =
    useFormAnalytics({
      trigger,
      getValues,
      getFieldState,
      position,
    });

  useEffect(() => {
    if (isRestored) {
      trackDraftRestored();
    }
  }, [isRestored]);

  const handleClearDraft = () => {
    if (
      !window.confirm(
        '저장된 작성 내용을 모두 지울까요? 이 작업은 되돌릴 수 없습니다.',
      )
    ) {
      return;
    }

    clearDraft();
    reset(defaultValues);
    trackDraftCleared();
  };

  const onSubmit = async (rawData) => {
    const data = sanitizeFormData(rawData);
    const payload = buildSubmissionPayload(data);

    try {
      await submitApplication(payload);
      clearCacheOnSubmit();
      trackFormSubmitted(data.position);
      onSuccess();
    } catch (err) {
      onSubmitFailed(err);
      setError('root', {
        message:
          err.message ||
          '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  };

  const handleFormSubmit = (event) => {
    onSubmitAttempt();
    handleSubmit(onSubmit)(event);
  };

  const handlePositionChange = (e) => {
    trackPositionSelected(e.target.value);
    onFieldBlur('position');
  };

  return (
    <FormLayout>
      <RecruitmentNotice />

      {isRestored && (
        <div className="mb-8">
          <RestoredDraftNotice onDismiss={dismissRestoredNotice} />
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
        <fieldset
          ref={setSectionRef('common')}
          data-section="common"
          className="space-y-8"
        >
          <legend className="sr-only">공통 정보</legend>

          <TextInput
            id="name"
            label="이름"
            required
            placeholder="홍길동"
            error={errors.name?.message}
            register={register}
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'name')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'birth_date')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'academic_info')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'residence')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'activity_location')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'phone')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'email')}
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
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'inspiration_source')}
            registerOptions={{
              ...requiredRule('영감의 출처를 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />
        </fieldset>

        {position === 'PD' && (
          <fieldset
            ref={setSectionRef('pd')}
            data-section="pd"
            className="space-y-8 border-t border-gray-100 pt-8"
          >
            <legend className="mb-2 text-lg font-bold text-gray-900">
              PD 지원 항목
            </legend>

            <TextInput
              id="pd_strategy"
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              placeholder="전략 및 개선점을 작성해 주세요."
              error={errors.pd_strategy?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_strategy')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_idea"
              label="'노원구'를 기반으로 만들어보고 싶은 영상 콘텐츠 프로그램 아이디어"
              required
              placeholder="프로그램 아이디어를 작성해 주세요."
              error={errors.pd_idea?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_idea')}
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
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_tools')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextAreaInput
              id="pd_experience"
              label="콘텐츠 제작 및 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요."
              error={errors.pd_experience?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_experience')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_comment"
              label="마무리 한마디"
              placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
              error={errors.pd_comment?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_comment')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="pd_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.pd_inflow_channel?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'pd_inflow_channel')}
              registerOptions={{
                ...requiredRule('유입 경로를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />
          </fieldset>
        )}

        {position === '홍보마케터' && (
          <fieldset
            ref={setSectionRef('marketer')}
            data-section="marketer"
            className="space-y-8 border-t border-gray-100 pt-8"
          >
            <legend className="mb-2 text-lg font-bold text-gray-900">
              홍보마케터 지원 항목
            </legend>

            <TextInput
              id="mkt_strategy"
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              placeholder="전략 및 개선점을 작성해 주세요."
              error={errors.mkt_strategy?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_strategy')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              placeholder="Canva, Photoshop, Meta Ads 등"
              error={errors.mkt_tools?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_tools')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextAreaInput
              id="mkt_experience"
              label="콘텐츠 제작 및 홍보 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요."
              error={errors.mkt_experience?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_experience')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_comment"
              label="마무리 한마디"
              placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
              error={errors.mkt_comment?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_comment')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.mkt_inflow_channel?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_inflow_channel')}
              registerOptions={{
                ...requiredRule('유입 경로를 입력해 주세요.'),
                validate: sanitizeRule,
              }}
            />
          </fieldset>
        )}

        {position === '디자이너' && (
          <fieldset
            ref={setSectionRef('designer')}
            data-section="designer"
            className="space-y-8 border-t border-gray-100 pt-8"
          >
            <legend className="mb-2 text-lg font-bold text-gray-900">
              디자이너 지원 항목
            </legend>

            <TextInput
              id="des_challenge"
              label="노원유쓰캐스트에서 가장 도전해보고 싶은 디자인 작업은 무엇인가요?"
              placeholder="브랜딩, SNS 콘텐츠, 영상 그래픽 등"
              error={errors.des_challenge?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'des_challenge')}
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
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'des_portfolio_url')}
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
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'des_comment')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="des_inflow_channel"
              label="유입 경로"
              required
              placeholder="인스타그램, 지인 추천, 학교 공지 등"
              error={errors.des_inflow_channel?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'des_inflow_channel')}
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

        <DraftSaveStatus lastSavedAt={lastSavedAt} onClear={handleClearDraft} />

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
