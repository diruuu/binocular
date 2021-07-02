import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';

import { persistStore } from 'redux-persist';

import symbolListReducer from './slices/symbol-list-slice';
import accountReducer from './slices/account-slice';
import snackbarReducer from './slices/snackbar-slice';
import symbolInfoReducer from './slices/symbol-info-slice';
import settingsReducer from './slices/settings-slice';
import orderFormReducer from './slices/order-form-slice';
import symbolBookmarkReducer from './slices/symbol-bookmark-slice';

const rootReducer = combineReducers({
  symbolList: symbolListReducer,
  account: accountReducer,
  snackbar: snackbarReducer,
  symbolInfo: symbolInfoReducer,
  settings: settingsReducer,
  orderForm: orderFormReducer,
  symbolBookmark: symbolBookmarkReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});

// expose to window for debugging purpose
(window as any).REDUX_STORE = store;

export const getState: typeof store.getState = () => {
  return store?.getState();
};

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
