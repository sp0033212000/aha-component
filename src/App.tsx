import React, { ChangeEventHandler, useCallback, useState } from 'react';

import classNames from 'classnames';

import { DatePicker, PasswordField } from '@common/field';

const App: React.FC = function () {
  const [password, setPassword] = useState<string>('');
  const [birthday, setBirthday] = useState<Date | null>(null);

  const onPasswordChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const { value } = e.target;
      setPassword(value);
    },
    [],
  );

  const onBirthdayChange = useCallback((date: Date) => {
    setBirthday(date);
  }, []);

  return (
    <div className={classNames('p-4', 'w-screen h-[100rem]', 'bg-bg-dark')}>
      <div className="w-[335px] mb-10 font-['Ubuntu']">
        <PasswordField
          label="Password"
          placeholder="Password"
          value={password}
          onChange={onPasswordChange}
        />
      </div>
      <div className="w-[335px] font-['Inter']">
        <DatePicker
          label="Birthday"
          placeholder="mm/dd/yyyy"
          value={birthday}
          onChange={onBirthdayChange}
        />
      </div>
    </div>
  );
};

export default App;
