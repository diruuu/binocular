/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import nextTick from '../../utils/next-tick';

function useSetStudyHeight(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
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

  const setHeight = async (initialLoad: boolean) => {
    setInitialPaneHeight(initialLoad);
  };

  async function setStudyHeight() {
    const tvWidget = chartRef.current;
    tvWidget?.subscribe('study', async () => {
      await nextTick();
      await setHeight(false);
    });
  }

  return { setStudyHeight, setInitialPaneHeight };
}

export default useSetStudyHeight;
