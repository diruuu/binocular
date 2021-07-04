import { useCallback, useContext, useEffect } from 'react';
import useCreateOrderLine, {
  OrderLineCallback,
  OrderLineMoveCallback,
} from './use-create-order-line';
import {
  cancelOrderByGroupId,
  updateOCOByGroupId,
} from '../../slices/order-form-slice';
import { useDispatch, useSelector } from '../../hooks';
import {
  selectActiveTradeList,
  selectSymbolInfo,
} from '../../slices/symbol-info-slice';
import { IBinanceTradeItem } from '../../types';
import clearTrailingZero from '../../utils/clear-trailing-zero';
import DialogContext from '../../contexts/dialog-context';
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';

function useOrderLines(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const dispatch = useDispatch();
  const symbolInfo = useSelector(selectSymbolInfo);
  const dialogContextRef = useContext(DialogContext);
  const activeTradeList = useSelector(selectActiveTradeList);
  const activeTradeListIds = activeTradeList
    ?.map(
      (trade) =>
        (trade.clientOrderId || '') +
        trade.stopLossOrder?.orderId +
        trade.takeProfitOrder?.orderId
    )
    ?.join();
  const { createOrderLine, resetOrderLine } = useCreateOrderLine(
    chartRef,
    dialogContextRef
  );

  const onCancelOCOOrder = useCallback((result: OrderLineCallback) => {
    dispatch(cancelOrderByGroupId(result.orderId, false));
  }, []);

  const onCancelAllOrder = useCallback((result: OrderLineCallback) => {
    dispatch(cancelOrderByGroupId(result.orderId, true));
  }, []);

  const onMove = useCallback((result: OrderLineMoveCallback) => {
    dispatch(
      updateOCOByGroupId(
        result.orderId,
        result.stopLossPrice,
        result.takeProfitPrice
      )
    );
  }, []);

  useEffect(() => {
    if (!activeTradeList.length) {
      return;
    }
    const id = new Date().getTime();
    activeTradeList.forEach((trade: IBinanceTradeItem) => {
      // Market order
      createOrderLine(
        {
          price: parseFloat(trade.price),
          quantity: `${clearTrailingZero(trade.origQuoteOrderQty || '0')} ${
            symbolInfo?.quoteAsset
          }`,
          text: `Buy: #${trade.groupId}`,
          onCancel: onCancelAllOrder,
          color: '#F1BA10',
          textColor: '#333',
          orderId: trade.groupId?.toString() || '',
        },
        id
      );

      // Stop loss order
      if (trade?.stopLossOrder) {
        const price = parseFloat(trade?.stopLossOrder?.stopPrice || '0');
        const buyPrice = parseFloat(trade.price);
        const origQuoteOrderQty = parseFloat(trade.origQuoteOrderQty || '0');
        const priceDiff = buyPrice - price;
        const origQty = parseFloat(trade?.stopLossOrder?.origQty || '0');
        const loss = origQty * priceDiff;
        createOrderLine(
          {
            price,
            quantity: `${(origQuoteOrderQty - loss).toFixed(2)} ${
              symbolInfo?.quoteAsset
            }`,
            text: `Stop loss: #${trade?.stopLossOrder?.groupId}`,
            onCancel: onCancelOCOOrder,
            onMove,
            color: '#f44336',
            orderId: trade.groupId?.toString() || '',
          },
          id,
          true
        );
      }

      // Take profit order
      if (trade?.takeProfitOrder) {
        const price = parseFloat(trade?.takeProfitOrder?.price || '0');
        const buyPrice = parseFloat(trade.price);
        const origQuoteOrderQty = parseFloat(trade.origQuoteOrderQty || '0');
        const priceDiff = price - buyPrice;
        const origQty = parseFloat(trade?.takeProfitOrder?.origQty || '0');
        const profit = origQty * priceDiff;
        createOrderLine(
          {
            price,
            quantity: `${(origQuoteOrderQty + profit).toFixed(2)} ${
              symbolInfo?.quoteAsset
            }`,
            text: `Take profit: #${trade?.takeProfitOrder?.groupId}`,
            onCancel: onCancelOCOOrder,
            onMove,
            color: '#009688',
            orderId: trade.groupId?.toString() || '',
          },
          id,
          true
        );
      }
    });

    return () => {
      resetOrderLine(id);
    };
  }, [activeTradeListIds]);
}

export default useOrderLines;
