import { RECRUITMENT_INFO } from '../constants/recruitmentInfo';
import Disclosure from './Disclosure';
import FormHtml from './FormHtml';

const TEXT_LINK_PATTERN = /(<b>[\s\S]*?<\/b>)/;

function LinkedText({ text }) {
  return text.split(TEXT_LINK_PATTERN).map((part, index) => {
    const boldMatch = part.match(/^<b>([\s\S]*)<\/b>$/);
    if (boldMatch) {
      return (
        <b key={`bold-${index}`} className="font-bold">
          {boldMatch[1]}
        </b>
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
    <ul className="space-y-1 text-base leading-relaxed text-gray-700">
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
            className="block h-auto w-full max-w-full"
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
            <LinkedText text={paragraph} />
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

      <Disclosure
        sectionName="recruitment_details"
        title={section2.title}
        closedHint="모집 대상, 일정, 혜택 자세히 보기"
        panelClassName="mt-6 space-y-6"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900">
              {eligibility.title}
            </h3>
            <FormHtml html={eligibility.note} />
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
              <p className="text-base leading-relaxed text-gray-800">
                {schedule.notice}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900">
              {benefits.title}
            </h3>
            <BulletList items={benefits.items} />
          </div>

          <p className="text-base leading-relaxed text-gray-700">
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
          className="block h-auto w-full max-w-full"
        />
      </div>

      <p className="text-sm text-gray-600">
        <span className="text-red-500">*</span> {requiredNotice}
      </p>
    </header>
  );
}
