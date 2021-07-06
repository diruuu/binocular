import moment from 'moment';
import { useDispatch } from '../../hooks';
import { setTick } from '../../slices/symbol-info-slice';
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import { ITickValue } from '../../types';
import nextTick from '../../utils/next-tick';

function useLatestATR(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const dispatch = useDispatch();

  async function calculateExportData<T>(): Promise<T> {
    await nextTick(500);
    const ATRID = chartRef.current
      ?.activeChart()
      .getAllStudies()
      ?.find((study: any) => study.name === 'Average True Range')?.id;

    const exportData = await chartRef.current?.chart().exportData({
      includeTime: false,
      includeSeries: true,
      includedStudies: ATRID ? [ATRID] : [],
      from: moment().subtract(5, 'minutes').unix(),
    });

    const transformedData: Record<string, unknown> =
      (!!exportData?.data?.length &&
        exportData?.schema.reduce(
          (acc: Record<string, unknown>, scheme: any, index) => {
            const key =
              scheme.sourceType === 'series' ? scheme.plotTitle : 'atr';
            const value = exportData.data[0][index];

            return {
              ...acc,
              [key]: value,
            };
          },
          {}
        )) ||
      {};

    if (!transformedData?.atr || Number.isNaN(transformedData.atr)) {
      transformedData.atr = (transformedData.close as number) * 0.05;
    }

    return transformedData as T;
  }

  async function updateTickData() {
    const exportData: ITickValue = await calculateExportData<ITickValue>();
    dispatch(setTick(exportData));
  }

  function watchPrice() {
    const tvWidget = chartRef.current;
    tvWidget?.subscribe('onTick', updateTickData);
  }

  return { watchPrice, updateTickData };
}

export default useLatestATR;
