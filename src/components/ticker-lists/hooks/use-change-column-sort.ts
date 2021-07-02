import { useEffect, useRef } from 'react';

function useChangeColumnSort(columnList: any) {
  const intervalRef = useRef<NodeJS.Timeout>();
  const sortedKeys = columnList?.map((column: any) => column.isSorted).join('');

  useEffect(() => {
    const activeSortedColumn = (columnList as any[])?.find(
      (column) => column.isSorted
    );
    const columnId = activeSortedColumn?.id;
    if (columnId === 'change') {
      intervalRef.current = setInterval(() => {
        activeSortedColumn?.toggleSortBy(true);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [sortedKeys]);
}

export default useChangeColumnSort;
