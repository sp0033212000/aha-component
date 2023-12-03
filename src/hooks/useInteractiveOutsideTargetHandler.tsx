import { useCallback, useEffect } from 'react';

import { isNotSet } from '@/utils';

const useInteractiveOutsideTargetHandler = (
  el: HTMLElement | null,
  cb: Function,
  excludeEls: (HTMLElement | null)[] = [],
) => {
  const clickHandler = useCallback(
    (event: Event) => {
      if (isNotSet(el)) return;
      if (
        el instanceof HTMLElement &&
        event.target instanceof HTMLElement &&
        !el.contains(event.target)
      ) {
        const isExcludedElement = excludeEls.some(
          (excludeElement) =>
            excludeElement instanceof HTMLElement &&
            event.target instanceof HTMLElement &&
            excludeElement.contains(event.target),
        );
        if (!isExcludedElement) {
          cb();
        }
      }
    },
    [cb, el, excludeEls],
  );

  useEffect(() => {
    document.addEventListener('mousedown', clickHandler);
    document.addEventListener('touchstart', clickHandler);

    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('touchstart', clickHandler);
    };
  }, [clickHandler]);
};

export default useInteractiveOutsideTargetHandler;
