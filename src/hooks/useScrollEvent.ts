import { DependencyList, useEffect } from 'react';

export const useScrollEvent = (
  callback: (event: Event | TouchEvent) => void,
  deps: DependencyList,
) => {
  useEffect(() => {
    window.addEventListener('scroll', callback);

    if (window.ontouchmove) {
      window.addEventListener('touchmove', callback);
    }

    return () => {
      window.removeEventListener('scroll', callback);

      if (window.ontouchmove) {
        window.removeEventListener('touchmove', callback);
      }
    };
  }, deps);
};
