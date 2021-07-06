function toFixedExactly(num: string, fixed: number): string {
  const re = new RegExp(`^-?\\d+(?:.\\d{0,${fixed || -1}})?`);
  const match = num.match(re);
  return match && !!match.length ? match[0] : parseFloat(num).toFixed(fixed);
}

export default toFixedExactly;
