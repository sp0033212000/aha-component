import React from 'react';

import classNames from 'classnames';

const App: React.FC = function () {
  return (
    <div className={classNames('p-4', 'w-screen h-[100rem]', 'bg-bg-dark')} />
  );
};

export default App;
