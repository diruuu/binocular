import { RootState } from '../../store';
import {
  IBinanceTradeItem,
  OrderListStatus,
  OrderListTableItem,
} from '../../types';
import timeSince from '../../utils/time-since';
import {
  getOrderListByType,
  selectSymbol,
  selectTick,
  selectTradeList,
} from '../symbol-info-slice';

export const selectBuyList = (state: RootState): IBinanceTradeItem[] => {
  const tradeList = selectTradeList(state);
  const symbol = selectSymbol(state);
  const buyList = tradeList
    ?.filter((trade) => {
      const validOrder =
        trade.status === 'FILLED' &&
        trade.type === 'MARKET' &&
        trade.side === 'BUY' &&
        trade.clientOrderId?.startsWith('market-') &&
        !trade.clientOrderId?.startsWith('market-sell') &&
        trade.symbol === symbol;
      return validOrder;
    })
    .map((trade) => {
      const stopLossOrder = getOrderListByType(
        'STOP_LOSS_LIMIT',
        'SELL',
        trade.groupId || 0
      )(state);
      const takeProfitOrder = getOrderListByType(
        'LIMIT_MAKER',
        'SELL',
        trade.groupId || 0
      )(state);
      const marketSellOrder = getOrderListByType(
        'MARKET',
        'SELL',
        trade.groupId || 0
      )(state);
      return {
        ...trade,
        stopLossOrder,
        takeProfitOrder,
        marketSellOrder,
      };
    });

  return buyList;
};

export const selectOrderListTableItems = (
  state: RootState
): OrderListTableItem[] => {
  const buyList = selectBuyList(state);
  const tick = selectTick(state);
  const result = buyList?.map(
    (list): OrderListTableItem => {
      function getStatus(): OrderListStatus {
        const isMarketSold = list.marketSellOrder?.status === 'FILLED';
        const isCancelled =
          list.stopLossOrder?.status === 'CANCELED' ||
          list.takeProfitOrder?.status === 'CANCELED';
        const isStoppedLoss = list.stopLossOrder?.status === 'FILLED';
        const isTookProfit = list.takeProfitOrder?.status === 'FILLED';
        const isPartiallyFilled =
          list.stopLossOrder?.status === 'PARTIALLY_FILLED' ||
          list.takeProfitOrder?.status === 'PARTIALLY_FILLED';
        const isOnStopLimit =
          list.stopLossOrder?.status === 'NEW' &&
          list.takeProfitOrder?.status === 'EXPIRED';
        const isExecuting =
          list.stopLossOrder?.status === 'NEW' &&
          list.takeProfitOrder?.status === 'NEW';
        const isOcoFailed = !list.stopLossOrder && !list.takeProfitOrder;

        if (isExecuting) {
          return 'EXEC';
        }
        if (isOnStopLimit) {
          return 'ON_LIMIT';
        }
        if (isPartiallyFilled) {
          return 'PARTIAL_FILL';
        }
        if (isStoppedLoss) {
          return 'STOP_LIMIT';
        }
        if (isTookProfit) {
          return 'TOOK_PROFIT';
        }
        if (isMarketSold) {
          return 'SOLD';
        }
        if (isCancelled) {
          return 'CANCELLED';
        }
        if (isOcoFailed) {
          return 'OCO_FAILED';
        }
        return 'UNKNOWN';
      }

      function getProfit(): string {
        const status = getStatus();
        const marketBuyQTY: number = parseFloat(list.cummulativeQuoteQty);
        const marketExecQTY: number = list.origQty
          ? parseFloat(list.origQty)
          : 0;
        let profit = '0';
        if (status === 'SOLD') {
          const marketSellQTY: number = list.marketSellOrder
            ?.cummulativeQuoteQty
            ? parseFloat(list.marketSellOrder?.cummulativeQuoteQty)
            : marketBuyQTY;
          profit = (marketSellQTY - marketBuyQTY).toFixed(2);
        } else if (status === 'STOP_LIMIT') {
          const stopLossQTY: number = list.stopLossOrder?.cummulativeQuoteQty
            ? parseFloat(list.stopLossOrder?.cummulativeQuoteQty)
            : marketBuyQTY;
          profit = (stopLossQTY - marketBuyQTY).toFixed(2);
        } else if (status === 'TOOK_PROFIT') {
          const takeProfitQTY: number = list.takeProfitOrder
            ?.cummulativeQuoteQty
            ? parseFloat(list.takeProfitOrder?.cummulativeQuoteQty)
            : marketBuyQTY;
          profit = (takeProfitQTY - marketBuyQTY).toFixed(2);
        } else if (
          ['CANCELLED', 'OCO_FAILED', 'ON_LIMIT', 'EXEC'].includes(status)
        ) {
          const predictedSell = tick.close * marketExecQTY;
          if (!Number.isNaN(predictedSell)) {
            profit = (predictedSell - marketBuyQTY).toFixed(2);
          }
        }
        return profit;
      }

      function getTime(): string {
        // eslint-disable-next-line prefer-destructuring
        let time: number | undefined = list.time;
        const status = getStatus();
        if (status === 'SOLD') {
          time = list.marketSellOrder?.time;
        } else if (status === 'STOP_LIMIT') {
          time = list.stopLossOrder?.time;
        } else if (status === 'TOOK_PROFIT') {
          time = list.takeProfitOrder?.time;
        }
        return timeSince(time || list.time);
      }

      return {
        index: 0,
        tradeId: list.groupId?.toString() || '',
        status: getStatus(),
        profit: getProfit(),
        time: getTime(),
        orgQty: parseFloat(list.cummulativeQuoteQty).toFixed(2),
      };
    }
  );

  const reversed = [...result].reverse();
  const indexed = reversed?.map((trade, index) => ({
    ...trade,
    index: index + 1,
  }));
  return indexed;
};
