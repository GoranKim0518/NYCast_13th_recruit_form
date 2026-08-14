import { RECRUITMENT_INFO } from '../constants/recruitmentInfo';

function MultilineText({ text }) {
  return text.split('\n').map((line, index, lines) => (
    <span key={index}>
      {line}
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
      className={`text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800 ${className}`}
    >
      {children}
    </a>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1 text-base leading-relaxed text-gray-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function RecruitmentNotice() {
  const { banner, poster, section1, section2, section3 } = RECRUITMENT_INFO;
  const { title, subTitle, introText, about, learnMore, footerNotice } =
    section1;
  const { eligibility, roles, schedule, benefits, contact } = section2;
  const posterSrc = poster?.src || section3.posterImageUrl;
  const posterAlt = poster?.alt || section3.caption;
  const requiredNotice = footerNotice.replace(/^\*\s*/, '');

  return (
    <header className="mb-10 space-y-8 text-left">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <img
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            className="block h-auto w-full"
          />
        </div>

        <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>

        <p className="text-base font-semibold leading-relaxed text-gray-800">
          <MultilineText text={subTitle} />
        </p>

        {introText.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-gray-700">
            {paragraph}
          </p>
        ))}

        <div className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">{about.title}</h2>
          <p className="text-base leading-relaxed text-gray-700">
            <MultilineText text={about.description} />
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">
            {learnMore.title}
          </h2>
          <p className="text-base leading-relaxed text-gray-700">
            <ExternalLink href={learnMore.siteUrl}>
              {learnMore.siteLabel}
            </ExternalLink>
            {learnMore.siteSuffix}
            <ExternalLink href={learnMore.wikiLink.url}>
              {learnMore.wikiLink.text}
            </ExternalLink>{' '}
            확인
          </p>
          <ul className="space-y-1 text-base">
            {learnMore.interviewLinks.map(({ text, url }) => (
              <li key={text}>
                <ExternalLink href={url}>{text}</ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="group">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-base font-bold text-gray-900 sm:text-lg">
              {section2.title}
            </span>
            <span className="mt-0.5 block text-sm text-gray-500 group-open:hidden">
              모집 대상, 일정, 혜택 자세히 보기
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-gray-500">
            <span className="group-open:hidden">펼치기</span>
            <span className="hidden group-open:inline">접기</span>
            <svg
              className="h-5 w-5 transition-transform group-open:rotate-180"
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
        </summary>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900">
              {eligibility.title}
            </h3>
            <BulletList items={eligibility.items} />
            <p className="text-base leading-relaxed text-gray-700">
              {eligibility.subtitle}
            </p>
          </div>

          <div className="space-y-5">
            {roles.map((role) => (
              <div key={role.id} className="space-y-2">
                <h3 className="text-base font-bold text-gray-900">
                  {role.title}
                </h3>
                <BulletList items={role.tasks} />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-base font-bold text-gray-900">
              {schedule.duration}
            </p>
            <dl className="space-y-2">
              {schedule.timeline.map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={`flex flex-col gap-0.5 rounded-lg px-3 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 ${
                    highlight
                      ? 'bg-violet-50 font-semibold text-violet-800'
                      : 'text-gray-700'
                  }`}
                >
                  <dt className="text-base">{label}</dt>
                  <dd className="text-base sm:text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {schedule.notice && (
              <p className="text-base leading-relaxed text-gray-800">
                {schedule.notice}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <BulletList items={benefits} />
          </div>

          <p className="text-base leading-relaxed text-gray-700">
            문의:{' '}
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800"
            >
              {contact.email}
            </a>
            {' · '}
            <ExternalLink href={contact.instagram}>Instagram</ExternalLink>
          </p>
        </div>
      </details>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <img
          src={posterSrc}
          alt={posterAlt}
          className="block h-auto w-full"
        />
      </div>

      <p className="text-sm text-gray-600">
        <span className="text-red-500">*</span> {requiredNotice}
      </p>
    </header>
  );
}
