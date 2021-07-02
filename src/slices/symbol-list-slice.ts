import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import BinanceRest from '../services/binance-rest';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../store';
import { BinancePrice, BinancePriceResponse } from '../types';
import lang from '../utils/lang';
import logger from '../utils/logger';
import { appendSnackbar } from './snackbar-slice';

interface ISymbolListState {
  isFetchingSymbols: boolean;
  list: BinancePrice[];
}

const initialState: ISymbolListState = {
  list: [],
  isFetchingSymbols: false,
};

export const symbolListSlice = createSlice({
  name: 'symbolList',
  initialState,
  reducers: {
    populateSymbolList: (state, action: PayloadAction<BinancePrice[]>) => {
      state.list = action.payload;
    },
    resetSymbolList: (state) => {
      state.list = initialState.list;
    },
    setFetchingSymbol: (state, action: PayloadAction<boolean>) => {
      state.isFetchingSymbols = action.payload;
    },
  },
});

export const {
  populateSymbolList,
  resetSymbolList,
  setFetchingSymbol,
} = symbolListSlice.actions;

export const selectSymbolList = (state: RootState): BinancePrice[] => {
  return state.symbolList.list;
};

export const selectIsFetchingSymbols = (state: RootState): boolean => {
  return state.symbolList.isFetchingSymbols;
};

export const fetchAllSymbols = (
  fiat: string,
  forced?: boolean
): AppThunk => async (dispatch, getState) => {
  try {
    const states = getState();
    const symbolList = selectSymbolList(states);
    const sameFiat: boolean =
      symbolList && !!symbolList.length && symbolList[0].symbol.endsWith(fiat);
    if (symbolList && symbolList.length && !forced && sameFiat) {
      logger(lang('SKIPPED_BECAUSE_SYMBOL_LIST_NOT_EMPTY'));
      return;
    }
    dispatch(resetSymbolList());
    dispatch(setFetchingSymbol(true));
    const result: BinancePriceResponse[] = await BinanceRest.instance.getTickerPriceAll();
    const sorted = result?.filter((response: BinancePriceResponse) => {
      const isFiat = response.symbol?.endsWith(fiat);
      const isNotFiatDown = !response.symbol?.endsWith(`DOWN${fiat}`);
      const isNotFiatUp = !response.symbol?.endsWith(`UP${fiat}`);
      const isNotFiatBear = !response.symbol?.endsWith(`BEAR${fiat}`);
      const isNotFiatNull = !response.symbol?.endsWith(`BULL${fiat}`);
      return (
        isFiat && isNotFiatDown && isNotFiatUp && isNotFiatBear && isNotFiatNull
      );
    });
    dispatch(populateSymbolList(sorted));
  } catch (error) {
    dispatch(
      appendSnackbar({
        message: lang('ERROR_GETTING_SYMBOL_LISTS'),
        variant: 'error',
      })
    );
  } finally {
    dispatch(setFetchingSymbol(false));
  }
};

const persistConfig = {
  key: 'symbolListSlice',
  storage,
  whitelist: ['list'],
};

const persistedReducer = persistReducer(persistConfig, symbolListSlice.reducer);

export default persistedReducer;
