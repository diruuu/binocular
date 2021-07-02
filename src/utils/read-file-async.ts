import { readFile } from 'fs';

const readFileAsync = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, fileSetting) => {
      if (err) {
        return reject(err);
      }
      resolve(fileSetting);
    });
  });

export default readFileAsync;
