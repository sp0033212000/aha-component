import React, {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';

import { isNotSet, refMerge } from '@/utils';

import useLayoutSettle from '@hooks/useLayoutSettle';

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
  useEffect(() => {
    if (!isOpen) return;

    const triggerRecalculateTop = () => setRecalculateTop((prev) => prev + 1);
    window.addEventListener('scroll', triggerRecalculateTop);

    if (window.ontouchmove) {
      window.addEventListener('touchmove', triggerRecalculateTop);
    }

    return () => {
      window.removeEventListener('scroll', triggerRecalculateTop);

      if (window.ontouchmove) {
        window.removeEventListener('touchmove', triggerRecalculateTop);
      }
    };
  }, [isOpen]);

  const isLayoutSettle = useLayoutSettle();

  const modalRef = useRef<HTMLDivElement | null>(null);

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
    >
      {children}
    </div>
  );
};

export default TailingModal;
