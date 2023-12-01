import React, { forwardRef, PropsWithChildren } from 'react';

import classNames from 'classnames';

interface Props extends ElementProps<'div'> {
  label?: string;
  isFocus?: boolean;
  focusBorderClassName?: string;
}

const FieldWrapper = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(
  (
    {
      children,
      className,
      label,
      isFocus,
      focusBorderClassName = 'border-primary-blue',
      ...divProps
    },
    ref,
  ) => (
    <div
      ref={ref}
      role="presentation"
      id="password-field-wrapper"
      className={classNames(
        className,
        'relative',
        'px-[0.5625rem] pb-3 pt-4',
        'w-full',
        'border-[3px] border-solid rounded-lg',
        'border-opacity-50',
        'hover:border-opacity-100',
        {
          'border-opacity-100': isFocus,
          [focusBorderClassName]: isFocus,
          'border-white': !isFocus,
        },
      )}
      {...divProps}
    >
      <span
        className={classNames(
          'absolute top-0 transform translate-y-[calc(-50%-1.5px)]',
          'px-1',
          'text-[0.75rem] leading-[1.125rem] text-white tracking-[0.4px]',
          'bg-bg-dark',
        )}
      >
        {label}
      </span>
      {children}
    </div>
  ),
);

export default FieldWrapper;
