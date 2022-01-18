export const setMultiKey = (a, k, v) => {
  const keys = k.replace(/\[\]$/, '').split('.');

	if (keys.length > 1) {
	  if (!Object.hasOwnProperty(a, keys[0])) {
			a[keys[0]] = {};
		}
		setMultiKey(a[keys[0]], keys.slice(1).join('.'), v);
	} else {
	  a[k] = v;
	}
};

export const getMultiKey = (a, k) => {
  const keys = k.replace(/\[\]$/, '').split('.');
	if (keys.length > 1) {
  	return Object.hasOwnProperty(a, keys[0]) ? getMultiKey(a[keys[0]], keys.slice(1).join('.')) : '';
	}
	return Object.hasOwnProperty(a, k) ? a[k] : '';
};

export const delMultiKey = (a, k) => {
	const keys = k.replace(/\[\]$/, '').split('.');

	if (keys.length > 1) {
		delMultiKey(a[keys[0]], keys.slice(1).join('.'), null);
	} else if (a && Object.hasOwnProperty(a, keys[0])) {
	  delete a[keys[0]];
	}
};