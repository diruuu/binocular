import { useEffect, useRef } from 'react';
import {
  IChartingLibraryWidget,
  IOrderLineAdapter,
} from '../../../assets/charting_library/charting_library';
import { DialogRef } from '../../components/modal';
import getChartLatestPrice from '../../utils/get-chart-latest-price';
import logger from '../../utils/logger';
import until from '../../utils/until';

interface IOrderLine {
  price: number;
  quantity: string;
  orderId: string;
  text: string;
  onMove?: (result: OrderLineMoveCallback) => void;
  onCancel?: (result: OrderLineCallback) => void;
  color: string;
  textColor?: string;
}

export interface OrderLineCallback {
  price: number;
  orderId: string;
}

export interface OrderLineMoveCallback {
  stopLossPrice: number;
  takeProfitPrice: number;
  orderId: string;
}

function useCreateOrderLine(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>,
  dialogContextRef?: React.MutableRefObject<DialogRef | undefined>
) {
  const orderLineRef = useRef<{ [key: number]: IOrderLineAdapter[] }>({});
  const countRef = useRef<number>(0);

  useEffect(() => {
    (window as any).ORDER_LINES = orderLineRef;
  }, []);

  const createLine = (onLineCreate: (orderLine: IOrderLineAdapter) => void) => {
    try {
      const activeChart = chartRef.current?.activeChart();
      const orderLine = activeChart?.createOrderLine({});
      if (orderLine) {
        onLineCreate(orderLine);
        countRef.current = 0;
      }
    } catch (error) {
      if (countRef.current > 10) {
        logger('RECREATE_MAX_LIMIT_REACHED');
        return;
      }
      countRef.current += 1;
      setTimeout(() => {
        logger('RECREATE_ORDER_LINE', error.message);
        createLine(onLineCreate);
      }, 2000);
    }
  };

  function createOrderLine(
    options: IOrderLine,
    id: number,
    isOCOOrder = false
  ) {
    createLine((orderLine) => {
      orderLine
        .setPrice(options.price)
        .setQuantity(options.quantity)
        .setText(options.text)
        .setQuantityBackgroundColor(options.color)
        .setQuantityBorderColor(options.color)
        .setQuantityTextColor(options.textColor || '#fff')
        .setBodyBorderColor(options.color)
        .setBodyTextColor(options.textColor || '#fff')
        .setCancelButtonBorderColor(options.color)
        .setCancelButtonIconColor(options.textColor || '#fff')
        .setModifyTooltip(options.orderId)
        .setCancelButtonBackgroundColor(options.color)
        .setBodyBackgroundColor(options.color)
        .setTooltip(options.price.toString());

      if (options.onMove) {
        orderLine?.onMove(async () => {
          if (!orderLine) {
            return;
          }
          const originalOrderId = orderLine.getModifyTooltip();
          const originalPrice = orderLine.getTooltip();

          function getOrderByName(name: string) {
            return orderLineRef?.current[id].find((orderLineItem) => {
              const orderId = orderLineItem.getModifyTooltip();
              const orderText = orderLineItem.getText();
              return orderId === originalOrderId && orderText.startsWith(name);
            });
          }

          const buyOrder = getOrderByName('Buy');
          const stopLoss = getOrderByName('Stop loss');
          const takeProfit = getOrderByName('Take profit');

          const buyOrderPrice = buyOrder?.getPrice() || 0;
          const stopLossPrice = stopLoss?.getPrice() || 0;
          const takeProfitPrice = takeProfit?.getPrice() || 0;

          let latestPrice: number = buyOrderPrice;

          const activeChart = chartRef.current?.activeChart();
          if (activeChart) {
            latestPrice = await getChartLatestPrice(activeChart);
          }

          function resetPrice() {
            orderLine.setPrice(parseFloat(originalPrice));
          }

          function updateOriginalPrice() {
            const price = orderLine.getPrice();
            orderLine.setTooltip(price.toString());
          }

          function setUnsaved() {
            const text = orderLine.getText();
            if (text?.includes('(*)')) {
              return;
            }
            orderLine.setText(`${text} (*)`);
          }

          function setSaved(orderLineObject: IOrderLineAdapter) {
            if (!orderLineObject) {
              return;
            }
            const text = orderLineObject.getText();
            const result = text.replace(' (*)', '');
            orderLineObject.setText(result);
          }

          function setSavedAll() {
            if (stopLoss) {
              setSaved(stopLoss);
            }
            if (takeProfit) {
              setSaved(takeProfit);
            }
          }

          // Validation
          if (takeProfitPrice <= buyOrderPrice) {
            return resetPrice();
          }
          if (stopLossPrice >= latestPrice) {
            return resetPrice();
          }
          updateOriginalPrice();

          dialogContextRef?.current?.openModal({
            title: 'Order Changes Confirmation',
            confirmLabel: 'Make changes',
            children:
              'Are you sure want to modify this order? Pressing yes will change both stop loss order and take profit order. Choose no if you still want to modify the other order.',
            onConfirm: (onClose) => {
              if (options.onMove && stopLossPrice && takeProfitPrice) {
                options.onMove({
                  stopLossPrice,
                  takeProfitPrice,
                  orderId: originalOrderId,
                });
                setSavedAll();
              }
              onClose();
            },
            onCancel: () => {
              setUnsaved();
            },
          });
        });
      }
      if (options.onCancel) {
        orderLine?.onCancel(() => {
          if (!orderLine) {
            return;
          }
          const modifyTooltip = orderLine.getModifyTooltip();
          const price = orderLine.getPrice();
          const title = isOCOOrder
            ? 'Cancel OCO Order Confirmation'
            : 'Cancel All Order Confirmation';
          const body = isOCOOrder
            ? 'Are you sure want to cancel this order? It will cancel both stop loss limit and take profit order.'
            : 'Are you sure want to cancel all orders? It will sell the amount of assets you bought on the market price.';
          dialogContextRef?.current?.openModal({
            title,
            children: body,
            confirmLabel: 'Cancel Order',
            onConfirm: (onClose) => {
              if (options.onCancel) {
                options.onCancel({
                  price,
                  orderId: modifyTooltip,
                });
              }
              onClose();
            },
          });
        });
      }
      if (orderLine) {
        if (!orderLineRef.current[id]) {
          orderLineRef.current[id] = [];
        }
        orderLineRef.current[id] = [...orderLineRef.current[id], orderLine];
      }
      return orderLine;
    });
  }

  const resetOrderLine = async (id: number) => {
    await until('RESET_ORDER_LINE', () => !!orderLineRef.current[id]?.length);
    orderLineRef.current[id]?.forEach((orderLine: IOrderLineAdapter) => {
      orderLine.remove();
    });
    orderLineRef.current[id] = [];
  };

  return { createOrderLine, resetOrderLine };
}

export default useCreateOrderLine;
