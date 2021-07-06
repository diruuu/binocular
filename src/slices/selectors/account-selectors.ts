import { RootState } from '../../store';
import { IBinanceBalance } from '../../types';

export const selectBalances = (state: RootState): IBinanceBalance[] => {
  return state.account.balances;
};

export const selectMakerCommission = (state: RootState): number => {
  return state.account.makerCommission / 10000;
};

export const selectListenKey = (state: RootState): string | null => {
  return state.account.listenKey;
};

export const selectListenKeyUpdatedAt = (state: RootState): number => {
  return state.account.listenKeyUpdatedAt;
};
