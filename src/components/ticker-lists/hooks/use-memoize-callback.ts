import { useRef } from 'react';
import lang from '../../../utils/lang';

function useMemoizeCallback() {
  const callbackRef = useRef<Map<string, () => void>>(new Map());
  const addNewCallback = (name: string, callback: () => void) => {
    const callbackMap = callbackRef.current;
    if (callbackMap.has(name)) {
      return;
    }
    callbackMap.set(name, callback);
  };

  const getCallback = (name: string) => {
    const callbackMap = callbackRef.current;
    if (callbackMap.has(name)) {
      return callbackMap.get(name);
    }
    throw new Error(lang('CALLBACK_NOT_FOUND'));
  };

  return { addNewCallback, getCallback };
}

export default useMemoizeCallback;
