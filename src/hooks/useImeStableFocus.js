import { useEffect } from 'react';

function isFormControl(element) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isEditableControl(element) {
  return (
    isFormControl(element) &&
    element.type !== 'checkbox' &&
    element.type !== 'radio'
  );
}

export function useImeStableFocus(formRef) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return undefined;
    }

    let composingEl = null;
    let restoreTimer = 0;

    const clearRestore = () => {
      window.clearTimeout(restoreTimer);
      restoreTimer = 0;
    };

    const restoreIfStolen = () => {
      if (!composingEl || !form.contains(composingEl)) {
        return;
      }

      if (document.activeElement === composingEl) {
        return;
      }

      composingEl.focus({ preventScroll: true });
    };

    const markComposing = (event) => {
      const target = event.target;
      if (!isEditableControl(target)) {
        return;
      }

      if (event.type !== 'compositionstart' && event.keyCode !== 229) {
        return;
      }

      composingEl = target;
      target.composing = true;
    };

    const endComposing = (event) => {
      const target = event.target;
      if (!isEditableControl(target)) {
        return;
      }

      target.composing = false;
      clearRestore();
      restoreTimer = window.setTimeout(() => {
        if (composingEl === target) {
          composingEl = null;
        }
      }, 50);
    };

    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const control = target.closest('input, textarea');
      if (control && control !== composingEl) {
        composingEl = null;
        clearRestore();
      }
    };

    const onFocusIn = () => {
      if (!composingEl) {
        return;
      }

      restoreIfStolen();
    };

    const onFocusOut = (event) => {
      if (event.target !== composingEl) {
        return;
      }

      clearRestore();
      restoreTimer = window.setTimeout(restoreIfStolen, 0);
    };

    form.addEventListener('compositionstart', markComposing, true);
    form.addEventListener('keydown', markComposing, true);
    form.addEventListener('compositionend', endComposing, true);
    form.addEventListener('pointerdown', onPointerDown, true);
    form.addEventListener('focusin', onFocusIn, true);
    form.addEventListener('focusout', onFocusOut, true);

    return () => {
      clearRestore();
      form.removeEventListener('compositionstart', markComposing, true);
      form.removeEventListener('keydown', markComposing, true);
      form.removeEventListener('compositionend', endComposing, true);
      form.removeEventListener('pointerdown', onPointerDown, true);
      form.removeEventListener('focusin', onFocusIn, true);
      form.removeEventListener('focusout', onFocusOut, true);
    };
  }, [formRef]);
}
