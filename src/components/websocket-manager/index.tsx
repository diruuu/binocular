import React, { useEffect } from 'react';
import { useDispatch, useSelector } from '../../hooks';
import {
  connectToWebsocket,
  selectWebsocketStatus,
  WebsocketStatus,
} from '../../slices/settings-slice';
import ConnectingState from './connecting-state';
import DisconnectedState from './disconnected-state';

function WebsocketManager({ children }: any) {
  const dispatch = useDispatch();
  const websocketStatus = useSelector(selectWebsocketStatus);
  useEffect(() => {
    dispatch(connectToWebsocket());
  }, [dispatch]);

  if (websocketStatus === WebsocketStatus.CONNECTING) {
    return <ConnectingState />;
  }

  if (websocketStatus === WebsocketStatus.CLOSE) {
    return <DisconnectedState />;
  }

  return children;
}

export default WebsocketManager;
