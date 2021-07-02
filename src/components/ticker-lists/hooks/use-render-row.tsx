import classNames from 'classnames';
import React, { useCallback } from 'react';
import { Cell } from 'react-table';
import Row from '../row';
import styles from '../styles.scss';

function useRenderRow(prepareRow: any) {
  const getCellProps = useCallback(
    (cellInfo: Cell<Record<string, unknown>, any>) => {
      const classList: string[] = [];
      if (cellInfo.column.id === 'price') {
        if ((cellInfo.row.original as any).isIncreasing) {
          classList.push(styles.isIncreasing);
        } else {
          classList.push(styles.isDecreasing);
        }
      }
      if (cellInfo.column.id === 'change') {
        if (parseFloat(cellInfo.value) >= 0) {
          classList.push(styles.isIncreasing);
        } else {
          classList.push(styles.isDecreasing);
        }
      }
      return {
        className: classNames(...classList),
      };
    },
    []
  );

  const RenderRow = React.useCallback(
    (rowDefs) => ({ index, style }: any) => {
      const row = rowDefs[index];
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
    []
  );

  return RenderRow;
}

export default useRenderRow;
