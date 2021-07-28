import { useEffect } from 'react';
import {
  IChartingLibraryWidget,
  ResolutionString,
  SymbolIntervalResult,
} from '../../../assets/charting_library/charting_library';
import useStoreInterval from './use-store-interval';

function useOnSymbolChange(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>,
  symbol: string
) {
  const { storedInterval } = useStoreInterval();
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
  }, [chartRef, storedInterval, symbol]);
}

export default useOnSymbolChange;
