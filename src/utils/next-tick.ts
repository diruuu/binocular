function nextTick(ms = 0): Promise<true> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      resolve(true);
    }, ms);
  });
}

export default nextTick;
