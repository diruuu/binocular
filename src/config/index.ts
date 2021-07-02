import constants from './constants';

const config = {
  showLog: true,
  quoteAssetsPairs: [
    {
      value: 'BUSD',
      label: 'Trade in BUSD',
    },
    {
      value: 'USDT',
      label: 'Trade in USDT',
    },
  ],
  changeSources: [
    {
      value: '1m',
      label: '1 minute change',
    },
    {
      value: '3m',
      label: '3 minutes change',
    },
    {
      value: '5m',
      label: '5 minutes change',
    },
    {
      value: '15m',
      label: '15 minutes change',
    },
    {
      value: '30m',
      label: '30 minutes change',
    },
    {
      value: '1h',
      label: '1 hour change',
    },
    {
      value: '2h',
      label: '2 hours change',
    },
    {
      value: '4h',
      label: '4 hours change',
    },
    {
      value: '6h',
      label: '6 hours change',
    },
    {
      value: '8h',
      label: '8 hours change',
    },
    {
      value: '12h',
      label: '12 hours change',
    },
    {
      value: '1d',
      label: '1 day change',
    },
    {
      value: '3d',
      label: '3 days change',
    },
    {
      value: '1w',
      label: '1 week change',
    },
    {
      value: '1M',
      label: '1 month change',
    },
  ],
  getDefaultPair: () => {
    const quoteAsset = localStorage.getItem(
      constants.PREFERED_QUOTE_ASSET_LOCALSTORAGE_KEY
    );
    // issue with localstorage has double quote character
    const stripDoubleQuote = quoteAsset?.replaceAll('"', '');
    return stripDoubleQuote ? `BTC${stripDoubleQuote}` : 'BTCUSDT';
  },
};

export default config;
