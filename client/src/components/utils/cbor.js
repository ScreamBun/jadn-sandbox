/* CBOR Utils */
export const cbor2escaped = c => {
  c = c.replace(/\s/g, '');
  if (!c.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('cannot convert, not valid hexidecimal');
  } else if (c.length % 2 === 1) {
    throw new Error('cannot convert, not valid length');
  }
  c = c.match(/.{1,2}/g);

	return c.map(si => {
	  const ci = parseInt(si, 16);
	  return ci > 128 ? `\\x${si}` : String.fromCharCode(ci);
	}).join('').replace(/^\s+/, '');
};

export const escaped2cbor = e => {
  const tmp_e = e.replace(/\s/g, '');
  if (tmp_e.match(/^[0-9a-fA-F]+$/)) {
    throw new Error('cannot convert hexidecimal to hexidecimal');
  }

	return e.split(/\\x/g).map((bi, i) => {
	  const tmp = [bi.substr(0, 2)];
	  return tmp.concat(bi.substr(2).split('').map((s) => s.charCodeAt(0).toString(16))).join(' ');
	}).join(' ').replace(/^\s+/, '');
};

export const hexify = (str) => {
	let rtnStr = '';
	str = str.toString();

	for (const i in str) {
		const code = str.charCodeAt(i);
		const char = str.charAt(i);
		rtnStr += ((code > 128) ? `\\x${code.toString(16)}` : char);
	}
	return rtnStr;
};
