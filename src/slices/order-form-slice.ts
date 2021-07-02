import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BinanceRest from '../services/binance-rest';
import { AppThunk, RootState } from '../store';
import { IOrderData } from '../types';
import lang from '../utils/lang';
import logger from '../utils/logger';
import { selectCredential } from './settings-slice';
import { appendSnackbar } from './snackbar-slice';
import {
  selectTick,
  selectTickSizeDecimals,
  selectTradeListByGroupId,
} from './symbol-info-slice';

interface IOrderFormState {
  isSendingOrder: boolean;
  stopLoss: string;
  stopLossUseATR: boolean;
  stopLossFocused: boolean;
  takeProfit: string;
  takeProfitUseATR: boolean;
  takeProfitFocused: boolean;
}

const initialState: IOrderFormState = {
  isSendingOrder: false,
  stopLoss: '0',
  stopLossUseATR: true,
  stopLossFocused: false,
  takeProfit: '0',
  takeProfitUseATR: true,
  takeProfitFocused: false,
};

export const orderFormSlice = createSlice({
  name: 'orderForm',
  initialState,
  reducers: {
    setStopLoss: (state, action: PayloadAction<string>) => {
      state.stopLoss = action.payload;
    },
    setTakeProfit: (state, action: PayloadAction<string>) => {
      state.takeProfit = action.payload;
    },
    setStopLossUseATR: (state, action: PayloadAction<boolean>) => {
      state.stopLossUseATR = action.payload;
    },
    setTakeProfitUseATR: (state, action: PayloadAction<boolean>) => {
      state.takeProfitUseATR = action.payload;
    },
    setStopLossFocus: (state, action: PayloadAction<boolean>) => {
      state.stopLossFocused = action.payload;
    },
    setTakeProfitFocus: (state, action: PayloadAction<boolean>) => {
      state.takeProfitFocused = action.payload;
    },
    setSendingOrder: (state, action: PayloadAction<boolean>) => {
      state.isSendingOrder = action.payload;
    },
  },
});

export const {
  setStopLoss,
  setTakeProfit,
  setStopLossUseATR,
  setTakeProfitUseATR,
  setStopLossFocus,
  setTakeProfitFocus,
  setSendingOrder,
} = orderFormSlice.actions;

export const selectStopLoss = (state: RootState): string => {
  const tickSizeDecimals = selectTickSizeDecimals(state);
  const result = parseFloat(state.orderForm.stopLoss).toFixed(tickSizeDecimals);
  return result;
};

export const selectRealStopLoss = (stopLoss: number) => (
  state: RootState
): string => {
  const tickSizeDecimals = selectTickSizeDecimals(state);
  const ticks = selectTick(state);
  const priceLength = ticks.close - stopLoss;
  const stopLossLimitLength = 0.15 * priceLength;
  const stopLossLimit = stopLoss - stopLossLimitLength;
  const result = stopLossLimit?.toFixed(tickSizeDecimals);
  return !Number.isNaN(stopLossLimit) ? result : '0';
};

export const getRealStopLoss = (state: RootState): string => {
  const stopLoss = parseFloat(state.orderForm.stopLoss);
  const result = selectRealStopLoss(stopLoss)(state);
  return result;
};

export const selectTakeProfit = (state: RootState): string => {
  const tickSizeDecimals = selectTickSizeDecimals(state);
  const result = parseFloat(state.orderForm.takeProfit).toFixed(
    tickSizeDecimals
  );
  return result;
};

export const selectStopLossUseATR = (state: RootState): boolean => {
  return state.orderForm.stopLossUseATR;
};

export const selectTakeProfitUseATR = (state: RootState): boolean => {
  return state.orderForm.takeProfitUseATR;
};

export const selectStopFocused = (state: RootState): boolean => {
  return state.orderForm.stopLossFocused;
};

export const selectTakeProfitFocused = (state: RootState): boolean => {
  return state.orderForm.takeProfitFocused;
};

export const selectSendingOrder = (state: RootState): boolean => {
  return state.orderForm.isSendingOrder;
};

export const setStopLossTakeProfitOnChartClick = (
  price: number
): AppThunk => async (dispatch, getState) => {
  const states = getState();
  const isStopLossInputFocused = selectStopFocused(states);
  const isTakeProfitInputFocused = selectTakeProfitFocused(states);
  const isStopLossUseATR = selectStopLossUseATR(states);
  const isTakeProfitUseATR = selectTakeProfitUseATR(states);

  if (isStopLossInputFocused && !isStopLossUseATR) {
    dispatch(setStopLoss(price.toString()));
  }

  if (isTakeProfitInputFocused && !isTakeProfitUseATR) {
    dispatch(setTakeProfit(price.toString()));
  }
};

export const cancelOCOOrderByGroupId = (
  groupId: string,
  onSuccess: (ocoOrder: IOrderData) => void
): AppThunk => async (dispatch, getState) => {
  try {
    const states = getState();
    const credentials = selectCredential(states);
    if (!credentials) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const order = selectTradeListByGroupId(groupId)(states);
    const stopLimitOrder = order.find((o) => o.type === 'STOP_LOSS_LIMIT');
    if (!stopLimitOrder) {
      throw new Error(lang('STOP_LIMIT_ORDER_NOT_EXIST'));
    }
    const { orderListId, symbol } = stopLimitOrder;
    if (!orderListId) {
      throw new Error(lang('ORDER_LIST_ID_NOT_EXIST'));
    }
    // Cancelling OCO
    const ocoCancelResult = await BinanceRest.instance.cancelOCO(
      orderListId,
      symbol,
      credentials
    );
    logger({ ocoCancelResult });
    if (ocoCancelResult.listOrderStatus !== 'ALL_DONE') {
      throw new Error(lang('CANCELLING_OCO_ORDER_FAILED'));
    }
    if (onSuccess) {
      const ocoOrder: IOrderData = {
        symbol: stopLimitOrder.symbol,
        side: stopLimitOrder.side,
        quoteOrderQty: parseFloat(stopLimitOrder.origQty || '0'),
        orderId: groupId?.toString(),
      };
      onSuccess(ocoOrder);
    }
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: lang(error.message),
        variant: 'error',
      })
    );
  }
};

export const cancelMarketOrderByGroupId = (groupId: string): AppThunk => async (
  dispatch,
  getState
) => {
  try {
    const states = getState();
    const credentials = selectCredential(states);
    if (!credentials) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const order = selectTradeListByGroupId(groupId)(states);
    const marketOrder = order.find((o) => o.type === 'MARKET');
    if (!marketOrder) {
      throw new Error(lang('MARKET_ORDER_NOT_EXIST'));
    }

    dispatch(
      appendSnackbar({
        message: lang('SELLING_TO_MARKET'),
        variant: 'info',
      })
    );

    const sellingOrder: IOrderData = {
      symbol: marketOrder.symbol,
      orderId: `market-sell-${groupId}`,
      side: 'SELL',
      quantity: parseFloat(marketOrder.executedQty),
    };
    const marketSellResult = await BinanceRest.instance.sendOrder(
      sellingOrder,
      credentials
    );

    if (marketSellResult.status === 'FILLED') {
      dispatch(
        appendSnackbar({
          message: lang('SOLD_TO_MARKET'),
          variant: 'success',
        })
      );
    } else {
      dispatch(
        appendSnackbar({
          message: lang('FAILED_SELL_TO_MARKET'),
          variant: 'error',
        })
      );
    }

    logger({ marketSellResult });
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

export const cancelOrderByGroupId = (
  groupId: string,
  cancelMarketOrder = true
): AppThunk => async (dispatch) => {
  dispatch(
    cancelOCOOrderByGroupId(groupId, () => {
      if (!cancelMarketOrder) {
        return;
      }
      // Sell asset on market price
      dispatch(cancelMarketOrderByGroupId(groupId));
    })
  );
};

export const updateOCOByGroupId = (
  groupId: string,
  stopLossPrice: number,
  takeProfitPrice: number
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const credentials = selectCredential(state);
  if (!credentials) {
    throw new Error(lang('NO_CREDENTIAL_FOUND'));
  }
  dispatch(
    cancelOCOOrderByGroupId(groupId, async (ocoOrderOriginal: IOrderData) => {
      const realStopLoss = selectRealStopLoss(stopLossPrice)(state);
      // Create new OCO order
      const ocoOrder: IOrderData = {
        ...ocoOrderOriginal,
        takeProfit: takeProfitPrice,
        stopLoss: parseFloat(realStopLoss),
        stopLossLimit: stopLossPrice,
      };
      const newOCOResult = await BinanceRest.instance.sendOcoOrder(
        ocoOrder,
        credentials
      );
      logger({
        newOCOResult,
      });
    })
  );
};

export const sendOrder = (orderData: IOrderData): AppThunk => async (
  dispatch,
  getState
) => {
  try {
    const state = getState();
    const credentials = selectCredential(state);
    if (!credentials) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const order: IOrderData = {
      ...orderData,
      orderId: `market-${new Date().getTime()}`,
      side: 'BUY',
    };
    dispatch(setSendingOrder(true));
    const { executedQty, orderId } = await BinanceRest.instance.sendOrder(
      order,
      credentials
    );
    const ocoOrder: IOrderData = {
      ...orderData,
      side: 'SELL',
      quoteOrderQty: parseFloat(executedQty),
      orderId: orderId?.toString(),
    };
    const result = await BinanceRest.instance.sendOcoOrder(
      ocoOrder,
      credentials
    );
    logger({
      result,
      ocoOrder,
    });
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: error.message,
        variant: 'error',
      })
    );
  } finally {
    dispatch(setSendingOrder(false));
  }
};

export default orderFormSlice.reducer;
