/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import style from './index.scss';
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
  IChartingLibraryWidget,
  SymbolIntervalResult,
  CrossHairMovedEventParams,
  Timezone,
} from '../../../assets/charting_library/charting_library';
import squezeMomentumIndicator from '../indicators/squezee-momentum';
import supportResistance from '../indicators/support-resistance';
import Datafeed from '../datafeeds';
import { IBinanceTradeItem, ResString } from '../../types';
import config from '../../config';
import useLatestATR from '../hooks/use-latest-atr';
import useLoadStudies from '../hooks/use-load-studies';
import useStoreInterval from '../hooks/use-store-interval';
import useCreateOrderLine, {
  OrderLineCallback,
  OrderLineMoveCallback,
} from '../hooks/use-create-order-line';
import { useDispatch } from '../../hooks';
import {
  cancelOrderByGroupId,
  setStopLossTakeProfitOnChartClick,
  updateOCOByGroupId,
} from '../../slices/order-form-slice';
import {
  selectActiveTradeList,
  selectSymbolInfo,
} from '../../slices/symbol-info-slice';
import clearTrailingZero from '../../utils/clear-trailing-zero';
import useStoreChartProperties from '../hooks/use-chart-properties';
import DialogContext from '../../contexts/dialog-context';

export interface ChartContainerProps {
  symbol?: string;
  interval?: ResString;
  datafeedUrl?: string;
  libraryPath?: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl?: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion?: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId?: ChartingLibraryWidgetOptions['client_id'];
  userId?: ChartingLibraryWidgetOptions['user_id'];
  fullscreen?: ChartingLibraryWidgetOptions['fullscreen'];
  autosize?: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides?: ChartingLibraryWidgetOptions['studies_overrides'];
  containerId?: ChartingLibraryWidgetOptions['container_id'];
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>;
}

const defaultPair = config.getDefaultPair();

const TVChartContainer = ({
  symbol = defaultPair,
  containerId = 'tv_chart_container',
  libraryPath = '../assets/charting_library/',
  clientId = 'tradingview.com',
  userId = 'public_user_id',
  fullscreen = false,
  autosize = true,
  studiesOverrides = {},
  chartRef,
}: ChartContainerProps) => {
  const timePriceRef = useRef<{ time: number; price: number }>({
    time: 0,
    price: 0,
  });

  // Hooks
  const dispatch = useDispatch();
  const { watchPrice } = useLatestATR(chartRef);
  const { loadStudies } = useLoadStudies(chartRef);
  const { storedInterval } = useStoreInterval();
  const dialogContextRef = useContext(DialogContext);
  const { createOrderLine, resetOrderLine } = useCreateOrderLine(
    chartRef,
    dialogContextRef
  );
  const activeTradeList = useSelector(selectActiveTradeList);
  const symbolInfo = useSelector(selectSymbolInfo);
  const storedProperties = useStoreChartProperties();

  const defaultTimezone =
    storedProperties.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'exchange';

  const activeTradeListIds = activeTradeList
    ?.map(
      (trade) =>
        (trade.clientOrderId || '') +
        trade.stopLossOrder?.orderId +
        trade.takeProfitOrder?.orderId
    )
    ?.join();

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

  const initContainer = useCallback(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol,
      interval: storedInterval as ResolutionString,
      // datafeed: new Datafeed(),
      datafeed: new Datafeed(),
      container: containerId as ChartingLibraryWidgetOptions['container'],
      library_path: libraryPath as string,
      locale: 'en',
      disabled_features: [
        'header_saveload',
        'header_symbol_search',
        'timeframes_toolbar',
        'go_to_date',
      ],
      enabled_features: [],
      client_id: clientId,
      user_id: userId,
      fullscreen,
      autosize,
      studies_overrides: studiesOverrides,
      time_frames: [],
      timezone: defaultTimezone as Timezone,
      theme: 'Dark',
      custom_css_url: '../charting_library.css',
      custom_indicators_getter(PineJS) {
        return Promise.resolve([
          squezeMomentumIndicator(PineJS),
          supportResistance(PineJS),
        ]);
      },
    };

    const Widget = (window as any)?.TradingView?.widget;
    const tvWidget: IChartingLibraryWidget = new Widget(widgetOptions);

    tvWidget.onChartReady(async () => {
      await tvWidget.headerReady();

      loadStudies();
      watchPrice();

      tvWidget.subscribe('mouse_down', () => {
        dispatch(setStopLossTakeProfitOnChartClick(timePriceRef.current.price));
      });

      tvWidget
        ?.chart()
        .crossHairMoved(({ time, price }: CrossHairMovedEventParams) => {
          timePriceRef.current.time = time;
          timePriceRef.current.price = price;
        });
    });

    return tvWidget;
  }, []);

  useEffect(() => {
    const tvWidget = initContainer();
    chartRef.current = tvWidget;
    return () => {
      if (chartRef.current !== null) {
        chartRef.current?.remove();
      }
    };
  }, []);

  useEffect(() => {
    chartRef.current?.onChartReady(() => {
      const symbolInterval:
        | SymbolIntervalResult
        | undefined = chartRef.current?.symbolInterval();
      chartRef.current?.setSymbol(
        symbol,
        symbolInterval?.interval || (storedInterval as ResolutionString),
        () => {}
      );
    });
  }, [symbol]);

  return <div id={containerId} className={style.TVChartContainer} />;
};

export default TVChartContainer;
