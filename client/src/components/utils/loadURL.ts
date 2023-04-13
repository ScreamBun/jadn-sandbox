/* eslint compat/compat: 0 */

/* Async load of a file from a generic url */
const readAllChunks = (stream: ReadableStream<Uint8Array> | null): Promise<Array<Uint8Array | undefined>> => {
  if (stream) {
    const reader = stream.getReader();
    const chunks: Array<Uint8Array | undefined> = [];

    const pump = (): Promise<Array<Uint8Array | undefined>> => {
      return reader.read().then<Array<Uint8Array | undefined>>(({ value, done }) => {
        if (done) {
          return chunks;
        }
        chunks.push(value);
        return pump();
      });
    };
    return pump();
  }
  return new Promise((resolve, reject) => {
    reject(new Error('FAIL!'));
  });
};

const chunk2str = (chunks: Array<Uint8Array | undefined>) => {
  if (chunks && chunks.length === 1) {
    const rtnArr = Array.from(chunks[0]);
    return rtnArr.map(c => c > 128 ? `\\x${c.toString(16)}` : String.fromCharCode(c)).join('');
  }
  return '';
};

export const validURL = (url: string) => url.match(/^(https?:\/\/)?(www\.)?[0-9a-z]+([-.]{1}[0-9a-z]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/);


export const loadURL = (url: string) => {
  if (!validURL(url)) {
    return new Promise((resolve, reject) => {
      reject(new Error('invalid url'));
    });
  }

  const rtnArr = {
    data: {},
    file: url.substring(url.lastIndexOf('/') + 1),
    fileExt: '',
    fileName: ''
  };
  rtnArr.fileName = rtnArr.file.substring(0, rtnArr.file.lastIndexOf('.'));
  rtnArr.fileExt = rtnArr.file.substring(rtnArr.file.lastIndexOf('.') + 1);

  const jsonParser = (key: string, val: any) => {
    return typeof (val) === 'string' ? val.replace(/\\/g, '\\\\') : val;
  };

  return fetch(url).then(
    rsp => {
      switch (rtnArr.fileExt) {
        case 'jadn':
        case 'json':
          console.log('JADN/JSON');
          try {
            const tmp = rsp.text().then(txt => JSON.parse(txt, jsonParser));
            console.log(tmp);
            return tmp;
          } catch (err) {
            return {
              error: (err as Error).message
            };
          }
        case 'cbor':
          console.log('CBOR');
          return readAllChunks(rsp.body).then(chunks => chunk2str(chunks));
        case 'xml':
          console.log('XML');
          return rsp.text();
        default:
          console.log('UNKNOWN');
          return rsp.blob();
      }
    }).then(rsp => {
      console.log(rsp);
      rtnArr.data = rsp;
      return rtnArr;
    }).catch((err) => {
      console.log('failed to load ', url, err.stack);
      rtnArr.data = {
        error: 'cannot load url'
      };
      return rtnArr;
    });
};