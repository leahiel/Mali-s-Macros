/* Mali's <<a>> macro for Sugarcube */

Macro.add(['a','adel','but','butdel'],{isAsync:true,tags:['rep','prep','app','diag'],argsToObj:function(args){let argObject={},i=0;while(i<args.length){const arg=args[i];if(Array.isArray(arg)){args.splice(i--,1,...arg)}else if(typeof arg==='object'){Object.assign(argObject,arg)}else{const val=args[i+=1];if(val===undefined){throw new Error('Uneven number of arguments.')};argObject[arg.toLowerCase()]=val}i+=1}return argObject},activeKeys:[],handler(){const type=this.name[0]==='b'?'button':'link',attributes=this.self.argsToObj(this.args.slice(1)),payloads={};this.payload.slice(1).forEach(pay=>{payloads[pay.name]=pay});if(attributes.hasOwnProperty('condition')){var cond=attributes.condition;delete attributes.condition;if(!cond||!Scripting.evalTwineScript(cond)){return false}};let oldThis,deleteSelf=this.name.includes('del'),count=0;if(typeof this.args[0]==='object'){var{text:txt,link:passage,source:src}=this.args[0]}else{var txt=this.args[0];if(attributes.hasOwnProperty('goto')){var passage=attributes.goto;delete attributes.goto};if(typeof passage==='object'){passage=passage.link};}const link=$(`<${type==='button'?type:'a'}>`).wikiWithOptions({profile:'core'},src?`<img src='${ src }' class='link-image'>`:txt).attr({'data-passage':passage,'data-count':count});if(attributes.hasOwnProperty('trigger')){var trig=clone(attributes.trigger);delete attributes.trigger;trig=(typeof trig==='string')?trig.split(',').map(v=>v.trim()):[trig]};if(attributes.hasOwnProperty('count')){var maxCount=attributes.count;if(typeof maxCount!=='number'||maxCount<1){return this.error(`The 'count' attribute must be a number greater than 1, reading : ${ count }.`)}delete attributes.count};if(attributes.hasOwnProperty('choice')){var choiceID=attributes.choice;link.attr('data-choice',choiceID);delete attributes.choice};if(attributes.hasOwnProperty('key')){var keyArray=attributes.key;if(typeof keyArray==='string'){keyArray=keyArray.split(',')};const acKeys=this.self.activeKeys;if(!acKeys.length){$(document).keyup('macro-a',(e)=>{const validLinks=acKeys.filter(obj=>obj.keys.includesAny(e.key,e.code));validLinks.forEach(o=>{o.link.click()})})}else{setTimeout(()=>{acKeys.forEach(o=>{if(!$.contains(document.body,o.link[0])){acKeys.delete(o)}})},Engine.minDomActionDelay)}acKeys.push({keys:keyArray,link:link})};link.attr(attributes).addClass(`macro-${this.name } link-${attributes.href?'external':'internal'}`);if(passage){if(Config.addVisitedLinkClass&&State.hasPlayed(passage)){link.addClass('link-visited')}else if(!Story.has(passage)){link.addClass('link-broken')}};link.ariaClick({namespace:'.macros',role:type,one:(deleteSelf||passage)?true:false},this.createShadowWrapper((e)=>{link.attr('data-count',count+=1);try{oldThis=State.temporary.this;State.temporary.this={event:e,self:link,count:count};$.wiki(this.payload[0].contents);$.each(payloads,(k,pay)=>{const target=pay.args[0]?$(pay.args[0]):$(e.target).parent(),trans=pay.args.includesAny('transition','t8n'),attrObject=pay.args.find(a=>typeof a==='object'&&!a instanceof jQuery)??{};let result;switch(k){case 'rep':result=target.attr(attrObject).empty().wiki(pay.contents);break;case 'prep':result=$('<span>').attr(attrObject).addClass(`macro-${ k }-insert`).wiki(pay.contents).prependTo(target);break;case 'app':result=$('<span>').attr(attrObject).addClass(`macro-${ k }-insert`).wiki(pay.contents).appendTo(target);break;case 'diag':Dialog.setup(pay.args[0]??'',pay.args[1]??'');result=Dialog.wiki(pay.contents).open();break}if(result&&trans){$(result).fadeOut(0).fadeIn(400)}});trig?.forEach(e=>$(document).trigger(e));}finally{oldThis!==undefined?State.temporary.this=oldThis:delete State.temporary.this}},()=>{if(choiceID){$(`[data-choice*=${ choiceID }]`).not(link).remove()}if(passage){Engine.play(passage)}else if(count===maxCount||deleteSelf||(cond&&!Scripting.evalTwineScript(cond))){link.remove()}})).appendTo(this.output)}});
