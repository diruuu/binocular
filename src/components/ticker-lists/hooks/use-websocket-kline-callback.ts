import { useEffect } from 'react';
import PriceStorage from '../../../models/price-storage';
import BinanceSocketClient from '../../../services/binance-websocket';
import { BinanceKlineWebsocket, BinancePrice } from '../../../types';
import clearTrailingZero from '../../../utils/clear-trailing-zero';
import logger from '../../../utils/logger';

function useWebsocketKlineCallback(
  symbolList: BinancePrice[],
  changeSource: unknown
) {
  useEffect(() => {
    const callback = (kline: BinanceKlineWebsocket) => {
      if (kline.k.i === changeSource) {
        const changeLength = parseFloat(kline.k.c) - parseFloat(kline.k.o);
        const change = (changeLength / parseFloat(kline.k.o)) * 100;
        PriceStorage.instance.setChange(
          kline.k.s,
          kline.k.c,
          clearTrailingZero(change.toFixed(3))
        );
      }
    };
    BinanceSocketClient.instance.setKlineCallback(callback);
    return () => {
      PriceStorage.instance.reset();
    };
  }, [changeSource]);

  useEffect(() => {
    if (!symbolList?.length) {
      return;
    }
    const subscriptionList = symbolList?.map((list) => {
      const symbolLowercase: string = list.symbol.toLowerCase();
      return `${symbolLowercase}@kline_${changeSource}`;
    });

    // Limit only max 500 symbols due to Binance rate limit for websocket
    const subscriptionListLimited = subscriptionList.filter(
      (_list, index) => index < 500
    );

    BinanceSocketClient.instance.subscribe(subscriptionListLimited, () => {
      logger(
        `Subscribe to ${changeSource} kline for ${subscriptionListLimited.length} symbols`
      );
    });
    return () => {
      BinanceSocketClient.instance.unsubscribe(subscriptionListLimited, () => {
        logger(
          `Unsubscribe to ${changeSource} kline for ${subscriptionListLimited.length} symbols`
        );
      });
    };
  }, [symbolList, changeSource]);
}

export default useWebsocketKlineCallback;
