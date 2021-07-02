import React, { useCallback, useContext } from 'react';
import { useSelector } from '../../hooks';
import { selectBalanceByName } from '../../slices/account-slice';
import Text from '../text';
import styles from './styles.scss';
import {
  selectLastPrice,
  selectSymbolInfo,
} from '../../slices/symbol-info-slice';
import clearTrailingZero from '../../utils/clear-trailing-zero';
import useOrderForm from './hooks/use-order-form';
import config from '../../config';
import {
  selectStopLossAtrRatio,
  selectTakeProfitAtrRatio,
} from '../../slices/settings-slice';
import useValidateForm from './hooks/use-validate-form';
import useUpdateStopLossTakeProfit from './hooks/use-update-stop-loss-take-profit';
import lang from '../../utils/lang';
import useDialog from '../../hooks/use-dialog';

function OrderForm() {
  const symbolInfo = useSelector(selectSymbolInfo);
  const stopLossAtrRatio = useSelector(selectStopLossAtrRatio);
  const takeProfitAtrRatio = useSelector(selectTakeProfitAtrRatio);
  const lastPrice = useSelector(selectLastPrice);
  const dialog = useDialog();
  const defaultPair = config.getDefaultPair();
  const symbol = symbolInfo?.symbol || defaultPair;
  const {
    getters: orderFormGetters,
    setters: orderFormSetters,
    createOrder,
    isSending,
  } = useOrderForm(symbol);
  const amount = parseFloat(orderFormGetters.amount);
  const quantity = amount / lastPrice;
  const balance = useSelector(selectBalanceByName(symbolInfo?.quoteAsset));
  const baseAssetBalance = useSelector(
    selectBalanceByName(symbolInfo?.baseAsset)
  );
  const stopLossAmount = orderFormGetters.stopLoss * quantity;
  const takeProfitAmount = orderFormGetters.takeProfit * quantity;
  const loss = stopLossAmount - amount;
  const profit = takeProfitAmount - amount;
  const lossString: string | undefined =
    !!loss && !Number.isNaN(loss)
      ? clearTrailingZero(loss.toFixed(2))
      : undefined;
  const profitString: string | undefined =
    !!profit && !Number.isNaN(profit)
      ? clearTrailingZero(profit.toFixed(2))
      : undefined;

  const createOrderConfirmation = () => {
    dialog?.openModal({
      title: 'Place Order',
      confirmLabel: 'Proceed',
      onConfirm: (onClose) => {
        createOrder();
        onClose();
      },
      children: (
        <Text bigger>
          Are you sure want to place an order to buy {symbol} at market price
          with {amount} {symbolInfo?.quoteAsset}?
        </Text>
      ),
    });
  };

  const setAmountByPercentage = useCallback(
    (percent: number) => {
      if (balance) {
        const balanceFloat = parseFloat(balance);
        const result = percent * balanceFloat;
        const noZero = clearTrailingZero(result.toFixed(2));
        orderFormSetters.amount(noZero);
      }
    },
    [balance]
  );

  useUpdateStopLossTakeProfit();

  const { isValid } = useValidateForm({ orderFormGetters });

  return (
    <>
      <div className={styles.title}>
        <Text>
          {parseFloat(baseAssetBalance).toFixed(2)} {symbolInfo?.baseAsset}
        </Text>
        <Text>
          {parseFloat(balance).toFixed(2)} {symbolInfo?.quoteAsset}
        </Text>
      </div>
      <div className={styles.amountForm}>
        <input
          type="number"
          className={styles.amountInput}
          value={orderFormGetters.amount}
          onChange={(event) => orderFormSetters.amount(event.target.value)}
        />
        <button
          type="button"
          className={styles.amountButton}
          onClick={() => setAmountByPercentage(0.25)}
        >
          25%
        </button>
        <button
          type="button"
          className={styles.amountButton}
          onClick={() => setAmountByPercentage(0.5)}
        >
          50%
        </button>
        <button
          type="button"
          className={styles.amountButton}
          onClick={() => setAmountByPercentage(0.75)}
        >
          75%
        </button>
        <button
          type="button"
          className={styles.amountButton}
          onClick={() => setAmountByPercentage(1)}
        >
          100%
        </button>
      </div>
      <div className={styles.stopLossWrapper}>
        <div className={styles.stopLossGrid}>
          <div className={styles.stopLossTitle}>
            <Text>Stop Loss</Text>
            <Text className={styles.lossString}>
              {lossString && `(${lossString} ${symbolInfo?.quoteAsset})`}
            </Text>
          </div>
          <div>
            <input
              type="number"
              className={styles.stopLossInput}
              value={orderFormGetters.stopLoss}
              onChange={(event) =>
                orderFormSetters.stopLoss(event.target.value)
              }
              onFocus={() => orderFormSetters.stopLossFocused(true)}
              onBlur={() => orderFormSetters.stopLossFocused(false)}
              disabled={orderFormGetters.stopLossUseATR}
            />
          </div>
          <div className={styles.stopLossCheckboxWrapper}>
            <input
              type="checkbox"
              className={styles.stopLossCheckbox}
              checked={orderFormGetters.stopLossUseATR}
              onChange={() =>
                orderFormSetters.stopLossUseATR(
                  !orderFormGetters.stopLossUseATR
                )
              }
            />
            <Text>Use ATR ({stopLossAtrRatio}x)</Text>
          </div>
        </div>
        <div className={styles.stopLossGrid}>
          <div className={styles.stopLossTitle}>
            <Text>Take Profit</Text>
            <Text className={styles.profitString}>
              {profitString && `(+${profitString}  ${symbolInfo?.quoteAsset})`}
            </Text>
          </div>
          <div>
            <input
              type="number"
              className={styles.stopLossInput}
              value={orderFormGetters.takeProfit}
              onChange={(event) =>
                orderFormSetters.takeProfit(event.target.value)
              }
              disabled={orderFormGetters.takeProfitUseATR}
              onFocus={() => orderFormSetters.takeProfitFocused(true)}
              onBlur={() => orderFormSetters.takeProfitFocused(false)}
            />
          </div>
          <div className={styles.stopLossCheckboxWrapper}>
            <input
              type="checkbox"
              className={styles.stopLossCheckbox}
              checked={orderFormGetters.takeProfitUseATR}
              onChange={() =>
                orderFormSetters.takeProfitUseATR(
                  !orderFormGetters.takeProfitUseATR
                )
              }
            />
            <Text>Use ATR ({takeProfitAtrRatio}x)</Text>
          </div>
        </div>
      </div>
      <div className={styles.submitButtonWrapper}>
        <button
          type="button"
          disabled={!isValid}
          className={styles.submitButton}
          onClick={createOrderConfirmation}
        >
          <Text color="inherit">
            {isSending
              ? lang('PLACING_ORDER_LABEL', '...')
              : lang('PLACE_ORDER_LABEL')}{' '}
          </Text>
        </button>
      </div>
    </>
  );
}

export default OrderForm;
