dojo.require("dijit.dijit");
;(function(){
	
	var d = dojo, dij = dijit;
	
	d._nop = function(){
		// summary: A global no-op function to reused in all no-op situations
		//
		// example:
		// |	my.workAround = dojo.isIE ? function(){ /* janky */ } : dojo._nop;
		//
	}
	
	d._nopReturn = function(){
		// summary: A global no-op function, like `dojo.noop`, but for use 
		//		in `dojo.NodeList` no-op situations where the NodeList needs
		//		to be returned for forther chaining.
		//
		// example:
		//	Create a safe-NodeList function for an IE-specific issue
		//	|	dojo.extend(dojo.NodeList, {
		//	|		janky: dojo.isIE ? function(){ /* workaround */ } : d._nopReturn
		//	|	});
		return this; // Anything
	}
	
	d.extend(d.NodeList, {
		widget: {
			
			dom: function(){
				// get a list of widget's from the nodes
				//	
				// ex: dojo.query("[dojoType]").widget.dom().forEach(..).end();
				var nl = new d.NodeList();
				this.forEach(function(n){
					nl.push(dij.getEnclosingWidget(n));
				});
				return nl;
			}
		}
	});
	
})();