import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../hooks';
import { checkListenKey } from '../../slices/account-slice';
import {
  getAccountBalance,
  getListenKey,
} from '../../slices/actions/account-actions';
import { selectCredential } from '../../slices/settings-slice';

function UserAccountManager() {
  const credential = useSelector(selectCredential);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!credential) {
      return;
    }
    dispatch(getAccountBalance());
    dispatch(getListenKey());
    const intervalDuration = 1000 * 60; // Every 1 minutes
    const interval = setInterval(() => {
      dispatch(checkListenKey());
    }, intervalDuration);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [credential]);

  return null;
}

export default UserAccountManager;
