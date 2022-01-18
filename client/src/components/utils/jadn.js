import { cbor2escaped, escaped2cbor } from './cbor';

const srt_fmt = require('string-format');
const vkbeautify = require('vkbeautify');

const indent = 2;
const strFmt = srt_fmt.create({
  escape: s => s.replace(/(")/g, '\\$1'),
  upper: s => s.toUpperCase()
});

/* General Utils */
export const format = (msg, fmt, ind) => {
  ind = ind || 2;
  let rtnMsg = '';
  try {
    switch (fmt) {
      case 'cbor':
        rtnMsg = cbor2escaped(msg);
        break;
      case 'json':
        rtnMsg = vkbeautify.json(msg, ' '.repeat(ind));
        break;
      case 'xml':
        rtnMsg = vkbeautify.xml(msg, ' '.repeat(ind));
        break;
      default:
        rtnMsg = `Error, cannot format ${fmt} message`;
    }
  } catch (e) {
    rtnMsg = `Error, cannot format: ${e.message}`;
  }
  return rtnMsg;
};

export const minify = (msg, fmt) => {
  let rtnMsg = '';
  try {
    switch (fmt) {
      case 'cbor':
				rtnMsg = escaped2cbor(msg);
        break;
      case 'json':
				rtnMsg = vkbeautify.jsonmin(msg);
        break;
      case 'xml':
				rtnMsg = vkbeautify.xmlmin(msg);
        break;
      default:
				rtnMsg = `Error, cannot minify ${fmt} message`;
    }
  } catch (e) {
		rtnMsg = `Error, cannot minify: ${e.message}`;
  }
  return rtnMsg;
};

/* Schema Utils */
export const FormatJADN = (jadn) => {
	const idn = ' '.repeat(indent);
	if (typeof(jadn) === 'string') {
	  jadn = JSON.parse(jadn);
	}

	const meta = strFmt('{idn}"meta": {\n{obj}\n{idn}}', {
		idn,
		obj: $.map(jadn ? jadn.meta : {}, (val, key) => {
			switch (typeof(val)) {
				case 'object':
					const obj = val.map((val1, key1) => {
						if (typeof(val1) === 'object') {
							return strFmt('{idn}["{v}"]', {idn: idn.repeat(3), v: val1.join('", "')});
						}
						return strFmt('{idn}"{v}"', {idn: idn.repeat(3), v: val1});
					}).join(',\n');
					return strFmt('{idn}"{k}": [\n{v}\n{idn}]', {idn: idn.repeat(2), k: key, v: obj});
				default:
					return strFmt('{idn}"{k}": "{v}"', {idn: idn.repeat(2), k: key, v: val});
			}
		}).join(',\n')
	});

	const types = strFmt('[{obj}\n{idn}]', {
		idn,
		obj: $.map(jadn ? jadn.types : [], type => {
			const header = type.slice(0, -1).map(itm => {
				switch (typeof(itm)) {
					case 'object':
						return strFmt('[{obj}]', {obj: itm.map(i => strFmt('"{itm!escape}"', {itm: i})).join(', ')});
					default:
						return strFmt('"{itm}"', { itm });
				}
			}).join(', ');

			let defs = type.slice(-1).map((def) => {
				switch (typeof(def)) {
					case 'object':
						return def.map((itm) => {
							switch (typeof(itm)) {
								case 'object':
									return strFmt('{idn}{idn}{idn}[{obj}]', {idn, obj: itm.map(itm1 => {
										switch (typeof(itm1)) {
											case 'object':
												return strFmt('[{obj}]', {obj: itm1.map(i => {
													switch (typeof(i)) {
														case 'string':
															return strFmt('"{itm!escape}"', {itm: i});
														default:
															return i;
													}
												}).join(', ')});
											case 'string':
												return strFmt('"{itm!escape}"', {itm: itm1});
											default:
												return itm1;
										}
									}).join(', ')});
								case 'string':
									return strFmt('"{itm!escape}"', {idn, itm});
								default:
									return itm;
							}
						}).join(',\n');
					default:
						return strFmt('"{itm}"', {itm: def});
				}
			}).join(',\n');
			if (defs.match(/^\s+\[/)) {
				defs = strFmt('[\n{defs}\n{idn}{idn}]', {idn, defs});
			}
			return strFmt('\n{idn}{idn}[{header}, {defs}]', {idn, header, defs});
		}).join(', ')
	});
	return strFmt('{\n{meta},\n{idn}"types": {types}\n}', {idn, meta, types});
};

/* Message Utils */