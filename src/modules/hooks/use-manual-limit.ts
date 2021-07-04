import { useRef } from 'react';
import {
  CrossHairMovedEventParams,
  IChartingLibraryWidget,
} from '../../../assets/charting_library/charting_library';
import { useDispatch } from '../../hooks';
import { setStopLossTakeProfitOnChartClick } from '../../slices/order-form-slice';

function useManualLimit(
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>
) {
  const dispatch = useDispatch();
  const timePriceRef = useRef<{ time: number; price: number }>({
    time: 0,
    price: 0,
  });

  const initManualLimit = () => {
    chartRef.current?.subscribe('mouse_down', () => {
      dispatch(setStopLossTakeProfitOnChartClick(timePriceRef.current.price));
    });

    chartRef.current
      ?.chart()
      .crossHairMoved()
      .subscribe(null, ({ time, price }: CrossHairMovedEventParams) => {
        timePriceRef.current.time = time;
        timePriceRef.current.price = price;
      });
  };
  return initManualLimit;
}

export default useManualLimit;
