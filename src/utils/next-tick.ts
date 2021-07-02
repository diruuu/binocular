function nextTick(): Promise<true> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve(true);
    }, 0);
  });
}

export default nextTick;
