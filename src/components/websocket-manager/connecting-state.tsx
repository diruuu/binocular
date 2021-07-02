import React from 'react';
import styles from './styles.scss';
import LogoSVG from '../../svgs/main-logo';

function ConnectingState() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <LogoSVG />
        <h1 className={styles.title}>Connecting to Binance...</h1>
        <p className={styles.text}>
          Please wait while we try to connect you to binance server. Take a cup
          of coffee and relax.
        </p>
      </div>
    </div>
  );
}

export default ConnectingState;
