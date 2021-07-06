import BinanceRest from '../../services/binance-rest';
import { AppThunk } from '../../store';
import { IBinanceListenKey } from '../../types';
import lang from '../../utils/lang';
import logger from '../../utils/logger';
import { populateAccountInfo, setListenKey } from '../account-slice';
import { selectCredential } from '../settings-slice';
import { appendSnackbar } from '../snackbar-slice';

export const getListenKey = (): AppThunk => async (dispatch, getState) => {
  try {
    const states = getState();
    const credentials = selectCredential(states);
    if (!credentials) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const result: IBinanceListenKey = await BinanceRest.instance.getListenKey(
      credentials
    );
    dispatch(setListenKey(result?.listenKey));
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: error.message,
        variant: 'error',
      })
    );
  }
};

export const getAccountBalance = (
  onReceivedInfo?: () => void
): AppThunk => async (dispatch, getState) => {
  try {
    const states = getState();
    const credentials = selectCredential(states);
    if (!credentials) {
      throw new Error(lang('NO_CREDENTIAL_FOUND'));
    }
    const accountInfo = await BinanceRest.instance.getAccountInfo(credentials);
    dispatch(
      populateAccountInfo({
        balances: accountInfo.balances,
        accountType: accountInfo.accountType,
        canTrade: accountInfo.canTrade,
        permissions: accountInfo.permissions,
        makerCommission: accountInfo.makerCommission,
      })
    );
    if (onReceivedInfo) {
      onReceivedInfo();
    }
  } catch (error) {
    logger(error);
    dispatch(
      appendSnackbar({
        message: error.message,
        variant: 'error',
      })
    );
  }
};
