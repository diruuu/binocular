import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { MdRefresh } from 'react-icons/md';
import { useTable, useBlockLayout, useSortBy } from 'react-table';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Grid } from '@material-ui/core';
import classNames from 'classnames';
import useColumn from './hooks/use-column';
import styles from './styles.scss';
import scrollbarWidth from '../../utils/scrollbar-width';
import { BinancePrice } from '../../types';
import { useDispatch, useSelector } from '../../hooks';
import {
  fetchAllSymbols,
  selectSymbolList,
  selectIsFetchingSymbols,
} from '../../slices/symbol-list-slice';
import {
  selectBookmarkList,
  toggleBookmarkSymbol,
} from '../../slices/symbol-bookmark-slice';
import useListTransform from './hooks/use-list-transform';
import Select from '../select';
import useLocalStorage from '../../hooks/use-local-storage';
import PriceChangeSource from '../../models/price-change-source';
import LogoSVG from '../../svgs/main-logo';
import useChangeColumnSort from './hooks/use-change-column-sort';
import useWebsocketKlineCallback from './hooks/use-websocket-kline-callback';
import useRenderRow from './hooks/use-render-row';
import config from '../../config';
import CloseButton from '../../svgs/close-button';
import lang from '../../utils/lang';
import Text from '../text';

function TickerList() {
  const [changeSource, setChangeSource] = useLocalStorage<unknown>(
    'changeSource',
    '15m'
  );
  const [fiatCurrency, setFiatCurrency] = useLocalStorage<string>(
    'fiatCurrency',
    'USDT'
  );
  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);
  const [searchValue, setSearchValue] = useState('');
  const windowRef = useRef<any>(null);
  const dispatch = useDispatch();
  const symbolList = useSelector(selectSymbolList);
  const bookmarkList = useSelector(selectBookmarkList);
  const isFetchingSymbols = useSelector(selectIsFetchingSymbols);
  const setBookmark = (symbol: string) =>
    dispatch(toggleBookmarkSymbol(symbol));

  const fetchData = useCallback(
    (forced?: boolean) => dispatch(fetchAllSymbols(fiatCurrency, forced)),
    [dispatch, fiatCurrency]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, fiatCurrency]);

  const searchResult: BinancePrice[] = useListTransform({
    searchQuery: searchValue,
    symbolList,
    bookmarkList,
  });

  useWebsocketKlineCallback(symbolList, changeSource);

  const columns = useColumn({
    onBookmark: (symbol) => setBookmark(symbol),
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    sortedRows,
    prepareRow,
    toggleSortBy,
    columns: columnList,
    ...rest
  }: any = useTable(
    {
      columns,
      data: searchResult,
      autoResetSortBy: false,
      disableMultiSort: true,
    } as any,
    useBlockLayout,
    useSortBy
  );

  useChangeColumnSort(columnList);

  const RenderRow = useRenderRow(prepareRow);

  const onInputSearchChange = useCallback((event) => {
    const { value } = event.target;
    setSearchValue(value);
  }, []);

  const onSetChangeSource = useCallback((event) => {
    const { value } = event.target;
    setChangeSource(value);
    PriceChangeSource.instance.setChange(value);
  }, []);

  const onSetChangeFiatCurrency = useCallback((event) => {
    const { value } = event.target;
    setFiatCurrency(value);
  }, []);

  return (
    <div className={styles.wrapper}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <div className={styles.currency}>
            <Select
              value={fiatCurrency}
              inputClassName={styles.selectInput}
              onChange={onSetChangeFiatCurrency}
              options={config.quoteAssetsPairs}
            />
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={styles.currency}>
            <Select
              value={changeSource}
              inputClassName={styles.selectInput}
              onChange={onSetChangeSource}
              options={config.changeSources}
            />
          </div>
        </Grid>
      </Grid>

      <div className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <RiSearchLine />
          <input
            type="text"
            className={styles.input}
            placeholder="Search symbol.."
            value={searchValue}
            onChange={onInputSearchChange}
          />
          <button
            type="button"
            className={classNames(styles.inputButton, styles.closeButton, {
              [styles.closeButtonActive]: searchValue && searchValue !== '',
            })}
            onClick={() => onInputSearchChange({ target: { value: '' } })}
          >
            <CloseButton />
          </button>
        </div>
        <button
          type="button"
          className={styles.inputButton}
          onClick={() => fetchData(true)}
        >
          <MdRefresh />
        </button>
      </div>
      {isFetchingSymbols && (
        <div className={styles.centered}>
          <LogoSVG width={40} />
        </div>
      )}
      {!isFetchingSymbols && !sortedRows.length && (
        <div className={styles.centered}>
          <Text>{lang('NO_SYMBOL_FOUND')}</Text>
        </div>
      )}
      {!isFetchingSymbols && !!sortedRows.length && (
        <div {...getTableProps()} className={styles.table}>
          <div>
            {headerGroups.map((headerGroup: any, i: number) => (
              <div
                {...headerGroup.getHeaderGroupProps({
                  className: styles.tr,
                  style: {
                    paddingRight: scrollBarSize,
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
                      column.getSortByToggleProps(),
                    ])}
                    key={idx}
                  >
                    {column.render('Header')}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div
            {...getTableBodyProps({
              className: styles.rowGroup,
            })}
          >
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  ref={windowRef}
                  height={height}
                  itemCount={sortedRows.length}
                  itemSize={33}
                  width={width}
                >
                  {RenderRow(sortedRows)}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        </div>
      )}
    </div>
  );
}

export default TickerList;
