const connectionDetection = (callback: (isOnline: boolean) => void) => {
  function updateOnlineStatus() {
    callback(navigator.onLine);
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  updateOnlineStatus();
};

export default connectionDetection;
