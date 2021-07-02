import useLocalStorage from '../../hooks/use-local-storage';

function useStoreInterval() {
  const [storedInterval] = useLocalStorage<string>(
    'tradingview.chart.lastUsedTimeBasedResolution',
    '15'
  );

  return { storedInterval };
}

export default useStoreInterval;
