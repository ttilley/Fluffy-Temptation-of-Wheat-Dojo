dojo.provide('rails._util.xhrDomEvents');
dojo.require('rails._util.xhrReadyState');
dojo.require('plugd.trigger');

(function(){
    var _xhr = dojo.xhr;
    
    var _xhrDomEventHandler = function(element, customEvent){
        var handler = dojo.hitch(element, dojo.trigger, element, customEvent);
        return function(xhr){
            handler({
                request: xhr
            });
        };
    };
    
    var _xhrDomEventsFor = function(element){
        return {
            onLoading: _xhrDomEventHandler(element, 'ajax:loading'),
            onLoaded: _xhrDomEventHandler(element, 'ajax:loaded'),
            onInteractive: _xhrDomEventHandler(element, 'ajax:interactive'),
            onComplete: _xhrDomEventHandler(element, 'ajax:complete')
        };
    };
    
    dojo.xhr = function(method, args, hasBody){
        if (args && args.domEvents) {
            var element = args.domEvents;
            delete args.domEvents;
            
            var dfd;
            
            if (!dojo.trigger(element, 'ajax:before')) {
                var emptyFunction = function(){
                };
                dfd = dojo._ioSetArgs(args, emptyFunction, emptyFunction, emptyFunction);
                dfd.cancel();
                return dfd;
            }
            
            var readyStateCallbacks = _xhrDomEventsFor(element);
            if (args.readyStateCallbacks) {
                var overWrite = args.readyStateCallbacks;
                dojo.mixin(readyStateCallbacks, overWrite);
            }
            args.readyStateCallbacks = readyStateCallbacks;
            
            dfd = _xhr(method, args, hasBody);
            
            dojo.trigger(element, 'ajax:after');
            
            var ajaxSuccess = _xhrDomEventHandler(element, 'ajax:success');
            var ajaxFailure = _xhrDomEventHandler(element, 'ajax:failure');
            
            dfd.addCallbacks(function(dfd){
                ajaxSuccess(dfd.ioArgs.xhr);
            }, function(dfd){
                ajaxFailure(dfd.ioArgs.xhr);
            });
            
            return dfd;
        }
        else {
            return _xhr(method, args, hasBody);
        }
    };
    
})();
