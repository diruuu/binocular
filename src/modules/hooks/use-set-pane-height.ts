import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import nextTick from '../../utils/next-tick';

function useSetPanesHeight(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  function setPaneHeight() {
    const tvWidget = chartRef.current;
    tvWidget?.subscribe('study', async () => {
      await nextTick();
      const panes = tvWidget?.activeChart().getPanes();
      const chartHeight = panes && panes[0].getHeight();
      const panesHeight: number[] =
        panes?.map((_pane: any, index: number): number => {
          if (chartHeight && index === 0) {
            return chartHeight;
          }
          return 30;
        }) || [];
      tvWidget?.activeChart().setAllPanesHeight(panesHeight);
    });
  }

  return { setPaneHeight };
}

export default useSetPanesHeight;
