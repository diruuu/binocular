const squezeMomentumIndicator = (PineJS: any): any => ({
  name: 'Squeeze Momentum Indicator',
  metainfo: {
    _metainfoVersion: 40,
    id: 'SQZMOM_LB@tv-basicstudies-1',
    scriptIdPart: '',
    name: 'Squeeze Momentum Indicator',
    description: 'Squeeze Momentum Indicator',
    shortDescription: 'SQZMOM_LB',

    is_hidden_study: false,
    is_price_study: false,
    isCustomIndicator: true,

    plots: [
      { id: 'plot_0', type: 'histogram' },
      {
        id: 'plot_1',
        type: 'histogram',
      },
    ],
    defaults: {
      styles: {
        plot_0: {
          visible: true,
          linewidth: 4,
          plottype: 1,
          trackPrice: false,
          color: '#26a69a',
        },
        plot_1: {
          visible: true,
          linewidth: 4,
          plottype: 1,
          trackPrice: false,
          color: '#ef5350',
        },
      },

      // Precision is set to one digit, e.g. 777.7
      precision: 1,

      inputs: {},
    },
    styles: {
      plot_0: {
        // Output name will be displayed in the Style window
        title: 'Squeeze momentum value',
      },
    },
    inputs: [],
  },
  constructor() {
    this.init = function (context: any, inputCallback: any) {
      this._context = context;
      this._input = inputCallback;

      const symbol = PineJS.Std.ticker(this._context);
      this._context.new_sym(
        symbol,
        PineJS.Std.period(this._context),
        PineJS.Std.period(this._context)
      );
    };

    this.main = function (context: any, inputCallback: any) {
      this._context = context;
      this._input = inputCallback;

      this._context.select_sym(1);

      const lengthKC = 20;

      // Calculate BB
      const close = this._context.new_var(PineJS.Std.close(this._context));
      const high = this._context.new_var(PineJS.Std.high(this._context));
      const low = this._context.new_var(PineJS.Std.low(this._context));

      const highest = PineJS.Std.highest(high, lengthKC, context);
      const lowest = PineJS.Std.lowest(low, lengthKC, context);
      const highestLowestAvg = PineJS.Std.avg(highest, lowest);

      const newClose = this._context.new_var(PineJS.Std.close(this._context));
      const avg = PineJS.Std.avg(
        highestLowestAvg,
        PineJS.Std.sma(newClose, lengthKC, context)
      );

      const sub = this._context.new_var(close - avg);
      const val = PineJS.Std.linreg(sub, lengthKC, 0, context);

      const plot1Val = val > 0 ? val : 0;
      const plot2Val = val < 0 ? val : 0;

      return [plot1Val, plot2Val];
    };
  },
});

export default squezeMomentumIndicator;
