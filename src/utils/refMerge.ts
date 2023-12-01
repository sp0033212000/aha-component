import { MutableRefObject } from 'react';

import { isSet } from './formatCheck';

export const refMerge = <Ref extends any>(
  ...refs: Array<
    MutableRefObject<Ref | null> | ((instance: Ref) => void) | null | undefined
  >
) =>
  function (mainRef: Ref) {
    refs.forEach((ref) => {
      if (typeof ref === 'object') {
        if (isSet(ref)) {
          // eslint-disable-next-line
          ref.current = mainRef;
        }
      } else if (typeof ref === 'function') {
        ref(mainRef);
      }
    });
  };
