dojo.provide('ftow.ui.ExpandingTextBox');

dojo.require('dijit.form.TextBox');
dojo.require('dijit._Contained');

dojo.declare('ftow.ui.ExpandingTextBox', [dijit._Contained, dijit.form.TextBox], {
	templateString: null,
	templatePath: dojo.moduleUrl('ftow.ui.resources.templates', 'ExpandingTextBox.html'),
	
	baseClass: 'ExpandingTextBox',
	type: 'text',
	
	_focusPrevious: function() {
		var previous = this.getPreviousSibling();
		
		if (previous && previous.focus) {
			previous.focus();
			return true;
		} else {
			return false;
		}
	},
	
	_focusNext: function() {
		var next = this.getNextSibling();
		
		if (next && next.focus) {
			next.focus();
			return true;
		} else {
			return false;
		}
	},
	
	_focusParent: function() {
		var parent = this.getParent();
		
		if (parent && parent.focus) {
			parent.focus();
			return true;
		} else {
			return false;
		}
	},
	
	_getCaretPos: function() {
		var pos = 0;
		if (typeof(this.textbox.selectionStart) == "number") {
			pos = this.textbox.selectionStart;
		} else if (dojo.isIE) {
			var tr = dojo.doc.selection.createRange().duplicate();
			var ntr = this.textbox.createTextRange();
			tr.move("character", 0);
			ntr.move("character", 0);
			try {
				ntr.setEndPoint("EndToEnd", tr);
				pos = String(ntr.text).replace(/\r/g, "").length;
			} 
			catch (e) {
			}
		}
		return pos;
	},
	
	_onInput: function() {
		this.inherited(arguments);
		this.onInput(arguments);
	},
	
	onInput: function() {
	},
	
	_refreshState: function() {
		this.inherited(arguments);
		this._nudge(this.attr('value'));
	},
	
	_nudge: function(val) {
		this.nudgeNode.innerHTML = val;
	},
	
	reset: function() {
		this.inherited(arguments);
		this._nudge('');
	}
});
