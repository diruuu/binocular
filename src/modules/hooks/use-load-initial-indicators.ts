import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import lang from '../../utils/lang';
import nextTick from '../../utils/next-tick';
import logger from '../../utils/logger';
import useSetStudyHeight from './use-set-study-height';

function useLoadInitialIndicators(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const { setInitialPaneHeight } = useSetStudyHeight(chartRef);

  const loadInitialIndicators = async () => {
    logger(lang('INITIAL_SETUP_INDICATOR'));
    await chartRef.current
      ?.activeChart()
      .createStudy('Relative Strength Index', false, false, [14]);
    await chartRef.current
      ?.activeChart()
      .createStudy('Average True Range', false, false);
    await chartRef.current?.activeChart().createStudy('MACD', false, false);
    await chartRef.current
      ?.activeChart()
      .createStudy('Support/Resistance', false, false);

    await chartRef.current
      ?.activeChart()
      .createStudy('Moving Average Exponential', false, false, [5], {
        'plot.color': 'rgb(144, 202, 249)',
      });
    await chartRef.current
      ?.activeChart()
      .createStudy('Moving Average Exponential', false, false, [15], {
        'plot.color': 'rgb(255, 204, 128)',
      });

    await nextTick();
    setInitialPaneHeight(true);
  };

  return loadInitialIndicators;
}

export default useLoadInitialIndicators;
