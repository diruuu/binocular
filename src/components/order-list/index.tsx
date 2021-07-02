import React, { useCallback, useMemo } from 'react';
import { useTable, useBlockLayout, Cell } from 'react-table';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import useColumn from './hooks/use-column';
import scrollbarWidth from '../../utils/scrollbar-width';
import styles from './styles.scss';
import Row from './row';
import { useSelector } from '../../hooks';
import { selectOrderListTableItems } from '../../slices/selectors/symbol-info-selectors';
import { OrderListStatus } from '../../types';
import Text from '../text';
import { cancelMarketOrderByGroupId } from '../../slices/order-form-slice';
import useDialog from '../../hooks/use-dialog';

function OrderList() {
  const dispatch = useDispatch();
  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);
  const dialog = useDialog();
  const orderListTableItems = useSelector(selectOrderListTableItems);

  const onSellToMarket = (original: any) => {
    dialog?.openModal({
      title: 'Sell Asset Confirmation',
      children: `Are you sure want to sell the assets at the market price?`,
      confirmLabel: 'Proceed',
      onConfirm: (onClose) => {
        dispatch(cancelMarketOrderByGroupId(original.tradeId));
        onClose();
      },
    });
  };

  const getCellProps = useCallback(
    (cellInfo: Cell<Record<string, unknown>, any>) => {
      const classList: string[] = [];
      if (cellInfo.column.id === 'status') {
        const { value }: { value: OrderListStatus } = cellInfo;
        if (['CANCELLED', 'OCO_FAILED', 'ON_LIMIT', 'EXEC'].includes(value)) {
          classList.push(styles.isConcerning);
        } else if (value === 'TOOK_PROFIT') {
          classList.push(styles.isGood);
        } else if (['STOP_LIMIT'].includes(value)) {
          classList.push(styles.isBad);
        }
      }
      if (cellInfo.column.id === 'profit') {
        const { value }: { value: string } = cellInfo;
        if (parseFloat(value) < 0) {
          classList.push(styles.isBad);
        } else {
          classList.push(styles.isGood);
        }
        const orderStatus: OrderListStatus = (cellInfo.row.original as any)
          .status;
        if (
          ['CANCELLED', 'OCO_FAILED', 'ON_LIMIT', 'EXEC'].includes(orderStatus)
        ) {
          classList.push(styles.shadowed);
        }
      }
      return {
        className: classNames(...classList),
      };
    },
    []
  );

  const columns = useColumn({ onSellToMarket });

  const orderListIds: string = orderListTableItems
    ?.map((order) => order.tradeId + order.status + order.profit)
    .join();
  const tableItems = useMemo(() => orderListTableItems, [orderListIds]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  }: any = useTable(
    {
      columns: columns as any,
      data: tableItems,
    },
    useBlockLayout
  );

  const RenderRow = React.useCallback(
    ({ index, style }: any) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <Row
          {...row.getRowProps({
            style,
            className: styles.tr,
          })}
        >
          {row.cells.map((cell: any, i: number) => {
            return (
              <div
                {...cell.getCellProps([
                  {
                    className: classNames(
                      cell.column.className,
                      styles.tableCell
                    ),
                    style: cell.column.style,
                  },
                  getCellProps(cell),
                ])}
                key={i}
              >
                {cell.render('Cell')}
              </div>
            );
          })}
        </Row>
      );
    },
    [rows]
  );

  return (
    <div className={styles.wrapper}>
      <div {...getTableProps()} className={styles.table}>
        <div role="rowgroup">
          {headerGroups.map((headerGroup: any, i: number) => (
            <div
              {...headerGroup.getHeaderGroupProps({
                className: styles.tr,
                style: {
                  paddingRight: tableItems.length > 5 ? scrollBarSize : 0,
                },
              })}
              key={i}
            >
              {headerGroup.headers.map((column: any, idx: number) => (
                <div
                  {...column.getHeaderProps([
                    {
                      className: styles.tableHeader,
                    },
                  ])}
                  key={idx}
                >
                  {column.render('Header')}
                </div>
              ))}
            </div>
          ))}
        </div>
        {!tableItems.length && (
          <div className={styles.emptyState}>
            <Text>You don&apos;t have any trade history on this symbol.</Text>
          </div>
        )}
        <div
          {...getTableBodyProps({
            className: styles.rowGroup,
          })}
        >
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                height={height}
                itemCount={rows.length}
                itemSize={33}
                width={width}
              >
                {RenderRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}

export default OrderList;
