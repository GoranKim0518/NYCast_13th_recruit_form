import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
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
  getFirstErrorField,
  isCollapsedCommonField,
} from '../utils/formAnalyticsConfig';
import {
  buildSubmissionPayload,
  EMAIL_REGEX,
  PHONE_REGEX,
  POSITIONS,
  URL_REGEX,
} from '../utils/formConfig';
import { scrollElementIntoView } from '../utils/scroll';
import { RECRUITMENT_INFO } from '../constants/recruitmentInfo';
import Disclosure from './Disclosure';
import FormLayout from './FormLayout';
import RadioGroup from './RadioGroup';
import RecruitmentNotice from './RecruitmentNotice';
import TextInput, { TextAreaInput } from './TextInput';

const POSITION_ROLE_ID = {
  PD: 'pd',
  홍보마케터: 'mkt',
  디자이너: 'des',
};

const ROLE_BY_ID = Object.fromEntries(
  RECRUITMENT_INFO.section2.roles.map((role) => [role.id, role]),
);

function RoleTasks({ position }) {
  const role = ROLE_BY_ID[POSITION_ROLE_ID[position]];
  if (!role) {
    return null;
  }

  return (
    <ul className="space-y-1 text-sm leading-relaxed text-gray-600">
      {role.tasks.map((task) => (
        <li key={task}>{task}</li>
      ))}
    </ul>
  );
}

function PositionSection({ sectionRef, dataSection, title, position, children }) {
  return (
    <fieldset
      ref={sectionRef}
      data-section={dataSection}
      className="min-w-0 space-y-8 border-t border-gray-200 pt-8"
    >
      <legend className="sr-only">{title}</legend>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="mt-2">
          <RoleTasks position={position} />
        </div>
      </div>
      {children}
    </fieldset>
  );
}

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

function CommonFields({ errors, register, onFieldBlur, onPositionChange }) {
  return (
    <fieldset className="space-y-8">
      <legend className="sr-only">공통 정보</legend>

      <TextInput
        maxLength={20}
        id="name"
        label="이름"
        required
        placeholder="김노리"
        error={errors.name?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'name')}
        registerOptions={{
          ...requiredRule('이름을 입력해 주세요.'),
          validate: sanitizeRule,
        }}
      />

      <TextInput
        maxLength={8}
        id="birth_date"
        label="생년월일(YYYYMMDD)"
        required
        placeholder="20070102"
        error={errors.birth_date?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'birth_date')}
        registerOptions={{
          ...requiredRule('생년월일을 입력해 주세요.'),
          validate: sanitizeRule,
        }}
      />

      <TextInput
        maxLength={150}
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
        maxLength={150}
        id="residence"
        label="거주지"
        required
        placeholder="ex.서울시 노원구 상계동"
        error={errors.residence?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'residence')}
        registerOptions={{
          ...requiredRule('거주지를 입력해 주세요.'),
          validate: sanitizeRule,
        }}
      />

      <TextInput
        maxLength={100}
        id="activity_location"
        label="활동하는 곳"
        required
        placeholder="ex.광운대학교"
        error={errors.activity_location?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'activity_location')}
        registerOptions={{
          ...requiredRule('활동하는 곳을 입력해 주세요.'),
          validate: sanitizeRule,
        }}
      />

      <TextInput
        maxLength={13}
        id="phone"
        label="연락처"
        required
        placeholder="010-0000-0000"
        error={errors.phone?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'phone')}
        registerOptions={{
          ...requiredRule('연락처를 입력해 주세요.'),
          validate: {
            sanitize: sanitizeRule,
            format: (value) =>
              !value ||
              PHONE_REGEX.test(value.trim()) ||
              '010-0000-0000 형식으로 입력해 주세요.',
          },
        }}
      />

      <TextInput
        id="email"
        label="E-mail 주소"
        required
        placeholder="example@email.com"
        error={errors.email?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, 'email')}
        registerOptions={{
          ...requiredRule('이메일을 입력해 주세요.'),
          validate: {
            sanitize: sanitizeRule,
            format: (value) =>
              !value ||
              EMAIL_REGEX.test(value.trim()) ||
              '이메일 주소에 @가 포함되어야 합니다.',
          },
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
        onChange={onPositionChange}
      />
    </fieldset>
  );
}

function PositionClosingFields({ prefix, errors, register, onFieldBlur }) {
  const commentId = `${prefix}_comment`;
  const inflowId = `${prefix}_inflow_channel`;

  return (
    <>
      <TextInput
        id={commentId}
        label="마무리 한마디"
        placeholder="하고 싶은 말을 자유롭게 작성해 주세요."
        error={errors[commentId]?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, commentId)}
        registerOptions={{ validate: sanitizeRule }}
      />
      <TextInput
        id={inflowId}
        label="유입 경로"
        required
        placeholder="인스타그램, 지인 추천, 학교 공지 등"
        error={errors[inflowId]?.message}
        register={register}
        onAnalyticsBlur={fieldBlur(onFieldBlur, inflowId)}
        registerOptions={{
          ...requiredRule('유입 경로를 입력해 주세요.'),
          validate: sanitizeRule,
        }}
      />
    </>
  );
}

export default function ApplicationForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    getFieldState,
    formState: { errors, isSubmitting },
    setError,
    setFocus,
  } = useForm({
    defaultValues: getInitialFormValues(),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const position = watch('position');
  const commonDisclosureRef = useRef(null);
  const nextStepRef = useRef(null);
  const skipAutoScrollRef = useRef(true);

  const { isRestored, clearCacheOnSubmit } = useFormCache(watch);

  const {
    setSectionRef,
    onFieldBlur,
    onSubmitAttempt,
    onSubmitFailed,
    markFormSubmitted,
  } = useFormAnalytics({
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

  useLayoutEffect(() => {
    if (!position) {
      commonDisclosureRef.current?.setOpen(true);
      skipAutoScrollRef.current = false;
      return;
    }

    const shouldScroll = !skipAutoScrollRef.current;
    commonDisclosureRef.current?.setOpen(
      false,
      shouldScroll ? 'position_selected' : undefined,
    );

    if (shouldScroll) {
      scrollElementIntoView(nextStepRef.current);
    }

    skipAutoScrollRef.current = false;
  }, [position]);

  const onSubmit = async (rawData) => {
    const data = sanitizeFormData(rawData);
    const payload = buildSubmissionPayload(data);

    onSubmitAttempt();

    try {
      await submitApplication(payload);
      markFormSubmitted();
      clearCacheOnSubmit();
      trackDraftCleared();
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

  const onInvalid = useCallback(
    (formErrors) => {
      const firstErrorField = getFirstErrorField(formErrors, position);

      if (firstErrorField && isCollapsedCommonField(firstErrorField)) {
        commonDisclosureRef.current?.setOpen(true, 'validation_error');
      }

      if (!firstErrorField) {
        return;
      }

      setFocus(firstErrorField);
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (
          active instanceof HTMLElement &&
          (active.id === firstErrorField || active.name === firstErrorField)
        ) {
          scrollElementIntoView(active, { block: 'center' });
        }
      });
    },
    [position, setFocus],
  );

  const handleFormSubmit = (event) => {
    handleSubmit(onSubmit, onInvalid)(event);
  };

  const handlePositionChange = useCallback(
    (event) => {
      trackPositionSelected(event.target.value);
      onFieldBlur('position');
    },
    [onFieldBlur],
  );

  return (
    <FormLayout>
      <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
        <Disclosure
          ref={commonDisclosureRef}
          sectionRef={setSectionRef('common')}
          dataSection="common"
          sectionName="common"
          title="공통 정보"
          closedHint={position ? `지원분야 ${position}` : undefined}
          closedAction="변경"
          showTrigger={Boolean(position)}
        >
          <RecruitmentNotice />
          <CommonFields
            errors={errors}
            register={register}
            onFieldBlur={onFieldBlur}
            onPositionChange={handlePositionChange}
          />
        </Disclosure>

        <div
          ref={nextStepRef}
          id="form-position-questions"
          className="scroll-mt-6 space-y-8"
        >
          <TextAreaInput
            id="inspiration_source"
            label="[공통] 평소 새로운 아이디어나 기획, 디자인의 영감은 주로 어디서 얻으시나요?"
            required
            placeholder="영감을 얻는 경로, 매체 등을 자유롭게 작성해 주세요."
            error={errors.inspiration_source?.message}
            register={register}
            onAnalyticsBlur={fieldBlur(onFieldBlur, 'inspiration_source')}
            registerOptions={{
              ...requiredRule('영감의 출처를 입력해 주세요.'),
              validate: sanitizeRule,
            }}
          />

        {position === 'PD' && (
          <PositionSection
            sectionRef={setSectionRef('pd')}
            dataSection="pd"
            title="PD 지원 항목"
            position="PD"
          >
            <TextAreaInput
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
              placeholder="ex. 프리미어프로 / 상"
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

            <PositionClosingFields
              prefix="pd"
              errors={errors}
              register={register}
              onFieldBlur={onFieldBlur}
            />
          </PositionSection>
        )}

        {position === '홍보마케터' && (
          <PositionSection
            sectionRef={setSectionRef('marketer')}
            dataSection="marketer"
            title="홍보마케터 지원 항목"
            position="홍보마케터"
          >
            <TextAreaInput
              id="mkt_strategy"
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 본인만의 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              placeholder="전략 및 개선점을 작성해 주세요."
              error={errors.mkt_strategy?.message}
              register={register}
              onAnalyticsBlur={fieldBlur(onFieldBlur, 'mkt_strategy')}
              registerOptions={{ validate: sanitizeRule }}
            />

            <TextInput
              id="mkt_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              placeholder="ex. 포토샵 / 상, GTQ 1급"
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

            <PositionClosingFields
              prefix="mkt"
              errors={errors}
              register={register}
              onFieldBlur={onFieldBlur}
            />
          </PositionSection>
        )}

        {position === '디자이너' && (
          <PositionSection
            sectionRef={setSectionRef('designer')}
            dataSection="designer"
            title="디자이너 지원 항목"
            position="디자이너"
          >
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

            <PositionClosingFields
              prefix="des"
              errors={errors}
              register={register}
              onFieldBlur={onFieldBlur}
            />
          </PositionSection>
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
        </div>
      </form>
    </FormLayout>
  );
}
