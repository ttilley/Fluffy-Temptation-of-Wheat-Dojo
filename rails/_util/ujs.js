dojo.provide('rails._util.ujs');
dojo.require('rails._util.xhrDomEvents');
dojo.require('dojo.NodeList-traverse');

// main handlers:
// form[data-remote] 					-> submit
// input[data-remote] 					-> click
// a[data-remote] 						-> click
// a[data-method]:not([data-remote]) 	-> click
// 
// other important selectors:
// input[data-disable-with]
// form[data-remote]:has(input[data-disable-with])
// 
// HTML5 data attributes:
// data-remote 							-> ajax-enable this element
// data-method 							-> HTTP verb emulation
// data-confirm 						-> add a confirmation dialog
// data-disable-with 					-> disable inputs/forms with in-flight requests
// data-url (deprecated, use href) 		-> define endpoint for verb emulation
// 
// Cross-Site tags:
// meta[name=csrf-token]
// meta[name=csrf-param]
// 
// data-remote request lifecycle events:
// ajax:before
// ajax:loading
// ajax:loaded
// ajax:interactive
// ajax:complete
// ajax:success
// ajax:failure
// ajax:after

(function(){
    function ajaxEnable(el){
        var method, url, params, hasBody;
        
        if (el.tagName.toLowerCase() == 'form') {
            method = el.attr('method') || 'post';
            url = el.attr('action');
            params = dojo.formToObject(el);
            hasBody = true;
        }
        else {
            method = el.attr('data-method') || 'get';
            url = el.attr('data-url') || el.attr('href');
            params = {};
            hasBody = false;
        }
        
        if (!dojo.trigger(el, 'ajax:before')) {
            return false;
        }
        
        dojo.xhr(method, {
            url: url,
            handleAs: 'javascript',
            content: params,
            domEvents: el
        }, hasBody);
        
        dojo.trigger(el, 'ajax:after');
    };
    
    function emulateVerb(el){
        var action = dojo.attr(el, 'data-url') || dojo.attr(el, 'href');
        var emulatedVerb = dojo.attr(el, 'data-method');
        
        var form = dojo.create('form', {
            method: 'post',
            action: action,
            styles: {
                display: 'none'
            }
        }, el, 'after');
        
        if (emulatedVerb.toLowerCase() != 'post') {
            dojo.create('input', {
                type: 'hidden',
                name: '_method',
                value: emulatedVerb
            }, form, 'last');
        }
        
        csrf_param = dojo.query('meta[name=csrf-param]').attr('content')[0] || false;
        csrf_token = dojo.query('meta[name=csrf-token]').attr('content')[0] || false;
        
        if (csrf_param && csrf_token) {
            dojo.create('input', {
                type: 'hidden',
                name: csrf_param,
                value: csrf_token
            }, form, 'last');
        }
        
        form.submit();
    };
    
    function seekDisableableElement(el){
        return dojo.hasAttr(el, 'data-disable-with') ? el : dojo.query('[data-disable-with]', el)[0];
    }
    
    function disableInput(el){
        var el = seekDisableableElement(el);
        if (!el) {
            return true;
        }
        
        if (!dojo.hasAttr(el, 'data-enable-with')) {
            dojo.attr(el, 'data-enable-with', dojo.attr(el, 'value'));
        }
        
        dojo.attr(el, {
            value: dojo.attr(el, 'data-disable-with'),
            disabled: true
        });
    }
    
    function enableInput(el){
        if (dojo.hasAttr(el, 'data-enable-with')) {
            var value = dojo.attr(el, 'data-enable-with');
            dojo.attr(el, 'value', value);
        }
        dojo.attr(el, 'disabled', false);
    }
    
    dojo.connect(document.body, 'onclick', function(event){
        var message = dojo.attr(event.target, 'data-confirm');
        if (message && !confirm(message)) {
            dojo.stopEvent(event);
            return false;
        }
        
        var wrapper = new dojo.NodeList(event.target);
        
        var usesAjax = wrapper.closest("a[data-remote]")[0];
        if (usesAjax) {
            ajaxEnable(usesAjax);
            dojo.stopEvent(event);
            return true;
        }
        
        var usesVerbEmulation = wrapper.closest("a[data-method]")[0];
        if (usesVerbEmulation) {
            emulateVerb(usesVerbEmulation);
            dojo.stopEvent(event);
            return true;
        }
    });
    
    dojo.connect(document.body, 'onsubmit', function(event){
        var message = dojo.attr(event.target, 'data-confirm');
        if (message && !confirm(message)) {
            dojo.stopEvent(event);
            return false;
        }
        
        var inputs = dojo.query("input[type=submit][data-disable-with]", event.target);
        for (var input in inputs) {
            disableInput(input);
        }
        
        var usesAjax = new dojo.NodeList(event.target).closest("form[data-remote]")[0];
        if (usesAjax) {
            ajaxEnable(usesAjax);
            dojo.stopEvent(event);
            return true;
        }
    });
    
    dojo.connect(document.body, 'ajax:complete', function(event){
        if (event.target.tagName.toLowerCase() == 'form') {
            var inputs = dojo.query("input[type=submit][disabled=true][data-disable-with]", event.target);
            for (var input in inputs) {
                enableInput(input);
            }
        }
    });
})();
