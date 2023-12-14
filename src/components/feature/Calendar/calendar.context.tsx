import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isNotSet } from '@/utils';

import { useMountStateChange } from '@hooks/useMountStateChange';

export interface CalendarContextProps {
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

const CalendarContext = createContext<CalendarContextProps | null>(null);

export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (isNotSet(context)) {
    throw new Error('CalendarContext is not set properly');
  }
  return context;
};

interface CalendarContextProviderProps
  extends Pick<CalendarContextProps, 'onCancel' | 'onConfirm'> {
  defaultDate: Date | null;
}

export const CalendarContextProvider: React.FC<
  PropsWithChildren<CalendarContextProviderProps>
> = function ({ children, onCancel, onConfirm, defaultDate }) {
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(
    new Date().getFullYear(),
  );
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    new Date().getMonth(),
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isYearIndexSelectorOpen, setIsYearIndexSelectorOpen] =
    useState<boolean>(false);

  const mounted = useMountStateChange();

  useEffect(() => {
    if (mounted) return;
    setIsYearIndexSelectorOpen(false);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (defaultDate) {
      setCurrentYearIndex(defaultDate.getFullYear());
      setCurrentMonthIndex(defaultDate.getMonth());
    } else {
      setCurrentYearIndex(new Date().getFullYear());
      setCurrentMonthIndex(new Date().getMonth());
    }
  }, [mounted]);

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
