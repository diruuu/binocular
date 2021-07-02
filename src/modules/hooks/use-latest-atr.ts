import { useCallback } from 'react';
import { useDispatch } from '../../hooks';
import { setTick } from '../../slices/symbol-info-slice';
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import { ITickValue } from '../../types';
import lang from '../../utils/lang';
import logger from '../../utils/logger';

function useLatestATR(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const dispatch = useDispatch();

  const getLatestATR = useCallback(
    (
      onResolve: (lastATR: number) => void,
      onError: (errorMessage: Error) => void
    ): void => {
      try {
        const tvWidget = chartRef.current;
        const ATRID = chartRef.current
          ?.activeChart()
          .getAllStudies()
          ?.find((study: any) => study.name === 'Average True Range')?.id;
        if (!ATRID) {
          throw new Error(lang('ATR_CANNOT_BE_FOUND'));
        }
        const study: any = tvWidget?.activeChart().getStudyById(ATRID);
        const lastBar = study?._study?.m_data.last();
        if (!lastBar) {
          throw new Error(lang('LAST_BAR_NOT_EXIST'));
        }
        const lastATR = lastBar?.value[1];
        onResolve(lastATR);
      } catch (error) {
        onError(error);
      }
    },
    [chartRef]
  );

  const getLatestATRPromise = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      getLatestATR(resolve, reject);
    });
  };

  const getLastBar = async () => {
    const tvWidget = chartRef.current;
    const exportedData = await tvWidget
      ?.activeChart()
      .exportData({ includeTime: false, includedStudies: [] });
    const schema = exportedData?.schema;
    const lastBar = exportedData?.data[exportedData?.data.length - 1];
    const value = schema?.map(({ plotTitle }: any, index) => {
      const res = lastBar && lastBar[index];
      return {
        name: plotTitle,
        value: res,
      };
    });
    const formattedValue: ITickValue | undefined = value?.reduce(
      (acc: ITickValue, bar) => {
        return {
          ...acc,
          [bar.name]: bar.value,
        };
      },
      {} as ITickValue
    );
    return formattedValue;
  };

  async function onInitialCalculation() {
    try {
      const lastBar = await getLastBar();
      const ATR = await getLatestATRPromise();
      const tick: ITickValue = {
        open: lastBar?.open || 0,
        close: lastBar?.close || 0,
        low: lastBar?.low || 0,
        high: lastBar?.high || 0,
        atr: ATR,
      };

      dispatch(setTick(tick));
    } catch (error) {
      logger(error);
    }
  }

  const onTick = async (tickValue: ITickValue) => {
    let ATR = 0;
    try {
      ATR = await getLatestATRPromise();
    } catch (error) {
      logger(error.message);
    }

    const tick: ITickValue = {
      open: tickValue?.open || 0,
      close: tickValue?.close || 0,
      low: tickValue?.low || 0,
      high: tickValue?.high || 0,
      atr: ATR,
    };
    dispatch(setTick(tick));
  };

  function watchPrice() {
    const tvWidget = chartRef.current;
    tvWidget?.subscribe('onTick', onTick);
  }

  return { watchPrice };
}

export default useLatestATR;
