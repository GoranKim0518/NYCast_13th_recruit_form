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
  panelClassName,
  children,
}) {
  const detailsRef = useRef(null);
  const panelRef = useRef(null);
  const programmaticRef = useRef(false);
  const isOpenRef = useRef(true);
  const [isOpen, setIsOpen] = useState(true);
  const resolvedPanelClassName =
    panelClassName ?? (showTrigger ? 'mt-6 space-y-8' : 'space-y-8');

  const setDetailsNode = (node) => {
    detailsRef.current = node;
    sectionRef?.(node);
  };

  const syncInert = useCallback(
    (nextOpen) => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      panel.inert = Boolean(showTrigger && !nextOpen);
    },
    [showTrigger],
  );

  const setOpen = useCallback(
    (nextOpen, trigger) => {
      if (isOpenRef.current === nextOpen) {
        syncInert(nextOpen);
        return;
      }

      programmaticRef.current = true;
      isOpenRef.current = nextOpen;
      setIsOpen(nextOpen);
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
    if (!showTrigger) {
      setOpen(true);
    }
  }, [setOpen, showTrigger]);

  useLayoutEffect(() => {
    syncInert(isOpen);
  }, [isOpen, syncInert]);

  const handleToggle = (event) => {
    const nextOpen = event.currentTarget.open;

    if (programmaticRef.current) {
      programmaticRef.current = false;
      syncInert(nextOpen);
      return;
    }

    if (!showTrigger) {
      programmaticRef.current = true;
      isOpenRef.current = true;
      setIsOpen(true);
      event.currentTarget.open = true;
      syncInert(true);
      return;
    }

    isOpenRef.current = nextOpen;
    setIsOpen(nextOpen);
    syncInert(nextOpen);
    trackFormDisclosure({
      sectionName,
      disclosureAction: nextOpen ? 'open' : 'close',
      disclosureTrigger: 'user',
    });
  };

  return (
    <details
      ref={setDetailsNode}
      className="group"
      data-section={dataSection}
      open={isOpen}
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
