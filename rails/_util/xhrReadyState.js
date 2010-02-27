dojo.provide('rails._util.xhrReadyState');

(function(){
    var _xhrObj = dojo._xhrObj;
    var _readyStates = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
    
    var _readyStateHandler = function(callbacks, readyState){
        var state = _readyStates[readyState];
        var callback = callbacks['on' + state];
        if (callback && dojo.isFunction(callback)) {
            callback(this);
        }
    }
    
    dojo._xhrObj = function(args){
        var http = _xhrObj();
        if (callbacks = args.readyStateCallbacks) {
            delete args.readyStateCallbacks;
            try {
                http.onreadystatechange = dojo.hitch(http, _readyStateHandler, callbacks);
            } 
            catch (e) {
                console.error("Unable to setup ready state handler:");
                console.error(e);
            }
        }
        return http;
    }
})();
