dojo.provide('ftow.ui.Token');

dojo.require('dijit.form._FormWidget');
dojo.require('dijit._Contained');

dojo.declare('ftow.ui.Token', [dijit.form._FormWidget, dijit._Contained], {
	templateString: null,
	templatePath: dojo.moduleUrl('ftow.ui.resources', 'Token.html'),
	
	attributeMap: dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap), {
		value: "valueNode",
		disabled: "focusNode",
		id: "focusNode",
		tabIndex: "focusNode",
		alt: "focusNode",
		title: "titleNode",
		label: {
			node: "labelNode",
			type: "innerHTML"
		},
		iconClass: {
			node: "iconNode",
			type: "class"
		}
	}),
	
	baseClass: 'Token',
	
	name: '',
	label: '',
	value: '',
	tabIndex: '-1',
	
	scrollOnFocus: false,
	
	buildRendering: function() {
		var labelSaver = false;
		
		if (this.label && dojo.trim(this.label) !== '') {
			labelSaver = this.label;
		} else if (this.value && dojo.trim(this.value) !== '') {
			labelSaver = this.label;
		}
		
		this.inherited(arguments);
		
		this.label = labelSaver ? labelSaver : this.containerNode.innerHTML;
		
		if (!this.value || dojo.trim(this.value) === '') {
			this.value = this.label;
		}
	},
	
	postCreate: function() {
		this.inherited(arguments);
		dojo.setSelectable(this.containerNode, false);
	},
	
	_onMouse: function(evt) {
		dojo.stopEvent(evt);
		this.inherited(arguments);
	},
	
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
	
	_onKeyPress: function(evt) {
		dojo.stopEvent(evt);
		
		if (evt.keyChar) {
			return;
		}
		
		var key = evt.keyCode;
		
		switch (key) {
			case dojo.keys.LEFT_ARROW:
				this._focusPrevious();
				break;
			case dojo.keys.RIGHT_ARROW:
				this._focusNext();
				break;
			case dojo.keys.BACKSPACE:
				if (!this._focusPrevious()) {
					this._focusParent();
				}
				this.destroy();
				break;
		}
	},
	
	_onClickCloseButton: function(evt) {
		dojo.stopEvent(evt);
		this.destroy();
	},
	
	_onCloseButtonEnter: function() {
		dojo.addClass(this.closeNode, this.baseClass + "CloseButtonHover");
	},
	
	_onCloseButtonLeave: function() {
		dojo.removeClass(this.closeNode, this.baseClass + "CloseButtonHover");
	}
});
