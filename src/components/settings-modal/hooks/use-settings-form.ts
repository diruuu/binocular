import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from '../../../hooks';
import BinanceRest from '../../../services/binance-rest';
import {
  selectCredential,
  selectRESTApiBaseUrl,
  selectStopLossAtrRatio,
  selectTakeProfitAtrRatio,
  selectWebsocketBaseUrl,
  setCredential,
  setRestAPIBaseUrl as setRestAPIBaseUrlState,
  setWebsocketBaseUrl as setWebsocketBaseUrlState,
  setStopLossAtrRatio as setStopLossAtrRatioState,
  setTakeProfitAtrRatio as setTakeProfitAtrRatioState,
} from '../../../slices/settings-slice';
import lang from '../../../utils/lang';
import useErrorState from './use-error-state';
import { APICredentialInfo } from '../../../types';

function useSettingForm() {
  const dispatch = useDispatch();
  const errorFocusRef = useRef<string | null>(null);
  const credentials = useSelector(selectCredential);
  const restAPIBaseUrlState = useSelector(selectRESTApiBaseUrl);
  const websocketBaseUrlState = useSelector(selectWebsocketBaseUrl);
  const stopLossAtrRatioState = useSelector(selectStopLossAtrRatio);
  const takeProfitAtrRatioState = useSelector(selectTakeProfitAtrRatio);
  const [isValidating, setValidating] = useState(false);
  const [
    apiKey,
    setAPIKey,
    apiKeyErrorMessage,
    setAPIKeyErrorMessage,
  ] = useErrorState(credentials?.api_key || '');
  const [
    secretKey,
    setSecretKey,
    secretKeyErrorMessage,
    setSecretKeyErrorMessage,
  ] = useErrorState(credentials?.secret_key || '');
  const [
    stopLossRatio,
    setStopLossRatio,
    stopLossRatioErrorMessage,
    setStopLossRatioErrorMessage,
  ] = useErrorState<string>(stopLossAtrRatioState.toString() || '');
  const [
    takeProfitRatio,
    setTakeProfitRatio,
    takeProfitRatioErrorMessage,
    setTakeProfitRatioErrorMessage,
  ] = useErrorState<string>(takeProfitAtrRatioState.toString() || '');
  const [
    restAPIBaseUrl,
    setRestAPIBaseUrl,
    restAPIBaseUrlErrorMessage,
    setRestAPIBaseUrlErrorMessage,
  ] = useErrorState(restAPIBaseUrlState || '');
  const [
    websocketBaseUrl,
    setWebsocketBaseUrl,
    websocketBaseUrlErrorMessage,
    setWebsocketBaseUrlErrorMessage,
  ] = useErrorState(websocketBaseUrlState || '');

  const apiKeyInputRef = useRef(null);
  const secretKeyInputRef = useRef(null);
  const stopLossRatioInputRef = useRef(null);
  const takeProfitRatioInputRef = useRef(null);
  const restAPIBaseUrlInputRef = useRef(null);
  const websocketBaseUrlInputRef = useRef(null);

  const errors = {
    apiKey: apiKeyErrorMessage,
    secretKey: secretKeyErrorMessage,
    stopLossRatio: stopLossRatioErrorMessage,
    takeProfitRatio: takeProfitRatioErrorMessage,
    restAPIBaseUrl: restAPIBaseUrlErrorMessage,
    websocketBaseUrl: websocketBaseUrlErrorMessage,
  };

  const refs = {
    apiKey: apiKeyInputRef,
    secretKey: secretKeyInputRef,
    stopLossRatio: stopLossRatioInputRef,
    takeProfitRatio: takeProfitRatioInputRef,
    restAPIBaseUrl: restAPIBaseUrlInputRef,
    websocketBaseUrl: websocketBaseUrlInputRef,
  };

  const getters = {
    apiKey,
    secretKey,
    stopLossRatio,
    takeProfitRatio,
    restAPIBaseUrl,
    websocketBaseUrl,
  };

  const setErrorFocus = useCallback((focusKey) => {
    if (errorFocusRef.current) {
      return;
    }
    errorFocusRef.current = focusKey;
  }, []);

  const resetErrorFocus = useCallback(() => {
    errorFocusRef.current = null;
  }, []);

  const setters = {
    apiKey: setAPIKey,
    secretKey: setSecretKey,
    stopLossRatio: setStopLossRatio,
    takeProfitRatio: setTakeProfitRatio,
    restAPIBaseUrl: setRestAPIBaseUrl,
    websocketBaseUrl: setWebsocketBaseUrl,
  };

  const resetErrorMessage = () => {
    setAPIKeyErrorMessage('');
    setSecretKeyErrorMessage('');
  };

  interface IResult {
    credentials?: APICredentialInfo;
    stopLossRatio?: number;
    takeProfitRatio?: number;
    restAPIBaseUrl?: string;
    websocketBaseUrl?: string;
    errorCount: number;
  }

  const validateForm = async (): Promise<IResult> => {
    const result: IResult = {
      errorCount: 0,
    };
    setValidating(true);
    resetErrorMessage();
    resetErrorFocus();

    const setError = (key: string): void => {
      setErrorFocus(key);
      result.errorCount += 1;
    };

    const isApiKeyEmpty = !apiKey || apiKey === '';
    const isSecretKeyEmpty = !secretKey || secretKey === '';
    const isStopLossRatioEmpty = !stopLossRatio || stopLossRatio === '';
    const isTakeProfitRatioEmpty = !takeProfitRatio || takeProfitRatio === '';
    const isRestAPIBaseUrlEmpty = !restAPIBaseUrl || restAPIBaseUrl === '';
    const isWebsocketBaseUrlEmpty =
      !websocketBaseUrl || websocketBaseUrl === '';

    // Validate stop loss ratio
    if (isStopLossRatioEmpty) {
      setStopLossRatioErrorMessage(lang('STOP_LOSS_RATIO_CANNOT_BE_EMPTY'));
      setError('stopLossRatio');
    } else if (Number.isNaN(parseFloat(stopLossRatio))) {
      setStopLossRatioErrorMessage(lang('STOP_LOSS_RATIO_MUST_BE_NUMBER'));
      setError('stopLossRatio');
    } else {
      result.stopLossRatio = parseFloat(stopLossRatio);
    }

    // Validate take profit ratio
    if (isTakeProfitRatioEmpty) {
      setTakeProfitRatioErrorMessage(lang('TAKE_PROFIT_RATIO_CANNOT_BE_EMPTY'));
      setError('takeProfitRatio');
    } else if (Number.isNaN(parseFloat(takeProfitRatio))) {
      setStopLossRatioErrorMessage(lang('TAKE_PROFIT_RATIO_MUST_BE_NUMBER'));
      setError('takeProfitRatio');
    } else {
      result.takeProfitRatio = parseFloat(takeProfitRatio);
    }

    // Validate rest API Base Url
    if (isRestAPIBaseUrlEmpty) {
      setRestAPIBaseUrlErrorMessage(lang('REST_API_BASE_URL_CANNOT_BE_EMPTY'));
      setError('restAPIBaseUrl');
    } else {
      result.restAPIBaseUrl = restAPIBaseUrl;
    }

    // Validate websocket base Url
    if (isWebsocketBaseUrlEmpty) {
      setWebsocketBaseUrlErrorMessage(
        lang('WEBSOCKET_BASE_URL_CANNOT_BE_EMPTY')
      );
      setError('websocketBaseUrl');
    } else {
      result.websocketBaseUrl = websocketBaseUrl;
    }

    // Validate api key and secret
    try {
      if (isApiKeyEmpty && !isSecretKeyEmpty) {
        setAPIKeyErrorMessage(lang('API_KEY_CANNOT_BE_EMPTY'));
        setError('apiKey');
      } else if (isSecretKeyEmpty && !isApiKeyEmpty) {
        setSecretKeyErrorMessage(lang('SECRET_KEY_CANNOT_BE_EMPTY'));
        setError('secretKey');
      } else if (
        !isApiKeyEmpty &&
        !isSecretKeyEmpty &&
        (credentials?.api_key !== apiKey ||
          credentials.secret_key !== secretKey)
      ) {
        const credentialInput: APICredentialInfo = {
          api_key: apiKey,
          secret_key: secretKey,
        };
        await BinanceRest.instance.validateAPIKey(credentialInput);
        result.credentials = credentialInput;
      }
    } catch (error) {
      setAPIKeyErrorMessage(lang(error.message));
      setSecretKeyErrorMessage(lang(error.message));
      setError('apiKey');
    }

    // Finishing
    setValidating(false);
    // Focus to input
    if (errorFocusRef.current !== null) {
      const focusKey = errorFocusRef.current;
      const inputRef = refs[focusKey as 'secretKey'];
      if (inputRef && inputRef.current) {
        (inputRef.current as any)?.focus();
      }
    }

    return result;
  };

  const submitForm = async () => {
    const result = await validateForm();
    if (result.errorCount) {
      throw new Error(`FORM_VALIDATION_ERROR_${result.errorCount}`);
    }
    if (result.credentials) {
      dispatch(setCredential(result.credentials));
    }
    if (result.restAPIBaseUrl) {
      dispatch(setRestAPIBaseUrlState(result.restAPIBaseUrl));
    }
    if (result.websocketBaseUrl) {
      dispatch(setWebsocketBaseUrlState(result.websocketBaseUrl));
    }
    if (result.stopLossRatio) {
      dispatch(setStopLossAtrRatioState(result.stopLossRatio));
    }
    if (result.takeProfitRatio) {
      dispatch(setTakeProfitAtrRatioState(result.takeProfitRatio));
    }
  };

  return {
    getters,
    setters,
    errors,
    submitForm,
    isValidating,
    refs,
  };
}

export default useSettingForm;
