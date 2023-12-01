import React, { ChangeEventHandler, useCallback, useState } from 'react';

import classNames from 'classnames';

import { PasswordField } from '@common/field';

const App: React.FC = function () {
  const [password, setPassword] = useState<string>('');

  const onPasswordChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const { value } = e.target;
      setPassword(value);
    },
    [],
  );

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
    </div>
  );
};

export default App;
