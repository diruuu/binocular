import { ipcRenderer } from 'electron';
import { useState, useEffect, useCallback } from 'react';

import { useSelector } from 'react-redux';
import { useDispatch } from '../../hooks';
import BinanceSettings from '../../services/binance-setting';
import {
  selectRESTApiBaseUrl,
  selectWebsocketBaseUrl,
  setVersion,
} from '../../slices/settings-slice';

function InitialSetup({ children }: any) {
  const dispatch = useDispatch();
  const [instanceSetupComplete, setInstanceSetupComplete] = useState(false);
  const restAPIBaseUrl = useSelector(selectRESTApiBaseUrl);
  const webSocketBaseUrl = useSelector(selectWebsocketBaseUrl);

  const readAppVersion = useCallback(async () => {
    const data = await ipcRenderer.invoke('app-version');
    if (data.version) {
      dispatch(setVersion(data.version));
    }
  }, [dispatch]);

  // Get reg file data
  useEffect(() => {
    readAppVersion();
  }, [readAppVersion]);

  useEffect(() => {
    if (restAPIBaseUrl && webSocketBaseUrl) {
      BinanceSettings.instance.setSettings({
        RESTApiBaseUrl: restAPIBaseUrl,
        websocketBaseURl: webSocketBaseUrl,
      });
      setInstanceSetupComplete(true);
    }
  }, [restAPIBaseUrl, webSocketBaseUrl]);

  if (instanceSetupComplete && restAPIBaseUrl && webSocketBaseUrl) {
    return children;
  }
  return null;
}

export default InitialSetup;
