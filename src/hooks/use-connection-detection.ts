import { useEffect, useRef } from 'react';
import ConnectionStatus from '../enum/connection-status';
import connectionDetection from '../utils/connection-detection';

export default function useConnectionDetection() {
  const connectionStatusRef = useRef<ConnectionStatus>(ConnectionStatus.NONE);

  useEffect(() => {
    connectionDetection((isOnline) => {
      if (
        isOnline &&
        connectionStatusRef.current === ConnectionStatus.DISCONNECTED
      ) {
        window.location.reload();
      }

      connectionStatusRef.current = isOnline
        ? ConnectionStatus.CONNECTED
        : ConnectionStatus.DISCONNECTED;
    });
  }, []);
}
