import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../store';
import BinanceRest from '../services/binance-rest';
import {
  IBinancePriceLimitFilter,
  IBinanceMinNotionalFilter,
  IBinanceSymbolInfo,
  ITickValue,
  IBinanceTradeItem,
  IBinancePercentPriceFilter,
} from '../types';
import { appendSnackbar } from './snackbar-slice';
import clearTrailingZero from '../utils/clear-trailing-zero';
import countDecimals from '../utils/count-decimal';
import { selectBuyList } from './selectors/symbol-info-selectors';
import logger from '../utils/logger';
import { selectCredential } from './settings-slice';
import reverseArray from '../utils/reverse-array';

interface ISymbolInfoState {
  symbol: IBinanceSymbolInfo | null;
  isLoading: boolean;
  tick: ITickValue | Record<string, never>;
  tradeList: IBinanceTradeItem[];
}

const initialState: ISymbolInfoState = {
  symbol: null,
  isLoading: false,
  tick: {},
  tradeList: [],
};

export const symbolInfoSlice = createSlice({
  name: 'symbolInfo',
  initialState,
  reducers: {
    setSymbolInfo: (state, action: PayloadAction<IBinanceSymbolInfo>) => {
      state.symbol = action.payload;
      state.isLoading = initialState.isLoading;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.symbol = initialState.symbol;
      }
      state.isLoading = action.payload;
    },
    setTick: (state, action: PayloadAction<ITickValue>) => {
      state.tick = action.payload;
    },
    resetSymbol: (state) => {
      state.symbol = initialState.symbol;
      state.isLoading = initialState.isLoading;
      state.tick = initialState.tick;
    },
    resetTradeList: (state) => {
      state.tradeList = initialState.tradeList;
    },
    populateTradeList: (state, action: PayloadAction<IBinanceTradeItem[]>) => {
      const reversedArray = reverseArray(action.payload);
      const result = reversedArray.reduce(
        (acc: IBinanceTradeItem[], tradeItem: IBinanceTradeItem) => {
          const clientOrderIdList = acc.map((i) => i.clientOrderId);
          if (!clientOrderIdList.includes(tradeItem.clientOrderId)) {
            return [...acc, tradeItem];
          }
          return acc;
        },
        [] as IBinanceTradeItem[]
      );

      state.tradeList = reverseArray(result);
    },
    appendTradeList: (state, action: PayloadAction<IBinanceTradeItem>) => {
      // Check if has duplicate id and remove from the list;
      const noDuplicateList = state.tradeList?.filter((trade) => {
        if (trade.clientOrderId !== action.payload.clientOrderId) {
          return true;
        }
        return false;
      });
      const newList = [...noDuplicateList, action.payload];
      state.tradeList = newList;
    },
  },
});

export const {
  setSymbolInfo,
  setLoading,
  setTick,
  resetSymbol,
  resetTradeList,
  appendTradeList,
  populateTradeList,
} = symbolInfoSlice.actions;

export const fetchSymbolInfo = (symbol: string): AppThunk => async (
  dispatch
) => {
  try {
    dispatch(resetSymbol());
    dispatch(setLoading(true));
    const result = await BinanceRest.instance.getSymbolInfo(symbol);
    dispatch(setSymbolInfo(result));
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: error.message,
        variant: 'error',
      })
    );
  } finally {
    dispatch(setLoading(false));
  }
};

const transformTradeList = (
  tradeList: IBinanceTradeItem[]
): IBinanceTradeItem[] => {
  return tradeList?.map((trade: IBinanceTradeItem) => {
    const isMarketBuy = trade.type === 'MARKET' && trade.side === 'BUY';
    const clientOrderIdSplit = trade.clientOrderId?.split('-');
    const referenceOrderId =
      clientOrderIdSplit?.length && clientOrderIdSplit?.length > 1
        ? clientOrderIdSplit[clientOrderIdSplit?.length - 1]
        : (trade.clientOrderId as string);
    const cummulativeQuoteQty = trade?.cummulativeQuoteQty
      ? parseFloat(trade.cummulativeQuoteQty)
      : 0;
    const origQty = trade?.origQty ? parseFloat(trade.origQty) : 0;
    const price: string = isMarketBuy
      ? (cummulativeQuoteQty / origQty).toString()
      : trade.price;
    const groupId: number = isMarketBuy
      ? trade.orderId
      : parseInt(referenceOrderId, 10);
    return {
      ...trade,
      price,
      groupId,
    };
  });
};

export const getTradeInfo = (symbol: string): AppThunk => async (
  dispatch,
  getState
) => {
  try {
    dispatch(resetTradeList());
    const states = getState();
    const credentials = selectCredential(states);
    if (!credentials) {
      return;
    }
    const result: IBinanceTradeItem[] = await BinanceRest.instance.getTradeInfo(
      symbol,
      credentials
    );
    const transformedResult = transformTradeList(result);
    dispatch(populateTradeList(transformedResult));
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: error.message,
        variant: 'error',
      })
    );
  }
};

export const updateTradeList = (
  tradeItem: IBinanceTradeItem
): AppThunk => async (dispatch) => {
  const transformedResult = transformTradeList([tradeItem]);
  dispatch(appendTradeList(transformedResult[0]));
};

export const selectSymbolInfo = (
  state: RootState
): IBinanceSymbolInfo | null => {
  return state.symbolInfo.symbol;
};

export const selectSymbol = (state: RootState): string | undefined => {
  const symbolInfo = selectSymbolInfo(state);
  return symbolInfo?.symbol;
};

export const selectTradeList = (state: RootState): IBinanceTradeItem[] => {
  return state.symbolInfo.tradeList;
};

export const selectTradeListByGroupId = (groupId: string) => (
  state: RootState
): IBinanceTradeItem[] => {
  const tradeList = selectTradeList(state);
  const result = tradeList?.filter(
    (trade) => trade.groupId === parseInt(groupId, 10)
  );
  return result;
};

export const getOrderListByType = (
  type: string,
  side: 'SELL' | 'BUY',
  groupId: number
) => (state: RootState): IBinanceTradeItem | undefined => {
  const tradeList = selectTradeList(state);
  const symbolInfo = selectSymbolInfo(state);
  return tradeList?.find(
    (tradeItem) =>
      tradeItem.groupId === groupId &&
      tradeItem.type === type &&
      tradeItem.side === side &&
      tradeItem.symbol === symbolInfo?.symbol
  );
};

export const selectActiveTradeList = (
  state: RootState
): IBinanceTradeItem[] => {
  const buyList = selectBuyList(state);
  const validMarketOrder = buyList.filter(
    (trade) =>
      (trade.stopLossOrder && trade.stopLossOrder.status === 'NEW') ||
      (trade.takeProfitOrder && trade.takeProfitOrder.status === 'NEW')
  );

  return validMarketOrder;
};

export const selectQuoteAssetPrecision = (state: RootState): number => {
  const symbolInfo = selectSymbolInfo(state);
  return symbolInfo?.quoteAssetPrecision || 0;
};

export const selectFilter = <T>(filterName: string) => (
  state: RootState
): T | undefined => {
  const symbolInfo = selectSymbolInfo(state);
  const filters: any = symbolInfo?.filters;
  if (filters?.length) {
    const result: T = filters?.find(
      (filter: any) => filter.filterType === filterName
    ) as T;
    return result;
  }
  return undefined;
};

export const selectPriceFilter = (
  state: RootState
): IBinancePriceLimitFilter | undefined => {
  const filter = selectFilter<IBinancePriceLimitFilter>('PRICE_FILTER')(state);
  return filter;
};

export const selectMinMotional = (
  state: RootState
): IBinanceMinNotionalFilter | undefined => {
  const filter = selectFilter<IBinanceMinNotionalFilter>('MIN_NOTIONAL')(state);
  return filter;
};

export const selectPercentPrice = (
  state: RootState
): IBinancePercentPriceFilter | undefined => {
  const filter = selectFilter<IBinancePercentPriceFilter>('PERCENT_PRICE')(
    state
  );
  return filter;
};

export const selectMinPrice = (state: RootState): number => {
  const filterPrice = selectPriceFilter(state);
  const minPrice = filterPrice?.minPrice || '0';
  return parseFloat(minPrice);
};

export const selectMaxPrice = (state: RootState): number => {
  const filterPrice = selectPriceFilter(state);
  const maxPrice = filterPrice?.maxPrice || '0';
  return parseFloat(maxPrice);
};

export const selectTickSize = (state: RootState): string => {
  const filterPrice = selectPriceFilter(state);
  const tickSize = clearTrailingZero(filterPrice?.tickSize || '0');
  return tickSize;
};

export const selectTickSizeDecimals = (state: RootState): number => {
  const tickSize = selectTickSize(state);
  return countDecimals(tickSize);
};

export const selectSymbolInfoIsLoading = (state: RootState): boolean => {
  return state.symbolInfo.isLoading;
};

export const selectTick = (
  state: RootState
): ITickValue | Record<string, never> => {
  return state.symbolInfo.tick;
};

export const selectLastPrice = (state: RootState): number => {
  const tick = selectTick(state);
  return tick.close;
};

export default symbolInfoSlice.reducer;
