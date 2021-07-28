import moment from 'moment';
import { store } from '../../store';
import {
  IBasicDataFeed,
  ResolutionString,
  ServerTimeCallback,
  SearchSymbolsCallback,
  ResolveCallback,
  ErrorCallback,
  LibrarySymbolInfo,
  SubscribeBarsCallback,
  HistoryCallback,
  OnReadyCallback,
  DatafeedConfiguration,
  Bar,
  HistoryMetadata,
  PeriodParams,
} from '../../../assets/charting_library';
import BinanceSocketClient from '../../services/binance-websocket';
import {
  BinanceKlineWebsocket,
  BinancePriceResponse,
  BinanceServerTimeResponse,
  IBinanceKlines,
} from '../../types';
import clearTrailingZero from '../../utils/clear-trailing-zero';
import {
  selectSymbolInfo,
  selectTickSize,
} from '../../slices/symbol-info-slice';
import until from '../../utils/until';
import BinanceSettings from '../../services/binance-setting';
import lang from '../../utils/lang';
import countDecimals from '../../utils/count-decimal';

const toResStr = (string: string): ResolutionString => {
  return string as ResolutionString;
};

interface GetHistoryUrlOptions {
  symbolName: string;
  resolutionString: ResolutionString;
  rangeStartDate: number;
  rangeEndDate: number;
  limit: number;
  isFirstTime: boolean;
}

class Datafeed implements IBasicDataFeed {
  supportedResolutions = [
    toResStr('1'),
    toResStr('3'),
    toResStr('5'),
    toResStr('15'),
    toResStr('30'),
    toResStr('60'),
    toResStr('120'),
    toResStr('240'),
    toResStr('360'),
    toResStr('480'),
    toResStr('720'),
    toResStr('D'),
    toResStr('3D'),
    toResStr('1W'),
    toResStr('1M'),
  ];

  activeSockets: { [key: string]: { symbol: string; interval: string } } = {};

  public async onReady(callback: OnReadyCallback): Promise<void> {
    const configuration: DatafeedConfiguration = {
      exchanges: [
        {
          value: 'binance',
          name: 'Binance',
          desc: 'Binance',
        },
      ],
      supported_resolutions: this.supportedResolutions,
      supports_marks: false,
      supports_time: true,
      supports_timescale_marks: false,
      symbols_types: [
        {
          name: 'crypto',
          value: 'crypto',
        },
      ],
    };
    callback(configuration);
  }

  public async getServerTime(callback: ServerTimeCallback): Promise<void> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const response = await fetch(`${binanceSettings.RESTApiBaseUrl}/time`);
    const result: BinanceServerTimeResponse = await response.json();
    callback(result.serverTime);
  }

  public async getSymbolPrice(symbol: string): Promise<string> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const response = await fetch(
      `${binanceSettings.RESTApiBaseUrl}/ticker/price?symbol=${symbol}`
    );
    const result: BinancePriceResponse = await response.json();
    return result?.price;
  }

  public async searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): Promise<void> {
    // const result = await Api.get(
    //   apis.searchSymbol(exchange, userInput, symbolType)
    // );
    onResult([]);
  }

  getPriceScale(value: string): number {
    const price = clearTrailingZero(value);
    const decimalLength = countDecimals(price);
    const zeros = Array(decimalLength).fill(0).join('');
    const string = `1${zeros}`;
    return parseInt(string, 10);
  }

  public async resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ): Promise<void> {
    try {
      const isDataLoaded = (): boolean => {
        const state = store.getState();
        const symbolInfo = selectSymbolInfo(state);
        return symbolInfo?.symbol === symbolName;
      };
      await until('RESOLVE_SYMBOL', () => isDataLoaded());
      const state = store.getState();
      const tickSize = selectTickSize(state);
      const priceScale = this.getPriceScale(tickSize.toString());
      const symbolInfo: LibrarySymbolInfo = {
        name: symbolName,
        full_name: symbolName,
        ticker: symbolName,
        description: symbolName,
        type: 'crypto',
        session: '24x7',
        exchange: 'binance',
        listed_exchange: 'binance',
        timezone: 'Asia/Bangkok',
        format: 'price',
        pricescale: priceScale,
        minmov: 1,
        minmove2: 0,
        has_intraday: true,
        supported_resolutions: this.supportedResolutions,
        volume_precision: 0,
        data_status: 'streaming',
      };
      onResolve(symbolInfo);
    } catch (error) {
      onError(error.message);
    }
  }

  toUnix(time: number) {
    if (time && time.toString().length === 10) {
      return time * 1000;
    }
    return time;
  }

  getHistoryUrl({
    symbolName,
    resolutionString,
    rangeEndDate,
    limit,
    isFirstTime,
  }: GetHistoryUrlOptions): string {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const interval = this.intervalResolver(resolutionString);
    const endDate = isFirstTime ? moment().valueOf() : rangeEndDate;
    return `${
      binanceSettings.RESTApiBaseUrl
    }/klines?symbol=${symbolName}&interval=${interval}&endTime=${this.toUnix(
      endDate
    )}&limit=${limit}`;
  }

  intervalResolver(resolutionString: string): string {
    switch (resolutionString) {
      case '1':
        return '1m';
      case '3':
        return '3m';
      case '5':
        return '5m';
      case '15':
        return '15m';
      case '30':
        return '30m';
      case '60':
        return '1h';
      case '120':
        return '2h';
      case '240':
        return '4h';
      case '360':
        return '6h';
      case '480':
        return '8h';
      case '720':
        return '12h';
      case '1D':
        return '1d';
      case '3D':
        return '3d';
      case '1W':
        return '1w';
      case '1M':
        return '1M';
      default:
        return resolutionString;
    }
  }

  public async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): Promise<void> {
    try {
      // Fix start and end time
      const startTime =
        periodParams.from?.toString()?.length === 10
          ? periodParams.from * 1000
          : periodParams.from;
      const endTime =
        periodParams.to?.toString()?.length === 10
          ? periodParams.to * 1000
          : periodParams.to;

      const url = this.getHistoryUrl({
        symbolName: symbolInfo.name,
        resolutionString: resolution,
        rangeStartDate: startTime,
        rangeEndDate: endTime,
        limit: periodParams.countBack,
        isFirstTime: periodParams.firstDataRequest,
      });
      const response = await fetch(url);
      const result: IBinanceKlines = await response.json();
      const historyMeta: HistoryMetadata = {
        noData: !result.length,
      };
      const historyBars: Bar[] = result.map((_d) => {
        const bar: Bar = {
          time: _d[0],
          open: parseFloat(_d[1]),
          high: parseFloat(_d[2]),
          low: parseFloat(_d[3]),
          close: parseFloat(_d[4]),
          volume: parseFloat(_d[5]),
        };
        return bar;
      });
      onResult(historyBars || [], historyMeta);
    } catch (error) {
      onError(error.message);
    }
  }

  public subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    listenerGuid: string
  ): void {
    const interval = this.intervalResolver(resolution);
    BinanceSocketClient.instance.klineSubscribe(
      listenerGuid,
      symbolInfo.name,
      interval,
      (kline: BinanceKlineWebsocket) => {
        onRealtimeCallback({
          time: kline.k.t,
          open: parseFloat(kline.k.o),
          high: parseFloat(kline.k.h),
          low: parseFloat(kline.k.l),
          close: parseFloat(kline.k.c),
          volume: parseFloat(kline.k.v),
        });
      }
    );
    this.activeSockets[listenerGuid] = {
      symbol: symbolInfo.name,
      interval,
    };
  }

  public unsubscribeBars(listenerGuid: string): void {
    const info = this.activeSockets[listenerGuid];
    if (BinanceSocketClient.instance._ws) {
      BinanceSocketClient.instance.klineUnsubscribe(
        listenerGuid,
        info.symbol,
        info.interval,
        () => {}
      );
    }
  }
}

export default Datafeed;
