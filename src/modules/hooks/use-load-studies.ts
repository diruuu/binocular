/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import useLocalStorage from '../../hooks/use-local-storage';
import nextTick from '../../utils/next-tick';

function useLoadStudies(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const [storedChartData, saveChartData] = useLocalStorage<Record<
    string,
    unknown
  > | null>('chart_data', null);

  const loadChartDataAsync = (): Promise<Record<string, unknown>> => {
    return new Promise((resolve) => {
      const tvWidget = chartRef.current;
      const options = { saveSymbol: true, saveInterval: true };
      const template = tvWidget
        ?.activeChart()
        .createStudyTemplate(options) as Record<string, unknown>;
      resolve(template);
    });
  };

  const setInitialPaneHeight = (initialLoad: boolean) => {
    const tvWidget = chartRef.current;
    const panes = tvWidget?.activeChart().getPanes();
    const initialHeight = initialLoad ? 30 : 50;
    const panesHeight: number[] =
      panes?.map((_pane: any, index: number): number => {
        return _pane.getHeight();
      }) || [];
    const targetHeight =
      panesHeight.length > 2 && !initialLoad ? panesHeight[1] : initialHeight;
    const panesHeightResult: number[] =
      panes?.map((_pane: any, index: number): number => {
        if (index === 0) {
          return _pane.getHeight();
        }
        return targetHeight;
      }) || [];
    tvWidget?.activeChart().setAllPanesHeight(panesHeightResult);
  };

  const persistStudies = async (setHeight: boolean, initialLoad: boolean) => {
    if (setHeight) {
      setInitialPaneHeight(initialLoad);
    }
    const chartData = await loadChartDataAsync();
    saveChartData(chartData);
  };

  const loadInitialStudiesAsync = () => {
    return new Promise((resolve) => {
      const tvWidget = chartRef.current;
      tvWidget
        ?.activeChart()
        .createStudy('Relative Strength Index', false, false, [14]);
      tvWidget?.activeChart().createStudy('Average True Range', false, false);
      tvWidget?.activeChart().createStudy('MACD', false, false);
      tvWidget?.activeChart().createStudy('Support/Resistance', false, false);

      tvWidget
        ?.activeChart()
        .createStudy('Moving Average Exponential', false, false, [5], {
          'plot.color': 'rgb(144, 202, 249)',
        });
      tvWidget
        ?.activeChart()
        .createStudy('Moving Average Exponential', false, false, [15], {
          'plot.color': 'rgb(255, 204, 128)',
        });

      nextTick().then(async () => {
        await persistStudies(true, true);
        resolve(true);
      });
    });
  };

  async function loadStudies() {
    const tvWidget = chartRef.current;
    // Load current studies
    if (!storedChartData) {
      // Create initial studies
      await loadInitialStudiesAsync();
    } else {
      // Takeout symbol and interval
      const { symbol, interval, ...studiesTemplates } = storedChartData;
      tvWidget?.activeChart().applyStudyTemplate(studiesTemplates);
    }
    tvWidget?.subscribe('study', async () => {
      await nextTick();
      await persistStudies(true, false);
    });
    tvWidget?.subscribe('study_event' as any, async () => {
      await nextTick();
      await persistStudies(false, false);
    });
  }

  return { loadStudies };
}

export default useLoadStudies;
