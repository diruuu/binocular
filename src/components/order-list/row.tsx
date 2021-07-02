/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

function Row({ children, ...props }: any) {
  return <div {...props}>{children}</div>;
}

export default React.memo(Row);
