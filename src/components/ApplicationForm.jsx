import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFormAnalytics } from '../hooks/useFormAnalytics';
import { useFormCache } from '../hooks/useFormCache';
import { sanitizeFormData } from '../lib/sanitize';
import { getInitialFormValues, loadFormCache, saveMountedFormCache } from '../lib/formCache';
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
  POSITIONS,
  buildSubmissionPayload,
  readFormData,
  validateApplication,
} from '../utils/formConfig';
import { scrollElementIntoView } from '../utils/scroll';
import Disclosure from './Disclosure';
import FormLayout from './FormLayout';
import RadioGroup from './RadioGroup';
import RecruitmentNotice from './RecruitmentNotice';
import TextInput, { TextAreaInput } from './TextInput';

const POSITION_SUMMARY = {
  PD: '노원을 홍보하기 위한 영상 프로그램을 기획, 촬영, 송출합니다.',
  홍보마케터: '노원을 홍보하기 위한 프로젝트를 기획하고 집행합니다.',
  디자이너: (
    <>
      <p>
        디자이너 분야는 면접 없이{' '}
        <strong className="font-semibold text-gray-900">
          서류 + 포트폴리오로만 합/불이 결정
        </strong>
        됩니다.
      </p>
      <p className="mt-2">
        본인의 경력사항을 담은{' '}
        <strong className="font-semibold text-gray-900">
          포트폴리오를 필수로 제출
        </strong>
        해주세요!
      </p>
    </>
  ),
};

function PositionSection({ sectionRef, dataSection, title, position, children }) {
  const summary = POSITION_SUMMARY[position];

  return (
    <div
      ref={sectionRef}
      data-section={dataSection}
      className="min-w-0 scroll-mt-6 space-y-6 border-t border-gray-200 pt-8 sm:space-y-8"
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {summary && (
          <div className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
            {summary}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function CommonFields({ defaults, errors, position, onPositionChange }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <TextInput
        id="name"
        label="이름"
        required
        placeholder="김노리"
        defaultValue={defaults.name}
        error={errors.name?.message}
      />

      <TextInput
        id="birth_date"
        label="생년월일(YYYYMMDD)"
        required
        placeholder="20070102"
        defaultValue={defaults.birth_date}
        error={errors.birth_date?.message}
      />

      <TextInput
        id="academic_info"
        label="학교명/전공학과/학번(입학년도)"
        required
        placeholder="○○대학교 미디어학과 / 24학번"
        defaultValue={defaults.academic_info}
        error={errors.academic_info?.message}
      />

      <TextInput
        id="residence"
        label="거주지"
        required
        placeholder="ex.서울시 노원구 상계동"
        defaultValue={defaults.residence}
        error={errors.residence?.message}
      />

      <TextAreaInput
        id="activity_location"
        label="활동하는 곳"
        required
        placeholder="ex.광운대학교"
        defaultValue={defaults.activity_location}
        error={errors.activity_location?.message}
      />

      <TextInput
        id="phone"
        label="연락처"
        required
        placeholder="010-0000-0000"
        defaultValue={defaults.phone}
        error={errors.phone?.message}
      />

      <TextInput
        id="email"
        label="E-mail 주소"
        required
        placeholder="example@email.com"
        defaultValue={defaults.email}
        error={errors.email?.message}
      />

      <TextAreaInput
        id="inspiration_source"
        label="평소 새로운 아이디어나 기획, 디자인의 영감은 주로 어디서 얻으시나요?"
        required
        placeholder="영감을 얻는 경로, 매체 등을 자유롭게 작성해 주세요"
        defaultValue={defaults.inspiration_source}
        error={errors.inspiration_source?.message}
      />

      <RadioGroup
        name="position"
        label="지원분야"
        required
        options={POSITIONS}
        value={position}
        error={errors.position?.message}
        onChange={onPositionChange}
      />
    </div>
  );
}

function PositionClosingFields({ prefix, defaults, errors }) {
  const commentId = `${prefix}_comment`;
  const inflowId = `${prefix}_inflow_channel`;

  return (
    <>
      <TextAreaInput
        id={commentId}
        label="마무리 한마디"
        placeholder="내용을 자유롭게 작성해 주세요"
        defaultValue={defaults[commentId]}
        error={errors[commentId]?.message}
      />
      <TextInput
        id={inflowId}
        label="유입 경로"
        required
        placeholder="인스타그램, 에브리타임, 캠퍼스픽 등"
        defaultValue={defaults[inflowId]}
        error={errors[inflowId]?.message}
      />
    </>
  );
}

export default function ApplicationForm({ onSuccess }) {
  const defaultsRef = useRef(getInitialFormValues());
  const defaults = {
    ...defaultsRef.current,
    ...(loadFormCache() || {}),
  };
  const formRef = useRef(null);
  const commonDisclosureRef = useRef(null);
  const nextStepRef = useRef(null);
  const skipAutoScrollRef = useRef(true);
  const submitAttemptedRef = useRef(false);

  const [position, setPosition] = useState(defaults.position);
  const [errors, setErrors] = useState({});
  const [rootError, setRootError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getValues = useCallback((fieldName) => {
    const data = readFormData(formRef.current);
    return fieldName ? data[fieldName] : data;
  }, []);

  const { isRestored, clearCacheOnSubmit } = useFormCache(formRef);

  const {
    setSectionRef,
    onValidationFailed,
    onSubmitAttempt,
    onSubmitFailed,
    markFormSubmitted,
  } = useFormAnalytics({
    formRef,
    getValues,
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
    if (shouldScroll) {
      commonDisclosureRef.current?.setOpen(false, 'position_selected');
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const target = nextStepRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollElementIntoView(target);
        });
      });
    }

    skipAutoScrollRef.current = false;
  }, [position]);

  const revalidateIfAttempted = useCallback(
    (nextPosition = position) => {
      if (!submitAttemptedRef.current || !formRef.current) {
        return;
      }

      const data = readFormData(formRef.current);
      data.position = nextPosition || data.position;
      setErrors(validateApplication(data));
    },
    [position],
  );

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return undefined;
    }

    const onUpdate = (event) => {
      if (!event.target?.name) {
        return;
      }

      revalidateIfAttempted();
    };

    form.addEventListener('input', onUpdate, true);
    form.addEventListener('change', onUpdate, true);

    return () => {
      form.removeEventListener('input', onUpdate, true);
      form.removeEventListener('change', onUpdate, true);
    };
  }, [revalidateIfAttempted]);

  const handlePositionChange = useCallback(
    (event) => {
      saveMountedFormCache(formRef.current);
      const nextPosition = event.target.value;
      setPosition(nextPosition);
      trackPositionSelected(nextPosition);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          revalidateIfAttempted(nextPosition);
        });
      });
    },
    [revalidateIfAttempted],
  );

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    submitAttemptedRef.current = true;

    const rawData = readFormData(event.currentTarget);
    rawData.position = position;
    const formErrors = validateApplication(rawData);

    if (Object.keys(formErrors).length > 0) {
      onValidationFailed(formErrors);
      setErrors(formErrors);
      setRootError('');

      const firstErrorField = getFirstErrorField(formErrors, position);
      const form = event.currentTarget;

      if (firstErrorField && isCollapsedCommonField(firstErrorField)) {
        commonDisclosureRef.current?.setOpen(true, 'validation_error');
      }

      if (firstErrorField) {
        const reveal = () => {
          const field = form.elements.namedItem(firstErrorField);
          const element =
            field instanceof RadioNodeList ? field[0] : field;
          if (element instanceof HTMLElement) {
            element.focus();
            scrollElementIntoView(element, { block: 'center' });
          }
        };

        if (isCollapsedCommonField(firstErrorField)) {
          requestAnimationFrame(() => {
            requestAnimationFrame(reveal);
          });
        } else {
          reveal();
        }
      }
      return;
    }

    setErrors({});
    const data = sanitizeFormData(rawData);
    const payload = buildSubmissionPayload(data);

    onSubmitAttempt();
    setIsSubmitting(true);

    try {
      await submitApplication(payload);
      markFormSubmitted();
      clearCacheOnSubmit();
      trackDraftCleared();
      trackFormSubmitted(data.position);
      onSuccess();
    } catch (err) {
      onSubmitFailed(err);
      setRootError(
        err.message ||
          '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout>
      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        className="space-y-6 sm:space-y-8"
        noValidate
        autoComplete="off"
      >
        <Disclosure
          ref={commonDisclosureRef}
          sectionRef={setSectionRef('common')}
          dataSection="common"
          sectionName="common"
          title="기본 정보"
          closedHint={position ? `지원분야 ${position}` : undefined}
          closedAction="변경"
          showTrigger={Boolean(position)}
        >
          <RecruitmentNotice />
          <CommonFields
            defaults={defaults}
            errors={errors}
            position={position}
            onPositionChange={handlePositionChange}
          />
        </Disclosure>

        <div
          ref={nextStepRef}
          id="form-position-questions"
          className="scroll-mt-6 space-y-6 sm:space-y-8"
        >
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
              required
              placeholder="전략 및 개선점을 작성해 주세요"
              defaultValue={defaults.pd_strategy}
              error={errors.pd_strategy?.message}
            />

            <TextAreaInput
              id="pd_idea"
              label="'노원구'를 기반으로 만들어보고 싶은 영상 콘텐츠 프로그램 아이디어"
              required
              placeholder="프로그램 아이디어를 작성해 주세요"
              defaultValue={defaults.pd_idea}
              error={errors.pd_idea?.message}
            />

            <TextAreaInput
              id="pd_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              required
              placeholder="ex. 프리미어프로 / 상"
              defaultValue={defaults.pd_tools}
              error={errors.pd_tools?.message}
            />

            <TextAreaInput
              id="pd_experience"
              label="콘텐츠 제작 및 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요"
              defaultValue={defaults.pd_experience}
              error={errors.pd_experience?.message}
            />

            <PositionClosingFields
              prefix="pd"
              defaults={defaults}
              errors={errors}
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
              label="노원유쓰캐스트의 콘텐츠를 더 알리기 위한 홍보 전략/개선점과 그 이유를 함께 작성해 주세요."
              required
              placeholder="전략 및 개선점을 작성해 주세요"
              defaultValue={defaults.mkt_strategy}
              error={errors.mkt_strategy?.message}
            />

            <TextAreaInput
              id="mkt_tools"
              label="사용 가능한 툴과 실력을 모두 적어주세요"
              required
              placeholder="ex. 포토샵 / 상, GTQ 1급"
              defaultValue={defaults.mkt_tools}
              error={errors.mkt_tools?.message}
            />

            <TextAreaInput
              id="mkt_experience"
              label="콘텐츠 제작 및 홍보 관련 경력"
              placeholder="관련 경력이나 활동 경험을 작성해 주세요"
              defaultValue={defaults.mkt_experience}
              error={errors.mkt_experience?.message}
            />

            <PositionClosingFields
              prefix="mkt"
              defaults={defaults}
              errors={errors}
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
            <TextAreaInput
              id="des_challenge"
              label="노원유쓰캐스트에서 가장 도전해보고 싶은 디자인 작업은 무엇인가요?"
              required
              placeholder="ex. 실물 굿즈 디자인 / 노리 캐릭터를 활용한 스티커 세트"
              defaultValue={defaults.des_challenge}
              error={errors.des_challenge?.message}
            />

            <TextInput
              id="des_portfolio_url"
              label="디자이너 포트폴리오 제출"
              required
              placeholder="포트폴리오 링크를 적어 주세요"
              defaultValue={defaults.des_portfolio_url}
              error={errors.des_portfolio_url?.message}
            />

            <PositionClosingFields
              prefix="des"
              defaults={defaults}
              errors={errors}
            />
          </PositionSection>
        )}

        {rootError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {rootError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full cursor-pointer rounded-lg bg-violet-600 px-6 py-3 text-base font-semibold text-white transition-colors touch-manipulation hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '제출 중...' : '지원서 제출하기'}
        </button>
        </div>
      </form>
    </FormLayout>
  );
}
