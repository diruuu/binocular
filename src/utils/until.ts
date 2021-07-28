import lang from './lang';
import logger from './logger';

function until(name: string, conditionFunction: () => boolean) {
  let retry = 0;
  const poll = (resolve: any) => {
    if (conditionFunction()) {
      resolve();
    } else if (retry < 10) {
      setTimeout((_) => {
        logger('REPOLLING', name, retry);
        poll(resolve);
        retry += 1;
      }, 400);
    } else {
      console.error(lang('RETRY_LIMIT_EXCEEEDED'), retry);
    }
  };

  return new Promise(poll);
}

export default until;
