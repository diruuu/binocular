import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';

function useOnDataReady(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  function initOnDataReady(callback: () => void) {
    function onChange() {
      chartRef.current?.chart().onDataLoaded().subscribe(null, callback, true);
    }
    onChange();
    const onSymbolChanged = chartRef.current?.chart().onSymbolChanged();
    const onIntervalChanged = chartRef.current?.chart().onIntervalChanged();
    onSymbolChanged?.subscribe(null, onChange);
    onIntervalChanged?.subscribe(null, onChange);
  }

  return initOnDataReady;
}

export default useOnDataReady;
