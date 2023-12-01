export const isSet = <Whatever>(
  whatever: Whatever | null | undefined,
): whatever is Whatever => whatever !== void 0 && whatever !== null;

export const isNotSet = (whatever: any): whatever is undefined | null =>
  whatever === void 0 || whatever === null;

export const isEmptyString = (string: string): boolean => string.length === 0;
export const isNotEmptyString = (string: string): boolean => string.length > 0;
