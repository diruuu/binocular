import React from 'react';
import styles from './styles.scss';
import OrderForm from './form';
import CredentialNotice from './credential-notice';
import { useSelector } from '../../hooks';
import { selectCredential } from '../../slices/settings-slice';

function OrderFormWrapper() {
  const credentials = useSelector(selectCredential);

  if (!credentials) {
    return <CredentialNotice />;
  }
  return (
    <div className={styles.wrapper}>
      <OrderForm />
    </div>
  );
}

export default OrderFormWrapper;
