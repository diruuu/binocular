function useStoreInterval() {
  const storedInterval =
    localStorage.getItem('tradingview.chart.lastUsedTimeBasedResolution') ||
    '15';

  return { storedInterval };
}

export default useStoreInterval;
