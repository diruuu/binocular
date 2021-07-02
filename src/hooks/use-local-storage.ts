import { useRef, useState } from 'react';
import logger from '../utils/logger';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, React.MutableRefObject<T>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      logger(error);
      return initialValue;
    }
  });
  const valueRef = useRef<T>(storedValue);
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      // Save reference
      valueRef.current = value;
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // A more advanced implementation would handle the error case
      logger(error);
    }
  };
  return [storedValue, setValue, valueRef];
}

export default useLocalStorage;
