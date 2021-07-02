import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import Chart from '../../components/chart';
import TickerList from '../../components/ticker-lists';
import OrderFormWrapper from '../../components/order-form';
import styles from './styles.scss';
import useFetchSymbol from './hooks/use-fetch-symbol';
import useFetchTrades from './hooks/use-fetch-trades';
import OrderList from '../../components/order-list';
import { IChartingLibraryWidget } from '../../../assets/charting_library/charting_library';
import SettingsModal from '../../components/settings-modal';
import { selectCredential } from '../../slices/settings-slice';

type TParams = { symbol: string };

const Home = ({ match }: RouteComponentProps<TParams>) => {
  const { symbol } = match.params;
  const credentials = useSelector(selectCredential);
  useFetchSymbol(symbol);
  useFetchTrades(symbol);
  const chartRef = useRef<IChartingLibraryWidget>();
  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.tickerList}>
          <TickerList />
        </div>
        {credentials && (
          <div className={styles.orderList}>
            <OrderList />
          </div>
        )}
        <div className={styles.orderForm}>
          <OrderFormWrapper />
        </div>
      </div>
      <div className={styles.main}>
        <Chart symbol={symbol} interval="15" chartRef={chartRef} />
      </div>
      <SettingsModal />
    </div>
  );
};

export default Home;
