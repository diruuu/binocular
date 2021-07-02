import { useEffect } from 'react';
import config from '../../../config';
import { useDispatch, useSelector } from '../../../hooks';
import { selectCredential } from '../../../slices/settings-slice';
import { getTradeInfo } from '../../../slices/symbol-info-slice';

function useFetchTrades(symbol: string) {
  const dispatch = useDispatch();
  const credentials = useSelector(selectCredential);
  const hasCredential = Boolean(credentials);
  useEffect(() => {
    const defaultPair = config.getDefaultPair();
    const pair = symbol || defaultPair;
    dispatch(getTradeInfo(pair));
  }, [symbol, hasCredential, dispatch]);
}

export default useFetchTrades;
