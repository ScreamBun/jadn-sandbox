/*
Custom Utility Function File
*/

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
	if ($("#"+id).hasClass('format')) {
		return
	}
	$("#"+id).removeClass('minify')
	
	data = $("#"+id).val() || $("#"+id).text()
	
	if (id == "message") {
		type = $("#message-format").val()
		switch (type) {
			case "cbor":
				c = bytes2cbor(data)
				$("#"+id).text(c).val(c)
				break
			case "json":
				try {	
					j = JSON.stringify($.parseJSON(data), null, s)
					$("#"+id).text(j).val(j)
				} catch(e) {
					msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid: " + e.message
					alertMsg("#alert-container", msg)
				}
			break;
			default:
				msg = id.charAt(0).toUpperCase() + id.slice(1) + " Error, cannot minify " + type + " message"
				alertMsg("#alert-container", msg)
		}
	} else if (id == "schema") {
		try {
			j = JSON.stringify($.parseJSON(data), null, 0)
			$("#"+id).text(j).val(j)
		} catch (e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
			alertMsg("#alert-container", msg)		
		}
	}
	$("#"+id).addClass('minify')
}

function minify(id) {
	if ($("#"+id).hasClass('minify')) {
		return
	}
	$("#"+id).removeClass('format')
		
	data = $("#"+id).val() || $("#"+id).text()
	
	if (id == "message") {
		type = $("#message-format").val()
		switch (type) {
			case "cbor":
				c = cbor2bytes(data)
				$("#"+id).text(c).val(c)
				break
			case "json":
				try {
					j = JSON.stringify($.parseJSON(data), null, 0)
					$("#"+id).text(j).val(j)
				} catch (e) {
					msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
					alertMsg("#alert-container", msg)		
				}
			break;
			default:
				msg = id.charAt(0).toUpperCase() + id.slice(1) + " Error, cannot minify " + type + " message"
				alertMsg("#alert-container", msg)
		}
	} else if (id == "schema") {
		try {
			j = JSON.stringify($.parseJSON(data), null, 0)
			$("#"+id).text(j).val(j)
		} catch (e) {
			msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
			alertMsg("#alert-container", msg)		
		}
	}
	$("#"+id).addClass('minify')
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
	console.log(c)
	return c
}