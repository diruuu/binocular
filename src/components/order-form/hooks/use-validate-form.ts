import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectBalanceByName } from '../../../slices/account-slice';
import {
  selectMinMotional,
  selectPercentPrice,
  selectSymbolInfo,
  selectTick,
} from '../../../slices/symbol-info-slice';

function useValidateForm({ orderFormGetters }: any) {
  const symbolInfo = useSelector(selectSymbolInfo);
  const latestTick = useSelector(selectTick);
  const balance = useSelector(selectBalanceByName(symbolInfo?.quoteAsset));
  const minNotionalFilter = useSelector(selectMinMotional);
  const percentPriceFilter = useSelector(selectPercentPrice);
  const notional = useMemo(() => {
    const amount = parseFloat(orderFormGetters.amount);
    const quantity = amount / latestTick.close;
    return latestTick.close * quantity;
  }, [latestTick.close, orderFormGetters.amount]);

  const validityResult = useMemo((): {
    isValid: boolean;
    failDebug: string;
  } => {
    const balanceFloat = parseFloat(balance);
    const amount = parseFloat(orderFormGetters.amount);
    const stopLoss = parseFloat(orderFormGetters.stopLoss);
    const takeProfit = parseFloat(orderFormGetters.takeProfit);
    const predictedQty = amount / latestTick.close;
    const multiplierUp = parseFloat(percentPriceFilter?.multiplierUp || '0');
    const multiplierDown = parseFloat(
      percentPriceFilter?.multiplierDown || '0'
    );

    let failDebug = '';
    let isValid = false;

    const minNotional = minNotionalFilter
      ? parseFloat(minNotionalFilter.minNotional)
      : 0;

    if (
      !orderFormGetters.amount ||
      orderFormGetters.amount === '' ||
      amount === 0
    ) {
      failDebug = '0';
      isValid = false;
    } else if (stopLoss === 0 || takeProfit === 0) {
      isValid = false;
      failDebug = '12';
    } else if (amount > balanceFloat) {
      failDebug = '2';
      isValid = false;
    } else if (stopLoss >= latestTick.close) {
      failDebug = '3';
      isValid = false;
    } else if (takeProfit <= latestTick.close) {
      failDebug = '4';
      isValid = false;
    } else if (minNotionalFilter?.applyToMarket && minNotional >= notional) {
      failDebug = '5';
      isValid = false;
    } else if (stopLoss * predictedQty <= minNotional) {
      failDebug = '6';
      isValid = false;
    } else if (takeProfit * predictedQty <= minNotional) {
      failDebug = '7';
      isValid = false;
    } else if (stopLoss > multiplierUp * latestTick.close) {
      failDebug = '8';
      isValid = false;
    } else if (stopLoss < multiplierDown * latestTick.close) {
      failDebug = '9';
      isValid = false;
    } else if (takeProfit > multiplierUp * latestTick.close) {
      failDebug = '10';
      isValid = false;
    } else if (takeProfit < multiplierDown * latestTick.close) {
      failDebug = '11';
      isValid = false;
    } else {
      isValid = true;
    }

    return { isValid, failDebug };
  }, [
    orderFormGetters.amount,
    orderFormGetters.stopLoss,
    orderFormGetters.takeProfit,
    balance,
    latestTick.close,
    minNotionalFilter,
    percentPriceFilter,
    notional,
  ]);

  return validityResult;
}

export default useValidateForm;
