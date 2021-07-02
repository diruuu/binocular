import { useEffect } from 'react';
import config from '../../../config';
import { useDispatch } from '../../../hooks';
import { fetchSymbolInfo } from '../../../slices/symbol-info-slice';

function useFetchSymbol(symbol: string) {
  const dispatch = useDispatch();
  useEffect(() => {
    const defaultPair = config.getDefaultPair();
    const pair = !symbol ? defaultPair : symbol;
    dispatch(fetchSymbolInfo(pair));
  }, [symbol, dispatch]);
}

export default useFetchSymbol;
