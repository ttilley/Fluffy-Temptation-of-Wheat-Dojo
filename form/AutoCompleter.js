dojo.provide("dijit.form.AutoCompleter");

dojo.require("dijit.util.scroll");
dojo.require("dijit.util.wai");
dojo.require("dojo.data.JsonItemStore");
dojo.require("dijit.form._DropDownTextBox");
dojo.require("dijit.form.ValidationTextbox");
dojo.require("dijit.base.TemplatedWidget");

dojo.declare(
	"dijit.form.AutoCompleter",
	[dijit.form.ValidationTextbox, dijit.form._DropDownTextBox],
	{
		// summary:
		//		Auto-completing text box, and base class for Select widget.
		//
		//		The drop down box's values are populated from an class called
		//		a data provider, which returns a list of values based on the characters
		//		that the user has typed into the input box.
		//
		//		Some of the options to the AutoCompleter are actually arguments to the data
		//		provider.
		
		// searchLimit: Integer
		//		Argument to data provider.
		//		Specifies cap on maximum number of search results.
		//		Default is Infinity.
		searchLimit: Infinity,
	
		// store: Object
		//		Reference to data provider object created for this AutoCompleter
		//		according to "dataProviderClass" argument.
		store: null,
	
		// autoComplete: Boolean
		//		If you type in a partial string, and then tab out of the <input> box,
		//		automatically copy the first entry displayed in the drop down list to
		//		the <input> field
		autoComplete: true,
	
		// searchDelay: Integer
		//		Delay in milliseconds between when user types something and we start
		//		searching based on that value
		searchDelay: 100,
	
		// url: String
		//		URL argument passed to data provider object (class name specified in "dataProviderClass")
		//		An example of the URL format for the default data provider is
		//		"autoCompleterData.js"
		url: "",
	
// Bill: not sure we want to support url parameter; if we do then we have to support it for
// all dojo.data widgets (grid, tree)

		// maxListLength: Integer
		//		Limits list to X visible rows, scroll on rest
		maxListLength: 8,
	
// Bill: is maxListLength actually working?   I don't see any code that limits the # of visible rows
// (that would be a good feature in _AutoCompleterMenu)

		// dataProviderClass: String
		//		Name of data provider class (code that maps a search string to a list of values)
		//		The class must match the interface demonstrated by dojo.data.JsonItemStore
		dataProviderClass: "dojo.data.JsonItemStore",
	
// Bill: not sure we want to support this; if we do then we have to support it for
// all dojo.data widgets (grid, tree)

		// searchField: String
		//		Searches pattern match against this field
		searchField: "name",
	
// Bill: rename to searchAttr to match dojo.data spec
	
		// size: String
		//              Basic input tag size declaration.
		size: "",
	
		// maxlength: String
		//              Basic input tag maxlength declaration.
		maxlength: "",
			
// Bill: size and maxlength shouldn't be here.  Maybe in a base class for input widgets?
	
		// ignoreCase: Boolean
		//		Does the AutoCompleter menu ignore case?
		ignoreCase: true,
			
		// value: String
		//		The initial value of the AutoCompleter.
		//		This is the value that actually appears in the text area.
		value:"",
	
		templatePath: dojo.moduleUrl("dijit.form", "templates/AutoCompleter.html"),
		
		_setTextFieldValue:function(/*String*/ value){
			// summary: Select wants to call AutoCompleter's setValue to reach FormElement's setValue
			// But Select does not want to display the "value" in the text field!
			// this function fixes that problem by separating the code from Select's setTextValue
			this.textbox.value=value;
		},
	
		setValue:function(/*String*/ value){
			// summary: Sets the value of the AutoCompleter
			this._setTextFieldValue(value);

			// reuse dijit setValue code
			this.settingValue=true;
			dijit.form.AutoCompleter.superclass.setValue.apply(this, arguments);
			this.settingValue=false;
		},
	
// Bill: there's got to be a better way to do this than settingValue attribute
// But this is all tied in w/Autocompleter being defined as a SerializableTextbox
// when it really isn't

		setTextValue:function(/*String*/ value){
			// summary: keeps value of AutoCompleter in sync with its text value
	
			// prevent Textbox recursion
			if(!this.settingValue){
				this.setValue(value);
			}else{
				dijit.form.AutoCompleter.superclass.setTextValue.apply(this, arguments);
			}

		},

		getState: function(){
			// summary:
			//	Used for saving state of AutoCompleter when navigates to a new
			//	page, in case they then hit the browser's "Back" button.
			var state={};
			state[this.searchField]=this.getValue();
			return state;
		},
	
// Bill: this doesn't seem necessary; can just use getValue()

		setState: function(/*Object*/ state){
			// summary:
			//	Used for restoring state of AutoCompleter when has navigated to a new
			//	page but then hits browser's "Back" button.
			this.setValue(state[this.searchField]);
		},
	
		enable:function(){
			//this.disabled=false;
			dijit.form.AutoCompleter.superclass.enable.apply(this, arguments);
			this.textbox.removeAttribute("disabled");
		},
	
		disable: function(){
			//this.disabled = true;
			dijit.form.AutoCompleter.superclass.disable.apply(this, arguments);
			this.textbox.setAttribute("disabled",true);
		},
	
// Bill: enable()/disable() seem unnecessary; FormElement already has code for
// setting CSS classes when the widget is enabled/disabled

		_getCaretPos: function(/*DomNode*/ element){
			// khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
			if(typeof(element.selectionStart)=="number"){
				// FIXME: this is totally borked on Moz < 1.3. Any recourse?
				return element.selectionStart;
			}else if(dojo.isIE){
				// in the case of a mouse click in a popup being handled,
				// then the document.selection is not the textarea, but the popup
				// var r = document.selection.createRange();
				// hack to get IE 6 to play nice. What a POS browser.
				var tr = document.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character",0);
				ntr.move("character",0);
				try{
					// If control doesnt have focus, you get an exception.
					// Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
					// There appears to be no workaround for this - googled for quite a while.
					ntr.setEndPoint("EndToEnd", tr);
					return String(ntr.text).replace(/\r/g,"").length;
				}
	
				catch(e){
					return 0; // If focus has shifted, 0 is fine for caret pos.
				}
	
			}
	
		},
	
		_setCaretPos: function(/*DomNode*/ element, /*Number*/ location){
			location = parseInt(location);
			this._setSelectedRange(element, location, location);
		},
	
		_setSelectedRange: function(/*DomNode*/ element, /*Number*/ start, /*Number*/ end){
			if(!end){
				end = element.value.length;
			}  // NOTE: Strange - should be able to put caret at start of text?
			// Mozilla
			// parts borrowed from http://www.faqts.com/knowledge_base/view.phtml/aid/13562/fid/130
			if(element.setSelectionRange){
				element.focus();
				element.setSelectionRange(start, end);
			}else if(element.createTextRange){ // IE
				var range = element.createTextRange();
				with(range){
					collapse(true);
					moveEnd('character', end);
					moveStart('character', start);
					select();
				}
			
			}else{ //otherwise try the event-creation hack (our own invention)
				// do we need these?
				element.value = element.value;
				element.blur();
				element.focus();
				// figure out how far back to go
				var dist = parseInt(element.value.length)-end;
				var tchar = String.fromCharCode(37);
				var tcc = tchar.charCodeAt(0);
				for(var x = 0; x < dist; x++){
					var te = document.createEvent("KeyEvents");
					te.initKeyEvent("keypress", true, true, null, false, false, false, false, tcc, tcc);
					element.dispatchEvent(te);
				}
	
			}
	
		},
	
		onkeyup:function(){
			// Textbox uses onkeyup, but not AutoCompleter
			// this placeholder prevents errors
		},
	
		onkeypress: function(/*Event*/ evt){
			// summary: handles keyboard events
			if(evt.ctrlKey || evt.altKey){
				return;
			}
			var k = dojo.keys;
			var doSearch = true;
			switch(evt.keyCode){
				case dojo.keys.DOWN_ARROW:
					if(!this.popupWidget.isShowingNow||this._prev_key_esc){
						this._arrowPressed();
						this._startSearchFromInput();
					}
	
					this.popupWidget._highlightNextOption();
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.UP_ARROW:
					this.popupWidget._highlightPrevOption();
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.PAGE_DOWN:
					for(var i=0; i<this.maxListLength; i++){
						this.popupWidget._highlightNextOption();
					}
// Bill: maybe there should be a pageDown() method in AutoCompleterMenu
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.PAGE_UP:
					for(var i=0; i<this.maxListLength; i++){
						this.popupWidget._highlightPrevOption();
					}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.ENTER:
					// prevent submitting form if user presses enter
					dojo.stopEvent(evt);
	
				case dojo.keys.TAB:
					if(this.popupWidget.isShowingNow){
						
						this._prev_key_backspace = false;
						this._prev_key_esc = false;
						if(this.popupWidget.getHighlightedOption()){
							this.popupWidget.setValue({target:this.popupWidget.getHighlightedOption()});
						}else{
							this.setTextValue(this.getTextValue());
						}
						this._hideResultList();
						doSearch=false;
					}else{
						// also allow arbitrary user input
						this.setTextValue(this.getTextValue());
					}
					break;
	
				case dojo.keys.SPACE:
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(this.popupWidget.isShowingNow && this._highlighted_option){
						dojo.stopEvent(evt);
						this._selectOption();
						this._hideResultList();
						return;
					}
	
					break;
	
				case dojo.keys.ESCAPE:
					this._prev_key_backspace = false;
					this._hideResultList();
					this._prev_key_esc = true;
					return;
	
				case dojo.keys.BACKSPACE:
					this._prev_key_esc = false;
					this._prev_key_backspace = true;
					if(!this.textbox.value.length){
						this.setValue("");
					}
	
					break;
	
				case dojo.keys.RIGHT_ARROW: // fall through
	
				case dojo.keys.LEFT_ARROW: // fall through
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					doSearch = false;
					break;
	
				default:// non char keys (F1-F12 etc..)  shouldn't open list
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(evt.charCode==0){
						doSearch = false;
					}
	
			}
	
			if(this.searchTimer){
				clearTimeout(this.searchTimer);
			}
	
			if(doSearch){
				// if we have gotten this far we dont want to keep our highlight
				//this._blurOptionNode();
	
				// need to wait a tad before start search so that the event bubbles through DOM and we have value visible
				this.searchTimer = setTimeout(dojo.hitch(this, this._startSearchFromInput), this.searchDelay);
			}
	
		},
	
		compositionEnd: function(/*Event*/ evt){
			// summary: When inputting characters using an input method, such as Asian
			// languages, it will generate this event instead of onKeyDown event
			evt.key = evt.charCode = -1;
			this.onkeypress(evt);
		},
	
		_openResultList: function(/*Object*/ results){
			if(this.disabled){
				return;
			}
	
			this.popupWidget.clearResultList();
			if(!results.length){
				this._hideResultList();
				return;
			}
	
			var zerothvalue=new String(this.store.getValue(results[0], this.searchField));
			if(zerothvalue&&(this.autoComplete)&&
			(!this._prev_key_backspace)&&
			(this.textbox.value.length > 0)&&
			(new RegExp("^"+this.textbox.value, this.ignoreCase ? "i" : "").test(zerothvalue))){
				var cpos = this._getCaretPos(this.textbox);
				// only try to extend if we added the last character at the end of the input
				if((cpos+1) > this.textbox.value.length){
					// only add to input node as we would overwrite Capitalisation of chars
					// actually, that is ok
					this.textbox.value = zerothvalue;//.substr(cpos);
					// build a new range that has the distance from the earlier
					// caret position to the end of the first string selected
					this._setSelectedRange(this.textbox, cpos, this.textbox.value.length);
				}
	
			}
	
// Bill: I'm not sure what this setSelectedRange() is doing;
// there should be a comment explaining it here)

			// #2309: iterate over cache nondestructively
			for(var i=0; i<results.length; i++){
				var tr=results[i];
				if(tr){
					var td=this._createOption(tr);
					td.className = "dojoMenuItem";
					this.popupWidget.addItem(td);
				}
	
			}
// Bill: above loop could be done w/ "dojo.forEach(results, function(tr){" or better yet map()
//
// But actually the interface between AutoCompleterMenu and Autocompleter is strange to me.
// AutoCompleterMenu should be in charge of the
// DOM manipulation (creating text nodes, etc).   autocompleter should just pass in a list of
// items
				
			// show our list (only if we have content, else nothing)
			this._showResultList();
		},
	
		_createOption:function(/*Object*/ tr){
			// summary: creates an option to appear on the popup menu
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(this.store.getValue(tr, this.searchField)));
			td.item=tr;
			return td;
		},
	
// Bill: since createOption() is only called once it doesn't need to be a separate method.
// Code can be inlined.

		onfocus:function(){
			dijit.form.ValidationTextbox.prototype.onfocus.apply(this, arguments);
			this._hasFocus = true;
		},
	
		onblur:function(){
			dijit.form._DropDownTextBox.prototype.onblur.apply(this, arguments);
			dijit.form.ValidationTextbox.prototype.onblur.apply(this, arguments);
			this._hasFocus = false;
		},
	
// Bill: you are setting hasFocus but never using it, so the above functions seem unnecessary

		_selectOption: function(/*Event*/ evt){
			var tgt = null;
			if(!evt){
				// what if nothing is highlighted yet?
				evt ={ target: this._highlighted_option };
			}
	
			if(!evt.target){
				
				// handle autocompletion where the the user has hit ENTER or TAB
				// if the input is empty do nothing
				if(!this.textbox.value.length){
					//this._checkValueChanged();
					return;
				}
	
				//tgt = this.popupWidget.firstChild;
				this.setTextValue(this.getTextValue());
				return;
				
			// otherwise the user has accepted the autocompleted value
			}else{
				tgt = evt.target;
			}
			
			while((tgt.nodeType!=1)||(!this.store.getValue(tgt.item, this.searchField))){
				tgt = tgt.parentNode;
				if(tgt == dojo.body()){
					return false;
				}
	
			}
	
			this._doSelect(tgt);
			if(!evt.noHide){
				this._hideResultList();
				this._setSelectedRange(this.textbox, 0, null);
			}
	
			this.focus();
			if(this.popupWidget.domNode.style.display!="none"){
				dijit.util.PopupManager.close(this.popupWidget);
			}
		},
	
		_doSelect: function(tgt){
			this.setValue(this.store.getValue(tgt.item, this.searchField));
		},
	
		arrowClicked: function(){
// Bill: should rename to _onArrowClicked() for consistency
			// summary: callback when arrow is clicked
			if(this.disabled){
				return;
			}
			this.focus();
			if(this.popupWidget.isShowingNow){
				this._hideResultList();
			}else{
				// forces full population of results, if they click
				// on the arrow it means they want to see more options
				this._startSearch("");
			}
	
		},
	
		_startSearchFromInput: function(){
			this._startSearch(this.textbox.value);
		},
	
		_startSearch: function(/*String*/ key){
			var query={};
			query[this.searchField]=key+"*";
			this.store.fetch({queryIgnoreCase:this.ignoreCase, query: query, onComplete:dojo.hitch(this, "_openResultList"), count:this.searchLimit});

// Bill: actually you should save the query object (in this._query) and reuse it
// (after modifying the query), because
// fetch might maintain state info in there (caching,etc.)
// Same for Select

		},
	
		_assignHiddenValue:function(/*Object*/ keyValArr, /*DomNode*/ option){
			// not necessary in AutoCompleter
			return;
		},
// Bill: this shouldn't be here?   Autocompleter has no hidden value
	
		postCreate: function(){
			//dijit.form.AutoCompleter.superclass.postCreate.apply(this, arguments);
			dijit.form.ValidationTextbox.prototype.postCreate.apply(this, arguments);
			//dijit.form._DropDownTextBox.prototype.postCreate.apply(this, arguments);
			//document.body.appendChild(node);
			this.popupWidget=dijit.form.AutoCompleter.MasterPopup; //new dijit.form._AutoCompleterMenu({}, node);
			
// Bill: not sure having a MasterPopup is giving us here.
// How about creating the menu on demand (NOT at postCreate() time),
// but having one per widget?

			var dpClass=dojo.getObject(this.dataProviderClass, false);
			
			// new dojo.data code
			// is the store not specified?  If so, use inline read
			if(this.store==null){
				if(this.url==""&&this.data==null){
					dpClass=dojo.getObject("dojo.data.JsonItemStore", false);
					var opts = this.domNode.getElementsByTagName("option");
					var ol = opts.length;
					var data=[];
					for(var x=ol-1; x>=0; x--){
						var text = opts[x].innerHTML;
						var keyValArr ={};
						keyValArr[this.searchField]=String(text);
						this._assignHiddenValue(keyValArr, opts[x]);
						data.unshift(keyValArr);
						this.domNode.removeChild(opts[x]);
						//dojo.dom.removeNode(opts[x]);
					}
// Bill: is there a reason the loop goes backwards?  couldn't you make the loop go
// forwards and just call data.push()?  Not sure why you are calling this.domNode.removeChild()
// either.   This would all probably be easier if you just called
//	dojo.query("option", this.domNode).map(function(node){ return ...}) and it will construct the array
// for you
	
					// pass store inline data
					this.data={items:data};
				}
	
				this.store=new dpClass(this);
			}
			
			if(this.disabled){
				this.disable();
			}
	
			// FIXME: add state code back
			/*var s = dojo.widget.html.stabile.getState(this.id);
				
			if(s){
				this.setState(s);
			}else{
				this.setValue(this.value);
			}*/
			this._setTextFieldValue(this.value);
		}

	}

);

dojo.declare(
	"dijit.form._AutoCompleterMenu",
	[dijit.base.FormElement, dijit.base.TemplatedWidget, dijit.form._DropDownTextBox.Popup],

// Bill: 
// I'd like the interface to AutoCompleterMenu to be higher level,
// taking a list of items to initialize it, and returns the selected item
//
//                new _AutoCompleterMenu({
//                                 items: /*dojo.data.Item[]*/ items,
//                                 labelFunc: dojo.hitc(this, "_makeLabel"),
//                                 onSelectItem: dojo.hitch(this, "_itemSelected")
//               });
//
// (This is dependent on NOT having a global widget for this, but rather
// creating it on the fly, as per discussion with Bill, Adam, and Mark)
// 
// It could also have a method like handleKey(evt) that takes a keystroke
// the <input> received and handles it.
//
// Also, doesn't seem like this should inherit from FormElement, and again I'm not
// sure of the utility of dijit.form._DropDownTextBox.Popup;
// all the popup functionality is supposed to be in PopupManager
//


	{
		// summary:
		//	Focus-less div based menu for internal use in AutoCompleter

		templateString:"<div class='dojoMenu' dojoAttachEvent='onclick; onmouseover; onmouseout;' tabIndex='-1' style='display:none; position:absolute; overflow:\"auto\";'></div>",
		postCreate:function(){
			// summary:
			//	call all postCreates
			dijit.form._DropDownTextBox.Popup.prototype.postCreate.apply(this, arguments);
			dijit.base.FormElement.prototype.postCreate.apply(this, arguments);
		},
	
		open:function(/*Widget*/ widget){
			this.onValueChanged=dojo.hitch(widget, widget._selectOption);
			dijit.form._DropDownTextBox.Popup.prototype.open.apply(this, arguments);
		},
	
		close:function(){
			dijit.form._DropDownTextBox.Popup.prototype.close.apply(this, arguments);
			this._blurOptionNode();
		},
	
		addItem:function(/*Node*/ item){
			this.domNode.appendChild(item);
		},
// Bill: see comments above; this call is too low level for the interface
// between Autocompleter and AutocompleterMenu
	
		clearResultList:function(){
			this.domNode.innerHTML="";
		},
	
		getItems:function(){
			return this.domNode.childNodes;
		},
	
		getListLength:function(){
			return this.domNode.childNodes.length;
		},
// Bill: above two functions are never called
	
		onclick:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			var tgt=evt.target;
			// while the clicked node is inside the div
			while(!tgt.item){
				// recurse to the top
				tgt=tgt.parentNode;
			}

			this.setValue({target:tgt});
		},
	
		onmouseover:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._focusOptionNode(evt.target);
		},
	
		onmouseout:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._blurOptionNode();
		},
	
		_focusOptionNode:function(/*DomNode*/ node){
			// summary:
			//	does the actual highlight
			if(this._highlighted_option != node){
				this._blurOptionNode();
				this._highlighted_option = node;
				dojo.addClass(this._highlighted_option, "dojoMenuItemHover");
			}
	
		},
	
		_blurOptionNode:function(){
			// summary:
			//	removes highlight on highlighted option
			if(this._highlighted_option){
				dojo.removeClass(this._highlighted_option, "dojoMenuItemHover");
				this._highlighted_option = null;
			}
	
		},
	
		_highlightNextOption:function(){
			if(!this._highlighted_option){
				this._focusOptionNode(this.domNode.firstChild);
			}else if(this._highlighted_option.nextSibling){
				this._focusOptionNode(this._highlighted_option.nextSibling);
			}
	
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},
	
		_highlightPrevOption:function(){
			if(this._highlighted_option && this._highlighted_option.previousSibling){
				this._focusOptionNode(this._highlighted_option.previousSibling);
			}else{
				this._highlighted_option = null;
				this.close(true);
				return;
			}
	
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},
	
		getHighlightedOption:function(){
			// summary:
			//	Returns the highlighted option.
			return this._highlighted_option;
		},
	
		processKey:function(/*Event*/ evt){
			// summary:
			//	Required by PopupManager
			return false;
		}

	}

);

// dojo.addOnLoad() throws things on the end of the onload stack. We want to be on the front.
dojo._loaders.unshift(function(){
	if(!dijit.form.AutoCompleter.MasterPopup){
		dijit.form.AutoCompleter.MasterPopup = new dijit.form._AutoCompleterMenu({}, document.createElement("div"));
	}

});
