import { useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react';
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
  panelClassName,
  children,
}) {
  const detailsRef = useRef(null);
  const panelRef = useRef(null);
  const programmaticRef = useRef(false);
  const resolvedPanelClassName =
    panelClassName ?? (showTrigger ? 'mt-6 space-y-8' : 'space-y-8');

  const setDetailsNode = (node) => {
    detailsRef.current = node;
    sectionRef?.(node);
  };

  const syncInert = useCallback(
    (isOpen) => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      panel.inert = Boolean(showTrigger && !isOpen);
    },
    [showTrigger],
  );

  const setOpen = useCallback(
    (nextOpen, trigger) => {
      const details = detailsRef.current;
      if (!details || details.open === nextOpen) {
        syncInert(nextOpen);
        return;
      }

      programmaticRef.current = true;
      details.open = nextOpen;
      syncInert(nextOpen);

      if (trigger) {
        trackFormDisclosure({
          sectionName,
          disclosureAction: nextOpen ? 'open' : 'close',
          disclosureTrigger: trigger,
        });
      }
    },
    [sectionName, syncInert],
  );

  useImperativeHandle(ref, () => ({ setOpen }), [setOpen]);

  useLayoutEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    if (!showTrigger) {
      setOpen(true);
      return;
    }

    syncInert(details.open);
  }, [setOpen, showTrigger, syncInert]);

  const handleToggle = (event) => {
    const isOpen = event.currentTarget.open;

    if (programmaticRef.current) {
      programmaticRef.current = false;
      syncInert(isOpen);
      return;
    }

    if (!showTrigger) {
      event.currentTarget.open = true;
      syncInert(true);
      return;
    }

    syncInert(isOpen);
    trackFormDisclosure({
      sectionName,
      disclosureAction: isOpen ? 'open' : 'close',
      disclosureTrigger: 'user',
    });
  };

  return (
    <details
      ref={setDetailsNode}
      className="group"
      data-section={dataSection}
      onToggle={handleToggle}
    >
      <AccordionSummary
        title={title}
        closedHint={closedHint}
        closedAction={closedAction}
        openAction={openAction}
        hidden={!showTrigger}
      />
      <div ref={panelRef} className={resolvedPanelClassName}>
        {children}
      </div>
    </details>
  );
}
