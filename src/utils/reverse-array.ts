function reverseArray<T>(arr: T[]) {
  return ([] as T[]).concat(arr).reverse();
}

export default reverseArray;
