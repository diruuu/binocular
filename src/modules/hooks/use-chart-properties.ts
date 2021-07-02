import { Timezone } from '../../../assets/charting_library/charting_library';
import useLocalStorage from '../../hooks/use-local-storage';

interface IStoredChartProperties {
  timezone: Timezone;
}

function useStoreChartProperties() {
  const [storedProperties] = useLocalStorage<
    IStoredChartProperties | Record<string, unknown>
  >('tradingview.chartproperties', {});

  return storedProperties;
}

export default useStoreChartProperties;
