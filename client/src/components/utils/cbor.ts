/* CBOR Utils */

export const cbor2escaped = (c: string): string => {
  const tmpC = c.replace(/\s/g, '');
  if (!tmpC.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('cannot convert, not valid hexidecimal');
  } else if (tmpC.length % 2 === 1) {
    throw new Error('cannot convert, not valid length');
  }
  const pairs = tmpC.match(/.{1,2}/g);
	if (pairs) {
		return pairs.map(si => {
			const ci = parseInt(si, 16);
			return ci > 128 ? `\\x${si}` : String.fromCharCode(ci);
		}).join('').replace(/^\s+/, '');
	}
	return '';
};

export const escaped2cbor = (e: string): string => {
  const tmpE = e.replace(/\s/g, '');
  if (tmpE.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('cannot convert hexidecimal to hexidecimal');
  }

	return e.split(/\\x/g).map(bi => {
		const tmp = [bi.substring(0, 2)];
		return tmp.concat(bi.substring(2).split('').map((s) => s.charCodeAt(0).toString(16))).join(' ');
	}).join(' ').replace(/^\s+/, '');
};

export const hexify = (str: string): string => {
	return str.split('').map((char, i) => {
		const code = str.charCodeAt(i);
		return (code > 128) ? `\\x${code.toString(16)}` : char;
	}).join('');
};
