class PriceChangeSource {
  static inst?: PriceChangeSource;

  priceChange = '15m';

  static get instance(): PriceChangeSource {
    if (PriceChangeSource.inst) {
      return PriceChangeSource.inst;
    }
    PriceChangeSource.inst = new PriceChangeSource();
    return PriceChangeSource.inst;
  }

  setChange(change: string) {
    this.priceChange = change;
  }
}

export default PriceChangeSource;
