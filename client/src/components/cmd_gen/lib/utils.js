const indent = 2;
const format = require('string-format')

const fmt = format.create({
  escape: s => s.replace(/(\")/g, "\\\$1"),
  upper: s => s.toUpperCase(),
})

export const FormatJADN = (jadn) => {
	let idn = ' '.repeat(indent)
	if ($.type(jadn) == 'string') {
	    jadn = JSON.parse(jadn)
	}

	let meta = fmt('{idn}\"meta\": {\n{obj}\n{idn}}', {idn: idn, obj: $.map(jadn ? jadn.meta : {}, function(val, key) {
		switch (typeof(val)){
			case 'object':
				let obj = val.map((val1, key1) => {
					if (typeof(val1) == 'object') {
						return fmt('{idn}[\"{v}\"]', {idn: idn.repeat(3), v: val1.join('\", \"')})
					} else {
						return fmt('{idn}\"{v}\"', {idn: idn.repeat(3), v: val1})
					}
				}).join(',\n')

				return fmt('{idn}\"{k}\": [\n{v}\n{idn}]', {idn: idn.repeat(2), k: key, v: obj})
				break;
			default:
			return fmt('{idn}\"{k}\": \"{v}\"', {idn: idn.repeat(2), k: key, v: val})
		}
	}).join(',\n')})

	let types = fmt('[{obj}\n{idn}]', {idn: idn, obj: $.map(jadn ? jadn.types : [], function(type) {
		let header = type.slice(0, -1).map((itm) => {
			switch (typeof(itm)) {
				case "object":
					return fmt('[{obj}]', {obj: itm.map((i) => { return fmt('\"{itm!escape}\"', {itm: i}) }).join(', ')})
				default:
					return fmt('\"{itm}\"', {itm: itm})
			}
		}).join(", ")

		let defs = type.slice(-1).map((def) => {
			switch (typeof(def)) {
				case "object":
					return def.map((itm) => {
						switch (typeof(itm)) {
							case "object":
								return fmt('{idn}{idn}{idn}[{obj}]', {idn: idn, obj: itm.map((itm1) => {
									switch (typeof(itm1)) {
										case "object":
											return fmt('[{obj}]', {obj: itm1.map((i) => {
												switch (typeof(i)) {
													case 'string':
														return fmt('\"{itm!escape}\"', {itm: i})
													default:
														return i
												}
											}).join(', ')})
										case "string":
											return fmt('\"{itm!escape}\"', {itm: itm1})
										default:
											return itm1
									}
								}).join(", ")})
							case "string":
								return fmt('\"{itm!escape}\"', {idn: idn, itm: itm})
							default:
								return itm
						}
					}).join(",\n")
				default:
					return fmt('\"{itm}\"', {itm: def})
			}
		}).join(",\n")
		if (defs.match(/^\s+\[/)) {
			defs = fmt('[\n{defs}\n{idn}{idn}]', {idn: idn, defs: defs})
		}

		return fmt('\n{idn}{idn}[{header}, {defs}]', {idn: idn, header: header, defs: defs})
	}).join(", ")})

	return fmt('{\n{meta},\n{idn}\"types\": {types}\n}', {idn: idn, meta: meta, types: types})
}

export const isOptional = (def) => {
    switch (def.length) {
        case 5:
            return def[3].indexOf('[0') >= 0
		case 4:
		    return def[2].indexOf('[0') >= 0
		default:
		    this.alertFun('default optional - ' + def[0] + ' - ' + def[1]);
			return false;
	}
}

export const setMultiKey = (a, k, v) => {
    k = k.replace(/\[\]$/, '')
	let keys = k.split('.')

	if (keys.length > 1) {
	    if (!a.hasOwnProperty(keys[0])) {
			a[keys[0]] = {}
		}
		setMultiKey(a[keys[0]], keys.slice(1).join('.'), v)
	} else {
	    a[k] = v
	}
}

export const getMultiKey = (a, k) => {
    k = k.replace(/\[\]$/, '')
    let keys = k.split('.')

    return keys.length > 1 ? (a.hasOwnProperty(keys[0]) ? getMultiKey(a[keys[0]], keys.slice(1).join('.')) : '') : (a.hasOwnProperty(k) ? a[k] : '')
}

export const delMultiKey = (a, k) => {
    k = k.replace(/\[\]$/, '')
	let keys = k.split('.')

	if (keys.length > 1) {
		delMultiKey(a[keys[0]], keys.slice(1).join('.'), v)
	} else {
	    delete a[k]
	}
}