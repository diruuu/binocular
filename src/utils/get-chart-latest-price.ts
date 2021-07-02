import { IChartWidgetApi } from '../../assets/charting_library/charting_library';
import logger from './logger';

async function getChartLatestPrice(
  activeChart: IChartWidgetApi
): Promise<number> {
  try {
    const exportedData = await activeChart?.exportData({
      includeTime: false,
      includedStudies: [],
    });

    if (!exportedData.data || !exportedData.data.length) {
      return 0;
    }

    const closeIndex = exportedData.schema.reduce((acc, sch, index) => {
      if ((sch as any).plotTitle === 'close') {
        return index;
      }
      return acc;
    }, 0);

    const lastData = exportedData.data[exportedData.data.length - 1];

    const price =
      lastData.length && lastData.length > closeIndex
        ? lastData[closeIndex]
        : 0;

    return price;
  } catch (error) {
    logger(error);
    return 0;
  }
}

export default getChartLatestPrice;
