import axios from 'axios';
import moment from 'moment';
import config from '../config';
import RequestTypes from '../enum/request-types';
import {
  APICredentialInfo,
  BinancePriceResponse,
  IBinanceAccount,
  IBinanceExhangeInfo,
  IBinanceNewOrderResponseRest,
  IBinanceOCOCancelResponse,
  IBinanceSymbolInfo,
  IBinanceTradeItem,
  IBinanceTx,
  IOrderData,
  IOrderDataToSend,
} from '../types';
import lang from '../utils/lang';
import request from '../utils/request';
import BinanceSettings from './binance-setting';

class BinanceRest {
  static inst?: BinanceRest;

  static get instance(): BinanceRest {
    if (BinanceRest.inst) {
      return BinanceRest.inst;
    }
    BinanceRest.inst = new BinanceRest();
    return BinanceRest.inst;
  }

  async getListenKey(credential: APICredentialInfo): Promise<any> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    if (!credential) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }

    const result = await request(
      RequestTypes.POST,
      `${binanceSettings.RESTApiBaseUrl}/userDataStream`,
      {},
      {
        apiCredentials: credential,
      }
    );
    return result;
  }

  getLatestTimestampFromPriceLog(priceLogData: {
    [key: string]: string;
  }): number {
    const latestTimestamp: number = Object.keys(priceLogData || {}).reduce(
      (acc: number, objKey: string): number => {
        const keyNum = parseInt(objKey, 10);
        if (keyNum > acc) {
          return keyNum;
        }
        return acc;
      },
      0
    );
    return latestTimestamp;
  }

  async getAccountInfo(
    credential: APICredentialInfo
  ): Promise<IBinanceAccount> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    if (!credential) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const result: IBinanceAccount = await request(
      RequestTypes.GET,
      `${binanceSettings.RESTApiBaseUrl}/account`,
      {
        recvWindow: 60000,
      },
      {
        apiCredentials: credential,
        includePremadeDataInBody: true,
      }
    );
    return result;
  }

  async getBalanceByName(
    credentials: APICredentialInfo,
    baseAsset?: string
  ): Promise<number> {
    const accountInfo = await BinanceRest.instance.getAccountInfo(credentials);
    const balance = accountInfo.balances?.find((bal) => bal.asset === baseAsset)
      ?.free;
    const balanceNum: number = balance ? parseFloat(balance) : 0;
    return balanceNum;
  }

  async getTradeInfo(
    symbol: string,
    credential: APICredentialInfo
  ): Promise<IBinanceTradeItem[]> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    if (!credential) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const result: IBinanceTradeItem[] = await request(
      RequestTypes.GET,
      `${binanceSettings.RESTApiBaseUrl}/allOrders`,
      {
        symbol,
        recvWindow: 60000,
      },
      {
        apiCredentials: credential,
        includePremadeDataInBody: true,
      }
    );
    return result;
  }

  async getTickerPrice(symbol: string): Promise<IBinanceExhangeInfo> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const result: IBinanceExhangeInfo = await request(
      RequestTypes.GET,
      `${binanceSettings.RESTApiBaseUrl}/ticker/24hr`,
      {
        symbol,
      }
    );
    return result;
  }

  async getTickerPriceAll(): Promise<BinancePriceResponse[]> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const result: BinancePriceResponse[] = await request(
      RequestTypes.GET,
      `${binanceSettings.RESTApiBaseUrl}/ticker/price`
    );
    return result;
  }

  async getSymbolInfo(symbol: string): Promise<IBinanceSymbolInfo> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const result: IBinanceExhangeInfo = await request(
      RequestTypes.GET,
      `${binanceSettings.RESTApiBaseUrl}/exchangeInfo`,
      {
        symbol,
      }
    );
    if (result.symbols && result.symbols.length > 0) {
      return result.symbols[0];
    }
    throw new Error(lang('SYMBOL_NOT_FOUND'));
  }

  async cancelOCO(
    orderListId: number,
    symbol: string,
    credential: APICredentialInfo
  ): Promise<IBinanceOCOCancelResponse> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const result: IBinanceOCOCancelResponse = await request(
      RequestTypes.DELETE,
      `${binanceSettings.RESTApiBaseUrl}/orderList`,
      {
        symbol,
        orderListId,
        newClientOrderId: `cancel-${new Date().getTime()}`,
      },
      {
        apiCredentials: credential,
        includePremadeDataInBody: true,
      }
    );
    return result;
  }

  async validateAPIKey(credential: APICredentialInfo): Promise<true> {
    try {
      const binanceSettings = BinanceSettings.instance.settings;
      if (!binanceSettings) {
        throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
      }
      const result: Record<string, never> = await request(
        RequestTypes.POST,
        `${binanceSettings.RESTApiBaseUrl}/order/test`,
        {
          symbol: 'ETHUSDT',
          side: 'BUY',
          type: 'MARKET',
          quoteOrderQty: 20,
        },
        {
          apiCredentials: credential,
          includePremadeDataInBody: true,
        }
      );
      if (
        !(
          result &&
          Object.keys(result).length === 0 &&
          result.constructor === Object
        )
      ) {
        throw new Error(lang('INVALID_API_KEY_AND_SECRET'));
      }
      return true;
    } catch (error) {
      throw new Error(lang('INVALID_API_KEY_AND_SECRET'));
    }
  }

  async sendOrder(
    orderData: IOrderData,
    credential: APICredentialInfo
  ): Promise<IBinanceNewOrderResponseRest> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const orderDataToSend: IOrderDataToSend = {
      symbol: orderData.symbol,
      side: orderData.side || 'BUY',
      type: 'MARKET',
      newClientOrderId: orderData.orderId || `market-${new Date().getTime()}`,
      newOrderRespType: 'RESULT',
    };

    if (orderData.quoteOrderQty) {
      orderDataToSend.quoteOrderQty = orderData.quoteOrderQty;
    }

    if (orderData.quantity) {
      orderDataToSend.quantity = orderData.quantity;
    }
    const result: IBinanceNewOrderResponseRest = await request(
      RequestTypes.POST,
      `${binanceSettings.RESTApiBaseUrl}/order`,
      orderDataToSend,
      {
        apiCredentials: credential,
        includePremadeDataInBody: true,
      }
    );
    return result;
  }

  async sendOcoOrder(
    orderData: IOrderData,
    credential: APICredentialInfo
  ): Promise<any> {
    const binanceSettings = BinanceSettings.instance.settings;
    if (!binanceSettings) {
      throw new Error(lang('BINANCE_SETTING_NOT_SET_YET'));
    }
    const result = await request(
      RequestTypes.POST,
      `${binanceSettings.RESTApiBaseUrl}/order/oco `,
      {
        symbol: orderData.symbol,
        side: orderData.side,
        quantity: orderData.quoteOrderQty,
        listClientOrderId: `oco-${orderData.orderId}`,
        limitClientOrderId: `limit-${orderData.orderId}`,
        stopClientOrderId: `stop-${orderData.orderId}`,
        price: orderData.takeProfit,
        stopPrice: orderData.stopLossLimit, // Price to trigger stop limit
        stopLimitPrice: orderData.stopLoss, // Actual price to sell
        stopLimitTimeInForce: 'GTC',
        newOrderRespType: 'RESULT',
      },
      {
        apiCredentials: credential,
        includePremadeDataInBody: true,
      }
    );

    return result;
  }
}

export default BinanceRest;
