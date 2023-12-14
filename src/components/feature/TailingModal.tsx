import React, {
  MutableRefObject,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useUpdateEffect } from 'react-use';

import classNames from 'classnames';

import { isNotSet, refMerge } from '@/utils';

import useLayoutSettle from '@hooks/useLayoutSettle';
import { useScrollEvent } from '@hooks/useScrollEvent';

interface Props {
  isOpen: boolean;
  wrapperRef: MutableRefObject<HTMLElement | null>;
  customRef?: MutableRefObject<HTMLDivElement | null>;
  id?: string;
  style?: ElementProps<'div'>['style'];
  className?: ElementProps<'div'>['className'];
  offset?: number;
}

const TailingModal: React.FC<PropsWithChildren<Props>> = function ({
  children,
  wrapperRef,
  customRef,
  isOpen,
  id,
  style,
  className,
  offset = 20,
}) {
  const [recalculateTop, setRecalculateTop] = useState<number>(0);
  const [isTransitionEnd, setIsTransitionEnd] = useState<boolean>(true);
  const [shouldUnmount, setShouldUnmount] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useScrollEvent(() => {
    if (!isOpen) return;
    setRecalculateTop((prev) => prev + 1);
  }, [isOpen]);

  useUpdateEffect(() => {
    setIsTransitionEnd(false);
  }, [isOpen]);

  useUpdateEffect(() => {
    if (!isTransitionEnd) {
      setShouldUnmount(false);
    } else if (!isOpen) {
      setShouldUnmount(true);
    }
  }, [isTransitionEnd]);

  const isLayoutSettle = useLayoutSettle();

  const left = useMemo(() => {
    if (isNotSet(wrapperRef.current)) return 0;

    return wrapperRef.current.getBoundingClientRect().left;
  }, [wrapperRef, isLayoutSettle]);

  const top = useMemo(() => {
    if (!wrapperRef.current || !modalRef.current) return 0;
    const OFFSET = offset;
    const windowHeight = window.innerHeight;
    const wrapperBounding = wrapperRef.current.getBoundingClientRect();
    const wrapperTop = wrapperBounding.top;
    const wrapperHeight = wrapperBounding.height;

    const modalHeight = modalRef.current.scrollHeight;

    const downPosition = OFFSET + wrapperTop + wrapperHeight;

    const isOverflow = modalHeight + downPosition > windowHeight;

    if (isOverflow) {
      return wrapperTop - modalHeight - OFFSET;
    }
    return downPosition;
  }, [isOpen, recalculateTop]);

  const onTransitionEnd = useCallback(() => {
    setIsTransitionEnd(true);
  }, []);

  return (
    <div
      id={id}
      ref={refMerge(modalRef, customRef)}
      className={classNames(
        'fixed',
        'overflow-hidden',
        'transition-[max-height] duration-500',
        'rounded-lg',
        'shadow-[4px_4px_20px_rgba(0,0,0,0.3)] bg-bg-dark',
        'z-50',
        className,
      )}
      style={{
        maxHeight: isOpen ? window.innerHeight : 0,
        left,
        top,
        ...style,
      }}
      onTransitionEnd={onTransitionEnd}
    >
      {shouldUnmount ? null : children}
    </div>
  );
};

export default TailingModal;
