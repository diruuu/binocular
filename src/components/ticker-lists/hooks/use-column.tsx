import classNames from 'classnames';
import React, { useMemo } from 'react';
import { RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import PriceStorage from '../../../models/price-storage';
import ChangeCell from '../change-cell';
import PriceCell from '../price-cell';
import styles from '../styles.scss';

function useColumn({ onBookmark }: { onBookmark: (symbol: string) => void }) {
  const columns = useMemo(
    () => [
      {
        id: 'favorite',
        Header: ({ column }: any) => {
          return (
            <button
              type="button"
              className={styles.transparentButton}
              onClick={() => {
                column.toggleSortBy(column.isSortedDesc);
              }}
            >
              {column.isSortedDesc ? (
                <RiBookmarkFill className={styles.bookmarked} />
              ) : (
                <RiBookmarkLine />
              )}
            </button>
          );
        },
        accessor: 'bookmarked',
        disableResizing: true,
        width: 44,
        defaultCanSort: false,
        Cell: ({ row }: any) => {
          const Component =
            row.original.bookmarked === 1 ? RiBookmarkFill : RiBookmarkLine;
          return (
            <Component
              className={row.original.bookmarked === 1 ? styles.bookmarked : ''}
              onClick={() => onBookmark(row.original.symbol)}
            />
          );
        },
      },
      {
        id: 'symbol',
        Header: ({ column }: any) => {
          return (
            <button
              type="button"
              className={classNames(styles.transparentButton, {
                [styles.isSorted]: column.isSortedDesc,
              })}
              onClick={() => {
                column.toggleSortBy(column.isSortedDesc);
              }}
            >
              Symbol
            </button>
          );
        },
        accessor: 'symbol',
        Cell: ({ value }: any) => {
          return (
            <Link to={`/chart/${value}`} className={styles.link}>
              {value}
            </Link>
          );
        },
      },
      {
        Header: ({ column }: any) => {
          return (
            <button
              type="button"
              className={classNames(styles.transparentButton, {
                [styles.isSorted]: column.isSortedDesc,
              })}
              onClick={() => {
                column.toggleSortBy(column.isSortedDesc);
              }}
            >
              Last
            </button>
          );
        },
        accessor: 'price',
        Cell: ({ value, row }: any) => {
          return (
            <PriceCell
              symbol={row.original.symbol}
              initialPrice={row.original.price}
            />
          );
        },
      },
      {
        Header: ({ column }: any) => {
          return (
            <button
              type="button"
              className={classNames(styles.transparentButton, {
                [styles.isSorted]: column.isSortedDesc,
              })}
              onClick={() => {
                column.toggleSortBy(column.isSortedDesc);
              }}
            >
              Chg(%)
            </button>
          );
        },
        accessor: 'change',
        disableResizing: true,
        width: 110,
        Cell: ({ value, row }: any) => {
          return (
            <ChangeCell
              symbol={row.original.symbol}
              initialChange={row.original.change}
            />
          );
        },
        sortType: (rowA: any, rowB: any) => {
          const rowAChange = PriceStorage.instance.getChange(
            rowA.original.symbol
          );
          const rowBChange = PriceStorage.instance.getChange(
            rowB.original.symbol
          );
          const rowAChangeNumber =
            rowAChange &&
            !Number.isNaN(rowAChange) &&
            typeof rowAChange === 'string'
              ? parseFloat(rowAChange)
              : 0;
          const rowBChangeNumber =
            rowBChange &&
            !Number.isNaN(rowBChange) &&
            typeof rowBChange === 'string'
              ? parseFloat(rowBChange)
              : 0;

          if (rowAChangeNumber > rowBChangeNumber) {
            return 1;
          }
          return -1;
        },
      },
    ],
    []
  );

  return columns;
}

export default useColumn;
