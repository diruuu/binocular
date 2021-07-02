import texts from '../config/texts';

function lang<T>(string: string, ...params: any) {
  const text: T = (texts as any)[string] as T;
  if (!text) {
    return string;
  }
  const result: string = params.reduce(
    (acc: string, param: string, index: number) => {
      return acc.replace(`$${index + 1}`, param);
    },
    text
  );

  return result;
}

export default lang;
