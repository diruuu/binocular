import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import BinanceSocketClient from '../services/binance-websocket';
import { AppThunk, RootState } from '../store';
import { APICredentialInfo } from '../types';
import lang from '../utils/lang';
import { appendSnackbar } from './snackbar-slice';

export enum WebsocketStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSE = 'close',
}

interface ISettingsState {
  credential: APICredentialInfo | null;
  stopLossAtrRatio: number;
  takeProfitAtrRatio: number;
  websocketStatus?: WebsocketStatus;
  restAPIBaseUrl: string;
  websocketBaseUrl: string;
  version?: string;
  networkAccessBlocked?: boolean;
  isModalOpen: boolean;
}

const initialState: ISettingsState = {
  credential: null,
  stopLossAtrRatio: 1,
  takeProfitAtrRatio: 1.5,
  websocketStatus: WebsocketStatus.CLOSE,
  restAPIBaseUrl: 'https://api.binance.com/api/v3',
  websocketBaseUrl: 'wss://stream.binance.com/ws',
  version: '0.0.0',
  networkAccessBlocked: false,
  isModalOpen: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setWebsocketStatus(state, action: PayloadAction<WebsocketStatus>) {
      state.websocketStatus = action.payload;
    },
    setRestAPIBaseUrl(state, action: PayloadAction<string>) {
      state.restAPIBaseUrl = action.payload;
    },
    setWebsocketBaseUrl(state, action: PayloadAction<string>) {
      state.websocketBaseUrl = action.payload;
    },
    setStopLossAtrRatio(state, action: PayloadAction<number>) {
      state.stopLossAtrRatio = action.payload;
    },
    setTakeProfitAtrRatio(state, action: PayloadAction<number>) {
      state.takeProfitAtrRatio = action.payload;
    },
    setNetworkAccessBlocked(state, action: PayloadAction<boolean>) {
      state.networkAccessBlocked = action.payload;
    },
    setModalOpen(state, action: PayloadAction<boolean>) {
      state.isModalOpen = action.payload;
    },
    setVersion(state, action: PayloadAction<string>) {
      state.version = action.payload;
    },
    setCredential(state, action: PayloadAction<APICredentialInfo>) {
      state.credential = action.payload;
    },
  },
});

export const {
  setWebsocketStatus,
  setVersion,
  setNetworkAccessBlocked,
  setModalOpen,
  setCredential,
  setRestAPIBaseUrl,
  setWebsocketBaseUrl,
  setStopLossAtrRatio,
  setTakeProfitAtrRatio,
} = settingsSlice.actions;

export const selectCredential = (
  state: RootState
): APICredentialInfo | null => {
  return state.settings.credential;
};

export const selectVersion = (state: RootState): string => {
  return state.settings.version || '0.0.0';
};

export const selectWebsocketStatus = (state: RootState): WebsocketStatus => {
  return state.settings.websocketStatus || WebsocketStatus.CLOSE;
};

export const selectRESTApiBaseUrl = (state: RootState): string | null => {
  return state.settings.restAPIBaseUrl;
};

export const selectWebsocketBaseUrl = (state: RootState): string | null => {
  return state.settings.websocketBaseUrl;
};

export const selectStopLossAtrRatio = (state: RootState): number => {
  return state.settings.stopLossAtrRatio;
};

export const selectTakeProfitAtrRatio = (state: RootState): number => {
  return state.settings.takeProfitAtrRatio;
};

export const selectNetworkAccessBlocked = (state: RootState): boolean => {
  return state.settings.networkAccessBlocked || false;
};

export const selectModalOpen = (state: RootState): boolean => {
  return state.settings.isModalOpen;
};

export const connectToWebsocket = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setNetworkAccessBlocked(false));
    dispatch(setWebsocketStatus(WebsocketStatus.CONNECTING));
    await BinanceSocketClient.instance.connectAsync(() => {
      dispatch(setWebsocketStatus(WebsocketStatus.CLOSE));

      dispatch(
        appendSnackbar({
          message: lang('WEBSOCKET_CLOSED'),
          variant: 'error',
        })
      );
    });
    dispatch(setWebsocketStatus(WebsocketStatus.OPEN));
  } catch (error) {
    const errorMessage: string = error.message;
    if (errorMessage?.includes('404')) {
      dispatch(setNetworkAccessBlocked(true));
    }
    dispatch(setWebsocketStatus(WebsocketStatus.CLOSE));
  }
};

const persistConfig = {
  key: 'settingsSlice',
  storage,
  blacklist: ['websocketStatus', 'networkAccessBlocked', 'isModalOpen'],
};

const persistedReducer = persistReducer(persistConfig, settingsSlice.reducer);

export default persistedReducer;
