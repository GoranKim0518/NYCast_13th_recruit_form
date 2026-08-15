import { useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { trackFormDisclosure } from '../lib/analytics';
import AccordionSummary from './AccordionSummary';

export default function Disclosure({
  ref,
  sectionRef,
  dataSection,
  sectionName,
  title,
  closedHint,
  closedAction = '펼치기',
  openAction = '접기',
  showTrigger = true,
  defaultOpen = true,
  panelClassName,
  children,
}) {
  const isOpenRef = useRef(!showTrigger || defaultOpen);
  const [isOpen, setIsOpen] = useState(() => !showTrigger || defaultOpen);
  const resolvedPanelClassName =
    panelClassName ??
    (showTrigger ? 'mt-6 space-y-6 sm:space-y-8' : 'space-y-6 sm:space-y-8');

  const setRootNode = (node) => {
    sectionRef?.(node);
  };

  const setOpen = useCallback(
    (nextOpen, trigger) => {
      if (isOpenRef.current === nextOpen) {
        return;
      }

      isOpenRef.current = nextOpen;
      setIsOpen(nextOpen);

      if (trigger) {
        trackFormDisclosure({
          sectionName,
          disclosureAction: nextOpen ? 'open' : 'close',
          disclosureTrigger: trigger,
        });
      }
    },
    [sectionName],
  );

  useImperativeHandle(ref, () => ({ setOpen }), [setOpen]);

  useLayoutEffect(() => {
    if (!showTrigger) {
      setOpen(true);
    }
  }, [setOpen, showTrigger]);

  const handleUserToggle = () => {
    setOpen(!isOpenRef.current, 'user');
  };

  const collapsed = showTrigger && !isOpen;

  return (
    <div ref={setRootNode} data-section={dataSection} className="min-w-0">
      {showTrigger && (
        <AccordionSummary
          title={title}
          closedHint={closedHint}
          closedAction={closedAction}
          openAction={openAction}
          isOpen={isOpen}
          onClick={handleUserToggle}
        />
      )}
      <div
        className={collapsed ? 'hidden' : resolvedPanelClassName}
        aria-hidden={collapsed || undefined}
      >
        {children}
      </div>
    </div>
  );
}
