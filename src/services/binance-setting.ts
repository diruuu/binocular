export interface IBinanceSettings {
  RESTApiBaseUrl: string;
  websocketBaseURl: string;
}

class BinanceSettings {
  settings: IBinanceSettings | Record<string, never> = {};

  static inst?: BinanceSettings;

  static get instance(): BinanceSettings {
    if (BinanceSettings.inst) {
      return BinanceSettings.inst;
    }
    BinanceSettings.inst = new BinanceSettings();
    return BinanceSettings.inst;
  }

  setSettings(settings: IBinanceSettings) {
    this.settings = settings;
  }
}

export default BinanceSettings;
