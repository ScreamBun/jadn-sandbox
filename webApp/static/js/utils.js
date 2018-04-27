/*
Custom Utility Function File
*/

var alert_id = 1,
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

function formatJson(id, s=4) {
	try {
		data = $("#"+id).val() || $("#"+id).text()
		j = JSON.stringify($.parseJSON(data), null, s)
		$("#"+id).text(j)
		$("#"+id).val(j)
  	} catch(e) {
		msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid: " + e.message
		alertMsg("#alert-container", msg)
    }
}

function minifyJson(id) {
	data = $("#"+id).val() || $("#"+id).text()
	try {
		j = JSON.stringify($.parseJSON(data), null, 0)
		$("#"+id).text(j)
		$("#"+id).val(j)
	} catch (e) {
		msg = id.charAt(0).toUpperCase() + id.slice(1) + " Invalid, cannot minify: " + e.message
		alertMsg("#alert-container", msg)		
	}		
}