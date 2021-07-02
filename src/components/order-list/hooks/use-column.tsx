import React, { useMemo } from 'react';
import { OrderListStatus } from '../../../types';
import lang from '../../../utils/lang';
import styles from '../styles.scss';

interface IUseColumn {
  onSellToMarket: (original: any) => void;
}

function useColumn({ onSellToMarket }: IUseColumn) {
  const columns = useMemo(
    () => [
      {
        id: 'tradeId',
        Header: ({ value }: any) => {
          return <div className={styles.id}>ID</div>;
        },
        accessor: 'index',
        Cell: ({ value }: any) => {
          return <div className={styles.id}>{value}</div>;
        },
        disableResizing: true,
        width: 50,
      },
      {
        id: 'status',
        Header: 'Status',
        accessor: 'status',
        disableResizing: true,
        width: 200,
        Cell: ({ value, row }: { value: OrderListStatus; row: any }) => {
          if (['CANCELLED', 'OCO_FAILED', 'ON_LIMIT'].includes(value)) {
            return (
              <button
                type="button"
                onClick={() => onSellToMarket(row.original)}
                className={styles.sellButton}
              >
                {lang(value)}
              </button>
            );
          }
          return lang(value);
        },
      },
      {
        id: 'orgQty',
        Header: 'Qty',
        accessor: 'orgQty',
        disableResizing: true,
        width: 100,
      },
      {
        id: 'profit',
        Header: 'Profit',
        accessor: 'profit',
        disableResizing: true,
        width: 100,
      },
      {
        id: 'time',
        Header: 'Time',
        accessor: 'time',
        disableResizing: true,
        width: 100,
      },
    ],
    []
  );

  return columns;
}

export default useColumn;
