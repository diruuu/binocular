const supportResistance = (PineJS: any): any => ({
  name: 'Support/Resistance',
  metainfo: {
    _metainfoVersion: 40,
    id: 'SPRST@tv-basicstudies-1',
    scriptIdPart: '',
    name: 'Support/Resistance',
    description: 'Support/Resistance',
    shortDescription: 'SPRST',

    is_hidden_study: false,
    is_price_study: true,
    isCustomIndicator: true,

    plots: [
      { id: 'plot_0', type: 'circles' },
      {
        id: 'plot_1',
        type: 'circles',
      },
    ],
    defaults: {
      styles: {
        plot_0: {
          visible: true,
          linewidth: 2,
          plottype: 6,
          trackPrice: false,
          color: '#ef5350',
          join: false,
          transp: 20,
        },
        plot_1: {
          visible: true,
          linewidth: 2,
          plottype: 6,
          trackPrice: false,
          color: '#26a69a',
          join: false,
          transp: 20,
        },
      },

      inputs: {},
    },
    styles: {
      plot_0: {
        // Output name will be displayed in the Style window
        title: 'VWAP value',
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

    let lastXpup = 0;
    let lastXpdown = 0;

    this.main = function (context: any, inputCallback: any) {
      this._context = context;
      this._input = inputCallback;

      this._context.select_sym(1);

      // RSI
      const src1 = this._context.new_var(PineJS.Std.close(this._context));
      const len = 9;
      const change = PineJS.Std.change(src1, context);
      const max = this._context.new_var(PineJS.Std.max(change, 0));
      const min = this._context.new_var(-PineJS.Std.min(change, 0));
      const up1 = PineJS.Std.rma(this._context.new_var(max), len, context);
      const down1 = PineJS.Std.rma(this._context.new_var(min), len, context);

      const rsiElse = up1 === 0 ? 0 : 100 - 100 / (1 + up1 / down1);
      const rsi = down1 === 0 ? 100 : rsiElse;

      // HMA source for CMO
      const n = 12;
      const n2ma =
        2 *
        PineJS.Std.wma(
          this._context.new_var(PineJS.Std.close(this._context)),
          PineJS.Std.round(n / 2),
          context
        );
      const nma = PineJS.Std.wma(
        this._context.new_var(PineJS.Std.close(this._context)),
        n,
        context
      );
      const diff = n2ma - nma;
      const sqn = PineJS.Std.round(PineJS.Std.sqrt(n));
      const c = 5;
      const n2ma6 =
        2 *
        PineJS.Std.wma(
          this._context.new_var(PineJS.Std.open(this._context)),
          PineJS.Std.round(c / 2),
          context
        );
      const nma6 = PineJS.Std.wma(
        this._context.new_var(PineJS.Std.open(this._context)),
        c,
        context
      );
      const diff6 = n2ma6 - nma6;
      const sqn6 = PineJS.Std.round(PineJS.Std.sqrt(c));
      const a1 = PineJS.Std.wma(this._context.new_var(diff6), sqn6, context);
      const a = PineJS.Std.wma(this._context.new_var(diff), sqn, context);

      // CMO
      const len2 = 1;
      const gains = PineJS.Std.sum(
        this._context.new_var(a1 > a),
        len2,
        context
      );
      const losses = PineJS.Std.sum(
        this._context.new_var(a1 < a),
        len2,
        context
      );
      const cmo = (100 * (gains - losses)) / (gains + losses);
      // Close Pivots
      const len5 = 2;
      const h = PineJS.Std.highest(this._context.new_var(len5), context);
      const h1 = PineJS.Std.dev(this._context.new_var(h), len5, context)
        ? PineJS.Std.na(this._context)
        : h;
      const hpivot = PineJS.Std.fixnan(this._context.new_var(h1), context);
      const l = PineJS.Std.lowest(this._context.new_var(len5), context);
      const l1 = PineJS.Std.dev(this._context.new_var(l), len5, context)
        ? PineJS.Std.na(this._context)
        : l;
      const lpivot = PineJS.Std.fixnan(this._context.new_var(l1), context);

      // Calc Values
      const sup = rsi < 25 && cmo > 50 && lpivot;
      const res = rsi > 75 && cmo < -50 && hpivot;
      const xup = sup ? PineJS.Std.low(this._context) : lastXpup;
      const xdown = res ? PineJS.Std.high(this._context) : lastXpdown;

      lastXpup = xup;
      lastXpdown = xdown;

      return [xup, xdown];
    };
  },
});

export default supportResistance;
