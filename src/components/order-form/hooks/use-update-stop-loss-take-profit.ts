import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import config from '../../../config';
import {
  selectStopLossAtrRatio,
  selectTakeProfitAtrRatio,
} from '../../../slices/settings-slice';
import {
  selectSymbolInfo,
  selectTick,
} from '../../../slices/symbol-info-slice';
import useOrderForm from './use-order-form';

function useUpdateStopLossTakeProfit() {
  const symbolInfo = useSelector(selectSymbolInfo);
  const latestTick = useSelector(selectTick);
  const stopLossAtrRatio = useSelector(selectStopLossAtrRatio);
  const takeProfitAtrRatio = useSelector(selectTakeProfitAtrRatio);
  const defaultPair = config.getDefaultPair();
  const symbol = symbolInfo?.symbol || defaultPair;
  const { getters: orderFormGetters, setters: orderFormSetters } = useOrderForm(
    symbol
  );

  useEffect(() => {
    if (!orderFormGetters.stopLossUseATR) {
      return;
    }
    if (!latestTick?.atr || !latestTick.close || !stopLossAtrRatio) {
      orderFormSetters.stopLoss('0');
    } else {
      const stopLoss = latestTick.close - latestTick?.atr * stopLossAtrRatio;
      orderFormSetters.stopLoss(stopLoss.toString());
    }
  }, [
    latestTick.atr,
    latestTick.close,
    stopLossAtrRatio,
    orderFormSetters,
    orderFormGetters.stopLossUseATR,
  ]);

  useEffect(() => {
    if (!orderFormGetters.takeProfitUseATR) {
      return;
    }
    if (!latestTick?.atr || !latestTick.close || !takeProfitAtrRatio) {
      orderFormSetters.takeProfit('0');
    } else {
      const takeProfit =
        latestTick.close + latestTick?.atr * takeProfitAtrRatio;
      orderFormSetters.takeProfit(takeProfit.toString());
    }
  }, [
    latestTick.atr,
    latestTick.close,
    orderFormGetters.takeProfitUseATR,
    takeProfitAtrRatio,
    orderFormSetters,
  ]);
}

export default useUpdateStopLossTakeProfit;
