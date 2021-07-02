import React from 'react';
import { Button } from '@material-ui/core';
import styles from './styles.scss';
import LogoSVG from '../../svgs/main-logo';
import { useSelector } from '../../hooks';
import { selectNetworkAccessBlocked } from '../../slices/settings-slice';

function DisconnectedState() {
  const networkAccessBlocked = useSelector(selectNetworkAccessBlocked);
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <LogoSVG animate={false} />
        {networkAccessBlocked && (
          <>
            <h1 className={styles.title}>Connection Blocked</h1>
            <p className={styles.text}>
              Your ISP didn&apos;t allow connection to Binance server. Please
              use VPN to continue using this app, or hit the reload button below
              to try again.
            </p>
          </>
        )}
        {!networkAccessBlocked && (
          <>
            <h1 className={styles.title}>Connection Error</h1>
            <p className={styles.text}>
              We couldn&apos;t connect you to Binance server. It could be your
              internet connection. Try to hit reload button below to retry the
              connection.
            </p>
          </>
        )}
        <Button
          color="primary"
          className={styles.button}
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </div>
    </div>
  );
}

export default DisconnectedState;
