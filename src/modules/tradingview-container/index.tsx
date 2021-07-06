import React, { useCallback, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import style from './index.scss';
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
  IChartingLibraryWidget,
  Timezone,
} from '../../../assets/charting_library/charting_library';
import supportResistance from '../indicators/support-resistance';
import Datafeed from '../datafeeds';
import { ResString } from '../../types';
import config from '../../config';
import useLatestATR from '../hooks/use-latest-atr';
import useSetStudyHeight from '../hooks/use-set-study-height';
import useStoreInterval from '../hooks/use-store-interval';
import useStoreChartProperties from '../hooks/use-chart-properties';
import useManualLimit from '../hooks/use-manual-limit';
import useOrderLines from '../hooks/use-order-lines';
import logger from '../../utils/logger';
import lang from '../../utils/lang';
import useLoadInitialIndicators from '../hooks/use-load-initial-indicators';
import useOnSymbolChange from '../hooks/use-on-symbol-change';
import useOnDataReady from '../hooks/use-on-data-ready';

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
  // Hooks
  const { watchPrice, updateTickData } = useLatestATR(chartRef);
  const { setStudyHeight } = useSetStudyHeight(chartRef);
  const { storedInterval } = useStoreInterval();
  const storedProperties = useStoreChartProperties();
  const initManualLimit = useManualLimit(chartRef);
  const loadInitialIndicators = useLoadInitialIndicators(chartRef);
  const initOnDataReady = useOnDataReady(chartRef);

  const defaultTimezone =
    storedProperties.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'exchange';

  useOrderLines(chartRef);

  const initContainer = useCallback((chartData: Record<string, unknown>) => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol,
      interval: storedInterval as ResolutionString,
      datafeed: new Datafeed(),
      container: containerId as ChartingLibraryWidgetOptions['container'],
      library_path: libraryPath as string,
      locale: 'en',
      disabled_features: [
        'header_symbol_search',
        'timeframes_toolbar',
        'go_to_date',
        'use_localstorage_for_settings',
        'save_chart_properties_to_local_storage',
        'study_dialog_search_control',
        'header_saveload',
        'symbol_search_hot_key',
      ],
      enabled_features: [],
      saved_data: chartData,
      client_id: clientId,
      user_id: userId,
      fullscreen,
      autosize,
      studies_overrides: studiesOverrides,
      auto_save_delay: 2,
      time_frames: [],
      load_last_chart: true,
      timezone: defaultTimezone as Timezone,
      theme: 'Dark',
      custom_css_url: '../charting_library.css',
      custom_indicators_getter(PineJS) {
        return Promise.resolve([supportResistance(PineJS)]);
      },
    };

    const Widget = (window as any)?.TradingView?.widget;
    const tvWidget: IChartingLibraryWidget = new Widget(widgetOptions);

    tvWidget.onChartReady(async () => {
      initOnDataReady(async () => {
        updateTickData();
      });

      await tvWidget.headerReady();

      // Load default indicators if chart data is not stored yet
      if (!chartData) {
        await loadInitialIndicators();
      }

      setStudyHeight();
      watchPrice();
      initManualLimit();

      tvWidget.subscribe('onAutoSaveNeeded', () => {
        logger(lang('SAVING_CHART_DATA'));
        tvWidget.save((data) => {
          ipcRenderer.send('save_chart', data);
        });
      });
    });

    return tvWidget;
  }, []);

  const initChartingLibrary = useCallback(async () => {
    const chartData = await ipcRenderer.invoke('get_chart');
    const tvWidget = initContainer(chartData);
    chartRef.current = tvWidget;
    return () => {
      if (chartRef.current !== null) {
        chartRef.current?.remove();
      }
    };
  }, []);

  useEffect(() => {
    initChartingLibrary();
  }, []);

  useOnSymbolChange(chartRef, symbol);

  return <div id={containerId} className={style.TVChartContainer} />;
};

export default TVChartContainer;
