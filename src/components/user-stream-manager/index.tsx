import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../hooks';
import BinanceSocketClient from '../../services/binance-websocket';
import { updateBalance } from '../../slices/account-slice';
import { selectListenKey } from '../../slices/selectors/account-selectors';
import {
  selectSymbolInfo,
  updateTradeList,
} from '../../slices/symbol-info-slice';
import {
  IBinanceExcecutionReportWS,
  IBinanceOCOWS,
  IBinanceOutboundAccountPosition,
  IBinanceTradeItem,
} from '../../types';
import lang from '../../utils/lang';
import logger from '../../utils/logger';
import createNotification from '../../utils/notification';

function UserStreamManager() {
  const dispatch = useDispatch();
  const listenKey = useSelector(selectListenKey);
  const symbolInfo = useSelector(selectSymbolInfo);

  const onExecutionReport = useCallback(
    (data: IBinanceExcecutionReportWS) => {
      const clientOrderId = !data.C || data.C === '' ? data.c : data.C;
      const status = data.X;
      const newTradeUpdate: IBinanceTradeItem = {
        clientOrderId,
        cummulativeQuoteQty: data.Z,
        executedQty: data.l,
        icebergQty: data.F,
        isWorking: true,
        orderId: data.i,
        orderListId: data.g,
        origQty: data.q,
        origQuoteOrderQty: data.Q,
        price: data.p,
        side: data.S,
        status,
        stopPrice: data.P,
        symbol: data.s,
        time: data.E,
        timeInForce: data.f,
        type: data.o,
        updateTime: data.E,
      };
      logger({ BinanceExcecutionReportWS: newTradeUpdate, data });
      if (symbolInfo?.symbol === newTradeUpdate.symbol) {
        dispatch(updateTradeList(newTradeUpdate));
      } else {
        logger(lang('SYMBOL_DOESNT_MATCH'));
      }

      const isStopLimitFilled =
        newTradeUpdate.type === 'STOP_LOSS_LIMIT' && status === 'FILLED';

      const isStopLimitPartiallyFilled =
        newTradeUpdate.type === 'STOP_LOSS_LIMIT' &&
        status === 'PARTIALLY_FILLED';

      const isTakeProfitFilled =
        newTradeUpdate.type === 'LIMIT_MAKER' && status === 'FILLED';

      const isTakeProfitPartiallyFilled =
        newTradeUpdate.type === 'LIMIT_MAKER' && status === 'PARTIALLY_FILLED';

      if (isStopLimitFilled) {
        createNotification(
          lang('STOP_LIMIT_FILLED'),
          lang('STOP_LIMIT_FILLED_TEXT', newTradeUpdate.symbol)
        );
      }
      if (isStopLimitPartiallyFilled) {
        createNotification(
          lang('STOP_LIMIT_PARTIALLY_FILLED'),
          lang('STOP_LIMIT_PARTIALLY_FILLED_TEXT', newTradeUpdate.symbol)
        );
      }
      if (isTakeProfitFilled) {
        createNotification(
          lang('TAKE_PROFIT_FILLED'),
          lang('TAKE_PROFIT_FILLED_TEXT', newTradeUpdate.symbol)
        );
      }
      if (isTakeProfitPartiallyFilled) {
        createNotification(
          lang('TAKE_PROFIT_PARTIALLY_FILLED'),
          lang('TAKE_PROFIT_PARTIALLY_FILLED_TEXT', newTradeUpdate.symbol)
        );
      }
    },
    [dispatch, symbolInfo?.symbol]
  );

  const onListStatus = useCallback((data: IBinanceOCOWS) => {
    logger({ BinanceOCOWS: data });
  }, []);

  const onOutboundAccount = useCallback(
    (data: IBinanceOutboundAccountPosition) => {
      logger({ IBinanceOutboundAccountPosition: data });
      dispatch(updateBalance(data.B));
    },
    [dispatch]
  );

  useEffect(() => {
    BinanceSocketClient.instance.setExecutionReportCallback(onExecutionReport);
    BinanceSocketClient.instance.setListStatusCallback(onListStatus);
    BinanceSocketClient.instance.setOutboundAccountCallback(onOutboundAccount);
  }, [onExecutionReport, onListStatus, onOutboundAccount]);

  useEffect(() => {
    if (!listenKey) {
      return;
    }
    BinanceSocketClient.instance.userStreamSubscribe(listenKey);
    return () => {
      BinanceSocketClient.instance.userStreamUnsubscribe(listenKey);
    };
  }, [listenKey]);

  return null;
}

export default UserStreamManager;
