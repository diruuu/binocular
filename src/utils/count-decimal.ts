function countDecimals(string: string): number {
  const split = string.split('.');
  if (!split.length || split.length < 2) {
    return 0;
  }
  return split[1].length || 0;
}

export default countDecimals;
