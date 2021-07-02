import axios from 'axios';
import WebSocket from 'isomorphic-ws';
import config from '../config';
import PriceChangeSource from '../models/price-change-source';
import {
  BinanceKlineWebsocket,
  IBinanceExcecutionReportWS,
  IBinanceOCOWS,
  IBinanceOutboundAccountPosition,
} from '../types';
import lang from '../utils/lang';
import logger from '../utils/logger';
import randomInt from '../utils/random-number';
import BinanceSettings from './binance-setting';

enum EventType {
  TICKER = '24hrTicker',
  EXECUTION_REPORT = 'executionReport',
  LIST_STATUS = 'listStatus',
  MINI_TICKER = '24hrMiniTicker',
  KLINE = 'kline',
  OUTBOUND_ACCOUNT_POSITION = 'outboundAccountPosition',
}

class BinanceSocketClient {
  static inst?: BinanceSocketClient;

  _subscriptions: Map<string, (trade: any) => void>;

  _klineSubscriptions: Map<string, Map<string, (trade: any) => void>>;

  _ws?: WebSocket;

  _onOpenCallback?: (client: BinanceSocketClient) => void;

  _onCloseCallback?: () => void;

  _onErrorCallback?: (client: string) => void;

  static get instance(): BinanceSocketClient {
    if (BinanceSocketClient.inst) {
      return BinanceSocketClient.inst;
    }
    BinanceSocketClient.inst = new BinanceSocketClient();
    return BinanceSocketClient.inst;
  }

  constructor() {
    this._subscriptions = new Map();
    this._klineSubscriptions = new Map();
  }

  onOpen(callback: (client: BinanceSocketClient) => void) {
    this._onOpenCallback = callback;
    return this;
  }

  onClose(callback: () => void) {
    this._onCloseCallback = callback;
    return this;
  }

  onError(callback: (errorMessage: string) => void) {
    this._onErrorCallback = callback;
    return this;
  }

  disconnect() {
    logger('Disconnecting..');
    if (this._ws) {
      this._ws.close();
    }
  }

  connect() {
    const binanceSettings = BinanceSettings.instance.settings;

    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }

    this._ws = new WebSocket(binanceSettings.websocketBaseURl);

    this._ws.onmessage = (msg) => {
      try {
        const message: any = JSON.parse(msg.data as string);
        if (message.id) {
          if (this._subscriptions.has(`SUBSCRIBE#${message.id}`)) {
            const callback = this._subscriptions.get(`SUBSCRIBE#${message.id}`);
            if (callback) {
              callback(message);
            }
          }
          if (this._subscriptions.has(`UNSUBSCRIBE#${message.id}`)) {
            const callback = this._subscriptions.get(
              `UNSUBSCRIBE#${message.id}`
            );
            if (callback) {
              callback(message);
            }
          }
          // Subscription response
        } else if (message.e) {
          // Individual response
          const type: EventType = message?.e;
          const symbol: string = message?.s;
          const interval: string = message?.k?.i;
          const subscriptionName = this.getSubscriptionName(
            type,
            symbol,
            interval
          );

          if (this._klineSubscriptions.has(subscriptionName)) {
            const tradeMap = this._klineSubscriptions.get(subscriptionName);
            if (tradeMap) {
              tradeMap.forEach((callback, key) => {
                callback(message);
              });
            }
          }

          if (
            type === EventType.TICKER &&
            this._subscriptions.has(EventType.TICKER)
          ) {
            const callback = this._subscriptions.get(EventType.TICKER);
            if (callback) {
              callback(message);
            }
          }

          if (
            type === EventType.KLINE &&
            this._subscriptions.has(EventType.KLINE)
          ) {
            const callback = this._subscriptions.get(EventType.KLINE);
            if (callback) {
              callback(message);
            }
          }

          if (
            type === EventType.EXECUTION_REPORT &&
            this._subscriptions.has(EventType.EXECUTION_REPORT)
          ) {
            const callback = this._subscriptions.get(
              EventType.EXECUTION_REPORT
            );
            if (callback) {
              callback(message);
            }
          }

          if (
            type === EventType.LIST_STATUS &&
            this._subscriptions.has(EventType.LIST_STATUS)
          ) {
            const callback = this._subscriptions.get(EventType.LIST_STATUS);
            if (callback) {
              callback(message);
            }
          }

          if (
            type === EventType.OUTBOUND_ACCOUNT_POSITION &&
            this._subscriptions.has(EventType.OUTBOUND_ACCOUNT_POSITION)
          ) {
            const callback = this._subscriptions.get(
              EventType.OUTBOUND_ACCOUNT_POSITION
            );
            if (callback) {
              callback(message);
            }
          }
        } else if (Array.isArray(message) && message.length && message[0].s) {
          // Group response
        } else {
          logger(`Unprocessed method: ${JSON.stringify(message)}`);
        }
      } catch (error) {
        logger(`Parse message failed: ${error.message}`);
      }
    };

    this._ws.onopen = () => {
      logger('ws connected');
      if (this._onOpenCallback && this._ws) {
        this?._onOpenCallback(this);
      }
    };

    this._ws.onclose = (...args) => {
      logger('ws closed', args);
      if (this._onCloseCallback) {
        this._onCloseCallback();
      }
    };

    this._ws.onerror = async (event) => {
      try {
        logger(`ws error:`);
        // Test connectivity
        const result = await axios(`${binanceSettings.RESTApiBaseUrl}/ping`);
        logger({ testConnectivityResult: result });
      } catch (error) {
        logger('ERROR', JSON.stringify(error));
        if (this._onErrorCallback) {
          this._onErrorCallback(error);
        }
      }
    };
  }

  async connectAsync(onClose: () => void = () => {}) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve;
    }

    return new Promise((resolve, reject) => {
      this.onOpen(resolve).onClose(onClose).onError(reject).connect();
    });
  }

  async subscribe(param: string | string[], callback?: any) {
    if (this._ws?.readyState !== WebSocket.OPEN) {
      return;
    }
    const id = new Date().getTime() + randomInt(0, 1000);
    const paramNormalized = Array.isArray(param) ? param : [param];
    this._ws?.send(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: paramNormalized,
        id,
      })
    );
    this._subscriptions.set(`SUBSCRIBE#${id}`, callback);
  }

  unsubscribe(param: string | string[], callback?: any) {
    if (this._ws?.readyState !== WebSocket.OPEN) {
      return;
    }
    const id = new Date().getTime() + randomInt(0, 1000);
    const paramNormalized = Array.isArray(param) ? param : [param];
    this._ws?.send(
      JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: paramNormalized,
        id,
      })
    );
    this._subscriptions.set(`UNSUBSCRIBE#${id}`, callback);
  }

  getSubscriptionName(type: string, symbol: string, interval?: string): string {
    if (interval) {
      return `${type}#${symbol}#${interval}`;
    }
    return `${type}#${symbol}`;
  }

  klineSubscribe(
    id: string,
    symbol: string,
    interval: string,
    callback: (trade: BinanceKlineWebsocket) => void
  ) {
    const symbolLowercase: string = symbol.toLowerCase();
    const symbolUppercase: string = symbol.toUpperCase();
    const subscriptionName = this.getSubscriptionName(
      'kline',
      symbolUppercase,
      interval
    );

    logger(`Start subscription for ${subscriptionName}`);

    this.subscribe(`${symbolLowercase}@kline_${interval}`, () => {
      if (!this._klineSubscriptions.has(subscriptionName)) {
        this._klineSubscriptions.set(subscriptionName, new Map());
      }
      const klineMap = this._klineSubscriptions.get(subscriptionName);
      klineMap?.set(id, callback);
    });
  }

  klineUnsubscribe(
    id: string,
    symbol: string,
    interval: string,
    callback?: any
  ) {
    const priceChangeSourceKline = PriceChangeSource.instance.priceChange;
    const symbolLowercase: string = symbol.toLowerCase();
    const symbolUppercase: string = symbol.toUpperCase();
    const subscriptionName = this.getSubscriptionName(
      'kline',
      symbolUppercase,
      interval
    );

    logger(`Start unsubscription for ${subscriptionName}`);

    const unsubCallback = () => {
      const klineMap = this._klineSubscriptions.get(subscriptionName);
      if (klineMap && klineMap.has(id)) {
        klineMap?.delete(id);
      }

      if (callback) {
        callback();
      }
    };

    if (interval === priceChangeSourceKline) {
      unsubCallback();
    } else {
      this.unsubscribe(`${symbolLowercase}@kline_${interval}`, unsubCallback);
    }
  }

  setExecutionReportCallback(
    callback: (data: IBinanceExcecutionReportWS) => void
  ) {
    this._subscriptions.set(EventType.EXECUTION_REPORT, callback);
  }

  setKlineCallback(callback: (data: BinanceKlineWebsocket) => void) {
    this._subscriptions.set(EventType.KLINE, callback);
  }

  setListStatusCallback(callback: (data: IBinanceOCOWS) => void) {
    this._subscriptions.set(EventType.LIST_STATUS, callback);
  }

  setOutboundAccountCallback(
    callback: (data: IBinanceOutboundAccountPosition) => void
  ) {
    this._subscriptions.set(EventType.OUTBOUND_ACCOUNT_POSITION, callback);
  }

  userStreamSubscribe(listenKey: string) {
    this.subscribe(listenKey, () => {
      logger('User stream subscription succeed', listenKey);
    });
  }

  userStreamUnsubscribe(listenKey: string) {
    this.unsubscribe(listenKey, () => {
      logger('User stream unsubscription succeed', listenKey);
    });
  }
}

export default BinanceSocketClient;
