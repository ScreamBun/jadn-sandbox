/*
OpenC2 Message Creator
*/

(function ($) { //an IIFE so safely alias jQuery to $
    $.OpenC2 = function (messageList, messageFields, alertFun=null) {
        this.messageList = (messageList instanceof $) ? messageList : $(messageList)
        this.messageFields = (messageFields instanceof $) ? messageFields : $(messageFields)
		this.alertFun = (typeof(alertFun) === 'function') ? alertFun : alert.bind(window)
		this.message = null
		
		this.messageList.change(this._messageChange.bind(this))
    }

    //assigning an object literal to the prototype is a shorter syntax
    //than assigning one property at a time
    $.OpenC2.prototype = {
		initSchema: function(schema) {
			this.schema = (schema instanceof Object) ? schema : {}
			this.messageList.find('option.schema_record').remove()
			
			try {
				schema_records = $.map(this.schema['meta']['exports'], function(v, k) { return v })
			} catch (e) {
				schema_records = []
				opt = $('<option/>').addClass('schema_record').attr('disabled', '').text('Cannot Load, Invalid Schema')
				$('#message-list').append(opt)
				alertMsg('#alert-container', 'Schema Invalid, cannot load message types')
			}
			
			schema_records.sort();
			this.messageList.find('option.schema_record').remove()
			
			for (var i in schema_records) {
				record = schema_records[i]
				opt = $('<option/>').addClass('schema_record').attr('value', record).text(record)
				this.messageList.append(opt)
			}
		},
		_messageChange: function(e) {
			var selected = $(e.target).val()
			
			if (selected == '') { return }

			var msg = schema.types.filter(function(type) {
				return type[0] == selected
			})
			
			if (msg.length == 1) {
				this.message = msg[0]
			} else {
				console.log(this.alertFun)
				this.alertFun(selected + ' could not be found in the schema')
			}
			this._addFields()
		},
		_choiceChange: function(e) {
			var id = $(e.target).attr('id').replace('-choice', '')
			var choiceCont = $(e.target).parent().find('.choiceOptions')
			var selected = $(e.target).val()
			choiceCont.empty()
			
			var selectedDef = this.schema.types.filter(function(type) {
				return type[0] == id
			})
			selectedDef = (selectedDef.length == 1) ? selectedDef[0][selectedDef[0].length - 1] : []
			
			selectedDef = selectedDef.filter(function(type) {
				return Number(type[0]) == Number(selected)
			})
			selectedDef = (selectedDef.length == 1) ? selectedDef[0] : []
			
			console.log(selectedDef)
			choiceCont.append(this._defField(selectedDef, true))
		},
		_addFields: function() {			
			this.messageFields.empty()
			var defs = this.message[this.message.length - 1]
			
			this.messageFields.append($('<p/>').append($('<b/>').text('Comment: ')).append($('<span/>').text(this.message[this.message.length - 2])))
			this.messageFields.append($('<div/>').attr('id', 'fieldDefs'))
			var fieldDefs = this.messageFields.find('#fieldDefs')
			
			for (var i in defs) {
				fieldDefs.append(this._defField(defs[i]))
			}
		},
		_defField: function(def, field=false) {
			var defType = this.schema.types.filter(function(type) {
				return type[0] == def[2]
			})
			var defType = (defType.length == 1) ? defType[0] : def
			
			switch (defType.length) {
				case 5: // Nested Def
					var defs = defType[defType.length - 1]
					var rtnCont = $('<div/>')

					switch (defType[1]) {
						case 'Enumerated':
							rtnCont = $('<div/>').addClass('form-group' + (field ? '' : ' col-sm-6'))
								.append($('<label/>').attr('for', defType[0]).text(defType[0]))
							var sel = $('<select/>').attr('id', defType[0]).addClass('form-control')
							sel.append($('<option/>').attr('value', '').attr('selected', '').text(defType[0] + ' Options'))

							for (var i in defs) {
								sel.append(this._defField(defs[i], true))
							}

							rtnCont.append(sel)
							break
							
						case 'Choice':
							rtnCont = $('<fieldset/>').attr('id', defType[0]).addClass('border border-secondary' + (field ? '' : ' col-sm-6')).append($('<legend/>').text(defType[0]))
							
							var sel = $('<select/>').attr('id', defType[0]+'-choice').addClass('form-control')
							sel.append($('<option/>').attr('value', '').attr('selected', '').text(defType[0] + ' Options'))
							
							for (var i in defs) {
								var def = defs[i]
								sel.append($('<option/>').attr('value', def[0]).text(def[1] + (def[def.length-1] == '' ? '' : ' - ' + def[def.length-1])))
							}
							
							rtnCont.append(sel)
							rtnCont.append($('<div>').addClass('col-sm-12 py-2 choiceOptions'))
							
							sel.change(this._choiceChange.bind(this))
							break
						
						case 'Record':
							console.log('Record', defType)
							var rec = true
						case 'Map':
							rtnCont = $('<fieldset/>').addClass('border border-' + (rec ? 'primary' : 'light') + (field ? '' : ' col-sm-6')).append($('<legend/>').text(defType[0]))
							
							for (var i in defs) {
								field = this._defField(defs[i], true).addClass(field ? 'mx-2' : '')
								
								help = field.find('[id$=_help]')
								help = help.text(defs[i][defs[i].length - 1] + ' - ' + help.text())
								
								rtnCont.append(field)
							}
							break
							
						default:
							console.log('Unknown', defType)
							rtnCont = $('<div/>')
					}

					return rtnCont
					break
					
				case 4: // Array/ArrayOf/Custom Def
					var defs = defType[defType.length - 1]
					var rtnCont = $('<div/>')

					switch (defType[1]) {
						case 'Array':
							console.log('Array', defType)
							break
							
						case 'ArrayOf':
							console.log('ArrayOf', defType)
							break
						
						default:
							console.log('Custom')
							rtnCont = $('<div/>').addClass('form-group' + (field ? '' : ' col-sm-6'))
								.append($('<label/>').attr('for', defType[0]).text(defType[0])) //
								.append($('<input/>').attr({
									type: 'text',
									id: defType[0],
									'aria-describedby': defType[0] + '_help',
									placeholder: 'Enter ' + defType[0]
								}).addClass('form-control'))
								.append($('<small/>').attr('id', defType[0] + '_help').addClass('form-text text-muted').text(defType[defType.length - 1]))
					}
					return rtnCont
					break
				
				case 3: // Enum Def
					return $('<option/>').attr('value', defType[1]).text(defType[1] + ' - ' + defType[2])
					break
				
				default:
					console.log('oops...', defType.length)
					break
			}
		}
    }


    $.OpenC2.defaultOptions = {
        schema: {},
		messageList: 'message-list',
		messageFields: 'message-fields'
    }

}(jQuery))

/* 
* so you can use it as:
var oc2 = new $.OpenC2($('#playerElement'))
oc2.InitSchema()
*/