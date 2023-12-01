import React, { PropsWithChildren } from 'react';

const ConditionalFragment: React.FC<
  PropsWithChildren<{ condition?: boolean }>
> = function ({ condition, children }) {
  if (!condition) return null;

  // eslint-disable-next-line
  return <>{children}</>;
};

export default ConditionalFragment;
