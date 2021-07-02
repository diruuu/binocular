import React from 'react';
import { DialogRef } from '../components/modal';

const DialogContext = React.createContext<
  React.MutableRefObject<DialogRef | undefined> | undefined
>(undefined);

export default DialogContext;
