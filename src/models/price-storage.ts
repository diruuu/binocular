class PriceStorage {
  static inst?: PriceStorage;

  prices: Map<string, string> = new Map();

  change: Map<string, string> = new Map();

  static get instance(): PriceStorage {
    if (PriceStorage.inst) {
      return PriceStorage.inst;
    }
    PriceStorage.inst = new PriceStorage();
    return PriceStorage.inst;
  }

  setChange(symbol: string, price: string, change: string) {
    this.prices.set(symbol, price);
    this.change.set(symbol, change);
  }

  getPrice(symbol: string) {
    return this.prices.get(symbol);
  }

  getChange(symbol: string) {
    return this.change.get(symbol);
  }

  reset() {
    this.prices = new Map();
    this.change = new Map();
  }
}

export default PriceStorage;
