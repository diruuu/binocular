import React from 'react';
import styles from './styles.scss';
import Text from '../text';
import { useDispatch } from '../../hooks';
import { setModalOpen } from '../../slices/settings-slice';

function CredentialNotice() {
  const dispatch = useDispatch();
  return (
    <div className={styles.notice}>
      <Text>
        Please add your Binance API key and secret key before start trading.
        Click{' '}
        <button
          className={styles.button}
          type="button"
          onClick={() => dispatch(setModalOpen(true))}
        >
          here
        </button>{' '}
        to open setting dialog
      </Text>
    </div>
  );
}

export default CredentialNotice;
