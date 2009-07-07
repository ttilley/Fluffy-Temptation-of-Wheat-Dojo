dojo.provide('ftow.ui.TokenizedTextBox');

dojo.require('dojo.regexp');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form._FormWidget');
dojo.require('dijit._Container');

dojo.require('ftow.ui.Token');
dojo.require('ftow.ui.ExpandingTextBox');

dojo.declare('ftow.ui.TokenizedTextBox', [dijit._Widget, dijit._Templated, dijit._Container], {
	templateString: null,
	templatePath: dojo.moduleUrl('ftow.ui.resources', 'TokenizedTextBox.html'),
	
	widgetsInTemplate: true,
	
	baseClass: 'TokenizedTextBox',
	name: '',
	
	tokenizeKeys: [dojo.keys.TAB, dojo.keys.ENTER],
	tokenizeChars: '',
	tokenizeRegex: '',
	
	disabled: false,
	
	// inheriting from dijit.form._FormWidget would mean overwriting almost all of it just to get
	// two (very) useful functions.
	_onMouse: function() {
		dijit.form._FormWidget.prototype._onMouse.apply(this, arguments);
	},
	_setStateClass: function() {
		dijit.form._FormWidget.prototype._setStateClass.apply(this, arguments);
	},
	
	isFocusable: function() {
		return !this.disabled && !this.inputNode.disabled && (dojo.style(this.domNode, "display") != "none");
	},
	
	focus: function() {
		this.inputNode.focus();
	},
	
	_addToken: function(options) {
		var opt = dojo.mixin({
			name: this.name
		}, options);
		var token = new ftow.ui.Token(opt);
		token.placeAt(this.inputNode.domNode, "before");
	},
	
	_tokenCharsToRegex: function() {
		var tcha = this.tokenizeChars.split('');
		var nottch = '[^' + dojo.regexp.escapeString(this.tokenizeChars) + ']';
		
		var data = dojo.regexp.group(nottch + '*');
		
		var trigger = dojo.regexp.buildGroupRE(tcha, function(ch) {
			return dojo.regexp.escapeString(ch) + '$';
		}, true);
		
		return data + trigger;
	},
	
	_tokenizeOnInput: function() {
		var match = this.tokenizeRegex.exec(this.inputNode.attr('value'));
		if (match) {
			this.inputNode.reset();
			this._addToken({
				label: match[1]
			});
		}
	},
	
	_tokenizeOnKey: function(key) {
		if (dojo.indexOf(this.tokenizeKeys, key) != -1) {
			var label = this.inputNode.attr('value');
			this.inputNode.reset();
			this._addToken({
				label: label
			});
		}
	},
	
	_keyCodeHandler: function(e) {
		if (e.keyChar) {
			return;
		}
		
		// prevent submission of any containing forms
		e.preventDefault();
		
		var key = e.keyCode;
		
		switch (key) {
			case dojo.keys.BACKSPACE:
				if (this.inputNode.value === '') {
					this._onEmptyBackspace();
					return;
				}
				break;
			case dojo.keys.LEFT_ARROW:
				var pos = this.inputNode._getCaretPos();
				if (pos === 0) {
					this.inputNode._focusPrevious();
				}
				break;
			default:
				this._tokenizeOnKey(key);
		}
	},
	
	_onEmptyBackspace: function() {
		this.inputNode._focusPrevious();
	},
	
	postCreate: function() {
		if (this.tokenizeRegex.length === 0 && this.tokenizeChars.length > 0) {
			this.tokenizeRegex = this._tokenCharsToRegex();
		}
		
		if (this.tokenizeRegex.length > 0) {
			this.tokenizeRegex = new RegExp(this.tokenizeRegex, 'i');
			this.connect(this.inputNode, 'onInput', this._tokenizeOnInput);
		}
		
		this.connect(this.inputNode.textbox, 'onkeypress', this._keyCodeHandler);
		
		this._setStateClass();
	}
});
