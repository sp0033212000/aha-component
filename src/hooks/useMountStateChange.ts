import { useState } from 'react';
import { useMount, useUnmount } from 'react-use';

export const useMountStateChange = () => {
  const [isMounted, setIsMounted] = useState(false);

  useMount(() => {
    setIsMounted(true);
  });

  useUnmount(() => {
    setIsMounted(false);
  });

  return isMounted;
};
