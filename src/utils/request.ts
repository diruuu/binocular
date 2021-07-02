import axios from 'axios';
import https from 'https';
import queryString from 'query-string';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import { APICredentialInfo } from '../types';
import RequestTypes from '../enum/request-types';

const generateSignature = (params: string, apiSecret: string): string => {
  const hmac = hmacSHA256(params, apiSecret);
  return hmac.toString();
};

interface RequestOptions {
  apiCredentials?: APICredentialInfo;
  includePremadeDataInBody?: boolean;
}

const request = async <T>(
  requestType: RequestTypes,
  url: string,
  data: { [key: string]: any } = {},
  options: RequestOptions = {}
): Promise<T> => {
  try {
    const isSigned: boolean =
      Boolean(options?.apiCredentials?.api_key) &&
      Boolean(options?.apiCredentials?.secret_key);

    const timestamp = new Date().getTime();
    const paramsString = queryString.stringify(
      {
        timestamp,
        ...data,
      },
      { sort: false }
    );

    let signature = '';
    if (options?.apiCredentials?.secret_key) {
      signature = generateSignature(
        paramsString,
        options?.apiCredentials.secret_key
      );
    }

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const body =
      isSigned && options?.includePremadeDataInBody
        ? {
            timestamp,
            ...data,
            signature,
          }
        : data;

    const stringBody = queryString.stringify(body, { sort: false });

    const headers = isSigned
      ? {
          'X-MBX-APIKEY': options?.apiCredentials?.api_key,
        }
      : {};

    if (requestType === RequestTypes.GET) {
      const result = await axios.get(url, {
        headers,
        params: body,
      });
      return result.data;
    }
    if (requestType === RequestTypes.POST) {
      const result = await axios.post(url, stringBody, {
        httpsAgent: agent,
        headers,
      });
      return result.data;
    }
    if (requestType === RequestTypes.DELETE) {
      const result = await axios.delete(url, {
        httpsAgent: agent,
        headers,
        params: body,
      });
      return result.data;
    }
    throw new Error('Request type is not supported.');
  } catch (error) {
    const errorMessage = error?.response?.data?.msg || error.message;
    throw new Error(errorMessage);
  }
};

export default request;
