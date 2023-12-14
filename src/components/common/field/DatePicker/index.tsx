import React, { useCallback, useRef, useState } from 'react';

import classNames from 'classnames';
import { format } from 'date-fns';

import { isSet } from '@/utils';

import useInteractiveOutsideTargetHandler from '@hooks/useInteractiveOutsideTargetHandler';

import ConditionalFragment from '@common/ConditionalFragment';
import FieldWrapper from '@common/field/FieldWrapper';

import { Calendar } from '@feature/Calendar';
import TailingModal from '@feature/TailingModal';

interface Props {
  label?: string;
  placeholder?: string;
  value: Date | null;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<Props> = function ({
  label,
  value,
  placeholder,
  onChange,
}) {
  const [isFocus, setIsFocus] = useState<boolean>(false);

  const fieldRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const closeModal = useCallback(() => {
    setIsFocus(false);
  }, []);

  const onConfirm = useCallback((date: Date) => {
    onChange(date);
    closeModal();
  }, []);

  useInteractiveOutsideTargetHandler(fieldRef.current, closeModal, [
    modalRef.current,
  ]);

  const hasValue = isSet(value);

  const onFieldClick = useCallback(() => {
    setIsFocus(true);
  }, []);

  return (
    <>
      <FieldWrapper
        ref={fieldRef}
        role="presentation"
        label={label}
        onClick={onFieldClick}
        isFocus={isFocus}
        focusBorderClassName="border-white"
        className="font-['Ubuntu']"
      >
        <p
          className={classNames('text-base', 'text-white tracking-[0.15px]', {
            'text-opacity-30': !hasValue,
          })}
        >
          <ConditionalFragment condition={hasValue}>
            {value && format(value, 'MM/dd/yyyy')}
          </ConditionalFragment>
          <ConditionalFragment condition={!hasValue}>
            {placeholder}
          </ConditionalFragment>
        </p>
      </FieldWrapper>
      <TailingModal
        id="datepicker-modal"
        className="w-fit"
        isOpen={isFocus}
        wrapperRef={fieldRef}
        customRef={modalRef}
        offset={14}
      >
        <Calendar
          onCancel={closeModal}
          onConfirm={onConfirm}
          defaultDate={value}
        />
      </TailingModal>
    </>
  );
};
