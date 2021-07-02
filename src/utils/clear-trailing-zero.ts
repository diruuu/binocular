function clearTrailingZero(value: string): string {
  return value?.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
}

export default clearTrailingZero;
