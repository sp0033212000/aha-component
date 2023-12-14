import React, {
  FocusEventHandler,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';

import { isNotEmptyString, refMerge } from '@/utils';

import { CheckIcon, UnCheckIcon } from '@assets/icons';

import useLayoutSettle from '@hooks/useLayoutSettle';

import ConditionalFragment from '@common/ConditionalFragment';
import FieldWrapper from '@common/field/FieldWrapper';

import TailingModal from '@feature/TailingModal';
// noinspection RegExpSimplifiable
export const PASSWORD_CONDITION: Array<{
  pattern: RegExp;
  description: string;
}> = [
  { description: 'Have at least one uppercase letter', pattern: /[A-Z]+/ },
  { description: 'Have at least one lowercase letter', pattern: /[a-z]+/ },
  { description: 'Have at least one number', pattern: /[0-9]+/ },
  {
    description: 'Have at least one special character (!@#$...etc)',
    pattern: /[~`!@#$%^&*()_+\-={}[\]\\/|;:'",<.>]+/,
  },
  { description: 'Longer than 8 characters', pattern: /^.{8,}/ },
];

interface Props extends Omit<ElementProps<'input'>, 'type'> {
  label?: string;
  onValid?: (isValid: boolean) => void;
  value?: string;
}

const ValidItem: React.FC<
  PropsWithChildren<{
    password: string;
    pattern: RegExp;
  }>
> = function ({ children, pattern, password }) {
  const isValid = pattern.test(password);

  return (
    <div
      className={classNames(
        'flex items-center',
        'px-0.5 py-1',
        'min-h-[2.5rem]',
      )}
    >
      <span className="flex-shrink-0 mr-3">
        <ConditionalFragment condition={isValid}>
          <CheckIcon />
        </ConditionalFragment>
        <ConditionalFragment condition={!isValid}>
          <UnCheckIcon />
        </ConditionalFragment>
      </span>
      <p
        className={classNames(
          'flex-shrink-0 flex-1',
          'text-white text-sm leading-[1.3125rem] tracking-[0.25px]',
        )}
      >
        {children}
      </p>
    </div>
  );
};

const ValidateModal: React.FC<{
  wrapperRef: MutableRefObject<HTMLDivElement | null>;
  isOpen: boolean;
  password: string;
}> = function ({ isOpen, wrapperRef, password }) {
  const isLayoutSettle = useLayoutSettle();

  const width = useMemo(() => {
    if (!wrapperRef.current) return 0;
    return wrapperRef.current.getBoundingClientRect().width;
  }, [wrapperRef, isLayoutSettle]);

  return (
    <TailingModal
      id="password-validation-modal"
      isOpen={isOpen}
      wrapperRef={wrapperRef}
      style={{ width }}
    >
      <div className="py-2 px-3">
        {PASSWORD_CONDITION.map(({ description, pattern }) => (
          <ValidItem
            key={`${description}`}
            pattern={pattern}
            password={password}
          >
            {description}
          </ValidItem>
        ))}
      </div>
    </TailingModal>
  );
};

export const PasswordField = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      onFocus,
      onBlur,
      onValid,
      value: password = '',
      onChange,
      ...inputProps
    },
    ref,
  ) => {
    const [isFocus, setIsFocus] = useState<boolean>(false);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (!onValid) return;
      const isValid = PASSWORD_CONDITION.some(
        ({ pattern }) => !pattern.test(password),
      );
      onValid(isValid);
    }, [password]);

    const onFocusInner = useCallback<FocusEventHandler<HTMLInputElement>>(
      (e) => {
        setIsFocus(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const onBlurInner = useCallback<FocusEventHandler<HTMLInputElement>>(
      (e) => {
        setIsFocus(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const onWrapperClick = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <>
        <FieldWrapper
          ref={wrapperRef}
          role="presentation"
          id="password-field-wrapper"
          onClick={onWrapperClick}
          label={label}
          isFocus={isFocus}
        >
          <div
            className={classNames(
              'relative',
              'flex items-center',
              'w-full h-6',
            )}
          >
            <input
              ref={refMerge(ref, inputRef)}
              className={classNames(
                'w-full h-full',
                'text-base text-transparent',
                'placeholder-white placeholder-opacity-30',
                'bg-transparent',
                {
                  'tracking-[0.125rem]': isNotEmptyString(password),
                },
              )}
              onFocus={onFocusInner}
              onBlur={onBlurInner}
              onChange={onChange}
              value={password}
              type="password"
              {...inputProps}
              aria-autocomplete="none"
            />
            <p
              className={classNames('absolute', 'text-white leading-[1.5rem]')}
            >
              {'*'.repeat(password.length)}
            </p>
          </div>
        </FieldWrapper>
        <ValidateModal
          wrapperRef={wrapperRef}
          isOpen={isFocus}
          password={password}
        />
      </>
    );
  },
);
