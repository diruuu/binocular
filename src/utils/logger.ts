import config from '../config';
import isDev from './is-dev';

function logger(...logs: any) {
  const isOnDev = isDev();
  if (isOnDev && config.showLog) {
    console.log(...logs);
  }
}

export default logger;
