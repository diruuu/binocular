import logger from './logger';

function until(conditionFunction: () => boolean) {
  const poll = (resolve: any) => {
    if (conditionFunction()) resolve();
    else
      setTimeout((_) => {
        logger('REPOLLING...');
        poll(resolve);
      }, 400);
  };

  return new Promise(poll);
}

export default until;
