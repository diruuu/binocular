import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { AppThunk, RootState } from '../store';
import { IBinanceBalance, OutboundPositionBalance } from '../types';
import clearTrailingZero from '../utils/clear-trailing-zero';
import {
  selectBalances,
  selectListenKey,
  selectListenKeyUpdatedAt,
} from './selectors/account-selectors';
import { getListenKey } from './actions/account-actions';

interface IAccountStateRAW {
  balances: IBinanceBalance[];
  accountType: string;
  canTrade: boolean;
  permissions: ('SPOT' | 'MARGIN')[];
}

interface IAccountState extends IAccountStateRAW {
  listenKey: string | null;
  listenKeyUpdatedAt: number;
}

const initialState: IAccountState = {
  balances: [],
  accountType: 'SPOT',
  canTrade: true,
  listenKey: null,
  listenKeyUpdatedAt: 0,
  permissions: ['SPOT'],
};

export const accountSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {
    populateAccountInfo: (state, action: PayloadAction<IAccountStateRAW>) => {
      state.balances = action.payload.balances;
      state.accountType = action.payload.accountType;
      state.canTrade = action.payload.canTrade;
      state.permissions = action.payload.permissions;
    },
    updateBalance: (
      state,
      action: PayloadAction<OutboundPositionBalance[]>
    ) => {
      const removedBalance = state.balances?.filter((balance) => {
        const select = action.payload?.find(
          (newBalance) => newBalance.a === balance.asset
        );
        if (select) {
          return false;
        }
        return true;
      });

      const newBalance: IBinanceBalance[] = action.payload?.map((balance) => ({
        asset: balance.a,
        free: balance.f,
        locked: balance.l,
      }));

      state.balances = [...removedBalance, ...newBalance];
    },
    setListenKey: (state, action: PayloadAction<string | null>) => {
      state.listenKey = action.payload;
      state.listenKeyUpdatedAt = new Date().getTime();
    },
  },
});

export const {
  populateAccountInfo,
  setListenKey,
  updateBalance,
} = accountSlice.actions;

export const selectBalanceByName = (asset: string | undefined) => (
  state: RootState
): string => {
  const balances = selectBalances(state);
  const balance = balances?.find(
    (assetBalance) => assetBalance.asset === asset?.toUpperCase()
  );
  if (balance) {
    return clearTrailingZero(balance.free);
  }
  return '0';
};

export const checkListenKey = (): AppThunk => async (dispatch, getState) => {
  const states = getState();
  const listenKey = selectListenKey(states);
  const listenKeyUpdatedAt = selectListenKeyUpdatedAt(states);
  const now = new Date().getTime();
  const interval = 30 * 60 * 1000;
  const range = now - listenKeyUpdatedAt;
  if (!listenKey) {
    return;
  }
  if (range > interval) {
    dispatch(getListenKey());
  }
};

export default accountSlice.reducer;
