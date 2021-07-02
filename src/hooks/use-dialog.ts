import { useContext } from 'react';
import DialogContext from '../contexts/dialog-context';

function useDialog() {
  const dialogRef = useContext(DialogContext);
  return dialogRef?.current;
}

export default useDialog;
