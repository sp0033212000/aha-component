import { useLayoutEffect, useState } from 'react';

const useLayoutSettle = function () {
  const [isLayoutSettle, setIsLayoutSettle] = useState<boolean>(false);

  useLayoutEffect(() => {
    setIsLayoutSettle(true);
  }, []);

  return isLayoutSettle;
};

export default useLayoutSettle;
