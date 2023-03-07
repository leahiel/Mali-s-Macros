/* ----------------------- UTILITY BUNDLE ----------------------- */
/* ------------------- ONLY ONE COPY NEEDED! -------------------- */

window.MalisMacros={wikiWrapper:function(t,e){const r={};"object"==typeof t&&$.each(t,((t,e)=>{r[t]=State.temporary?.[t],State.temporary[t]=e}));try{e()}finally{$.each(r,((t,e)=>{State.temporary[t]=e}))}},on_macro_events:[],version: '1.0'},Array.prototype.attrFinder=function(t,e){const r=this.indexOf(t);if(-1!==r){const[a]=this.deleteAt(r+1);return this.delete(t),e&&e.attr(`data-${t}`,a),a}return!1},Array.prototype.payloadsToObj=function(){const t={default:this[0].contents};return this.slice(1).forEach((e=>{t[e.name]=e})),t},Array.prototype.unpack=function(){let t=0,e=this;for(;t<e.length;){const r=e[t];Array.isArray(r)?e.deleteAt(t)[0].forEach((t=>e.push(t))):"object"!=typeof r||r.isLink?t++:$.each(e.deleteAt(t)[0],((t,r)=>{e.push(t.toLowerCase()),e.push(r)}))}if(e.length%2)throw new Error("Non-object arguments should always come in pairs. "+(e.includes("disabled")?"Even the 'disabled' attribute.":""));return e},$.fn.extend({applyAttr:function(t){for(let e=0;e<t.length;e+=2)this.attr(t[e],t[e+1]);return this},runOutput:function(t,e){if(e)switch(t){case"rep":$(e.args[0]??this.parent()).empty().wiki(e.contents);break;case"prep":$(document.createDocumentFragment()).wiki(e.contents).prependTo(e.args[0]??this.parent());break;case"app":$(e.args[0]??this.parent()).wiki(e.contents);break;case"diag":Dialog.setup(e.args?.[0],e.args?.[1]),Dialog.wiki(e.contents),Dialog.open();break;case"refresh":this.empty().wiki(e);break;default:$.wiki(e)}},diagFrom:function(t,e){const r=this.offset().top-this.height()/2,a=this.offset().left-this.width()/2;return{distance:Math.hypot(r-e,a-t),top:e-r,left:t-a}}});

/* ------------------- END OF UTILITY BUNDLE -------------------- */

/* Maliface's <<on>> macro */

//Clean listeners on passage transition to avoid stacking !
$(document).on(':passageinit', function () {
	MalisMacros.on_macro_events.forEach(event => $(document).off(event));
	MalisMacros.on_macro_events = [];
});

Macro.add('on', {
	isAsync : true,
	tags    : null,

	handler() {
		
		if (!this.args[0]) {
			return this.error(`Missing event type.`);
		} else if (typeof this.args[0] !== 'string'){
			return this.error(`Event name must be a string, reading: ${typeof this.args[0]}.`);
		};
        
		const trig = this.args[0].split(',').map(event => event.trim()),
			attributes = this.args.slice(2).unpack(),
			container = $(document.createElement(this.args[1] || 'span')),
			payload = this.payload[0].contents;
		
      		const onInit = attributes.attrFinder('onInit') || true;

		container.applyAttr(attributes).addClass(`macro-${this.name}`).wiki(onInit ? payload : '').appendTo(this.output);
      
		// Apply listener for each event name
		trig.forEach(event => {
			MalisMacros.on_macro_events.pushUnique(event);
			$(document).on(event, this.createShadowWrapper(function() {
            	container.runOutput('refresh', payload);
			}));
		});
	}
});

// Triggers custom events

Macro.add('trigger', {
	handler() {
		
      	let trig = this.args[0];
      
		if (!['string','object'].includes(typeof trig)) {
			return this.error(`Invalid event type, reading :'${typeof trig}'.`);
		}
		
		if (typeof trig === 'string'){ //Comma-separated string of events
			trig = trig.split(',').map(event => event.trim());
		} else if (typeof trig === 'object' && !Array.isArray(trig)){ //A single event object
        	trig = [trig];
        }//Do nothing if trig is already an array, it's fine

		// Triggers each event supplied
		trig.forEach(event => {
			$(this.args[1] ?? document).trigger(event);
		});
	}
});
