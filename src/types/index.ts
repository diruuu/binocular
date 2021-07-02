export interface BinanceServerTimeResponse {
  serverTime: number;
}

export type IBinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

export type IBinanceKlines = IBinanceKline[];
export type IBookmarkState = 0 | 1 | undefined;

export interface BinancePriceResponse {
  symbol: string;
  price: string;
  bookmarked: IBookmarkState;
}

export interface BinancePrice extends BinancePriceResponse {
  change?: string;
  isIncreasing?: boolean;
}

export interface IBinanceWebsocketResponse {
  e: string;
  s: string;
  E: number;
  [key: string]: any;
}

export interface IBinanceSubscriptionResult {
  result: null;
  id: number;
}

export interface BinanceKlineWebsocket extends IBinanceWebsocketResponse {
  k: {
    t: number;
    T: number;
    s: string;
    i: '5m';
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: false;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
}

export type ResString =
  | '1'
  | '3'
  | '5'
  | '15'
  | '30'
  | '60'
  | '120'
  | '240'
  | '360'
  | '480'
  | '720'
  | 'D'
  | '3D'
  | '1W'
  | '1M';

export interface FixedSizeRenderList {
  overscanStartIndex: number;
  overscanStopIndex: number;
  visibleStartIndex: number;
  visibleStopIndex: number;
}

export interface IBinanceTicker {
  e: string;
  E: number;
  s: string;
  p: string;
  P: string;
  w: string;
  x: string;
  c: string;
  Q: string;
  b: string;
  B: string;
  a: string;
  A: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
  O: number;
  C: number;
  F: number;
  L: number;
  n: number;
}

export interface APICredentialInfo {
  api_key: string;
  secret_key: string;
}

export interface Settings {
  AUTO_UPDATE: boolean;
  BINANCE_API_KEY: string;
  BINANCE_SECRET_KEY: string;
  LICENSE_KEY: string;
  STOP_LOSS_ATR_RATIO: number;
  TAKE_PROFIT_ATR_RATIO: number;
  REST_API_BASE_URL: string;
  WEBSOCKET_BASE_URL: string;
}

export interface IBinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface IBinanceAccount {
  accountType: string;
  balances: IBinanceBalance[];
  buyerCommission: number;
  canDeposit: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  makerCommission: number;
  permissions: ('SPOT' | 'MARGIN')[];
  sellerCommission: number;
  takerCommission: number;
  updateTime: number;
}

export interface IBinancePriceLimitFilter {
  filterType: string;
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

export interface IBinanceMinNotionalFilter {
  filterType: string;
  minNotional: string;
  applyToMarket: boolean;
  avgPriceMins: number;
}

export interface IBinancePercentPriceFilter {
  filterType: string;
  multiplierUp: string;
  multiplierDown: string;
  avgPriceMins: number;
}

export interface IBinanceSymbolInfo {
  baseAsset: string;
  baseAssetPrecision: number;
  baseCommissionPrecision: number;
  isSpotTradingAllowed: boolean;
  ocoAllowed: boolean;
  quoteAsset: string;
  quoteAssetPrecision: number;
  quoteCommissionPrecision: number;
  status: string;
  symbol: string;
  filters: (IBinancePriceLimitFilter | IBinanceMinNotionalFilter)[];
}

export interface IBinanceExhangeInfo {
  symbols: IBinanceSymbolInfo[];
}

export interface ITickValue {
  close: number;
  high: number;
  low: number;
  open: number;
  atr?: number;
}

export interface IBinanceListenKey {
  listenKey: string;
}

export type OrderStatus =
  | 'NEW'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELED'
  | 'REJECTED'
  | 'TRADE'
  | 'EXPIRED';

type OrderType =
  | 'LIMIT'
  | 'MARKET'
  | 'STOP_LOSS'
  | 'STOP_LOSS_LIMIT'
  | 'TAKE_PROFIT'
  | 'TAKE_PROFIT_LIMIT'
  | 'LIMIT_MAKER';

export interface IBinanceExcecutionReportWS {
  e: 'executionReport';
  E: number;
  s: string;
  c: string;
  S: 'BUY' | 'SELL';
  o: OrderType;
  f: string;
  q: string;
  p: string;
  P: string;
  F: string;
  g: number;
  C?: string;
  x: OrderStatus;
  X: OrderStatus;
  r: string;
  i: number;
  l: string;
  z: string;
  L: string;
  n: string;
  N: null;
  T: number;
  t: number;
  I: number;
  w: true;
  m: false;
  M: false;
  O: number;
  Z: string;
  Y: string;
  Q: string;
}

export interface IBinanceOcoOrder {
  c: string;
  i: number;
  s: string;
}

export interface IBinanceOCOWS {
  e: 'listStatus';
  E: number;
  s: string;
  g: number;
  c: string;
  l: string;
  L: string;
  r: string;
  C: string;
  T: number;
  O: IBinanceOcoOrder[];
}

export interface OutboundPositionBalance {
  a: string;
  f: string;
  l: string;
}

export interface IBinanceOutboundAccountPosition {
  e: 'outboundAccountPosition';
  E: number;
  u: number;
  B: OutboundPositionBalance[];
}

export interface IOrderData {
  orderId?: string;
  symbol: string;
  side?: 'BUY' | 'SELL';
  quoteOrderQty?: number;
  quantity?: number;
  stopLoss?: number;
  stopLossLimit?: number;
  takeProfit?: number;
}

export interface IOrderDataToSend {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET';
  quoteOrderQty?: number;
  quantity?: number;
  newClientOrderId: string;
  newOrderRespType: 'RESULT';
}

export interface IBinanceNewOrderResponseRest {
  symbol: string;
  orderId: number;
  orderListId: -1;
  clientOrderId: string;
  transactTime: 1507725176595;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
}

export interface IBinanceTradeItem {
  clientOrderId?: string;
  cummulativeQuoteQty: string;
  executedQty: string;
  icebergQty?: string;
  isWorking?: boolean;
  orderId: number;
  orderListId?: number;
  origQty?: string;
  origQuoteOrderQty?: string;
  price: string;
  side: 'BUY' | 'SELL';
  status: OrderStatus;
  stopPrice: string;
  symbol: string;
  time: number;
  timeInForce: string;
  type: string;
  updateTime: number;
  groupId?: number;
  stopLossOrder?: IBinanceTradeItem;
  takeProfitOrder?: IBinanceTradeItem;
  marketSellOrder?: IBinanceTradeItem;
}

export type OCOStatusType = 'RESPONSE' | 'EXEC_STARTED' | 'ALL_DONE';
export type OCOOrderStatus = 'EXECUTING' | 'REJECT	' | 'ALL_DONE';

export interface IBinanceOCOCancelResponse {
  contingencyType: string;
  listClientOrderId: string;
  listOrderStatus: OCOOrderStatus;
  listStatusType: OCOStatusType;
  orderListId: number;
  symbol: string;
  transactionTime: number;
}

export type OrderListStatus =
  | 'EXEC'
  | 'CANCELLED'
  | 'STOP_LIMIT'
  | 'TOOK_PROFIT'
  | 'PARTIAL_FILL'
  | 'ON_LIMIT'
  | 'SOLD'
  | 'OCO_FAILED'
  | 'UNKNOWN';

export interface OrderListTableItem {
  index: number;
  tradeId: string;
  status: OrderListStatus;
  profit: string;
  time: string;
  orgQty: string;
}

export interface IBinanceTx {
  blockHeight: number;
  code: 0 | 404;
  confirmBlocks: number;
  fromAddr: string;
  hasChildren: number;
  log: string;
  mappedTxAsset: string;
  memo: string;
  sequence: number;
  source: number;
  timeStamp: number;
  toAddr: string;
  txAge: number;
  txAsset: string;
  txFee: number;
  txHash: string;
  txType: string;
  value: number;
  price: number;
}
