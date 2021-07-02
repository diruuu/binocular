import { useState } from 'react';

function useErrorState<T>(
  defaultValue: T
): [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  string,
  React.Dispatch<React.SetStateAction<string>>
] {
  const [value, setValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState('');
  return [value, setValue, errorMessage, setErrorMessage];
}

export default useErrorState;
