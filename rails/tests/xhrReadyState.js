dojo.provide('rails.tests.xhrReadyState');
dojo.require('rails._util.xhrReadyState');

doh.registerTests("xhrReadyState", [function definesReadyStateChangeCallback(t){
    var emptyCallbacks = {
        onLoading: function(xhr){
        },
        onLoaded: function(xhr){
        },
        onInteractive: function(xhr){
        },
        onComplete: function(xhr){
        }
    };
    var http = dojo._xhrObj({
        readyStateCallbacks: emptyCallbacks
    });
    t.t(dojo.isFunction(http.onreadystatechange));
}, function readyStateCallbackReceivesXhrObj(t){
    window.rscr = false;
    
    var returnArgCallbacks = {
        onLoading: function(xhr){
            window.rscr = xhr;
        },
        onLoaded: function(xhr){
            window.rscr = xhr;
        },
        onInteractive: function(xhr){
            window.rscr = xhr;
        },
        onComplete: function(xhr){
            window.rscr = xhr;
        }
    };
    var http = dojo._xhrObj({
        readyStateCallbacks: returnArgCallbacks
    });
    
    dojo.forEach([1, 2, 3, 4], function(rs){
        window.rscr = false;
        var fakeEvent = {
            target: {
                readyState: rs
            }
        };
        http.onreadystatechange(fakeEvent);
        t.assertEqual(rs, window.rscr.readyState);
    });
    
    delete window.rscr;
}, function firesReadyStateCallbacksOnRequest(t){
    var d = new doh.Deferred();
    
    var fired = {
        onLoading: false,
        onLoaded: false,
        onInteractive: false,
        onComplete: false
    };
    
    var callbacks = {
        onLoading: function(){
            fired.onLoading = true;
        },
        onLoaded: function(){
            fired.onLoaded = true;
        },
        onInteractive: function(){
            fired.onInteractive = true;
        },
        onComplete: function(){
            fired.onComplete = true;
        }
    };
    
    var td = dojo.xhrGet({
        url: dojo.moduleUrl('rails.tests', 'xhrReadyState.js').toString(),
        readyStateCallbacks: callbacks,
        handle: function(res, ioargs){
            t.assertTrue(fired.onLoading);
            t.assertTrue(fired.onLoaded);
            t.assertTrue(fired.onInteractive);
            t.assertTrue(fired.onComplete);
            console.dir(fired);
        }
    });
    
    td.addCallback(d, 'callback');
    
    return d;
}
]);
