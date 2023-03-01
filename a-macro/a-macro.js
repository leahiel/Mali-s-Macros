/* Maliface's 'a' macro for Sugarcube */

;(function(){
  
const attrFinder = (attributes, match) => {//Return proper arg from attributes and remove pair
	const attr = attributes.deleteAt([attributes.indexOf(match)+1])[0];
	attributes.delete(match);
   	return attr;
};

Macro.add(['a','adel','but','butdel'], {
	isAsync : true,
	tags    : ['rep','prep','app'],

	handler() {
      
		const type = this.name[0] === 'b' ? 'button' : 'link',
			attributes = this.args.slice(1),
			payload = this.payload[0].contents,
		      	Rep = this.payload.find(pay => pay.name === 'rep'),
			Prep = this.payload.find(pay => pay.name === 'prep'),
			App = this.payload.find(pay => pay.name === 'app');
      	
      	let oldThis, i = 0, link = $(`<${type === 'button'? type : 'a'}>`);
      
      	//Flatten objects into attributes pairs, while handles nested objects
      	while (i < attributes.length) {
        	const attr = attributes[i];
          	if (Array.isArray(attr)) {//Array of pairs
             	attributes.deleteAt(i)[0].forEach((el) => attributes.push(el));
            } else if (typeof attr === 'object'){//JQ-style object
            	$.each(attributes.deleteAt(i)[0] , (key, value)=> {
                	attributes.push(key.toLowerCase());
                  	attributes.push(value);
                });
            } else {
          	i++;
            }
        }
      	//Check all attributes are pairs
      	if (attributes.length%2) return this.error(`Non-object arguments should always come in pairs. ${attributes.includes('disabled') ? "Even the 'disabled' attribute." : ''}`);
      
      	// Catch choice property
      	if (attributes.includes('choice')){
		var choiceID = attrFinder(attributes, 'choice');
        	link.attr('data-choice', choiceID);
          	choiceID = choiceID.split(',');
	};
      
      	// Catch trigger property
      	if (attributes.includes('trigger')){
		var trig = attrFinder(attributes, 'trigger').split(',').map(e => e.trim());
	};
      
      	// Catch goto property
	if (attributes.includes('goto')){
		var passage = attrFinder(attributes, 'goto');
          	link.attr('data-passage', passage);
	};
      	
      	// Catch key property
	if (attributes.includes('key')){
		var keyArray = attrFinder(attributes, 'key');
          	link.attr('data-key', keyArray);
          	keyArray = keyArray.split(',');

          	$(document).keyup('macro-a-key', (e) => {
			keyArray.every(key => {
				if (e[isNaN(Number(key)) ? 'key' : 'keyCode'] == key){
					e.preventDefault();
					link.click();
					return false; //Stops the every()
					//Makes sure it runs only once even if redundant keys are given
				}
				return true;
			})
		})
	};
          
	// Apply arguments
	for (let i = 0; i < attributes.length;i+=2) {
		link.attr(attributes[i], attributes[i+1]);
	};
      	
      	// Process passage links like SC's link macro would
      	if (passage) {
        	if (Story.has(passage)) {
			link.addClass('link-internal');
			if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
				link.addClass('link-visited');
			}
		} else {
			link.addClass('link-broken');
		}
        };

	// Wiki link text
	link.wikiWithOptions({ profile : 'core' }, this.args[0]).addClass(`macro-${this.name} link-internal`);
      
	link.ariaClick( //Options object
		{namespace : '.macros',
		role : type ,
		one : (this.name.length > 3 || passage !== undefined) ? true : false},            
		this.createShadowWrapper(
				() => { // Main call
        			oldThis = State.temporary.hasOwnProperty('this') ? State.temporary.this : null; 
           			State.temporary.this = link;
        	
        			payload ? $.wiki(payload) : null;
					Rep ? $(Rep.args[0] ?? link.parent()).empty().wiki(Rep.contents) : null ;
					Prep ? $(document.createDocumentFragment()).wiki(Prep.contents).prependTo(Prep.args[0] ?? link.parent()) : null ;
					App ? $(App.args[0]  ?? link.parent()).wiki(App.contents) : null ;
					trig ? trig.forEach(e => {$(document).trigger(e)}) : null ;
				},
				() => { // After call
	    			oldThis !== null ? State.temporary.this = oldThis : delete State.temporary.this; // _this cleanup
           			if (passage){ //Go to passage
						Engine.play(passage);
					} else if (this.name.length > 3){ //Remove link
						link.remove();
					}
                  	if (choiceID){
                    	choiceID.forEach(id => { $(`[data-choice*=${id}]`).not(link).remove() });
                    }
		}
            )
        ).appendTo(this.output);
	}
});
})();
