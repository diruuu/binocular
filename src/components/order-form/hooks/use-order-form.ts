import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from '../../../hooks';
import {
  selectStopFocused,
  selectStopLoss,
  selectStopLossUseATR,
  selectTakeProfit,
  selectTakeProfitFocused,
  selectTakeProfitUseATR,
  setStopLoss,
  setTakeProfit,
  setStopLossUseATR,
  setTakeProfitUseATR,
  setStopLossFocus,
  setTakeProfitFocus,
  sendOrder,
  selectSendingOrder,
  getRealStopLoss,
} from '../../../slices/order-form-slice';
import { selectSymbolInfo } from '../../../slices/symbol-info-slice';
import { IOrderData } from '../../../types';
import logger from '../../../utils/logger';

function useOrderForm(symbol: string) {
  const initialAmount = '0';
  const [amount, setAmount] = useState(initialAmount);
  const dispatch = useDispatch();
  const stopLoss = useSelector(selectStopLoss);
  const realStopLoss = useSelector(getRealStopLoss);
  const takeProfit = useSelector(selectTakeProfit);
  const stopLossUseATR = useSelector(selectStopLossUseATR);
  const takeProfitUseATR = useSelector(selectTakeProfitUseATR);
  const stopLossFocused = useSelector(selectStopFocused);
  const takeProfitFocused = useSelector(selectTakeProfitFocused);
  const symbolInfo = useSelector(selectSymbolInfo);
  const isSending = useSelector(selectSendingOrder);

  useEffect(() => {
    setAmount(initialAmount);
  }, [symbol]);

  const stopLossNum: number = useMemo(() => parseFloat(stopLoss), [stopLoss]);

  const realStopLossNum: number = useMemo(() => parseFloat(realStopLoss), [
    realStopLoss,
  ]);
  const takeProfitNum: number = useMemo(() => parseFloat(takeProfit), [
    takeProfit,
  ]);

  const createOrder = () => {
    const orderData: IOrderData = {
      symbol: symbolInfo?.symbol || '',
      quoteOrderQty: parseFloat(amount),
      stopLoss: parseFloat(realStopLoss),
      stopLossLimit: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
    };
    logger(orderData);
    dispatch(sendOrder(orderData));
    setAmount(initialAmount);
  };

  return {
    getters: {
      amount,
      stopLoss: realStopLossNum,
      takeProfit: takeProfitNum,
      stopLossUseATR,
      takeProfitUseATR,
      stopLossFocused,
      takeProfitFocused,
      stopLossLimit: stopLossNum,
    },
    setters: {
      amount: setAmount,
      stopLoss: (value: string) => dispatch(setStopLoss(value)),
      takeProfit: (value: string) => dispatch(setTakeProfit(value)),
      stopLossUseATR: (value: boolean) => dispatch(setStopLossUseATR(value)),
      takeProfitUseATR: (value: boolean) =>
        dispatch(setTakeProfitUseATR(value)),
      stopLossFocused: (value: boolean) => dispatch(setStopLossFocus(value)),
      takeProfitFocused: (value: boolean) =>
        dispatch(setTakeProfitFocus(value)),
    },
    createOrder,
    isSending,
  };
}

export default useOrderForm;
