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
	tokenizeRegExp: '',
	
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
	
	_tokenize: function(val){
		var value = val ? val : this.inputNode.attr('value');
		this.inputNode.reset();
		
		if (value.length > 0) {
			this._addToken({
				label: value
			});
		}
	},
	
	_tokenizeOnInput: function() {
		var match = this.tokenizeRegExp.exec(this.inputNode.attr('value'));
		if (match) {
			this._tokenize(match[1]);
		}
	},
	
	_tokenizeOnKey: function(key) {
		if (dojo.indexOf(this.tokenizeKeys, key) != -1) {
			this._tokenize();
		}
	},
	
	_tokenizeOnBlur: function(){
		this._tokenize();
	},
	
	_keyCodeHandler: function(e) {
		if (e.keyChar) {
			return;
		}
		
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
			case dojo.keys.ENTER:
				// prevent submission of any containing forms
				e.preventDefault();
			default:
				this._tokenizeOnKey(key);
		}
	},
	
	_onEmptyBackspace: function() {
		this.inputNode._focusPrevious();
	},
	
	postCreate: function() {
		if (this.tokenizeRegExp.length === 0 && this.tokenizeChars.length > 0) {
			this.tokenizeRegExp = this._tokenCharsToRegex();
		}
		
		if (this.tokenizeRegExp.length > 0) {
			this.tokenizeRegExp = new RegExp(this.tokenizeRegExp, 'i');
			this.connect(this.inputNode, 'onInput', this._tokenizeOnInput);
		}
		
		this.connect(this.inputNode.textbox, 'onkeypress', this._keyCodeHandler);
		this.connect(this.inputNode, 'onBlur', this._tokenizeOnBlur);
		
		this._setStateClass();
	}
});
