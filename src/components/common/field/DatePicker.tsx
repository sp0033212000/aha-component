import React, {
  createContext,
  Dispatch,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import classNames from 'classnames';
import {
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  set as setDate,
} from 'date-fns';
import { chunk } from 'lodash';

import { NOOP } from '@/constants';
import { isSet } from '@/utils';

import { ArrowLeftIcon, ArrowRightIcon } from '@assets/icons';

import useInteractiveOutsideTargetHandler from '@hooks/useInteractiveOutsideTargetHandler';

import ConditionalFragment from '@common/ConditionalFragment';
import FieldWrapper from '@common/field/FieldWrapper';

import TailingModal from '@feature/TailingModal';

const DAY_TEXT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_TEXT_ABBREVIATION = [
  'Jan,',
  'Feb,',
  'Mar,',
  'Apr,',
  'May',
  'June',
  'July',
  'Aug,',
  'Sept,',
  'Oct,',
  'Nov,',
  'Dec,',
];
const MONTH_TEXT = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const EARLIEST_AVAILABLE_YEAR = 1981;
const LATEST_AVAILABLE_YEAR = new Date().getFullYear() + 20;
const YEARS = chunk(
  chunk(
    [...new Array(LATEST_AVAILABLE_YEAR - EARLIEST_AVAILABLE_YEAR)].map(
      (_, index) => index + EARLIEST_AVAILABLE_YEAR,
    ),
    4,
  ),
  5,
);

interface DateItem {
  date: Date;
  inMonth: boolean;
}

interface CalendarContextProps {
  // State
  currentYearIndex: number;
  currentMonthIndex: number;
  currentDate: Date;
  isYearIndexSelectorOpen: boolean;

  // Action
  setCurrentYearIndex: Dispatch<SetStateAction<number>>;
  setCurrentMonthIndex: Dispatch<SetStateAction<number>>;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
  setIsYearIndexSelectorOpen: Dispatch<SetStateAction<boolean>>;
  goToSpecificYearIndex: (yearIndex: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextProps>({
  // State
  currentYearIndex: new Date().getFullYear(),
  currentMonthIndex: new Date().getMonth(),
  currentDate: new Date(),
  isYearIndexSelectorOpen: false,

  // Action
  setCurrentMonthIndex: NOOP,
  setCurrentYearIndex: NOOP,
  setCurrentDate: NOOP,
  setIsYearIndexSelectorOpen: NOOP,
  goToSpecificYearIndex: NOOP,
  goToPreviousMonth: NOOP,
  goToNextMonth: NOOP,
  onCancel: NOOP,
  onConfirm: NOOP,
});

const useCalendarContext = () => useContext(CalendarContext);

interface CalendarContextProviderProps
  extends Pick<CalendarContextProps, 'onCancel' | 'onConfirm'> {
  isOpen: boolean;
  defaultDate: Date | null;
}

const CalendarContextProvider: React.FC<
  PropsWithChildren<CalendarContextProviderProps>
> = function ({ children, onCancel, onConfirm, isOpen, defaultDate }) {
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(
    new Date().getFullYear(),
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    new Date().getMonth(),
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isYearIndexSelectorOpen, setIsYearIndexSelectorOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (isOpen) return;
    setIsYearIndexSelectorOpen(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (defaultDate) {
      setCurrentYearIndex(defaultDate.getFullYear());
      setCurrentMonthIndex(defaultDate.getMonth());
    } else {
      setCurrentYearIndex(new Date().getFullYear());
      setCurrentMonthIndex(new Date().getMonth());
    }
  }, [isOpen]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonthIndex((previousMonth) => {
      if (previousMonth === 0) {
        setCurrentYearIndex((previousYear) => previousYear - 1);
        return 11;
      }
      return previousMonth - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonthIndex((previousMonth) => {
      if (previousMonth === 11) {
        setCurrentYearIndex((previousYear) => previousYear + 1);
        return 0;
      }
      return previousMonth + 1;
    });
  }, []);

  const goToSpecificYearIndex = useCallback(
    (yearIndex: number) => setCurrentYearIndex(yearIndex),
    [],
  );

  const contextValue = useMemo<CalendarContextProps>(
    () => ({
      // State
      currentDate,
      currentYearIndex,
      currentMonthIndex,
      isYearIndexSelectorOpen,

      // Action,
      setCurrentDate,
      setCurrentYearIndex,
      setCurrentMonthIndex,
      setIsYearIndexSelectorOpen,
      goToSpecificYearIndex,
      goToPreviousMonth,
      goToNextMonth,
      onCancel,
      onConfirm,
    }),
    [
      currentYearIndex,
      currentMonthIndex,
      currentDate,
      isYearIndexSelectorOpen,
      onCancel,
      onConfirm,
    ],
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

const MonthControlButton: React.FC<PropsWithChildren<ElementProps<'button'>>> =
  function ({ children, className, type = 'button', ...buttonProps }) {
    return (
      <button
        // eslint-disable-next-line react/button-has-type
        type={type}
        className={classNames(
          className,
          'flex items-center justify-center',
          'w-12 h-12',
          'disabled:text-gray-500 disabled:cursor-not-allowed',
        )}
        {...buttonProps}
      >
        {children}
      </button>
    );
  };

const CalendarHeader = () => {
  const { currentYearIndex, currentMonthIndex } = useCalendarContext();

  return (
    <div className="pt-[1.0625rem] px-6 mb-[0.9375rem]">
      <p className="mb-1 text-base">Text</p>
      <p className="text-[2rem] leading-[2.75rem] font-bold">
        {MONTH_TEXT_ABBREVIATION[currentMonthIndex]} {currentYearIndex}
      </p>
    </div>
  );
};

const CalendarController = () => {
  const {
    currentMonthIndex,
    currentYearIndex,
    goToPreviousMonth,
    goToNextMonth,
    setIsYearIndexSelectorOpen,
  } = useCalendarContext();

  return (
    <div className="flex justify-between mb-2">
      <MonthControlButton onClick={goToPreviousMonth}>
        <ArrowLeftIcon />
      </MonthControlButton>
      <button
        onClick={() => setIsYearIndexSelectorOpen(true)}
        type="button"
        className={classNames('pl-[1px] pt-[0.625rem] pb-[0.875rem]')}
      >
        {MONTH_TEXT[currentMonthIndex]} {currentYearIndex}
      </button>
      <MonthControlButton onClick={goToNextMonth}>
        <ArrowRightIcon />
      </MonthControlButton>
    </div>
  );
};

const CalendarDateController = () => {
  const { currentYearIndex, currentMonthIndex, currentDate, setCurrentDate } =
    useCalendarContext();

  const dates = useMemo(() => {
    const dayAry: Array<DateItem> = [];

    const firstDate = setDate(new Date(), {
      year: currentYearIndex,
      month: currentMonthIndex,
      date: 1,
    });

    const daysInMonth = getDaysInMonth(firstDate);
    const dayStartAt = getDay(firstDate);
    const dayEndAt = getDay(
      setDate(new Date(firstDate), { date: daysInMonth }),
    );

    const startOffset = dayStartAt;
    const endOffset = 6 - dayEndAt;

    [...new Array(startOffset)].forEach((_, index) => {
      const date = setDate(new Date(firstDate), {
        date: index - startOffset + 1,
      });
      dayAry.push({ date, inMonth: false });
    });
    [...new Array(daysInMonth + endOffset)].forEach((_, index) => {
      const dateNumber = index + 1;
      const date = setDate(new Date(firstDate), {
        date: dateNumber,
      });
      dayAry.push({ date, inMonth: dateNumber <= daysInMonth });
    });

    return chunk(dayAry, 7);
  }, [currentYearIndex, currentMonthIndex]);

  return (
    <div className="px-4 mb-3">
      <div className="flex mb-3">
        {DAY_TEXT.map((text) => (
          <div
            key={text}
            className={classNames(
              'mr-1.5 last:mr-0',
              'w-9',
              'text-[0.6875rem] leading-[0.8125rem] text-center text-gray-500',
            )}
          >
            {text}
          </div>
        ))}
      </div>
      {dates.map((week) => (
        <div
          key={week?.[0].date.toDateString()}
          className={classNames('flex items-center')}
        >
          {week.map(({ date, inMonth }) => (
            <div
              role="presentation"
              key={date.toDateString()}
              className={classNames(
                'mr-1.5 last:mr-0',
                'w-9 h-9',
                'text-center text-[0.875rem] leading-[2.25rem]',
                'rounded-[50%]',
                'hover:cursor-pointer hover:bg-white hover:border-white hover:text-[#080808]',
                { 'pointer-events-none': !inMonth },
                !inMonth && ['text-white text-opacity-50'],
                isSameDay(new Date(), date) && [
                  'border border-solid border-primary-blue',
                ],
                isSameDay(currentDate, date) && ['bg-primary-blue'],
              )}
              onClick={() => setCurrentDate(date)}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const CalenderFooter = () => {
  const { onCancel, onConfirm, currentDate } = useCalendarContext();

  return (
    <div className={classNames('pb-4 pr-[1.6875rem]')}>
      <div
        className={classNames(
          'flex justify-end items-center',
          'px-4 py-2',
          'text-sm font-semibold leading-[1.5rem]',
        )}
      >
        <button type="button" className="mr-[4.375rem] w-12" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="w-[1.3125rem]"
          onClick={() => onConfirm(currentDate)}
        >
          OK
        </button>
      </div>
    </div>
  );
};

const CalenderYearController = () => {
  const { currentYearIndex, setCurrentYearIndex, setIsYearIndexSelectorOpen } =
    useCalendarContext();

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const thisYear = useRef<number>(new Date().getFullYear());

  useEffect(() => {
    const pageIndex = YEARS.findIndex((yearsPage) =>
      yearsPage.some((yearsRow) => yearsRow.includes(currentYearIndex)),
    );
    if (pageIndex > -1) {
      setCurrentPageIndex(pageIndex);
    } else {
      throw new Error('The year you selected are not be included in system.');
    }
  }, [currentYearIndex]);

  const onSelect = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      const year = Number(event.currentTarget.dataset.year);
      setCurrentYearIndex(year);
      setIsYearIndexSelectorOpen(false);
    },
    [],
  );

  return (
    <>
      <div className="flex justify-between mb-[1.125rem]">
        <MonthControlButton
          disabled={currentPageIndex === 0}
          onClick={() => setCurrentPageIndex((prev) => prev - 1)}
        >
          <ArrowLeftIcon />
        </MonthControlButton>
        <p className={classNames('pt-[0.5625rem] pb-[0.9375rem]')}>
          {currentYearIndex}
        </p>
        <MonthControlButton
          disabled={currentPageIndex === YEARS.length - 1}
          onClick={() => setCurrentPageIndex((prev) => prev + 1)}
        >
          <ArrowRightIcon />
        </MonthControlButton>
      </div>
      <div className="pl-6 pr-[1.5625rem] mb-[1.6875rem] min-w-[20rem]">
        {YEARS[currentPageIndex].map((yearsRow) => (
          <div
            key={yearsRow.join('-')}
            className={classNames('flex items-center mb-6 last:mb-0')}
          >
            {yearsRow.map((year) => {
              const isThisYear = thisYear.current === year;
              const isSelectedYear = year === currentYearIndex;

              return (
                <button
                  type="button"
                  key={year}
                  data-year={year}
                  className={classNames(
                    'mr-[0.5625rem] last:mr-0',
                    'w-[3.8125rem] h-6',
                    'text-base text-center',
                    'hover:cursor-pointer hover:bg-white hover:text-[#080808]',
                    'border border-solid',
                    'rounded-sm',
                    isThisYear && ['border-primary-blue hover:border-white'],
                    isSelectedYear
                      ? [
                          'bg-primary-blue border-primary-blue hover:border-white',
                        ]
                      : [isThisYear ? '' : 'border-transparent'],
                  )}
                  onClick={onSelect}
                >
                  {year}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

const Calendar: React.FC<{
  isOpen: boolean;
  wrapperRef: MutableRefObject<HTMLDivElement | null>;
  modalRef: MutableRefObject<HTMLDivElement | null>;
}> = function ({ isOpen, wrapperRef, modalRef }) {
  const { isYearIndexSelectorOpen } = useCalendarContext();

  return (
    <TailingModal
      id="datepicker-modal"
      className="w-fit"
      isOpen={isOpen}
      wrapperRef={wrapperRef}
      customRef={modalRef}
      offset={14}
    >
      <div className="text-white">
        <CalendarHeader />
        <ConditionalFragment condition={!isYearIndexSelectorOpen}>
          <CalendarController />
          <CalendarDateController />
        </ConditionalFragment>
        <ConditionalFragment condition={isYearIndexSelectorOpen}>
          <CalenderYearController />
        </ConditionalFragment>
        <CalenderFooter />
      </div>
    </TailingModal>
  );
};

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
    <CalendarContextProvider
      onCancel={closeModal}
      onConfirm={onConfirm}
      isOpen={isFocus}
      defaultDate={value}
    >
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
      <Calendar isOpen={isFocus} wrapperRef={fieldRef} modalRef={modalRef} />
    </CalendarContextProvider>
  );
};
