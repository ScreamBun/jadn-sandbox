/*
Custom Utility Function File
*/

/* https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format */
String.prototype.format = String.prototype.format || function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ? Array.prototype.slice.call(arguments) : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
}

var indent = 2,
	alert_id = 1,
	alert_levels = [
		'primary',
		'secondary',
		'light',
		'info',
		'success',
		'warning',
		'danger'
	]

regex_pun = "\\~\\`\\!\\@\\#\\$\\%\\^\\&\\*\\-\\_\\=\\+\\|\\;\\:\\'\\\"\\,\\<\\.\\>\\/\\?\\(\\)\\[\\]"
regex_str = "\\\"[\\w{pun}]+\\\",".format({pun: regex_pun})
regex_num = "\\d+,"
regex_br = "\\n\\s+"

function alertMsg(c, m, l=5, t=5000) {
	msg_id = "alert_"+alert_id
	alert_id++
			
    closeBtn = $("<button/>").addClass("close").attr("type", "button").attr("data-dismiss", "alert").attr("aria-label", "Close").append($("<span/>").attr("aria-hidden", "true").html("&times;"))
    $(c).append($("<div/>").addClass("alert alert-"+alert_levels[l]).attr("role", "alert").attr("id", msg_id).text(m).append(closeBtn))

	setTimeout(function (m_id) {
		$("#"+m_id).alert('close')
	}, t, msg_id)
}

function format(id, s=indent) {	
	$("#"+id).removeClass('minify')
	data = $("#"+id).val() || $("#"+id).text()
	
	if (id == "message") {
		if ($("#"+id).hasClass('format')) {
			return
		}
		type = ($("#message-format").val() || $("#message-format").text()).toLowerCase()
		try {
			switch (type) {
				case "cbor":
					c = bytes2cbor(data)
					$("#"+id).text(c).val(c)
					break
				case "json":
					j = vkbeautify.json(data, ' '.repeat(indent))
					$("#"+id).text(j).val(j)
					break
				case "xml":
					x = vkbeautify.xml(data, ' '.repeat(indent))
					$("#"+id).text(x).val(x)
					break
				default:
					msg = id.charAt(0).toUpperCase() + id.slice(1) + " Error, cannot format " + type + " message"
					alertMsg("#alert-container", msg)
			}
		} catch(e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Error, cannot format: " + e.message
			alertMsg("#alert-container", msg)
		}
	} else if (id == "schema") {
		console.log()
		try {
			j = formatJADN(data)
			$("#"+id).text(j).val(j)
		} catch (e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot format: " + e.message
			alertMsg("#alert-container", msg)		
		}
	}
	$("#"+id).addClass('format')
}

function minify(id) {	
	$("#"+id).removeClass('format')
	data = $("#"+id).val() || $("#"+id).text()
	
	if (id == "message") {
		if ($("#"+id).hasClass('minify')) {
			return
		}
		type = ($("#message-format").val() || $("#message-format").text()).toLowerCase()
		try {
			switch (type) {
				case "cbor":
					c = cbor2bytes(data)
					$("#"+id).text(c).val(c)
					break
				case "json":
					j = vkbeautify.jsonmin(data)
					$("#"+id).text(j).val(j)
				break
				case "xml":
					x = vkbeautify.xmlmin(data, true)
					$("#"+id).text(x).val(x)
					break
				default:
					msg = id.charAt(0).toUpperCase() + id.slice(1) + " Error, cannot minify " + type + " message"
					alertMsg("#alert-container", msg)
			}
		} catch (e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
			alertMsg("#alert-container", msg)		
		}
	} else if (id == "schema") {
		try {
			j = vkbeautify.jsonmin(data)
			$("#"+id).text(j).val(j)
		} catch (e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
			alertMsg("#alert-container", msg)		
		}
	}
	$("#"+id).addClass('minify')
}

function formatJADN(jadn) {
	idn = ' '.repeat(indent)
	jadn = JSON.parse(jadn)
	meta = "{idn}\"meta\": {\n{obj}\n{idn}}".format({idn: idn, obj: $.map(jadn.meta, function(val, key) {
		switch (typeof(val)){
			case 'object':
				obj = $.map(val, function(val1, key1) {
					if (typeof(val1) == 'object') {
						return '{idn}[\"{v}\"]'.format({idn: idn.repeat(3), v: val1.join('\", \"')})
					} else {
						return '{idn}\"{v}\"'.format({idn: idn.repeat(3), v: val1})
					}
				}).join(',\n')
				
				return '{idn}\"{k}\": [\n{v}\n{idn}]'.format({idn: idn.repeat(2), k: key, v: obj})
				break;
			default:
			return '{idn}\"{k}\": \"{v}\"'.format({idn: idn.repeat(2), k: key, v: val})		
		}
	}).join(',\n')})
	
	types = "[{obj}\n{idn}]".format({idn: idn, obj: $.map(jadn.types, function(type) {
		header = $.map(type.slice(0, -1), function(itm) {
			switch (typeof(itm)) {
				case "object":
					return "[{obj}]".format({obj: $.map(itm, function(i) { return "\"{itm}\"".format({itm: i.replace(/\"/g, "\\\"")}) }).join(', ')})
				default:
					return "\"{itm}\"".format({itm: itm})
			}
		}).join(", ")
		
		defs = $.map(type.slice(-1), function(def) {
			switch (typeof(def)) {
				case "object":
					return $.map(def, function(itm) {
						switch (typeof(itm)) {
							case "object":
								return "{idn}{idn}{idn}[{obj}]".format({idn: idn, obj: $.map(itm, function(itm1) {
									switch (typeof(itm1)) {
										case "object":
											return "[{obj}]".format({obj: $.map(itm1, function(i) {
												switch (typeof(i)) {
													case 'string':
														return "\"{itm}\"".format({itm: i.replace(/\"/g, "\\\"")})
													default:
														return i
												}
											}).join(', ')})
										case "string":
											return "\"{itm}\"".format({itm: itm1.replace(/\"/g, "\\\"")})
										default:
											return itm1
									}
								}).join(", ")})
							case "string":
								return "\"{itm}\"".format({idn: idn, itm: itm.replace(/\"/g, "\\\"")})
							default:
								return itm
						}
					}).join(",\n")
				default:
					return "\"{itm}\"".format({itm: def})
			}
		}).join(",\n")
		if (defs.match(/^\s+\[/)) {
			defs = "[\n{defs}\n{idn}{idn}]".format({idn: idn, defs: defs})
		}
		
		return "\n{idn}{idn}[{header}, {defs}]".format({idn: idn, header: header, defs: defs})
	}).join(", ".format({idn: idn}))})
	
	return "{\n{meta},\n{idn}\"types\": {types}\n}".format({idn: idn, meta: meta, types: types})
}

/*
 * General Util Functions
 */
function cbor2bytes(c) {
	s = ''
	spl = c.split(/\\x/g)
	for (i=0; i<spl.length; i++) {
		s+= spl[i].substr(0, 2)
		r = spl[i].substr(2)
		for (c=0; c<r.length; c++) {
			s += r.charCodeAt(c).toString(16)
		}
	}	
	return s
}

function bytes2cbor(b) {
	c = ''
	hb = b.match(/.{1,2}/g)
	for (i=0; i<hb.length; i++) {
		ci = parseInt(hb[i], 16)
		cs = String.fromCharCode(ci)
		c += ci > 128 ? "\\x"+hb[i] : cs
	}
	return c
}