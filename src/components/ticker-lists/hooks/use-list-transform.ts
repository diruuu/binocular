import { useMemo } from 'react';
import { BinancePrice, IBookmarkState } from '../../../types';

interface IUseListTransform {
  searchQuery: string;
  symbolList: BinancePrice[];
  bookmarkList: string[];
}

function useListTransform({
  searchQuery,
  symbolList,
  bookmarkList,
}: IUseListTransform) {
  const symbolListNames = symbolList.map((symbol) => symbol.symbol).join('');
  const bookmarkListLength = bookmarkList.length;
  const searchResult: BinancePrice[] = useMemo(() => {
    const result = symbolList
      ?.filter((listItem) => {
        const symbolUppercase = listItem.symbol?.toUpperCase();
        const searchQueryUppercase = searchQuery?.toUpperCase();
        if (!!searchQuery && searchQuery !== '') {
          if (!symbolUppercase.includes(searchQueryUppercase)) {
            return false;
          }
        }
        return true;
      })
      ?.map((listItem) => {
        if (bookmarkList.includes(listItem.symbol)) {
          return {
            ...listItem,
            bookmarked: 1 as IBookmarkState,
          };
        }
        return {
          ...listItem,
          bookmarked: 0 as IBookmarkState,
        };
      });
    return result;
  }, [searchQuery, symbolListNames, bookmarkListLength]);

  return searchResult;
}

export default useListTransform;
