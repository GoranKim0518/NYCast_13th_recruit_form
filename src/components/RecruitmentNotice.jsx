import { RECRUITMENT_INFO } from '../constants/recruitmentInfo';
import Disclosure from './Disclosure';

const TEXT_MARKUP_PATTERN = /(<b>[\s\S]*?<\/b>|<nowrap>[\s\S]*?<\/nowrap>)/;
const BODY_CLASS = 'text-[0.9375rem] leading-[1.8] tracking-tight text-gray-700 sm:text-base';

function LinkedText({ text }) {
  return text.split(TEXT_MARKUP_PATTERN).map((part, index) => {
    const boldMatch = part.match(/^<b>([\s\S]*)<\/b>$/);
    if (boldMatch) {
      return (
        <b key={`bold-${index}`} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </b>
      );
    }

    const nowrapMatch = part.match(/^<nowrap>([\s\S]*)<\/nowrap>$/);
    if (nowrapMatch) {
      return (
        <span key={`nowrap-${index}`} className="whitespace-nowrap">
          {nowrapMatch[1]}
        </span>
      );
    }

    return part;
  });
}

function MultilineText({ text }) {
  return text.split('\n').map((line, index, lines) => (
    <span key={index}>
      <LinkedText text={line} />
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

function ExternalLink({ href, children, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`break-words text-violet-600 underline underline-offset-2 transition-colors hover:text-violet-800 ${className}`}
    >
      {children}
    </a>
  );
}

function BulletList({ items }) {
  return (
    <ul className={`space-y-1.5 sm:space-y-1 ${BODY_CLASS}`}>
      {items.map((item) => (
        <li key={item}>
          <LinkedText text={item} />
        </li>
      ))}
    </ul>
  );
}

export default function RecruitmentNotice() {
  const { banner, poster, section1, section2, section3 } = RECRUITMENT_INFO;
  const {
    title,
    subTitle,
    subTitleMobile,
    introText,
    introTextMobile,
    about,
    learnMore,
    footerNotice,
  } = section1;
  const { eligibility, roles, schedule, benefits, contact } = section2;
  const posterSrc = poster?.src || section3.posterImageUrl;
  const posterAlt = poster?.alt || section3.caption;
  const requiredNotice = footerNotice.replace(/^\*\s*/, '');

  return (
    <header className="mb-10 space-y-8 text-left">
      <div className="space-y-6 sm:space-y-5">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <img
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            decoding="async"
            className="block h-auto w-full max-w-full"
          />
        </div>

        <div className="space-y-3 sm:space-y-5">
          <h1 className="text-pretty text-[1.375rem] font-bold leading-[1.45] tracking-tight text-gray-900 sm:text-3xl sm:leading-snug sm:tracking-normal">
            {title}
          </h1>

          <p className={`${BODY_CLASS} text-pretty sm:hidden`}>
            <LinkedText text={subTitleMobile} />
          </p>
          <p className="hidden text-base font-semibold leading-relaxed text-gray-800 sm:block">
            <MultilineText text={subTitle} />
          </p>

          <div className="space-y-3 sm:hidden">
            {introTextMobile.map((paragraph) => (
              <p key={paragraph} className={`${BODY_CLASS} text-pretty`}>
                <LinkedText text={paragraph} />
              </p>
            ))}
          </div>

          {introText.map((paragraph) => (
            <p
              key={paragraph}
              className="hidden text-base leading-relaxed text-gray-700 sm:block"
            >
              <LinkedText text={paragraph} />
            </p>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-[1.0625rem] font-bold tracking-tight text-gray-900 sm:text-base sm:tracking-normal">
            {about.title}
          </h2>
          <p className={`${BODY_CLASS} sm:leading-relaxed`}>
            <MultilineText text={about.description} />
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-[1.0625rem] font-bold tracking-tight text-gray-900 sm:text-base sm:tracking-normal">
            {learnMore.title}
          </h2>
          <p className={`${BODY_CLASS} sm:leading-relaxed`}>
            <ExternalLink href={learnMore.siteUrl}>
              {learnMore.siteLabel}
            </ExternalLink>
            {learnMore.siteSuffix}
            <ExternalLink href={learnMore.wikiLink.url}>
              {learnMore.wikiLink.text}
            </ExternalLink>{' '}
            확인
          </p>
          <ul className="space-y-2 pt-1 sm:space-y-1 sm:pt-0 sm:text-base">
            {learnMore.interviewLinks.map(({ text, url }) => (
              <li key={text}>
                <ExternalLink
                  href={url}
                  className="inline-block py-0.5 leading-[1.7] sm:py-0 sm:leading-relaxed"
                >
                  {text}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Disclosure
        sectionName="recruitment_details"
        title={section2.title}
        closedHint="모집 대상, 일정, 혜택 자세히 보기"
        panelClassName="mt-6 space-y-6"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[1.0625rem] font-bold tracking-tight text-gray-900">
              {eligibility.title}
            </h3>
            <p className={`${BODY_CLASS} font-medium text-violet-800`}>
              {eligibility.note}
            </p>
            <BulletList items={eligibility.items} />
            <p className={BODY_CLASS}>{eligibility.subtitle}</p>
          </div>

          <div className="space-y-5">
            {roles.map((role) => (
              <div key={role.id} className="space-y-2">
                <h3 className="text-[1.0625rem] font-bold tracking-tight text-gray-900">
                  {role.title}
                </h3>
                <BulletList items={role.tasks} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[1.0625rem] font-bold tracking-tight text-gray-900">
              {schedule.duration}
            </p>
            <dl className="space-y-2">
              {schedule.timeline.map(({ label, note, value, highlight }) => (
                <div
                  key={label}
                  className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 ${
                    highlight
                      ? 'bg-violet-50 font-semibold text-violet-800'
                      : 'text-gray-700'
                  }`}
                >
                  <dt className="text-base">
                    {label}
                    {note && (
                      <span className="mt-0.5 block text-sm font-medium">
                        {note}
                      </span>
                    )}
                  </dt>
                  <dd className="text-base sm:text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {schedule.notice && (
              <p className={`${BODY_CLASS} text-gray-800`}>{schedule.notice}</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-[1.0625rem] font-bold tracking-tight text-gray-900">
              {benefits.title}
            </h3>
            <BulletList items={benefits.items} />
          </div>

          <p className={BODY_CLASS}>
            문의:{' '}
            <ExternalLink href={`mailto:${contact.email}`}>
              {contact.email}
            </ExternalLink>
            {' · '}
            <ExternalLink href={contact.instagram}>Instagram</ExternalLink>
          </p>
        </div>
      </Disclosure>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <img
          src={posterSrc}
          alt={posterAlt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full max-w-full"
        />
      </div>

      <p className="text-sm leading-relaxed tracking-tight text-gray-600">
        <span className="text-red-500">*</span> {requiredNotice}
      </p>
    </header>
  );
}
