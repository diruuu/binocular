import React from 'react';
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import TVChartContainer from '../../modules/tradingview-container';
import { ResString } from '../../types';

interface IChartProps {
  symbol: string;
  interval: ResString;
  chartRef: React.MutableRefObject<IChartingLibraryWidget | undefined>;
}

function Chart({ symbol, interval, chartRef }: IChartProps) {
  return (
    <TVChartContainer symbol={symbol} interval={interval} chartRef={chartRef} />
  );
}

export default Chart;
