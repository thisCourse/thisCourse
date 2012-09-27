
/**
 * @license RequireJS order 1.0.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint nomen: false, plusplus: false, strict: false */
/*global require: false, define: false, window: false, document: false,
  setTimeout: false */

//Specify that requirejs optimizer should wrap this code in a closure that
//maps the namespaced requirejs API to non-namespaced local variables.
/*requirejs namespace: true */

(function () {

    //Sadly necessary browser inference due to differences in the way
    //that browsers load and execute dynamically inserted javascript
    //and whether the script/cache method works when ordered execution is
    //desired. Currently, Gecko and Opera do not load/fire onload for scripts with
    //type="script/cache" but they execute injected scripts in order
    //unless the 'async' flag is present.
    //However, this is all changing in latest browsers implementing HTML5
    //spec. With compliant browsers .async true by default, and
    //if false, then it will execute in order. Favor that test first for forward
    //compatibility.
    var testScript = typeof document !== "undefined" &&
                 typeof window !== "undefined" &&
                 document.createElement("script"),

        supportsInOrderExecution = testScript && (testScript.async ||
                               ((window.opera &&
                                 Object.prototype.toString.call(window.opera) === "[object Opera]") ||
                               //If Firefox 2 does not have to be supported, then
                               //a better check may be:
                               //('mozIsLocallyAvailable' in window.navigator)
                               ("MozAppearance" in document.documentElement.style))),

        //This test is true for IE browsers, which will load scripts but only
        //execute them once the script is added to the DOM.
        supportsLoadSeparateFromExecute = testScript &&
                                          testScript.readyState === 'uninitialized',

        readyRegExp = /^(complete|loaded)$/,
        cacheWaiting = [],
        cached = {},
        scriptNodes = {},
        scriptWaiting = [];

    //Done with the test script.
    testScript = null;

    //Callback used by the type="script/cache" callback that indicates a script
    //has finished downloading.
    function scriptCacheCallback(evt) {
        var node = evt.currentTarget || evt.srcElement, i,
            moduleName, resource;

        if (evt.type === "load" || readyRegExp.test(node.readyState)) {
            //Pull out the name of the module and the context.
            moduleName = node.getAttribute("data-requiremodule");

            //Mark this cache request as loaded
            cached[moduleName] = true;

            //Find out how many ordered modules have loaded
            for (i = 0; (resource = cacheWaiting[i]); i++) {
                if (cached[resource.name]) {
                    resource.req([resource.name], resource.onLoad);
                } else {
                    //Something in the ordered list is not loaded,
                    //so wait.
                    break;
                }
            }

            //If just loaded some items, remove them from cacheWaiting.
            if (i > 0) {
                cacheWaiting.splice(0, i);
            }

            //Remove this script tag from the DOM
            //Use a setTimeout for cleanup because some older IE versions vomit
            //if removing a script node while it is being evaluated.
            setTimeout(function () {
                node.parentNode.removeChild(node);
            }, 15);
        }
    }

    /**
     * Used for the IE case, where fetching is done by creating script element
     * but not attaching it to the DOM. This function will be called when that
     * happens so it can be determined when the node can be attached to the
     * DOM to trigger its execution.
     */
    function onFetchOnly(node) {
        var i, loadedNode, resourceName;

        //Mark this script as loaded.
        node.setAttribute('data-orderloaded', 'loaded');

        //Cycle through waiting scripts. If the matching node for them
        //is loaded, and is in the right order, add it to the DOM
        //to execute the script.
        for (i = 0; (resourceName = scriptWaiting[i]); i++) {
            loadedNode = scriptNodes[resourceName];
            if (loadedNode &&
                loadedNode.getAttribute('data-orderloaded') === 'loaded') {
                delete scriptNodes[resourceName];
                require.addScriptToDom(loadedNode);
            } else {
                break;
            }
        }

        //If just loaded some items, remove them from waiting.
        if (i > 0) {
            scriptWaiting.splice(0, i);
        }
    }

    define('order',{
        version: '1.0.0',

        load: function (name, req, onLoad, config) {
            var url = req.nameToUrl(name, null),
                node, context;

            //Make sure the async attribute is not set for any pathway involving
            //this script.
            require.s.skipAsync[url] = true;
            if (supportsInOrderExecution || config.isBuild) {
                //Just a normal script tag append, but without async attribute
                //on the script.
                req([name], onLoad);
            } else if (supportsLoadSeparateFromExecute) {
                //Just fetch the URL, but do not execute it yet. The
                //non-standards IE case. Really not so nice because it is
                //assuming and touching requrejs internals. OK though since
                //ordered execution should go away after a long while.
                context = require.s.contexts._;

                if (!context.urlFetched[url] && !context.loaded[name]) {
                    //Indicate the script is being fetched.
                    context.urlFetched[url] = true;

                    //Stuff from require.load
                    require.resourcesReady(false);
                    context.scriptCount += 1;

                    //Fetch the script now, remember it.
                    node = require.attach(url, context, name, null, null, onFetchOnly);
                    scriptNodes[name] = node;
                    scriptWaiting.push(name);
                }

                //Do a normal require for it, once it loads, use it as return
                //value.
                req([name], onLoad);
            } else {
                //Credit to LABjs author Kyle Simpson for finding that scripts
                //with type="script/cache" allow scripts to be downloaded into
                //browser cache but not executed. Use that
                //so that subsequent addition of a real type="text/javascript"
                //tag will cause the scripts to be executed immediately in the
                //correct order.
                if (req.specified(name)) {
                    req([name], onLoad);
                } else {
                    cacheWaiting.push({
                        name: name,
                        req: req,
                        onLoad: onLoad
                    });
                    require.attach(url, null, name, scriptCacheCallback, "script/cache");
                }
            }
        }
    });
}());

/*!
 * jQuery UI 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function(c,j){function k(a,b){var d=a.nodeName.toLowerCase();if("area"===d){b=a.parentNode;d=b.name;if(!a.href||!d||b.nodeName.toLowerCase()!=="map")return false;a=c("img[usemap=#"+d+"]")[0];return!!a&&l(a)}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||b:b)&&l(a)}function l(a){return!c(a).parents().andSelf().filter(function(){return c.curCSS(this,"visibility")==="hidden"||c.expr.filters.hidden(this)}).length}c.ui=c.ui||{};if(!c.ui.version){c.extend(c.ui,{version:"1.8.16",
keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}});c.fn.extend({propAttr:c.fn.prop||c.fn.attr,_focus:c.fn.focus,focus:function(a,b){return typeof a==="number"?this.each(function(){var d=
this;setTimeout(function(){c(d).focus();b&&b.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=c.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(c.curCSS(this,"position",1))&&/(auto|scroll)/.test(c.curCSS(this,"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(c.curCSS(this,
"overflow",1)+c.curCSS(this,"overflow-y",1)+c.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?c(document):a},zIndex:function(a){if(a!==j)return this.css("zIndex",a);if(this.length){a=c(this[0]);for(var b;a.length&&a[0]!==document;){b=a.css("position");if(b==="absolute"||b==="relative"||b==="fixed"){b=parseInt(a.css("zIndex"),10);if(!isNaN(b)&&b!==0)return b}a=a.parent()}}return 0},disableSelection:function(){return this.bind((c.support.selectstart?"selectstart":
"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}});c.each(["Width","Height"],function(a,b){function d(f,g,m,n){c.each(e,function(){g-=parseFloat(c.curCSS(f,"padding"+this,true))||0;if(m)g-=parseFloat(c.curCSS(f,"border"+this+"Width",true))||0;if(n)g-=parseFloat(c.curCSS(f,"margin"+this,true))||0});return g}var e=b==="Width"?["Left","Right"]:["Top","Bottom"],h=b.toLowerCase(),i={innerWidth:c.fn.innerWidth,innerHeight:c.fn.innerHeight,
outerWidth:c.fn.outerWidth,outerHeight:c.fn.outerHeight};c.fn["inner"+b]=function(f){if(f===j)return i["inner"+b].call(this);return this.each(function(){c(this).css(h,d(this,f)+"px")})};c.fn["outer"+b]=function(f,g){if(typeof f!=="number")return i["outer"+b].call(this,f);return this.each(function(){c(this).css(h,d(this,f,true,g)+"px")})}});c.extend(c.expr[":"],{data:function(a,b,d){return!!c.data(a,d[3])},focusable:function(a){return k(a,!isNaN(c.attr(a,"tabindex")))},tabbable:function(a){var b=c.attr(a,
"tabindex"),d=isNaN(b);return(d||b>=0)&&k(a,!d)}});c(function(){var a=document.body,b=a.appendChild(b=document.createElement("div"));c.extend(b.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});c.support.minHeight=b.offsetHeight===100;c.support.selectstart="onselectstart"in b;a.removeChild(b).style.display="none"});c.extend(c.ui,{plugin:{add:function(a,b,d){a=c.ui[a].prototype;for(var e in d){a.plugins[e]=a.plugins[e]||[];a.plugins[e].push([b,d[e]])}},call:function(a,b,d){if((b=a.plugins[b])&&
a.element[0].parentNode)for(var e=0;e<b.length;e++)a.options[b[e][0]]&&b[e][1].apply(a.element,d)}},contains:function(a,b){return document.compareDocumentPosition?a.compareDocumentPosition(b)&16:a!==b&&a.contains(b)},hasScroll:function(a,b){if(c(a).css("overflow")==="hidden")return false;b=b&&b==="left"?"scrollLeft":"scrollTop";var d=false;if(a[b]>0)return true;a[b]=1;d=a[b]>0;a[b]=0;return d},isOverAxis:function(a,b,d){return a>b&&a<b+d},isOver:function(a,b,d,e,h,i){return c.ui.isOverAxis(a,d,h)&&
c.ui.isOverAxis(b,e,i)}})}})(jQuery);
;/*!
 * jQuery UI Widget 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function(b,j){if(b.cleanData){var k=b.cleanData;b.cleanData=function(a){for(var c=0,d;(d=a[c])!=null;c++)try{b(d).triggerHandler("remove")}catch(e){}k(a)}}else{var l=b.fn.remove;b.fn.remove=function(a,c){return this.each(function(){if(!c)if(!a||b.filter(a,[this]).length)b("*",this).add([this]).each(function(){try{b(this).triggerHandler("remove")}catch(d){}});return l.call(b(this),a,c)})}}b.widget=function(a,c,d){var e=a.split(".")[0],f;a=a.split(".")[1];f=e+"-"+a;if(!d){d=c;c=b.Widget}b.expr[":"][f]=
function(h){return!!b.data(h,a)};b[e]=b[e]||{};b[e][a]=function(h,g){arguments.length&&this._createWidget(h,g)};c=new c;c.options=b.extend(true,{},c.options);b[e][a].prototype=b.extend(true,c,{namespace:e,widgetName:a,widgetEventPrefix:b[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);b.widget.bridge(a,b[e][a])};b.widget.bridge=function(a,c){b.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),h=this;d=!e&&f.length?b.extend.apply(null,[true,d].concat(f)):
d;if(e&&d.charAt(0)==="_")return h;e?this.each(function(){var g=b.data(this,a),i=g&&b.isFunction(g[d])?g[d].apply(g,f):g;if(i!==g&&i!==j){h=i;return false}}):this.each(function(){var g=b.data(this,a);g?g.option(d||{})._init():b.data(this,a,new c(d,this))});return h}};b.Widget=function(a,c){arguments.length&&this._createWidget(a,c)};b.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:false},_createWidget:function(a,c){b.data(c,this.widgetName,this);this.element=b(c);this.options=
b.extend(true,{},this.options,this._getCreateOptions(),a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return b.metadata&&b.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+
"-disabled ui-state-disabled")},widget:function(){return this.element},option:function(a,c){var d=a;if(arguments.length===0)return b.extend({},this.options);if(typeof a==="string"){if(c===j)return this.options[a];d={};d[a]=c}this._setOptions(d);return this},_setOptions:function(a){var c=this;b.each(a,function(d,e){c._setOption(d,e)});return this},_setOption:function(a,c){this.options[a]=c;if(a==="disabled")this.widget()[c?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",
c);return this},enable:function(){return this._setOption("disabled",false)},disable:function(){return this._setOption("disabled",true)},_trigger:function(a,c,d){var e=this.options[a];c=b.Event(c);c.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(c.originalEvent){a=b.event.props.length;for(var f;a;){f=b.event.props[--a];c[f]=c.originalEvent[f]}}this.element.trigger(c,d);return!(b.isFunction(e)&&e.call(this.element[0],c,d)===false||c.isDefaultPrevented())}}})(jQuery);
;/*!
 * jQuery UI Mouse 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function(b){var d=false;b(document).mouseup(function(){d=false});b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(c){return a._mouseDown(c)}).bind("click."+this.widgetName,function(c){if(true===b.data(c.target,a.widgetName+".preventClickEvent")){b.removeData(c.target,a.widgetName+".preventClickEvent");c.stopImmediatePropagation();return false}});this.started=false},_mouseDestroy:function(){this.element.unbind("."+
this.widgetName)},_mouseDown:function(a){if(!d){this._mouseStarted&&this._mouseUp(a);this._mouseDownEvent=a;var c=this,f=a.which==1,g=typeof this.options.cancel=="string"&&a.target.nodeName?b(a.target).closest(this.options.cancel).length:false;if(!f||g||!this._mouseCapture(a))return true;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=true},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)){this._mouseStarted=
this._mouseStart(a)!==false;if(!this._mouseStarted){a.preventDefault();return true}}true===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");this._mouseMoveDelegate=function(e){return c._mouseMove(e)};this._mouseUpDelegate=function(e){return c._mouseUp(e)};b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);a.preventDefault();return d=true}},_mouseMove:function(a){if(b.browser.msie&&
!(document.documentMode>=9)&&!a.button)return this._mouseUp(a);if(this._mouseStarted){this._mouseDrag(a);return a.preventDefault()}if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==false)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=
false;a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",true);this._mouseStop(a)}return false},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return true}})})(jQuery);
;/*
 * jQuery UI Position 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Position
 */
(function(c){c.ui=c.ui||{};var n=/left|center|right/,o=/top|center|bottom/,t=c.fn.position,u=c.fn.offset;c.fn.position=function(b){if(!b||!b.of)return t.apply(this,arguments);b=c.extend({},b);var a=c(b.of),d=a[0],g=(b.collision||"flip").split(" "),e=b.offset?b.offset.split(" "):[0,0],h,k,j;if(d.nodeType===9){h=a.width();k=a.height();j={top:0,left:0}}else if(d.setTimeout){h=a.width();k=a.height();j={top:a.scrollTop(),left:a.scrollLeft()}}else if(d.preventDefault){b.at="left top";h=k=0;j={top:b.of.pageY,
left:b.of.pageX}}else{h=a.outerWidth();k=a.outerHeight();j=a.offset()}c.each(["my","at"],function(){var f=(b[this]||"").split(" ");if(f.length===1)f=n.test(f[0])?f.concat(["center"]):o.test(f[0])?["center"].concat(f):["center","center"];f[0]=n.test(f[0])?f[0]:"center";f[1]=o.test(f[1])?f[1]:"center";b[this]=f});if(g.length===1)g[1]=g[0];e[0]=parseInt(e[0],10)||0;if(e.length===1)e[1]=e[0];e[1]=parseInt(e[1],10)||0;if(b.at[0]==="right")j.left+=h;else if(b.at[0]==="center")j.left+=h/2;if(b.at[1]==="bottom")j.top+=
k;else if(b.at[1]==="center")j.top+=k/2;j.left+=e[0];j.top+=e[1];return this.each(function(){var f=c(this),l=f.outerWidth(),m=f.outerHeight(),p=parseInt(c.curCSS(this,"marginLeft",true))||0,q=parseInt(c.curCSS(this,"marginTop",true))||0,v=l+p+(parseInt(c.curCSS(this,"marginRight",true))||0),w=m+q+(parseInt(c.curCSS(this,"marginBottom",true))||0),i=c.extend({},j),r;if(b.my[0]==="right")i.left-=l;else if(b.my[0]==="center")i.left-=l/2;if(b.my[1]==="bottom")i.top-=m;else if(b.my[1]==="center")i.top-=
m/2;i.left=Math.round(i.left);i.top=Math.round(i.top);r={left:i.left-p,top:i.top-q};c.each(["left","top"],function(s,x){c.ui.position[g[s]]&&c.ui.position[g[s]][x](i,{targetWidth:h,targetHeight:k,elemWidth:l,elemHeight:m,collisionPosition:r,collisionWidth:v,collisionHeight:w,offset:e,my:b.my,at:b.at})});c.fn.bgiframe&&f.bgiframe();f.offset(c.extend(i,{using:b.using}))})};c.ui.position={fit:{left:function(b,a){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();b.left=
d>0?b.left-d:Math.max(b.left-a.collisionPosition.left,b.left)},top:function(b,a){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();b.top=d>0?b.top-d:Math.max(b.top-a.collisionPosition.top,b.top)}},flip:{left:function(b,a){if(a.at[0]!=="center"){var d=c(window);d=a.collisionPosition.left+a.collisionWidth-d.width()-d.scrollLeft();var g=a.my[0]==="left"?-a.elemWidth:a.my[0]==="right"?a.elemWidth:0,e=a.at[0]==="left"?a.targetWidth:-a.targetWidth,h=-2*a.offset[0];b.left+=
a.collisionPosition.left<0?g+e+h:d>0?g+e+h:0}},top:function(b,a){if(a.at[1]!=="center"){var d=c(window);d=a.collisionPosition.top+a.collisionHeight-d.height()-d.scrollTop();var g=a.my[1]==="top"?-a.elemHeight:a.my[1]==="bottom"?a.elemHeight:0,e=a.at[1]==="top"?a.targetHeight:-a.targetHeight,h=-2*a.offset[1];b.top+=a.collisionPosition.top<0?g+e+h:d>0?g+e+h:0}}}};if(!c.offset.setOffset){c.offset.setOffset=function(b,a){if(/static/.test(c.curCSS(b,"position")))b.style.position="relative";var d=c(b),
g=d.offset(),e=parseInt(c.curCSS(b,"top",true),10)||0,h=parseInt(c.curCSS(b,"left",true),10)||0;g={top:a.top-g.top+e,left:a.left-g.left+h};"using"in a?a.using.call(b,g):d.css(g)};c.fn.offset=function(b){var a=this[0];if(!a||!a.ownerDocument)return null;if(b)return this.each(function(){c.offset.setOffset(this,b)});return u.call(this)}}})(jQuery);
;/*
 * jQuery UI Draggable 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.draggable",d.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false},_create:function(){if(this.options.helper==
"original"&&!/^(?:r|a|f)/.test(this.element.css("position")))this.element[0].style.position="relative";this.options.addClasses&&this.element.addClass("ui-draggable");this.options.disabled&&this.element.addClass("ui-draggable-disabled");this._mouseInit()},destroy:function(){if(this.element.data("draggable")){this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._mouseDestroy();return this}},_mouseCapture:function(a){var b=
this.options;if(this.helper||b.disabled||d(a.target).is(".ui-resizable-handle"))return false;this.handle=this._getHandle(a);if(!this.handle)return false;if(b.iframeFix)d(b.iframeFix===true?"iframe":b.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")});return true},_mouseStart:function(a){var b=this.options;
this.helper=this._createHelper(a);this._cacheHelperProportions();if(d.ui.ddmanager)d.ui.ddmanager.current=this;this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});
this.originalPosition=this.position=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);b.containment&&this._setContainment();if(this._trigger("start",a)===false){this._clear();return false}this._cacheHelperProportions();d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.helper.addClass("ui-draggable-dragging");this._mouseDrag(a,true);d.ui.ddmanager&&d.ui.ddmanager.dragStart(this,a);return true},
_mouseDrag:function(a,b){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!b){b=this._uiHash();if(this._trigger("drag",a,b)===false){this._mouseUp({});return false}this.position=b.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return false},_mouseStop:function(a){var b=
false;if(d.ui.ddmanager&&!this.options.dropBehaviour)b=d.ui.ddmanager.drop(this,a);if(this.dropped){b=this.dropped;this.dropped=false}if((!this.element[0]||!this.element[0].parentNode)&&this.options.helper=="original")return false;if(this.options.revert=="invalid"&&!b||this.options.revert=="valid"&&b||this.options.revert===true||d.isFunction(this.options.revert)&&this.options.revert.call(this.element,b)){var c=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,
10),function(){c._trigger("stop",a)!==false&&c._clear()})}else this._trigger("stop",a)!==false&&this._clear();return false},_mouseUp:function(a){this.options.iframeFix===true&&d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)});d.ui.ddmanager&&d.ui.ddmanager.dragStop(this,a);return d.ui.mouse.prototype._mouseUp.call(this,a)},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var b=!this.options.handle||
!d(this.options.handle,this.element).length?true:false;d(this.options.handle,this.element).find("*").andSelf().each(function(){if(this==a.target)b=true});return b},_createHelper:function(a){var b=this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a])):b.helper=="clone"?this.element.clone().removeAttr("id"):this.element;a.parents("body").length||a.appendTo(b.appendTo=="parent"?this.element[0].parentNode:b.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&
a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=
this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),
10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),
10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[a.containment=="document"?0:d(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,a.containment=="document"?0:d(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,
(a.containment=="document"?0:d(window).scrollLeft())+d(a.containment=="document"?document:window).width()-this.helperProportions.width-this.margins.left,(a.containment=="document"?0:d(window).scrollTop())+(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&a.containment.constructor!=Array){a=d(a.containment);var b=a[0];if(b){a.offset();var c=d(b).css("overflow")!=
"hidden";this.containment=[(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0),(parseInt(d(b).css("borderTopWidth"),10)||0)+(parseInt(d(b).css("paddingTop"),10)||0),(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),
10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom];this.relative_container=a}}else if(a.containment.constructor==Array)this.containment=a.containment},_convertPositionTo:function(a,b){if(!b)b=this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName);return{top:b.top+
this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&
!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(c[0].tagName),e=a.pageX,h=a.pageY;if(this.originalPosition){var g;if(this.containment){if(this.relative_container){g=this.relative_container.offset();g=[this.containment[0]+g.left,this.containment[1]+g.top,this.containment[2]+g.left,this.containment[3]+g.top]}else g=this.containment;if(a.pageX-this.offset.click.left<g[0])e=g[0]+this.offset.click.left;
if(a.pageY-this.offset.click.top<g[1])h=g[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>g[2])e=g[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>g[3])h=g[3]+this.offset.click.top}if(b.grid){h=b.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/b.grid[1])*b.grid[1]:this.originalPageY;h=g?!(h-this.offset.click.top<g[1]||h-this.offset.click.top>g[3])?h:!(h-this.offset.click.top<g[1])?h-b.grid[1]:h+b.grid[1]:h;e=b.grid[0]?this.originalPageX+Math.round((e-this.originalPageX)/
b.grid[0])*b.grid[0]:this.originalPageX;e=g?!(e-this.offset.click.left<g[0]||e-this.offset.click.left>g[2])?e:!(e-this.offset.click.left<g[0])?e-b.grid[0]:e+b.grid[0]:e}}return{top:h-this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:c.scrollTop()),left:e-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<
526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:c.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=false},_trigger:function(a,b,c){c=c||this._uiHash();d.ui.plugin.call(this,a,[b,c]);if(a=="drag")this.positionAbs=this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,b,
c)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.16"});d.ui.plugin.add("draggable","connectToSortable",{start:function(a,b){var c=d(this).data("draggable"),f=c.options,e=d.extend({},b,{item:c.element});c.sortables=[];d(f.connectToSortable).each(function(){var h=d.data(this,"sortable");if(h&&!h.options.disabled){c.sortables.push({instance:h,shouldRevert:h.options.revert});
h.refreshPositions();h._trigger("activate",a,e)}})},stop:function(a,b){var c=d(this).data("draggable"),f=d.extend({},b,{item:c.element});d.each(c.sortables,function(){if(this.instance.isOver){this.instance.isOver=0;c.cancelHelperRemoval=true;this.instance.cancelHelperRemoval=false;if(this.shouldRevert)this.instance.options.revert=true;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;c.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else{this.instance.cancelHelperRemoval=
false;this.instance._trigger("deactivate",a,f)}})},drag:function(a,b){var c=d(this).data("draggable"),f=this;d.each(c.sortables,function(){this.instance.positionAbs=c.positionAbs;this.instance.helperProportions=c.helperProportions;this.instance.offset.click=c.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver){this.instance.isOver=1;this.instance.currentItem=d(f).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",true);
this.instance.options._helper=this.instance.options.helper;this.instance.options.helper=function(){return b.helper[0]};a.target=this.instance.currentItem[0];this.instance._mouseCapture(a,true);this.instance._mouseStart(a,true,true);this.instance.offset.click.top=c.offset.click.top;this.instance.offset.click.left=c.offset.click.left;this.instance.offset.parent.left-=c.offset.parent.left-this.instance.offset.parent.left;this.instance.offset.parent.top-=c.offset.parent.top-this.instance.offset.parent.top;
c._trigger("toSortable",a);c.dropped=this.instance.element;c.currentItem=c.element;this.instance.fromOutside=c}this.instance.currentItem&&this.instance._mouseDrag(a)}else if(this.instance.isOver){this.instance.isOver=0;this.instance.cancelHelperRemoval=true;this.instance.options.revert=false;this.instance._trigger("out",a,this.instance._uiHash(this.instance));this.instance._mouseStop(a,true);this.instance.options.helper=this.instance.options._helper;this.instance.currentItem.remove();this.instance.placeholder&&
this.instance.placeholder.remove();c._trigger("fromSortable",a);c.dropped=false}})}});d.ui.plugin.add("draggable","cursor",{start:function(){var a=d("body"),b=d(this).data("draggable").options;if(a.css("cursor"))b._cursor=a.css("cursor");a.css("cursor",b.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","opacity",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("opacity"))b._opacity=
a.css("opacity");a.css("opacity",b.opacity)},stop:function(a,b){a=d(this).data("draggable").options;a._opacity&&d(b.helper).css("opacity",a._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var b=d(this).data("draggable"),c=b.options,f=false;if(b.scrollParent[0]!=document&&b.scrollParent[0].tagName!="HTML"){if(!c.axis||c.axis!=
"x")if(b.overflowOffset.top+b.scrollParent[0].offsetHeight-a.pageY<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop+c.scrollSpeed;else if(a.pageY-b.overflowOffset.top<c.scrollSensitivity)b.scrollParent[0].scrollTop=f=b.scrollParent[0].scrollTop-c.scrollSpeed;if(!c.axis||c.axis!="y")if(b.overflowOffset.left+b.scrollParent[0].offsetWidth-a.pageX<c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft+c.scrollSpeed;else if(a.pageX-b.overflowOffset.left<
c.scrollSensitivity)b.scrollParent[0].scrollLeft=f=b.scrollParent[0].scrollLeft-c.scrollSpeed}else{if(!c.axis||c.axis!="x")if(a.pageY-d(document).scrollTop()<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()-c.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<c.scrollSensitivity)f=d(document).scrollTop(d(document).scrollTop()+c.scrollSpeed);if(!c.axis||c.axis!="y")if(a.pageX-d(document).scrollLeft()<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()-
c.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<c.scrollSensitivity)f=d(document).scrollLeft(d(document).scrollLeft()+c.scrollSpeed)}f!==false&&d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(b,a)}});d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),b=a.options;a.snapElements=[];d(b.snap.constructor!=String?b.snap.items||":data(draggable)":b.snap).each(function(){var c=d(this),f=c.offset();this!=a.element[0]&&a.snapElements.push({item:this,
width:c.outerWidth(),height:c.outerHeight(),top:f.top,left:f.left})})},drag:function(a,b){for(var c=d(this).data("draggable"),f=c.options,e=f.snapTolerance,h=b.offset.left,g=h+c.helperProportions.width,n=b.offset.top,o=n+c.helperProportions.height,i=c.snapElements.length-1;i>=0;i--){var j=c.snapElements[i].left,l=j+c.snapElements[i].width,k=c.snapElements[i].top,m=k+c.snapElements[i].height;if(j-e<h&&h<l+e&&k-e<n&&n<m+e||j-e<h&&h<l+e&&k-e<o&&o<m+e||j-e<g&&g<l+e&&k-e<n&&n<m+e||j-e<g&&g<l+e&&k-e<o&&
o<m+e){if(f.snapMode!="inner"){var p=Math.abs(k-o)<=e,q=Math.abs(m-n)<=e,r=Math.abs(j-g)<=e,s=Math.abs(l-h)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k-c.helperProportions.height,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j-c.helperProportions.width}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l}).left-c.margins.left}var t=
p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(k-n)<=e;q=Math.abs(m-o)<=e;r=Math.abs(j-h)<=e;s=Math.abs(l-g)<=e;if(p)b.position.top=c._convertPositionTo("relative",{top:k,left:0}).top-c.margins.top;if(q)b.position.top=c._convertPositionTo("relative",{top:m-c.helperProportions.height,left:0}).top-c.margins.top;if(r)b.position.left=c._convertPositionTo("relative",{top:0,left:j}).left-c.margins.left;if(s)b.position.left=c._convertPositionTo("relative",{top:0,left:l-c.helperProportions.width}).left-c.margins.left}if(!c.snapElements[i].snapping&&
(p||q||r||s||t))c.options.snap.snap&&c.options.snap.snap.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=p||q||r||s||t}else{c.snapElements[i].snapping&&c.options.snap.release&&c.options.snap.release.call(c.element,a,d.extend(c._uiHash(),{snapItem:c.snapElements[i].item}));c.snapElements[i].snapping=false}}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options;a=d.makeArray(d(a.stack)).sort(function(c,f){return(parseInt(d(c).css("zIndex"),
10)||0)-(parseInt(d(f).css("zIndex"),10)||0)});if(a.length){var b=parseInt(a[0].style.zIndex)||0;d(a).each(function(c){this.style.zIndex=b+c});this[0].style.zIndex=b+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,b){a=d(b.helper);b=d(this).data("draggable").options;if(a.css("zIndex"))b._zIndex=a.css("zIndex");a.css("zIndex",b.zIndex)},stop:function(a,b){a=d(this).data("draggable").options;a._zIndex&&d(b.helper).css("zIndex",a._zIndex)}})})(jQuery);
;/*
 * jQuery UI Droppable 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.mouse.js
 *	jquery.ui.draggable.js
 */
(function(d){d.widget("ui.droppable",{widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect"},_create:function(){var a=this.options,b=a.accept;this.isover=0;this.isout=1;this.accept=d.isFunction(b)?b:function(c){return c.is(b)};this.proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};d.ui.ddmanager.droppables[a.scope]=d.ui.ddmanager.droppables[a.scope]||[];d.ui.ddmanager.droppables[a.scope].push(this);
a.addClasses&&this.element.addClass("ui-droppable")},destroy:function(){for(var a=d.ui.ddmanager.droppables[this.options.scope],b=0;b<a.length;b++)a[b]==this&&a.splice(b,1);this.element.removeClass("ui-droppable ui-droppable-disabled").removeData("droppable").unbind(".droppable");return this},_setOption:function(a,b){if(a=="accept")this.accept=d.isFunction(b)?b:function(c){return c.is(b)};d.Widget.prototype._setOption.apply(this,arguments)},_activate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&
this.element.addClass(this.options.activeClass);b&&this._trigger("activate",a,this.ui(b))},_deactivate:function(a){var b=d.ui.ddmanager.current;this.options.activeClass&&this.element.removeClass(this.options.activeClass);b&&this._trigger("deactivate",a,this.ui(b))},_over:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.addClass(this.options.hoverClass);
this._trigger("over",a,this.ui(b))}},_out:function(a){var b=d.ui.ddmanager.current;if(!(!b||(b.currentItem||b.element)[0]==this.element[0]))if(this.accept.call(this.element[0],b.currentItem||b.element)){this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("out",a,this.ui(b))}},_drop:function(a,b){var c=b||d.ui.ddmanager.current;if(!c||(c.currentItem||c.element)[0]==this.element[0])return false;var e=false;this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function(){var g=
d.data(this,"droppable");if(g.options.greedy&&!g.options.disabled&&g.options.scope==c.options.scope&&g.accept.call(g.element[0],c.currentItem||c.element)&&d.ui.intersect(c,d.extend(g,{offset:g.element.offset()}),g.options.tolerance)){e=true;return false}});if(e)return false;if(this.accept.call(this.element[0],c.currentItem||c.element)){this.options.activeClass&&this.element.removeClass(this.options.activeClass);this.options.hoverClass&&this.element.removeClass(this.options.hoverClass);this._trigger("drop",
a,this.ui(c));return this.element}return false},ui:function(a){return{draggable:a.currentItem||a.element,helper:a.helper,position:a.position,offset:a.positionAbs}}});d.extend(d.ui.droppable,{version:"1.8.16"});d.ui.intersect=function(a,b,c){if(!b.offset)return false;var e=(a.positionAbs||a.position.absolute).left,g=e+a.helperProportions.width,f=(a.positionAbs||a.position.absolute).top,h=f+a.helperProportions.height,i=b.offset.left,k=i+b.proportions.width,j=b.offset.top,l=j+b.proportions.height;
switch(c){case "fit":return i<=e&&g<=k&&j<=f&&h<=l;case "intersect":return i<e+a.helperProportions.width/2&&g-a.helperProportions.width/2<k&&j<f+a.helperProportions.height/2&&h-a.helperProportions.height/2<l;case "pointer":return d.ui.isOver((a.positionAbs||a.position.absolute).top+(a.clickOffset||a.offset.click).top,(a.positionAbs||a.position.absolute).left+(a.clickOffset||a.offset.click).left,j,i,b.proportions.height,b.proportions.width);case "touch":return(f>=j&&f<=l||h>=j&&h<=l||f<j&&h>l)&&(e>=
i&&e<=k||g>=i&&g<=k||e<i&&g>k);default:return false}};d.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function(a,b){var c=d.ui.ddmanager.droppables[a.options.scope]||[],e=b?b.type:null,g=(a.currentItem||a.element).find(":data(droppable)").andSelf(),f=0;a:for(;f<c.length;f++)if(!(c[f].options.disabled||a&&!c[f].accept.call(c[f].element[0],a.currentItem||a.element))){for(var h=0;h<g.length;h++)if(g[h]==c[f].element[0]){c[f].proportions.height=0;continue a}c[f].visible=c[f].element.css("display")!=
"none";if(c[f].visible){e=="mousedown"&&c[f]._activate.call(c[f],b);c[f].offset=c[f].element.offset();c[f].proportions={width:c[f].element[0].offsetWidth,height:c[f].element[0].offsetHeight}}}},drop:function(a,b){var c=false;d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(this.options){if(!this.options.disabled&&this.visible&&d.ui.intersect(a,this,this.options.tolerance))c=c||this._drop.call(this,b);if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],a.currentItem||
a.element)){this.isout=1;this.isover=0;this._deactivate.call(this,b)}}});return c},dragStart:function(a,b){a.element.parents(":not(body,html)").bind("scroll.droppable",function(){a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)})},drag:function(a,b){a.options.refreshPositions&&d.ui.ddmanager.prepareOffsets(a,b);d.each(d.ui.ddmanager.droppables[a.options.scope]||[],function(){if(!(this.options.disabled||this.greedyChild||!this.visible)){var c=d.ui.intersect(a,this,this.options.tolerance);
if(c=!c&&this.isover==1?"isout":c&&this.isover==0?"isover":null){var e;if(this.options.greedy){var g=this.element.parents(":data(droppable):eq(0)");if(g.length){e=d.data(g[0],"droppable");e.greedyChild=c=="isover"?1:0}}if(e&&c=="isover"){e.isover=0;e.isout=1;e._out.call(e,b)}this[c]=1;this[c=="isout"?"isover":"isout"]=0;this[c=="isover"?"_over":"_out"].call(this,b);if(e&&c=="isout"){e.isout=0;e.isover=1;e._over.call(e,b)}}}})},dragStop:function(a,b){a.element.parents(":not(body,html)").unbind("scroll.droppable");
a.options.refreshPositions||d.ui.ddmanager.prepareOffsets(a,b)}}})(jQuery);
;/*
 * jQuery UI Resizable 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(e){e.widget("ui.resizable",e.ui.mouse,{widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,zIndex:1E3},_create:function(){var b=this,a=this.options;this.element.addClass("ui-resizable");e.extend(this,{_aspectRatio:!!a.aspectRatio,aspectRatio:a.aspectRatio,originalElement:this.element,
_proportionallyResizeElements:[],_helper:a.helper||a.ghost||a.animate?a.helper||"ui-resizable-helper":null});if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)){/relative/.test(this.element.css("position"))&&e.browser.opera&&this.element.css({position:"relative",top:"auto",left:"auto"});this.element.wrap(e('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),
top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("resizable",this.element.data("resizable"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});this.originalResizeStyle=
this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize()}this.handles=a.handles||(!e(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",
nw:".ui-resizable-nw"});if(this.handles.constructor==String){if(this.handles=="all")this.handles="n,e,s,w,se,sw,ne,nw";var c=this.handles.split(",");this.handles={};for(var d=0;d<c.length;d++){var f=e.trim(c[d]),g=e('<div class="ui-resizable-handle '+("ui-resizable-"+f)+'"></div>');/sw|se|ne|nw/.test(f)&&g.css({zIndex:++a.zIndex});"se"==f&&g.addClass("ui-icon ui-icon-gripsmall-diagonal-se");this.handles[f]=".ui-resizable-"+f;this.element.append(g)}}this._renderAxis=function(h){h=h||this.element;for(var i in this.handles){if(this.handles[i].constructor==
String)this.handles[i]=e(this.handles[i],this.element).show();if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/textarea|input|select|button/i)){var j=e(this.handles[i],this.element),l=0;l=/sw|ne|nw|se|n|s/.test(i)?j.outerHeight():j.outerWidth();j=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");h.css(j,l);this._proportionallyResize()}e(this.handles[i])}};this._renderAxis(this.element);this._handles=e(".ui-resizable-handle",this.element).disableSelection();
this._handles.mouseover(function(){if(!b.resizing){if(this.className)var h=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);b.axis=h&&h[1]?h[1]:"se"}});if(a.autoHide){this._handles.hide();e(this.element).addClass("ui-resizable-autohide").hover(function(){if(!a.disabled){e(this).removeClass("ui-resizable-autohide");b._handles.show()}},function(){if(!a.disabled)if(!b.resizing){e(this).addClass("ui-resizable-autohide");b._handles.hide()}})}this._mouseInit()},destroy:function(){this._mouseDestroy();
var b=function(c){e(c).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").unbind(".resizable").find(".ui-resizable-handle").remove()};if(this.elementIsWrapper){b(this.element);var a=this.element;a.after(this.originalElement.css({position:a.css("position"),width:a.outerWidth(),height:a.outerHeight(),top:a.css("top"),left:a.css("left")})).remove()}this.originalElement.css("resize",this.originalResizeStyle);b(this.originalElement);return this},_mouseCapture:function(b){var a=
false;for(var c in this.handles)if(e(this.handles[c])[0]==b.target)a=true;return!this.options.disabled&&a},_mouseStart:function(b){var a=this.options,c=this.element.position(),d=this.element;this.resizing=true;this.documentScroll={top:e(document).scrollTop(),left:e(document).scrollLeft()};if(d.is(".ui-draggable")||/absolute/.test(d.css("position")))d.css({position:"absolute",top:c.top,left:c.left});e.browser.opera&&/relative/.test(d.css("position"))&&d.css({position:"relative",top:"auto",left:"auto"});
this._renderProxy();c=m(this.helper.css("left"));var f=m(this.helper.css("top"));if(a.containment){c+=e(a.containment).scrollLeft()||0;f+=e(a.containment).scrollTop()||0}this.offset=this.helper.offset();this.position={left:c,top:f};this.size=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalSize=this._helper?{width:d.outerWidth(),height:d.outerHeight()}:{width:d.width(),height:d.height()};this.originalPosition={left:c,top:f};this.sizeDiff=
{width:d.outerWidth()-d.width(),height:d.outerHeight()-d.height()};this.originalMousePosition={left:b.pageX,top:b.pageY};this.aspectRatio=typeof a.aspectRatio=="number"?a.aspectRatio:this.originalSize.width/this.originalSize.height||1;a=e(".ui-resizable-"+this.axis).css("cursor");e("body").css("cursor",a=="auto"?this.axis+"-resize":a);d.addClass("ui-resizable-resizing");this._propagate("start",b);return true},_mouseDrag:function(b){var a=this.helper,c=this.originalMousePosition,d=this._change[this.axis];
if(!d)return false;c=d.apply(this,[b,b.pageX-c.left||0,b.pageY-c.top||0]);this._updateVirtualBoundaries(b.shiftKey);if(this._aspectRatio||b.shiftKey)c=this._updateRatio(c,b);c=this._respectSize(c,b);this._propagate("resize",b);a.css({top:this.position.top+"px",left:this.position.left+"px",width:this.size.width+"px",height:this.size.height+"px"});!this._helper&&this._proportionallyResizeElements.length&&this._proportionallyResize();this._updateCache(c);this._trigger("resize",b,this.ui());return false},
_mouseStop:function(b){this.resizing=false;var a=this.options,c=this;if(this._helper){var d=this._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName);d=f&&e.ui.hasScroll(d[0],"left")?0:c.sizeDiff.height;f=f?0:c.sizeDiff.width;f={width:c.helper.width()-f,height:c.helper.height()-d};d=parseInt(c.element.css("left"),10)+(c.position.left-c.originalPosition.left)||null;var g=parseInt(c.element.css("top"),10)+(c.position.top-c.originalPosition.top)||null;a.animate||this.element.css(e.extend(f,
{top:g,left:d}));c.helper.height(c.size.height);c.helper.width(c.size.width);this._helper&&!a.animate&&this._proportionallyResize()}e("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",b);this._helper&&this.helper.remove();return false},_updateVirtualBoundaries:function(b){var a=this.options,c,d,f;a={minWidth:k(a.minWidth)?a.minWidth:0,maxWidth:k(a.maxWidth)?a.maxWidth:Infinity,minHeight:k(a.minHeight)?a.minHeight:0,maxHeight:k(a.maxHeight)?a.maxHeight:
Infinity};if(this._aspectRatio||b){b=a.minHeight*this.aspectRatio;d=a.minWidth/this.aspectRatio;c=a.maxHeight*this.aspectRatio;f=a.maxWidth/this.aspectRatio;if(b>a.minWidth)a.minWidth=b;if(d>a.minHeight)a.minHeight=d;if(c<a.maxWidth)a.maxWidth=c;if(f<a.maxHeight)a.maxHeight=f}this._vBoundaries=a},_updateCache:function(b){this.offset=this.helper.offset();if(k(b.left))this.position.left=b.left;if(k(b.top))this.position.top=b.top;if(k(b.height))this.size.height=b.height;if(k(b.width))this.size.width=
b.width},_updateRatio:function(b){var a=this.position,c=this.size,d=this.axis;if(k(b.height))b.width=b.height*this.aspectRatio;else if(k(b.width))b.height=b.width/this.aspectRatio;if(d=="sw"){b.left=a.left+(c.width-b.width);b.top=null}if(d=="nw"){b.top=a.top+(c.height-b.height);b.left=a.left+(c.width-b.width)}return b},_respectSize:function(b){var a=this._vBoundaries,c=this.axis,d=k(b.width)&&a.maxWidth&&a.maxWidth<b.width,f=k(b.height)&&a.maxHeight&&a.maxHeight<b.height,g=k(b.width)&&a.minWidth&&
a.minWidth>b.width,h=k(b.height)&&a.minHeight&&a.minHeight>b.height;if(g)b.width=a.minWidth;if(h)b.height=a.minHeight;if(d)b.width=a.maxWidth;if(f)b.height=a.maxHeight;var i=this.originalPosition.left+this.originalSize.width,j=this.position.top+this.size.height,l=/sw|nw|w/.test(c);c=/nw|ne|n/.test(c);if(g&&l)b.left=i-a.minWidth;if(d&&l)b.left=i-a.maxWidth;if(h&&c)b.top=j-a.minHeight;if(f&&c)b.top=j-a.maxHeight;if((a=!b.width&&!b.height)&&!b.left&&b.top)b.top=null;else if(a&&!b.top&&b.left)b.left=
null;return b},_proportionallyResize:function(){if(this._proportionallyResizeElements.length)for(var b=this.helper||this.element,a=0;a<this._proportionallyResizeElements.length;a++){var c=this._proportionallyResizeElements[a];if(!this.borderDif){var d=[c.css("borderTopWidth"),c.css("borderRightWidth"),c.css("borderBottomWidth"),c.css("borderLeftWidth")],f=[c.css("paddingTop"),c.css("paddingRight"),c.css("paddingBottom"),c.css("paddingLeft")];this.borderDif=e.map(d,function(g,h){g=parseInt(g,10)||
0;h=parseInt(f[h],10)||0;return g+h})}e.browser.msie&&(e(b).is(":hidden")||e(b).parents(":hidden").length)||c.css({height:b.height()-this.borderDif[0]-this.borderDif[2]||0,width:b.width()-this.borderDif[1]-this.borderDif[3]||0})}},_renderProxy:function(){var b=this.options;this.elementOffset=this.element.offset();if(this._helper){this.helper=this.helper||e('<div style="overflow:hidden;"></div>');var a=e.browser.msie&&e.browser.version<7,c=a?1:0;a=a?2:-1;this.helper.addClass(this._helper).css({width:this.element.outerWidth()+
a,height:this.element.outerHeight()+a,position:"absolute",left:this.elementOffset.left-c+"px",top:this.elementOffset.top-c+"px",zIndex:++b.zIndex});this.helper.appendTo("body").disableSelection()}else this.helper=this.element},_change:{e:function(b,a){return{width:this.originalSize.width+a}},w:function(b,a){return{left:this.originalPosition.left+a,width:this.originalSize.width-a}},n:function(b,a,c){return{top:this.originalPosition.top+c,height:this.originalSize.height-c}},s:function(b,a,c){return{height:this.originalSize.height+
c}},se:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},sw:function(b,a,c){return e.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[b,a,c]))},ne:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[b,a,c]))},nw:function(b,a,c){return e.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[b,a,c]))}},_propagate:function(b,a){e.ui.plugin.call(this,b,[a,this.ui()]);
b!="resize"&&this._trigger(b,a,this.ui())},plugins:{},ui:function(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition}}});e.extend(e.ui.resizable,{version:"1.8.16"});e.ui.plugin.add("resizable","alsoResize",{start:function(){var b=e(this).data("resizable").options,a=function(c){e(c).each(function(){var d=e(this);d.data("resizable-alsoresize",{width:parseInt(d.width(),
10),height:parseInt(d.height(),10),left:parseInt(d.css("left"),10),top:parseInt(d.css("top"),10),position:d.css("position")})})};if(typeof b.alsoResize=="object"&&!b.alsoResize.parentNode)if(b.alsoResize.length){b.alsoResize=b.alsoResize[0];a(b.alsoResize)}else e.each(b.alsoResize,function(c){a(c)});else a(b.alsoResize)},resize:function(b,a){var c=e(this).data("resizable");b=c.options;var d=c.originalSize,f=c.originalPosition,g={height:c.size.height-d.height||0,width:c.size.width-d.width||0,top:c.position.top-
f.top||0,left:c.position.left-f.left||0},h=function(i,j){e(i).each(function(){var l=e(this),q=e(this).data("resizable-alsoresize"),p={},r=j&&j.length?j:l.parents(a.originalElement[0]).length?["width","height"]:["width","height","top","left"];e.each(r,function(n,o){if((n=(q[o]||0)+(g[o]||0))&&n>=0)p[o]=n||null});if(e.browser.opera&&/relative/.test(l.css("position"))){c._revertToRelativePosition=true;l.css({position:"absolute",top:"auto",left:"auto"})}l.css(p)})};typeof b.alsoResize=="object"&&!b.alsoResize.nodeType?
e.each(b.alsoResize,function(i,j){h(i,j)}):h(b.alsoResize)},stop:function(){var b=e(this).data("resizable"),a=b.options,c=function(d){e(d).each(function(){var f=e(this);f.css({position:f.data("resizable-alsoresize").position})})};if(b._revertToRelativePosition){b._revertToRelativePosition=false;typeof a.alsoResize=="object"&&!a.alsoResize.nodeType?e.each(a.alsoResize,function(d){c(d)}):c(a.alsoResize)}e(this).removeData("resizable-alsoresize")}});e.ui.plugin.add("resizable","animate",{stop:function(b){var a=
e(this).data("resizable"),c=a.options,d=a._proportionallyResizeElements,f=d.length&&/textarea/i.test(d[0].nodeName),g=f&&e.ui.hasScroll(d[0],"left")?0:a.sizeDiff.height;f={width:a.size.width-(f?0:a.sizeDiff.width),height:a.size.height-g};g=parseInt(a.element.css("left"),10)+(a.position.left-a.originalPosition.left)||null;var h=parseInt(a.element.css("top"),10)+(a.position.top-a.originalPosition.top)||null;a.element.animate(e.extend(f,h&&g?{top:h,left:g}:{}),{duration:c.animateDuration,easing:c.animateEasing,
step:function(){var i={width:parseInt(a.element.css("width"),10),height:parseInt(a.element.css("height"),10),top:parseInt(a.element.css("top"),10),left:parseInt(a.element.css("left"),10)};d&&d.length&&e(d[0]).css({width:i.width,height:i.height});a._updateCache(i);a._propagate("resize",b)}})}});e.ui.plugin.add("resizable","containment",{start:function(){var b=e(this).data("resizable"),a=b.element,c=b.options.containment;if(a=c instanceof e?c.get(0):/parent/.test(c)?a.parent().get(0):c){b.containerElement=
e(a);if(/document/.test(c)||c==document){b.containerOffset={left:0,top:0};b.containerPosition={left:0,top:0};b.parentData={element:e(document),left:0,top:0,width:e(document).width(),height:e(document).height()||document.body.parentNode.scrollHeight}}else{var d=e(a),f=[];e(["Top","Right","Left","Bottom"]).each(function(i,j){f[i]=m(d.css("padding"+j))});b.containerOffset=d.offset();b.containerPosition=d.position();b.containerSize={height:d.innerHeight()-f[3],width:d.innerWidth()-f[1]};c=b.containerOffset;
var g=b.containerSize.height,h=b.containerSize.width;h=e.ui.hasScroll(a,"left")?a.scrollWidth:h;g=e.ui.hasScroll(a)?a.scrollHeight:g;b.parentData={element:a,left:c.left,top:c.top,width:h,height:g}}}},resize:function(b){var a=e(this).data("resizable"),c=a.options,d=a.containerOffset,f=a.position;b=a._aspectRatio||b.shiftKey;var g={top:0,left:0},h=a.containerElement;if(h[0]!=document&&/static/.test(h.css("position")))g=d;if(f.left<(a._helper?d.left:0)){a.size.width+=a._helper?a.position.left-d.left:
a.position.left-g.left;if(b)a.size.height=a.size.width/c.aspectRatio;a.position.left=c.helper?d.left:0}if(f.top<(a._helper?d.top:0)){a.size.height+=a._helper?a.position.top-d.top:a.position.top;if(b)a.size.width=a.size.height*c.aspectRatio;a.position.top=a._helper?d.top:0}a.offset.left=a.parentData.left+a.position.left;a.offset.top=a.parentData.top+a.position.top;c=Math.abs((a._helper?a.offset.left-g.left:a.offset.left-g.left)+a.sizeDiff.width);d=Math.abs((a._helper?a.offset.top-g.top:a.offset.top-
d.top)+a.sizeDiff.height);f=a.containerElement.get(0)==a.element.parent().get(0);g=/relative|absolute/.test(a.containerElement.css("position"));if(f&&g)c-=a.parentData.left;if(c+a.size.width>=a.parentData.width){a.size.width=a.parentData.width-c;if(b)a.size.height=a.size.width/a.aspectRatio}if(d+a.size.height>=a.parentData.height){a.size.height=a.parentData.height-d;if(b)a.size.width=a.size.height*a.aspectRatio}},stop:function(){var b=e(this).data("resizable"),a=b.options,c=b.containerOffset,d=b.containerPosition,
f=b.containerElement,g=e(b.helper),h=g.offset(),i=g.outerWidth()-b.sizeDiff.width;g=g.outerHeight()-b.sizeDiff.height;b._helper&&!a.animate&&/relative/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g});b._helper&&!a.animate&&/static/.test(f.css("position"))&&e(this).css({left:h.left-d.left-c.left,width:i,height:g})}});e.ui.plugin.add("resizable","ghost",{start:function(){var b=e(this).data("resizable"),a=b.options,c=b.size;b.ghost=b.originalElement.clone();b.ghost.css({opacity:0.25,
display:"block",position:"relative",height:c.height,width:c.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof a.ghost=="string"?a.ghost:"");b.ghost.appendTo(b.helper)},resize:function(){var b=e(this).data("resizable");b.ghost&&b.ghost.css({position:"relative",height:b.size.height,width:b.size.width})},stop:function(){var b=e(this).data("resizable");b.ghost&&b.helper&&b.helper.get(0).removeChild(b.ghost.get(0))}});e.ui.plugin.add("resizable","grid",{resize:function(){var b=
e(this).data("resizable"),a=b.options,c=b.size,d=b.originalSize,f=b.originalPosition,g=b.axis;a.grid=typeof a.grid=="number"?[a.grid,a.grid]:a.grid;var h=Math.round((c.width-d.width)/(a.grid[0]||1))*(a.grid[0]||1);a=Math.round((c.height-d.height)/(a.grid[1]||1))*(a.grid[1]||1);if(/^(se|s|e)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a}else if(/^(ne)$/.test(g)){b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}else{if(/^(sw)$/.test(g)){b.size.width=d.width+h;b.size.height=
d.height+a}else{b.size.width=d.width+h;b.size.height=d.height+a;b.position.top=f.top-a}b.position.left=f.left-h}}});var m=function(b){return parseInt(b,10)||0},k=function(b){return!isNaN(parseInt(b,10))}})(jQuery);
;/*
 * jQuery UI Selectable 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(e){e.widget("ui.selectable",e.ui.mouse,{options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch"},_create:function(){var c=this;this.element.addClass("ui-selectable");this.dragged=false;var f;this.refresh=function(){f=e(c.options.filter,c.element[0]);f.each(function(){var d=e(this),b=d.offset();e.data(this,"selectable-item",{element:this,$element:d,left:b.left,top:b.top,right:b.left+d.outerWidth(),bottom:b.top+d.outerHeight(),startselected:false,selected:d.hasClass("ui-selected"),
selecting:d.hasClass("ui-selecting"),unselecting:d.hasClass("ui-unselecting")})})};this.refresh();this.selectees=f.addClass("ui-selectee");this._mouseInit();this.helper=e("<div class='ui-selectable-helper'></div>")},destroy:function(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled").removeData("selectable").unbind(".selectable");this._mouseDestroy();return this},_mouseStart:function(c){var f=this;this.opos=[c.pageX,
c.pageY];if(!this.options.disabled){var d=this.options;this.selectees=e(d.filter,this.element[0]);this._trigger("start",c);e(d.appendTo).append(this.helper);this.helper.css({left:c.clientX,top:c.clientY,width:0,height:0});d.autoRefresh&&this.refresh();this.selectees.filter(".ui-selected").each(function(){var b=e.data(this,"selectable-item");b.startselected=true;if(!c.metaKey){b.$element.removeClass("ui-selected");b.selected=false;b.$element.addClass("ui-unselecting");b.unselecting=true;f._trigger("unselecting",
c,{unselecting:b.element})}});e(c.target).parents().andSelf().each(function(){var b=e.data(this,"selectable-item");if(b){var g=!c.metaKey||!b.$element.hasClass("ui-selected");b.$element.removeClass(g?"ui-unselecting":"ui-selected").addClass(g?"ui-selecting":"ui-unselecting");b.unselecting=!g;b.selecting=g;(b.selected=g)?f._trigger("selecting",c,{selecting:b.element}):f._trigger("unselecting",c,{unselecting:b.element});return false}})}},_mouseDrag:function(c){var f=this;this.dragged=true;if(!this.options.disabled){var d=
this.options,b=this.opos[0],g=this.opos[1],h=c.pageX,i=c.pageY;if(b>h){var j=h;h=b;b=j}if(g>i){j=i;i=g;g=j}this.helper.css({left:b,top:g,width:h-b,height:i-g});this.selectees.each(function(){var a=e.data(this,"selectable-item");if(!(!a||a.element==f.element[0])){var k=false;if(d.tolerance=="touch")k=!(a.left>h||a.right<b||a.top>i||a.bottom<g);else if(d.tolerance=="fit")k=a.left>b&&a.right<h&&a.top>g&&a.bottom<i;if(k){if(a.selected){a.$element.removeClass("ui-selected");a.selected=false}if(a.unselecting){a.$element.removeClass("ui-unselecting");
a.unselecting=false}if(!a.selecting){a.$element.addClass("ui-selecting");a.selecting=true;f._trigger("selecting",c,{selecting:a.element})}}else{if(a.selecting)if(c.metaKey&&a.startselected){a.$element.removeClass("ui-selecting");a.selecting=false;a.$element.addClass("ui-selected");a.selected=true}else{a.$element.removeClass("ui-selecting");a.selecting=false;if(a.startselected){a.$element.addClass("ui-unselecting");a.unselecting=true}f._trigger("unselecting",c,{unselecting:a.element})}if(a.selected)if(!c.metaKey&&
!a.startselected){a.$element.removeClass("ui-selected");a.selected=false;a.$element.addClass("ui-unselecting");a.unselecting=true;f._trigger("unselecting",c,{unselecting:a.element})}}}});return false}},_mouseStop:function(c){var f=this;this.dragged=false;e(".ui-unselecting",this.element[0]).each(function(){var d=e.data(this,"selectable-item");d.$element.removeClass("ui-unselecting");d.unselecting=false;d.startselected=false;f._trigger("unselected",c,{unselected:d.element})});e(".ui-selecting",this.element[0]).each(function(){var d=
e.data(this,"selectable-item");d.$element.removeClass("ui-selecting").addClass("ui-selected");d.selecting=false;d.selected=true;d.startselected=true;f._trigger("selected",c,{selected:d.element})});this._trigger("stop",c);this.helper.remove();return false}});e.extend(e.ui.selectable,{version:"1.8.16"})})(jQuery);
;/*
 * jQuery UI Sortable 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.sortable",d.ui.mouse,{widgetEventPrefix:"sort",options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1E3},_create:function(){var a=this.options;this.containerCache={};this.element.addClass("ui-sortable");
this.refresh();this.floating=this.items.length?a.axis==="x"||/left|right/.test(this.items[0].item.css("float"))||/inline|table-cell/.test(this.items[0].item.css("display")):false;this.offset=this.element.offset();this._mouseInit()},destroy:function(){this.element.removeClass("ui-sortable ui-sortable-disabled").removeData("sortable").unbind(".sortable");this._mouseDestroy();for(var a=this.items.length-1;a>=0;a--)this.items[a].item.removeData("sortable-item");return this},_setOption:function(a,b){if(a===
"disabled"){this.options[a]=b;this.widget()[b?"addClass":"removeClass"]("ui-sortable-disabled")}else d.Widget.prototype._setOption.apply(this,arguments)},_mouseCapture:function(a,b){if(this.reverting)return false;if(this.options.disabled||this.options.type=="static")return false;this._refreshItems(a);var c=null,e=this;d(a.target).parents().each(function(){if(d.data(this,"sortable-item")==e){c=d(this);return false}});if(d.data(a.target,"sortable-item")==e)c=d(a.target);if(!c)return false;if(this.options.handle&&
!b){var f=false;d(this.options.handle,c).find("*").andSelf().each(function(){if(this==a.target)f=true});if(!f)return false}this.currentItem=c;this._removeCurrentsFromItems();return true},_mouseStart:function(a,b,c){b=this.options;var e=this;this.currentContainer=this;this.refreshPositions();this.helper=this._createHelper(a);this._cacheHelperProportions();this._cacheMargins();this.scrollParent=this.helper.scrollParent();this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,
left:this.offset.left-this.margins.left};this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=a.pageY;b.cursorAt&&this._adjustOffsetFromHelper(b.cursorAt);this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};
this.helper[0]!=this.currentItem[0]&&this.currentItem.hide();this._createPlaceholder();b.containment&&this._setContainment();if(b.cursor){if(d("body").css("cursor"))this._storedCursor=d("body").css("cursor");d("body").css("cursor",b.cursor)}if(b.opacity){if(this.helper.css("opacity"))this._storedOpacity=this.helper.css("opacity");this.helper.css("opacity",b.opacity)}if(b.zIndex){if(this.helper.css("zIndex"))this._storedZIndex=this.helper.css("zIndex");this.helper.css("zIndex",b.zIndex)}if(this.scrollParent[0]!=
document&&this.scrollParent[0].tagName!="HTML")this.overflowOffset=this.scrollParent.offset();this._trigger("start",a,this._uiHash());this._preserveHelperProportions||this._cacheHelperProportions();if(!c)for(c=this.containers.length-1;c>=0;c--)this.containers[c]._trigger("activate",a,e._uiHash(this));if(d.ui.ddmanager)d.ui.ddmanager.current=this;d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(a);
return true},_mouseDrag:function(a){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs)this.lastPositionAbs=this.positionAbs;if(this.options.scroll){var b=this.options,c=false;if(this.scrollParent[0]!=document&&this.scrollParent[0].tagName!="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-this.overflowOffset.top<
b.scrollSensitivity)this.scrollParent[0].scrollTop=c=this.scrollParent[0].scrollTop-b.scrollSpeed;if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-this.overflowOffset.left<b.scrollSensitivity)this.scrollParent[0].scrollLeft=c=this.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(a.pageY-d(document).scrollTop()<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()-
b.scrollSpeed);else if(d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity)c=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed);if(a.pageX-d(document).scrollLeft()<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed);else if(d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity)c=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed)}c!==false&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,
a)}this.positionAbs=this._convertPositionTo("absolute");if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";for(b=this.items.length-1;b>=0;b--){c=this.items[b];var e=c.item[0],f=this._intersectsWithPointer(c);if(f)if(e!=this.currentItem[0]&&this.placeholder[f==1?"next":"prev"]()[0]!=e&&!d.ui.contains(this.placeholder[0],e)&&(this.options.type=="semi-dynamic"?!d.ui.contains(this.element[0],
e):true)){this.direction=f==1?"down":"up";if(this.options.tolerance=="pointer"||this._intersectsWithSides(c))this._rearrange(a,c);else break;this._trigger("change",a,this._uiHash());break}}this._contactContainers(a);d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);this._trigger("sort",a,this._uiHash());this.lastPositionAbs=this.positionAbs;return false},_mouseStop:function(a,b){if(a){d.ui.ddmanager&&!this.options.dropBehaviour&&d.ui.ddmanager.drop(this,a);if(this.options.revert){var c=this;b=c.placeholder.offset();
c.reverting=true;d(this.helper).animate({left:b.left-this.offset.parent.left-c.margins.left+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollLeft),top:b.top-this.offset.parent.top-c.margins.top+(this.offsetParent[0]==document.body?0:this.offsetParent[0].scrollTop)},parseInt(this.options.revert,10)||500,function(){c._clear(a)})}else this._clear(a,b);return false}},cancel:function(){var a=this;if(this.dragging){this._mouseUp({target:null});this.options.helper=="original"?this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper"):
this.currentItem.show();for(var b=this.containers.length-1;b>=0;b--){this.containers[b]._trigger("deactivate",null,a._uiHash(this));if(this.containers[b].containerCache.over){this.containers[b]._trigger("out",null,a._uiHash(this));this.containers[b].containerCache.over=0}}}if(this.placeholder){this.placeholder[0].parentNode&&this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.options.helper!="original"&&this.helper&&this.helper[0].parentNode&&this.helper.remove();d.extend(this,{helper:null,
dragging:false,reverting:false,_noFinalSort:null});this.domPosition.prev?d(this.domPosition.prev).after(this.currentItem):d(this.domPosition.parent).prepend(this.currentItem)}return this},serialize:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};d(b).each(function(){var e=(d(a.item||this).attr(a.attribute||"id")||"").match(a.expression||/(.+)[-=_](.+)/);if(e)c.push((a.key||e[1]+"[]")+"="+(a.key&&a.expression?e[1]:e[2]))});!c.length&&a.key&&c.push(a.key+"=");return c.join("&")},
toArray:function(a){var b=this._getItemsAsjQuery(a&&a.connected),c=[];a=a||{};b.each(function(){c.push(d(a.item||this).attr(a.attribute||"id")||"")});return c},_intersectsWith:function(a){var b=this.positionAbs.left,c=b+this.helperProportions.width,e=this.positionAbs.top,f=e+this.helperProportions.height,g=a.left,h=g+a.width,i=a.top,k=i+a.height,j=this.offset.click.top,l=this.offset.click.left;j=e+j>i&&e+j<k&&b+l>g&&b+l<h;return this.options.tolerance=="pointer"||this.options.forcePointerForContainers||
this.options.tolerance!="pointer"&&this.helperProportions[this.floating?"width":"height"]>a[this.floating?"width":"height"]?j:g<b+this.helperProportions.width/2&&c-this.helperProportions.width/2<h&&i<e+this.helperProportions.height/2&&f-this.helperProportions.height/2<k},_intersectsWithPointer:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left,a.width);b=b&&a;a=this._getDragVerticalDirection();
var c=this._getDragHorizontalDirection();if(!b)return false;return this.floating?c&&c=="right"||a=="down"?2:1:a&&(a=="down"?2:1)},_intersectsWithSides:function(a){var b=d.ui.isOverAxis(this.positionAbs.top+this.offset.click.top,a.top+a.height/2,a.height);a=d.ui.isOverAxis(this.positionAbs.left+this.offset.click.left,a.left+a.width/2,a.width);var c=this._getDragVerticalDirection(),e=this._getDragHorizontalDirection();return this.floating&&e?e=="right"&&a||e=="left"&&!a:c&&(c=="down"&&b||c=="up"&&!b)},
_getDragVerticalDirection:function(){var a=this.positionAbs.top-this.lastPositionAbs.top;return a!=0&&(a>0?"down":"up")},_getDragHorizontalDirection:function(){var a=this.positionAbs.left-this.lastPositionAbs.left;return a!=0&&(a>0?"right":"left")},refresh:function(a){this._refreshItems(a);this.refreshPositions();return this},_connectWith:function(){var a=this.options;return a.connectWith.constructor==String?[a.connectWith]:a.connectWith},_getItemsAsjQuery:function(a){var b=[],c=[],e=this._connectWith();
if(e&&a)for(a=e.length-1;a>=0;a--)for(var f=d(e[a]),g=f.length-1;g>=0;g--){var h=d.data(f[g],"sortable");if(h&&h!=this&&!h.options.disabled)c.push([d.isFunction(h.options.items)?h.options.items.call(h.element):d(h.options.items,h.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),h])}c.push([d.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):d(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),
this]);for(a=c.length-1;a>=0;a--)c[a][0].each(function(){b.push(this)});return d(b)},_removeCurrentsFromItems:function(){for(var a=this.currentItem.find(":data(sortable-item)"),b=0;b<this.items.length;b++)for(var c=0;c<a.length;c++)a[c]==this.items[b].item[0]&&this.items.splice(b,1)},_refreshItems:function(a){this.items=[];this.containers=[this];var b=this.items,c=[[d.isFunction(this.options.items)?this.options.items.call(this.element[0],a,{item:this.currentItem}):d(this.options.items,this.element),
this]],e=this._connectWith();if(e)for(var f=e.length-1;f>=0;f--)for(var g=d(e[f]),h=g.length-1;h>=0;h--){var i=d.data(g[h],"sortable");if(i&&i!=this&&!i.options.disabled){c.push([d.isFunction(i.options.items)?i.options.items.call(i.element[0],a,{item:this.currentItem}):d(i.options.items,i.element),i]);this.containers.push(i)}}for(f=c.length-1;f>=0;f--){a=c[f][1];e=c[f][0];h=0;for(g=e.length;h<g;h++){i=d(e[h]);i.data("sortable-item",a);b.push({item:i,instance:a,width:0,height:0,left:0,top:0})}}},refreshPositions:function(a){if(this.offsetParent&&
this.helper)this.offset.parent=this._getParentOffset();for(var b=this.items.length-1;b>=0;b--){var c=this.items[b];if(!(c.instance!=this.currentContainer&&this.currentContainer&&c.item[0]!=this.currentItem[0])){var e=this.options.toleranceElement?d(this.options.toleranceElement,c.item):c.item;if(!a){c.width=e.outerWidth();c.height=e.outerHeight()}e=e.offset();c.left=e.left;c.top=e.top}}if(this.options.custom&&this.options.custom.refreshContainers)this.options.custom.refreshContainers.call(this);else for(b=
this.containers.length-1;b>=0;b--){e=this.containers[b].element.offset();this.containers[b].containerCache.left=e.left;this.containers[b].containerCache.top=e.top;this.containers[b].containerCache.width=this.containers[b].element.outerWidth();this.containers[b].containerCache.height=this.containers[b].element.outerHeight()}return this},_createPlaceholder:function(a){var b=a||this,c=b.options;if(!c.placeholder||c.placeholder.constructor==String){var e=c.placeholder;c.placeholder={element:function(){var f=
d(document.createElement(b.currentItem[0].nodeName)).addClass(e||b.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper")[0];if(!e)f.style.visibility="hidden";return f},update:function(f,g){if(!(e&&!c.forcePlaceholderSize)){g.height()||g.height(b.currentItem.innerHeight()-parseInt(b.currentItem.css("paddingTop")||0,10)-parseInt(b.currentItem.css("paddingBottom")||0,10));g.width()||g.width(b.currentItem.innerWidth()-parseInt(b.currentItem.css("paddingLeft")||0,10)-parseInt(b.currentItem.css("paddingRight")||
0,10))}}}}b.placeholder=d(c.placeholder.element.call(b.element,b.currentItem));b.currentItem.after(b.placeholder);c.placeholder.update(b,b.placeholder)},_contactContainers:function(a){for(var b=null,c=null,e=this.containers.length-1;e>=0;e--)if(!d.ui.contains(this.currentItem[0],this.containers[e].element[0]))if(this._intersectsWith(this.containers[e].containerCache)){if(!(b&&d.ui.contains(this.containers[e].element[0],b.element[0]))){b=this.containers[e];c=e}}else if(this.containers[e].containerCache.over){this.containers[e]._trigger("out",
a,this._uiHash(this));this.containers[e].containerCache.over=0}if(b)if(this.containers.length===1){this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}else if(this.currentContainer!=this.containers[c]){b=1E4;e=null;for(var f=this.positionAbs[this.containers[c].floating?"left":"top"],g=this.items.length-1;g>=0;g--)if(d.ui.contains(this.containers[c].element[0],this.items[g].item[0])){var h=this.items[g][this.containers[c].floating?"left":"top"];if(Math.abs(h-
f)<b){b=Math.abs(h-f);e=this.items[g]}}if(e||this.options.dropOnEmpty){this.currentContainer=this.containers[c];e?this._rearrange(a,e,null,true):this._rearrange(a,null,this.containers[c].element,true);this._trigger("change",a,this._uiHash());this.containers[c]._trigger("change",a,this._uiHash(this));this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[c]._trigger("over",a,this._uiHash(this));this.containers[c].containerCache.over=1}}},_createHelper:function(a){var b=
this.options;a=d.isFunction(b.helper)?d(b.helper.apply(this.element[0],[a,this.currentItem])):b.helper=="clone"?this.currentItem.clone():this.currentItem;a.parents("body").length||d(b.appendTo!="parent"?b.appendTo:this.currentItem[0].parentNode)[0].appendChild(a[0]);if(a[0]==this.currentItem[0])this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};if(a[0].style.width==
""||b.forceHelperSize)a.width(this.currentItem.width());if(a[0].style.height==""||b.forceHelperSize)a.height(this.currentItem.height());return a},_adjustOffsetFromHelper:function(a){if(typeof a=="string")a=a.split(" ");if(d.isArray(a))a={left:+a[0],top:+a[1]||0};if("left"in a)this.offset.click.left=a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=
this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();if(this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])){a.left+=this.scrollParent.scrollLeft();a.top+=this.scrollParent.scrollTop()}if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a=
{top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.currentItem.position();return{top:a.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),
10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,d(a.containment=="document"?
document:window).width()-this.helperProportions.width-this.margins.left,(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)){var b=d(a.containment)[0];a=d(a.containment).offset();var c=d(b).css("overflow")!="hidden";this.containment=[a.left+(parseInt(d(b).css("borderLeftWidth"),10)||0)+(parseInt(d(b).css("paddingLeft"),10)||0)-this.margins.left,a.top+(parseInt(d(b).css("borderTopWidth"),
10)||0)+(parseInt(d(b).css("paddingTop"),10)||0)-this.margins.top,a.left+(c?Math.max(b.scrollWidth,b.offsetWidth):b.offsetWidth)-(parseInt(d(b).css("borderLeftWidth"),10)||0)-(parseInt(d(b).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,a.top+(c?Math.max(b.scrollHeight,b.offsetHeight):b.offsetHeight)-(parseInt(d(b).css("borderTopWidth"),10)||0)-(parseInt(d(b).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top]}},_convertPositionTo:function(a,b){if(!b)b=
this.position;a=a=="absolute"?1:-1;var c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);return{top:b.top+this.offset.relative.top*a+this.offset.parent.top*a-(d.browser.safari&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop())*a),left:b.left+this.offset.relative.left*a+this.offset.parent.left*a-(d.browser.safari&&
this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())*a)}},_generatePosition:function(a){var b=this.options,c=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(c[0].tagName);if(this.cssPosition=="relative"&&!(this.scrollParent[0]!=document&&this.scrollParent[0]!=this.offsetParent[0]))this.offset.relative=this._getRelativeOffset();
var f=a.pageX,g=a.pageY;if(this.originalPosition){if(this.containment){if(a.pageX-this.offset.click.left<this.containment[0])f=this.containment[0]+this.offset.click.left;if(a.pageY-this.offset.click.top<this.containment[1])g=this.containment[1]+this.offset.click.top;if(a.pageX-this.offset.click.left>this.containment[2])f=this.containment[2]+this.offset.click.left;if(a.pageY-this.offset.click.top>this.containment[3])g=this.containment[3]+this.offset.click.top}if(b.grid){g=this.originalPageY+Math.round((g-
this.originalPageY)/b.grid[1])*b.grid[1];g=this.containment?!(g-this.offset.click.top<this.containment[1]||g-this.offset.click.top>this.containment[3])?g:!(g-this.offset.click.top<this.containment[1])?g-b.grid[1]:g+b.grid[1]:g;f=this.originalPageX+Math.round((f-this.originalPageX)/b.grid[0])*b.grid[0];f=this.containment?!(f-this.offset.click.left<this.containment[0]||f-this.offset.click.left>this.containment[2])?f:!(f-this.offset.click.left<this.containment[0])?f-b.grid[0]:f+b.grid[0]:f}}return{top:g-
this.offset.click.top-this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():e?0:c.scrollTop()),left:f-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:c.scrollLeft())}},_rearrange:function(a,b,c,e){c?c[0].appendChild(this.placeholder[0]):b.item[0].parentNode.insertBefore(this.placeholder[0],
this.direction=="down"?b.item[0]:b.item[0].nextSibling);this.counter=this.counter?++this.counter:1;var f=this,g=this.counter;window.setTimeout(function(){g==f.counter&&f.refreshPositions(!e)},0)},_clear:function(a,b){this.reverting=false;var c=[];!this._noFinalSort&&this.currentItem.parent().length&&this.placeholder.before(this.currentItem);this._noFinalSort=null;if(this.helper[0]==this.currentItem[0]){for(var e in this._storedCSS)if(this._storedCSS[e]=="auto"||this._storedCSS[e]=="static")this._storedCSS[e]=
"";this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper")}else this.currentItem.show();this.fromOutside&&!b&&c.push(function(f){this._trigger("receive",f,this._uiHash(this.fromOutside))});if((this.fromOutside||this.domPosition.prev!=this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!=this.currentItem.parent()[0])&&!b)c.push(function(f){this._trigger("update",f,this._uiHash())});if(!d.ui.contains(this.element[0],this.currentItem[0])){b||c.push(function(f){this._trigger("remove",
f,this._uiHash())});for(e=this.containers.length-1;e>=0;e--)if(d.ui.contains(this.containers[e].element[0],this.currentItem[0])&&!b){c.push(function(f){return function(g){f._trigger("receive",g,this._uiHash(this))}}.call(this,this.containers[e]));c.push(function(f){return function(g){f._trigger("update",g,this._uiHash(this))}}.call(this,this.containers[e]))}}for(e=this.containers.length-1;e>=0;e--){b||c.push(function(f){return function(g){f._trigger("deactivate",g,this._uiHash(this))}}.call(this,
this.containers[e]));if(this.containers[e].containerCache.over){c.push(function(f){return function(g){f._trigger("out",g,this._uiHash(this))}}.call(this,this.containers[e]));this.containers[e].containerCache.over=0}}this._storedCursor&&d("body").css("cursor",this._storedCursor);this._storedOpacity&&this.helper.css("opacity",this._storedOpacity);if(this._storedZIndex)this.helper.css("zIndex",this._storedZIndex=="auto"?"":this._storedZIndex);this.dragging=false;if(this.cancelHelperRemoval){if(!b){this._trigger("beforeStop",
a,this._uiHash());for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}return false}b||this._trigger("beforeStop",a,this._uiHash());this.placeholder[0].parentNode.removeChild(this.placeholder[0]);this.helper[0]!=this.currentItem[0]&&this.helper.remove();this.helper=null;if(!b){for(e=0;e<c.length;e++)c[e].call(this,a);this._trigger("stop",a,this._uiHash())}this.fromOutside=false;return true},_trigger:function(){d.Widget.prototype._trigger.apply(this,arguments)===false&&this.cancel()},
_uiHash:function(a){var b=a||this;return{helper:b.helper,placeholder:b.placeholder||d([]),position:b.position,originalPosition:b.originalPosition,offset:b.positionAbs,item:b.currentItem,sender:a?a.element:null}}});d.extend(d.ui.sortable,{version:"1.8.16"})})(jQuery);
;/*
 * jQuery UI Accordion 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(c){c.widget("ui.accordion",{options:{active:0,animated:"slide",autoHeight:true,clearStyle:false,collapsible:false,event:"click",fillSpace:false,header:"> li > :first-child,> :not(li):even",icons:{header:"ui-icon-triangle-1-e",headerSelected:"ui-icon-triangle-1-s"},navigation:false,navigationFilter:function(){return this.href.toLowerCase()===location.href.toLowerCase()}},_create:function(){var a=this,b=a.options;a.running=0;a.element.addClass("ui-accordion ui-widget ui-helper-reset").children("li").addClass("ui-accordion-li-fix");
a.headers=a.element.find(b.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all").bind("mouseenter.accordion",function(){b.disabled||c(this).addClass("ui-state-hover")}).bind("mouseleave.accordion",function(){b.disabled||c(this).removeClass("ui-state-hover")}).bind("focus.accordion",function(){b.disabled||c(this).addClass("ui-state-focus")}).bind("blur.accordion",function(){b.disabled||c(this).removeClass("ui-state-focus")});a.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");
if(b.navigation){var d=a.element.find("a").filter(b.navigationFilter).eq(0);if(d.length){var h=d.closest(".ui-accordion-header");a.active=h.length?h:d.closest(".ui-accordion-content").prev()}}a.active=a._findActive(a.active||b.active).addClass("ui-state-default ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");a.active.next().addClass("ui-accordion-content-active");a._createIcons();a.resize();a.element.attr("role","tablist");a.headers.attr("role","tab").bind("keydown.accordion",
function(f){return a._keydown(f)}).next().attr("role","tabpanel");a.headers.not(a.active||"").attr({"aria-expanded":"false","aria-selected":"false",tabIndex:-1}).next().hide();a.active.length?a.active.attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}):a.headers.eq(0).attr("tabIndex",0);c.browser.safari||a.headers.find("a").attr("tabIndex",-1);b.event&&a.headers.bind(b.event.split(" ").join(".accordion ")+".accordion",function(f){a._clickHandler.call(a,f,this);f.preventDefault()})},_createIcons:function(){var a=
this.options;if(a.icons){c("<span></span>").addClass("ui-icon "+a.icons.header).prependTo(this.headers);this.active.children(".ui-icon").toggleClass(a.icons.header).toggleClass(a.icons.headerSelected);this.element.addClass("ui-accordion-icons")}},_destroyIcons:function(){this.headers.children(".ui-icon").remove();this.element.removeClass("ui-accordion-icons")},destroy:function(){var a=this.options;this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role");this.headers.unbind(".accordion").removeClass("ui-accordion-header ui-accordion-disabled ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("tabIndex");
this.headers.find("a").removeAttr("tabIndex");this._destroyIcons();var b=this.headers.next().css("display","").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active ui-accordion-disabled ui-state-disabled");if(a.autoHeight||a.fillHeight)b.css("height","");return c.Widget.prototype.destroy.call(this)},_setOption:function(a,b){c.Widget.prototype._setOption.apply(this,arguments);a=="active"&&this.activate(b);if(a=="icons"){this._destroyIcons();
b&&this._createIcons()}if(a=="disabled")this.headers.add(this.headers.next())[b?"addClass":"removeClass"]("ui-accordion-disabled ui-state-disabled")},_keydown:function(a){if(!(this.options.disabled||a.altKey||a.ctrlKey)){var b=c.ui.keyCode,d=this.headers.length,h=this.headers.index(a.target),f=false;switch(a.keyCode){case b.RIGHT:case b.DOWN:f=this.headers[(h+1)%d];break;case b.LEFT:case b.UP:f=this.headers[(h-1+d)%d];break;case b.SPACE:case b.ENTER:this._clickHandler({target:a.target},a.target);
a.preventDefault()}if(f){c(a.target).attr("tabIndex",-1);c(f).attr("tabIndex",0);f.focus();return false}return true}},resize:function(){var a=this.options,b;if(a.fillSpace){if(c.browser.msie){var d=this.element.parent().css("overflow");this.element.parent().css("overflow","hidden")}b=this.element.parent().height();c.browser.msie&&this.element.parent().css("overflow",d);this.headers.each(function(){b-=c(this).outerHeight(true)});this.headers.next().each(function(){c(this).height(Math.max(0,b-c(this).innerHeight()+
c(this).height()))}).css("overflow","auto")}else if(a.autoHeight){b=0;this.headers.next().each(function(){b=Math.max(b,c(this).height("").height())}).height(b)}return this},activate:function(a){this.options.active=a;a=this._findActive(a)[0];this._clickHandler({target:a},a);return this},_findActive:function(a){return a?typeof a==="number"?this.headers.filter(":eq("+a+")"):this.headers.not(this.headers.not(a)):a===false?c([]):this.headers.filter(":eq(0)")},_clickHandler:function(a,b){var d=this.options;
if(!d.disabled)if(a.target){a=c(a.currentTarget||b);b=a[0]===this.active[0];d.active=d.collapsible&&b?false:this.headers.index(a);if(!(this.running||!d.collapsible&&b)){var h=this.active;j=a.next();g=this.active.next();e={options:d,newHeader:b&&d.collapsible?c([]):a,oldHeader:this.active,newContent:b&&d.collapsible?c([]):j,oldContent:g};var f=this.headers.index(this.active[0])>this.headers.index(a[0]);this.active=b?c([]):a;this._toggle(j,g,e,b,f);h.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);
if(!b){a.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top").children(".ui-icon").removeClass(d.icons.header).addClass(d.icons.headerSelected);a.next().addClass("ui-accordion-content-active")}}}else if(d.collapsible){this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all").children(".ui-icon").removeClass(d.icons.headerSelected).addClass(d.icons.header);this.active.next().addClass("ui-accordion-content-active");var g=this.active.next(),
e={options:d,newHeader:c([]),oldHeader:d.active,newContent:c([]),oldContent:g},j=this.active=c([]);this._toggle(j,g,e)}},_toggle:function(a,b,d,h,f){var g=this,e=g.options;g.toShow=a;g.toHide=b;g.data=d;var j=function(){if(g)return g._completed.apply(g,arguments)};g._trigger("changestart",null,g.data);g.running=b.size()===0?a.size():b.size();if(e.animated){d={};d=e.collapsible&&h?{toShow:c([]),toHide:b,complete:j,down:f,autoHeight:e.autoHeight||e.fillSpace}:{toShow:a,toHide:b,complete:j,down:f,autoHeight:e.autoHeight||
e.fillSpace};if(!e.proxied)e.proxied=e.animated;if(!e.proxiedDuration)e.proxiedDuration=e.duration;e.animated=c.isFunction(e.proxied)?e.proxied(d):e.proxied;e.duration=c.isFunction(e.proxiedDuration)?e.proxiedDuration(d):e.proxiedDuration;h=c.ui.accordion.animations;var i=e.duration,k=e.animated;if(k&&!h[k]&&!c.easing[k])k="slide";h[k]||(h[k]=function(l){this.slide(l,{easing:k,duration:i||700})});h[k](d)}else{if(e.collapsible&&h)a.toggle();else{b.hide();a.show()}j(true)}b.prev().attr({"aria-expanded":"false",
"aria-selected":"false",tabIndex:-1}).blur();a.prev().attr({"aria-expanded":"true","aria-selected":"true",tabIndex:0}).focus()},_completed:function(a){this.running=a?0:--this.running;if(!this.running){this.options.clearStyle&&this.toShow.add(this.toHide).css({height:"",overflow:""});this.toHide.removeClass("ui-accordion-content-active");if(this.toHide.length)this.toHide.parent()[0].className=this.toHide.parent()[0].className;this._trigger("change",null,this.data)}}});c.extend(c.ui.accordion,{version:"1.8.16",
animations:{slide:function(a,b){a=c.extend({easing:"swing",duration:300},a,b);if(a.toHide.size())if(a.toShow.size()){var d=a.toShow.css("overflow"),h=0,f={},g={},e;b=a.toShow;e=b[0].style.width;b.width(parseInt(b.parent().width(),10)-parseInt(b.css("paddingLeft"),10)-parseInt(b.css("paddingRight"),10)-(parseInt(b.css("borderLeftWidth"),10)||0)-(parseInt(b.css("borderRightWidth"),10)||0));c.each(["height","paddingTop","paddingBottom"],function(j,i){g[i]="hide";j=(""+c.css(a.toShow[0],i)).match(/^([\d+-.]+)(.*)$/);
f[i]={value:j[1],unit:j[2]||"px"}});a.toShow.css({height:0,overflow:"hidden"}).show();a.toHide.filter(":hidden").each(a.complete).end().filter(":visible").animate(g,{step:function(j,i){if(i.prop=="height")h=i.end-i.start===0?0:(i.now-i.start)/(i.end-i.start);a.toShow[0].style[i.prop]=h*f[i.prop].value+f[i.prop].unit},duration:a.duration,easing:a.easing,complete:function(){a.autoHeight||a.toShow.css("height","");a.toShow.css({width:e,overflow:d});a.complete()}})}else a.toHide.animate({height:"hide",
paddingTop:"hide",paddingBottom:"hide"},a);else a.toShow.animate({height:"show",paddingTop:"show",paddingBottom:"show"},a)},bounceslide:function(a){this.slide(a,{easing:a.down?"easeOutBounce":"swing",duration:a.down?1E3:200})}}})})(jQuery);
;/*
 * jQuery UI Autocomplete 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Autocomplete
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.position.js
 */
(function(d){var e=0;d.widget("ui.autocomplete",{options:{appendTo:"body",autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null},pending:0,_create:function(){var a=this,b=this.element[0].ownerDocument,g;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off").attr({role:"textbox","aria-autocomplete":"list","aria-haspopup":"true"}).bind("keydown.autocomplete",function(c){if(!(a.options.disabled||a.element.propAttr("readOnly"))){g=
false;var f=d.ui.keyCode;switch(c.keyCode){case f.PAGE_UP:a._move("previousPage",c);break;case f.PAGE_DOWN:a._move("nextPage",c);break;case f.UP:a._move("previous",c);c.preventDefault();break;case f.DOWN:a._move("next",c);c.preventDefault();break;case f.ENTER:case f.NUMPAD_ENTER:if(a.menu.active){g=true;c.preventDefault()}case f.TAB:if(!a.menu.active)return;a.menu.select(c);break;case f.ESCAPE:a.element.val(a.term);a.close(c);break;default:clearTimeout(a.searching);a.searching=setTimeout(function(){if(a.term!=
a.element.val()){a.selectedItem=null;a.search(null,c)}},a.options.delay);break}}}).bind("keypress.autocomplete",function(c){if(g){g=false;c.preventDefault()}}).bind("focus.autocomplete",function(){if(!a.options.disabled){a.selectedItem=null;a.previous=a.element.val()}}).bind("blur.autocomplete",function(c){if(!a.options.disabled){clearTimeout(a.searching);a.closing=setTimeout(function(){a.close(c);a._change(c)},150)}});this._initSource();this.response=function(){return a._response.apply(a,arguments)};
this.menu=d("<ul></ul>").addClass("ui-autocomplete").appendTo(d(this.options.appendTo||"body",b)[0]).mousedown(function(c){var f=a.menu.element[0];d(c.target).closest(".ui-menu-item").length||setTimeout(function(){d(document).one("mousedown",function(h){h.target!==a.element[0]&&h.target!==f&&!d.ui.contains(f,h.target)&&a.close()})},1);setTimeout(function(){clearTimeout(a.closing)},13)}).menu({focus:function(c,f){f=f.item.data("item.autocomplete");false!==a._trigger("focus",c,{item:f})&&/^key/.test(c.originalEvent.type)&&
a.element.val(f.value)},selected:function(c,f){var h=f.item.data("item.autocomplete"),i=a.previous;if(a.element[0]!==b.activeElement){a.element.focus();a.previous=i;setTimeout(function(){a.previous=i;a.selectedItem=h},1)}false!==a._trigger("select",c,{item:h})&&a.element.val(h.value);a.term=a.element.val();a.close(c);a.selectedItem=h},blur:function(){a.menu.element.is(":visible")&&a.element.val()!==a.term&&a.element.val(a.term)}}).zIndex(this.element.zIndex()+1).css({top:0,left:0}).hide().data("menu");
d.fn.bgiframe&&this.menu.element.bgiframe()},destroy:function(){this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete").removeAttr("role").removeAttr("aria-autocomplete").removeAttr("aria-haspopup");this.menu.element.remove();d.Widget.prototype.destroy.call(this)},_setOption:function(a,b){d.Widget.prototype._setOption.apply(this,arguments);a==="source"&&this._initSource();if(a==="appendTo")this.menu.element.appendTo(d(b||"body",this.element[0].ownerDocument)[0]);a==="disabled"&&
b&&this.xhr&&this.xhr.abort()},_initSource:function(){var a=this,b,g;if(d.isArray(this.options.source)){b=this.options.source;this.source=function(c,f){f(d.ui.autocomplete.filter(b,c.term))}}else if(typeof this.options.source==="string"){g=this.options.source;this.source=function(c,f){a.xhr&&a.xhr.abort();a.xhr=d.ajax({url:g,data:c,dataType:"json",autocompleteRequest:++e,success:function(h){this.autocompleteRequest===e&&f(h)},error:function(){this.autocompleteRequest===e&&f([])}})}}else this.source=
this.options.source},search:function(a,b){a=a!=null?a:this.element.val();this.term=this.element.val();if(a.length<this.options.minLength)return this.close(b);clearTimeout(this.closing);if(this._trigger("search",b)!==false)return this._search(a)},_search:function(a){this.pending++;this.element.addClass("ui-autocomplete-loading");this.source({term:a},this.response)},_response:function(a){if(!this.options.disabled&&a&&a.length){a=this._normalize(a);this._suggest(a);this._trigger("open")}else this.close();
this.pending--;this.pending||this.element.removeClass("ui-autocomplete-loading")},close:function(a){clearTimeout(this.closing);if(this.menu.element.is(":visible")){this.menu.element.hide();this.menu.deactivate();this._trigger("close",a)}},_change:function(a){this.previous!==this.element.val()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(a){if(a.length&&a[0].label&&a[0].value)return a;return d.map(a,function(b){if(typeof b==="string")return{label:b,value:b};return d.extend({label:b.label||
b.value,value:b.value||b.label},b)})},_suggest:function(a){var b=this.menu.element.empty().zIndex(this.element.zIndex()+1);this._renderMenu(b,a);this.menu.deactivate();this.menu.refresh();b.show();this._resizeMenu();b.position(d.extend({of:this.element},this.options.position));this.options.autoFocus&&this.menu.next(new d.Event("mouseover"))},_resizeMenu:function(){var a=this.menu.element;a.outerWidth(Math.max(a.width("").outerWidth(),this.element.outerWidth()))},_renderMenu:function(a,b){var g=this;
d.each(b,function(c,f){g._renderItem(a,f)})},_renderItem:function(a,b){return d("<li></li>").data("item.autocomplete",b).append(d("<a></a>").text(b.label)).appendTo(a)},_move:function(a,b){if(this.menu.element.is(":visible"))if(this.menu.first()&&/^previous/.test(a)||this.menu.last()&&/^next/.test(a)){this.element.val(this.term);this.menu.deactivate()}else this.menu[a](b);else this.search(null,b)},widget:function(){return this.menu.element}});d.extend(d.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,
"\\$&")},filter:function(a,b){var g=new RegExp(d.ui.autocomplete.escapeRegex(b),"i");return d.grep(a,function(c){return g.test(c.label||c.value||c)})}})})(jQuery);
(function(d){d.widget("ui.menu",{_create:function(){var e=this;this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all").attr({role:"listbox","aria-activedescendant":"ui-active-menuitem"}).click(function(a){if(d(a.target).closest(".ui-menu-item a").length){a.preventDefault();e.select(a)}});this.refresh()},refresh:function(){var e=this;this.element.children("li:not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","menuitem").children("a").addClass("ui-corner-all").attr("tabindex",
-1).mouseenter(function(a){e.activate(a,d(this).parent())}).mouseleave(function(){e.deactivate()})},activate:function(e,a){this.deactivate();if(this.hasScroll()){var b=a.offset().top-this.element.offset().top,g=this.element.scrollTop(),c=this.element.height();if(b<0)this.element.scrollTop(g+b);else b>=c&&this.element.scrollTop(g+b-c+a.height())}this.active=a.eq(0).children("a").addClass("ui-state-hover").attr("id","ui-active-menuitem").end();this._trigger("focus",e,{item:a})},deactivate:function(){if(this.active){this.active.children("a").removeClass("ui-state-hover").removeAttr("id");
this._trigger("blur");this.active=null}},next:function(e){this.move("next",".ui-menu-item:first",e)},previous:function(e){this.move("prev",".ui-menu-item:last",e)},first:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},last:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},move:function(e,a,b){if(this.active){e=this.active[e+"All"](".ui-menu-item").eq(0);e.length?this.activate(b,e):this.activate(b,this.element.children(a))}else this.activate(b,
this.element.children(a))},nextPage:function(e){if(this.hasScroll())if(!this.active||this.last())this.activate(e,this.element.children(".ui-menu-item:first"));else{var a=this.active.offset().top,b=this.element.height(),g=this.element.children(".ui-menu-item").filter(function(){var c=d(this).offset().top-a-b+d(this).height();return c<10&&c>-10});g.length||(g=this.element.children(".ui-menu-item:last"));this.activate(e,g)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||
this.last()?":first":":last"))},previousPage:function(e){if(this.hasScroll())if(!this.active||this.first())this.activate(e,this.element.children(".ui-menu-item:last"));else{var a=this.active.offset().top,b=this.element.height();result=this.element.children(".ui-menu-item").filter(function(){var g=d(this).offset().top-a+b-d(this).height();return g<10&&g>-10});result.length||(result=this.element.children(".ui-menu-item:first"));this.activate(e,result)}else this.activate(e,this.element.children(".ui-menu-item").filter(!this.active||
this.first()?":last":":first"))},hasScroll:function(){return this.element.height()<this.element[d.fn.prop?"prop":"attr"]("scrollHeight")},select:function(e){this._trigger("selected",e,{item:this.active})}})})(jQuery);
;/*
 * jQuery UI Button 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Button
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(b){var h,i,j,g,l=function(){var a=b(this).find(":ui-button");setTimeout(function(){a.button("refresh")},1)},k=function(a){var c=a.name,e=a.form,f=b([]);if(c)f=e?b(e).find("[name='"+c+"']"):b("[name='"+c+"']",a.ownerDocument).filter(function(){return!this.form});return f};b.widget("ui.button",{options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function(){this.element.closest("form").unbind("reset.button").bind("reset.button",l);if(typeof this.options.disabled!==
"boolean")this.options.disabled=this.element.propAttr("disabled");this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var a=this,c=this.options,e=this.type==="checkbox"||this.type==="radio",f="ui-state-hover"+(!e?" ui-state-active":"");if(c.label===null)c.label=this.buttonElement.html();if(this.element.is(":disabled"))c.disabled=true;this.buttonElement.addClass("ui-button ui-widget ui-state-default ui-corner-all").attr("role","button").bind("mouseenter.button",function(){if(!c.disabled){b(this).addClass("ui-state-hover");
this===h&&b(this).addClass("ui-state-active")}}).bind("mouseleave.button",function(){c.disabled||b(this).removeClass(f)}).bind("click.button",function(d){if(c.disabled){d.preventDefault();d.stopImmediatePropagation()}});this.element.bind("focus.button",function(){a.buttonElement.addClass("ui-state-focus")}).bind("blur.button",function(){a.buttonElement.removeClass("ui-state-focus")});if(e){this.element.bind("change.button",function(){g||a.refresh()});this.buttonElement.bind("mousedown.button",function(d){if(!c.disabled){g=
false;i=d.pageX;j=d.pageY}}).bind("mouseup.button",function(d){if(!c.disabled)if(i!==d.pageX||j!==d.pageY)g=true})}if(this.type==="checkbox")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).toggleClass("ui-state-active");a.buttonElement.attr("aria-pressed",a.element[0].checked)});else if(this.type==="radio")this.buttonElement.bind("click.button",function(){if(c.disabled||g)return false;b(this).addClass("ui-state-active");a.buttonElement.attr("aria-pressed","true");
var d=a.element[0];k(d).not(d).map(function(){return b(this).button("widget")[0]}).removeClass("ui-state-active").attr("aria-pressed","false")});else{this.buttonElement.bind("mousedown.button",function(){if(c.disabled)return false;b(this).addClass("ui-state-active");h=this;b(document).one("mouseup",function(){h=null})}).bind("mouseup.button",function(){if(c.disabled)return false;b(this).removeClass("ui-state-active")}).bind("keydown.button",function(d){if(c.disabled)return false;if(d.keyCode==b.ui.keyCode.SPACE||
d.keyCode==b.ui.keyCode.ENTER)b(this).addClass("ui-state-active")}).bind("keyup.button",function(){b(this).removeClass("ui-state-active")});this.buttonElement.is("a")&&this.buttonElement.keyup(function(d){d.keyCode===b.ui.keyCode.SPACE&&b(this).click()})}this._setOption("disabled",c.disabled);this._resetButton()},_determineButtonType:function(){this.type=this.element.is(":checkbox")?"checkbox":this.element.is(":radio")?"radio":this.element.is("input")?"input":"button";if(this.type==="checkbox"||this.type===
"radio"){var a=this.element.parents().filter(":last"),c="label[for='"+this.element.attr("id")+"']";this.buttonElement=a.find(c);if(!this.buttonElement.length){a=a.length?a.siblings():this.element.siblings();this.buttonElement=a.filter(c);if(!this.buttonElement.length)this.buttonElement=a.find(c)}this.element.addClass("ui-helper-hidden-accessible");(a=this.element.is(":checked"))&&this.buttonElement.addClass("ui-state-active");this.buttonElement.attr("aria-pressed",a)}else this.buttonElement=this.element},
widget:function(){return this.buttonElement},destroy:function(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass("ui-button ui-widget ui-state-default ui-corner-all ui-state-hover ui-state-active  ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only").removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());this.hasTitle||this.buttonElement.removeAttr("title");
b.Widget.prototype.destroy.call(this)},_setOption:function(a,c){b.Widget.prototype._setOption.apply(this,arguments);if(a==="disabled")c?this.element.propAttr("disabled",true):this.element.propAttr("disabled",false);else this._resetButton()},refresh:function(){var a=this.element.is(":disabled");a!==this.options.disabled&&this._setOption("disabled",a);if(this.type==="radio")k(this.element[0]).each(function(){b(this).is(":checked")?b(this).button("widget").addClass("ui-state-active").attr("aria-pressed",
"true"):b(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false")});else if(this.type==="checkbox")this.element.is(":checked")?this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true"):this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false")},_resetButton:function(){if(this.type==="input")this.options.label&&this.element.val(this.options.label);else{var a=this.buttonElement.removeClass("ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only"),
c=b("<span></span>").addClass("ui-button-text").html(this.options.label).appendTo(a.empty()).text(),e=this.options.icons,f=e.primary&&e.secondary,d=[];if(e.primary||e.secondary){if(this.options.text)d.push("ui-button-text-icon"+(f?"s":e.primary?"-primary":"-secondary"));e.primary&&a.prepend("<span class='ui-button-icon-primary ui-icon "+e.primary+"'></span>");e.secondary&&a.append("<span class='ui-button-icon-secondary ui-icon "+e.secondary+"'></span>");if(!this.options.text){d.push(f?"ui-button-icons-only":
"ui-button-icon-only");this.hasTitle||a.attr("title",c)}}else d.push("ui-button-text-only");a.addClass(d.join(" "))}}});b.widget("ui.buttonset",{options:{items:":button, :submit, :reset, :checkbox, :radio, a, :data(button)"},_create:function(){this.element.addClass("ui-buttonset")},_init:function(){this.refresh()},_setOption:function(a,c){a==="disabled"&&this.buttons.button("option",a,c);b.Widget.prototype._setOption.apply(this,arguments)},refresh:function(){var a=this.element.css("direction")===
"ltr";this.buttons=this.element.find(this.options.items).filter(":ui-button").button("refresh").end().not(":ui-button").button().end().map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(a?"ui-corner-left":"ui-corner-right").end().filter(":last").addClass(a?"ui-corner-right":"ui-corner-left").end().end()},destroy:function(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return b(this).button("widget")[0]}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");
b.Widget.prototype.destroy.call(this)}})})(jQuery);
;/*
 * jQuery UI Dialog 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function(c,l){var m={buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},n={maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},o=c.attrFn||{val:true,css:true,html:true,text:true,data:true,width:true,height:true,offset:true,click:true};c.widget("ui.dialog",{options:{autoOpen:true,buttons:{},closeOnEscape:true,closeText:"close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:false,maxWidth:false,minHeight:150,minWidth:150,modal:false,
position:{my:"center",at:"center",collision:"fit",using:function(a){var b=c(this).css(a).offset().top;b<0&&c(this).css("top",a.top-b)}},resizable:true,show:null,stack:true,title:"",width:300,zIndex:1E3},_create:function(){this.originalTitle=this.element.attr("title");if(typeof this.originalTitle!=="string")this.originalTitle="";this.options.title=this.options.title||this.originalTitle;var a=this,b=a.options,d=b.title||"&#160;",e=c.ui.dialog.getTitleId(a.element),g=(a.uiDialog=c("<div></div>")).appendTo(document.body).hide().addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+
b.dialogClass).css({zIndex:b.zIndex}).attr("tabIndex",-1).css("outline",0).keydown(function(i){if(b.closeOnEscape&&!i.isDefaultPrevented()&&i.keyCode&&i.keyCode===c.ui.keyCode.ESCAPE){a.close(i);i.preventDefault()}}).attr({role:"dialog","aria-labelledby":e}).mousedown(function(i){a.moveToTop(false,i)});a.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(g);var f=(a.uiDialogTitlebar=c("<div></div>")).addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(g),
h=c('<a href="#"></a>').addClass("ui-dialog-titlebar-close ui-corner-all").attr("role","button").hover(function(){h.addClass("ui-state-hover")},function(){h.removeClass("ui-state-hover")}).focus(function(){h.addClass("ui-state-focus")}).blur(function(){h.removeClass("ui-state-focus")}).click(function(i){a.close(i);return false}).appendTo(f);(a.uiDialogTitlebarCloseText=c("<span></span>")).addClass("ui-icon ui-icon-closethick").text(b.closeText).appendTo(h);c("<span></span>").addClass("ui-dialog-title").attr("id",
e).html(d).prependTo(f);if(c.isFunction(b.beforeclose)&&!c.isFunction(b.beforeClose))b.beforeClose=b.beforeclose;f.find("*").add(f).disableSelection();b.draggable&&c.fn.draggable&&a._makeDraggable();b.resizable&&c.fn.resizable&&a._makeResizable();a._createButtons(b.buttons);a._isOpen=false;c.fn.bgiframe&&g.bgiframe()},_init:function(){this.options.autoOpen&&this.open()},destroy:function(){var a=this;a.overlay&&a.overlay.destroy();a.uiDialog.hide();a.element.unbind(".dialog").removeData("dialog").removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
a.uiDialog.remove();a.originalTitle&&a.element.attr("title",a.originalTitle);return a},widget:function(){return this.uiDialog},close:function(a){var b=this,d,e;if(false!==b._trigger("beforeClose",a)){b.overlay&&b.overlay.destroy();b.uiDialog.unbind("keypress.ui-dialog");b._isOpen=false;if(b.options.hide)b.uiDialog.hide(b.options.hide,function(){b._trigger("close",a)});else{b.uiDialog.hide();b._trigger("close",a)}c.ui.dialog.overlay.resize();if(b.options.modal){d=0;c(".ui-dialog").each(function(){if(this!==
b.uiDialog[0]){e=c(this).css("z-index");isNaN(e)||(d=Math.max(d,e))}});c.ui.dialog.maxZ=d}return b}},isOpen:function(){return this._isOpen},moveToTop:function(a,b){var d=this,e=d.options;if(e.modal&&!a||!e.stack&&!e.modal)return d._trigger("focus",b);if(e.zIndex>c.ui.dialog.maxZ)c.ui.dialog.maxZ=e.zIndex;if(d.overlay){c.ui.dialog.maxZ+=1;d.overlay.$el.css("z-index",c.ui.dialog.overlay.maxZ=c.ui.dialog.maxZ)}a={scrollTop:d.element.scrollTop(),scrollLeft:d.element.scrollLeft()};c.ui.dialog.maxZ+=1;
d.uiDialog.css("z-index",c.ui.dialog.maxZ);d.element.attr(a);d._trigger("focus",b);return d},open:function(){if(!this._isOpen){var a=this,b=a.options,d=a.uiDialog;a.overlay=b.modal?new c.ui.dialog.overlay(a):null;a._size();a._position(b.position);d.show(b.show);a.moveToTop(true);b.modal&&d.bind("keypress.ui-dialog",function(e){if(e.keyCode===c.ui.keyCode.TAB){var g=c(":tabbable",this),f=g.filter(":first");g=g.filter(":last");if(e.target===g[0]&&!e.shiftKey){f.focus(1);return false}else if(e.target===
f[0]&&e.shiftKey){g.focus(1);return false}}});c(a.element.find(":tabbable").get().concat(d.find(".ui-dialog-buttonpane :tabbable").get().concat(d.get()))).eq(0).focus();a._isOpen=true;a._trigger("open");return a}},_createButtons:function(a){var b=this,d=false,e=c("<div></div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),g=c("<div></div>").addClass("ui-dialog-buttonset").appendTo(e);b.uiDialog.find(".ui-dialog-buttonpane").remove();typeof a==="object"&&a!==null&&c.each(a,
function(){return!(d=true)});if(d){c.each(a,function(f,h){h=c.isFunction(h)?{click:h,text:f}:h;var i=c('<button type="button"></button>').click(function(){h.click.apply(b.element[0],arguments)}).appendTo(g);c.each(h,function(j,k){if(j!=="click")j in o?i[j](k):i.attr(j,k)});c.fn.button&&i.button()});e.appendTo(b.uiDialog)}},_makeDraggable:function(){function a(f){return{position:f.position,offset:f.offset}}var b=this,d=b.options,e=c(document),g;b.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",
handle:".ui-dialog-titlebar",containment:"document",start:function(f,h){g=d.height==="auto"?"auto":c(this).height();c(this).height(c(this).height()).addClass("ui-dialog-dragging");b._trigger("dragStart",f,a(h))},drag:function(f,h){b._trigger("drag",f,a(h))},stop:function(f,h){d.position=[h.position.left-e.scrollLeft(),h.position.top-e.scrollTop()];c(this).removeClass("ui-dialog-dragging").height(g);b._trigger("dragStop",f,a(h));c.ui.dialog.overlay.resize()}})},_makeResizable:function(a){function b(f){return{originalPosition:f.originalPosition,
originalSize:f.originalSize,position:f.position,size:f.size}}a=a===l?this.options.resizable:a;var d=this,e=d.options,g=d.uiDialog.css("position");a=typeof a==="string"?a:"n,e,s,w,se,sw,ne,nw";d.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:d.element,maxWidth:e.maxWidth,maxHeight:e.maxHeight,minWidth:e.minWidth,minHeight:d._minHeight(),handles:a,start:function(f,h){c(this).addClass("ui-dialog-resizing");d._trigger("resizeStart",f,b(h))},resize:function(f,h){d._trigger("resize",
f,b(h))},stop:function(f,h){c(this).removeClass("ui-dialog-resizing");e.height=c(this).height();e.width=c(this).width();d._trigger("resizeStop",f,b(h));c.ui.dialog.overlay.resize()}}).css("position",g).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")},_minHeight:function(){var a=this.options;return a.height==="auto"?a.minHeight:Math.min(a.minHeight,a.height)},_position:function(a){var b=[],d=[0,0],e;if(a){if(typeof a==="string"||typeof a==="object"&&"0"in a){b=a.split?a.split(" "):
[a[0],a[1]];if(b.length===1)b[1]=b[0];c.each(["left","top"],function(g,f){if(+b[g]===b[g]){d[g]=b[g];b[g]=f}});a={my:b.join(" "),at:b.join(" "),offset:d.join(" ")}}a=c.extend({},c.ui.dialog.prototype.options.position,a)}else a=c.ui.dialog.prototype.options.position;(e=this.uiDialog.is(":visible"))||this.uiDialog.show();this.uiDialog.css({top:0,left:0}).position(c.extend({of:window},a));e||this.uiDialog.hide()},_setOptions:function(a){var b=this,d={},e=false;c.each(a,function(g,f){b._setOption(g,f);
if(g in m)e=true;if(g in n)d[g]=f});e&&this._size();this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option",d)},_setOption:function(a,b){var d=this,e=d.uiDialog;switch(a){case "beforeclose":a="beforeClose";break;case "buttons":d._createButtons(b);break;case "closeText":d.uiDialogTitlebarCloseText.text(""+b);break;case "dialogClass":e.removeClass(d.options.dialogClass).addClass("ui-dialog ui-widget ui-widget-content ui-corner-all "+b);break;case "disabled":b?e.addClass("ui-dialog-disabled"):
e.removeClass("ui-dialog-disabled");break;case "draggable":var g=e.is(":data(draggable)");g&&!b&&e.draggable("destroy");!g&&b&&d._makeDraggable();break;case "position":d._position(b);break;case "resizable":(g=e.is(":data(resizable)"))&&!b&&e.resizable("destroy");g&&typeof b==="string"&&e.resizable("option","handles",b);!g&&b!==false&&d._makeResizable(b);break;case "title":c(".ui-dialog-title",d.uiDialogTitlebar).html(""+(b||"&#160;"));break}c.Widget.prototype._setOption.apply(d,arguments)},_size:function(){var a=
this.options,b,d,e=this.uiDialog.is(":visible");this.element.show().css({width:"auto",minHeight:0,height:0});if(a.minWidth>a.width)a.width=a.minWidth;b=this.uiDialog.css({height:"auto",width:a.width}).height();d=Math.max(0,a.minHeight-b);if(a.height==="auto")if(c.support.minHeight)this.element.css({minHeight:d,height:"auto"});else{this.uiDialog.show();a=this.element.css("height","auto").height();e||this.uiDialog.hide();this.element.height(Math.max(a,d))}else this.element.height(Math.max(a.height-
b,0));this.uiDialog.is(":data(resizable)")&&this.uiDialog.resizable("option","minHeight",this._minHeight())}});c.extend(c.ui.dialog,{version:"1.8.16",uuid:0,maxZ:0,getTitleId:function(a){a=a.attr("id");if(!a){this.uuid+=1;a=this.uuid}return"ui-dialog-title-"+a},overlay:function(a){this.$el=c.ui.dialog.overlay.create(a)}});c.extend(c.ui.dialog.overlay,{instances:[],oldInstances:[],maxZ:0,events:c.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function(a){return a+".dialog-overlay"}).join(" "),
create:function(a){if(this.instances.length===0){setTimeout(function(){c.ui.dialog.overlay.instances.length&&c(document).bind(c.ui.dialog.overlay.events,function(d){if(c(d.target).zIndex()<c.ui.dialog.overlay.maxZ)return false})},1);c(document).bind("keydown.dialog-overlay",function(d){if(a.options.closeOnEscape&&!d.isDefaultPrevented()&&d.keyCode&&d.keyCode===c.ui.keyCode.ESCAPE){a.close(d);d.preventDefault()}});c(window).bind("resize.dialog-overlay",c.ui.dialog.overlay.resize)}var b=(this.oldInstances.pop()||
c("<div></div>").addClass("ui-widget-overlay")).appendTo(document.body).css({width:this.width(),height:this.height()});c.fn.bgiframe&&b.bgiframe();this.instances.push(b);return b},destroy:function(a){var b=c.inArray(a,this.instances);b!=-1&&this.oldInstances.push(this.instances.splice(b,1)[0]);this.instances.length===0&&c([document,window]).unbind(".dialog-overlay");a.remove();var d=0;c.each(this.instances,function(){d=Math.max(d,this.css("z-index"))});this.maxZ=d},height:function(){var a,b;if(c.browser.msie&&
c.browser.version<7){a=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);b=Math.max(document.documentElement.offsetHeight,document.body.offsetHeight);return a<b?c(window).height()+"px":a+"px"}else return c(document).height()+"px"},width:function(){var a,b;if(c.browser.msie){a=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);b=Math.max(document.documentElement.offsetWidth,document.body.offsetWidth);return a<b?c(window).width()+"px":a+"px"}else return c(document).width()+
"px"},resize:function(){var a=c([]);c.each(c.ui.dialog.overlay.instances,function(){a=a.add(this)});a.css({width:0,height:0}).css({width:c.ui.dialog.overlay.width(),height:c.ui.dialog.overlay.height()})}});c.extend(c.ui.dialog.overlay.prototype,{destroy:function(){c.ui.dialog.overlay.destroy(this.$el)}})})(jQuery);
;/*
 * jQuery UI Slider 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */
(function(d){d.widget("ui.slider",d.ui.mouse,{widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null},_create:function(){var a=this,b=this.options,c=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),f=b.values&&b.values.length||1,e=[];this._mouseSliding=this._keySliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this.element.addClass("ui-slider ui-slider-"+
this.orientation+" ui-widget ui-widget-content ui-corner-all"+(b.disabled?" ui-slider-disabled ui-disabled":""));this.range=d([]);if(b.range){if(b.range===true){if(!b.values)b.values=[this._valueMin(),this._valueMin()];if(b.values.length&&b.values.length!==2)b.values=[b.values[0],b.values[0]]}this.range=d("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+(b.range==="min"||b.range==="max"?" ui-slider-range-"+b.range:""))}for(var j=c.length;j<f;j+=1)e.push("<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>");
this.handles=c.add(d(e.join("")).appendTo(a.element));this.handle=this.handles.eq(0);this.handles.add(this.range).filter("a").click(function(g){g.preventDefault()}).hover(function(){b.disabled||d(this).addClass("ui-state-hover")},function(){d(this).removeClass("ui-state-hover")}).focus(function(){if(b.disabled)d(this).blur();else{d(".ui-slider .ui-state-focus").removeClass("ui-state-focus");d(this).addClass("ui-state-focus")}}).blur(function(){d(this).removeClass("ui-state-focus")});this.handles.each(function(g){d(this).data("index.ui-slider-handle",
g)});this.handles.keydown(function(g){var k=true,l=d(this).data("index.ui-slider-handle"),i,h,m;if(!a.options.disabled){switch(g.keyCode){case d.ui.keyCode.HOME:case d.ui.keyCode.END:case d.ui.keyCode.PAGE_UP:case d.ui.keyCode.PAGE_DOWN:case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:k=false;if(!a._keySliding){a._keySliding=true;d(this).addClass("ui-state-active");i=a._start(g,l);if(i===false)return}break}m=a.options.step;i=a.options.values&&a.options.values.length?
(h=a.values(l)):(h=a.value());switch(g.keyCode){case d.ui.keyCode.HOME:h=a._valueMin();break;case d.ui.keyCode.END:h=a._valueMax();break;case d.ui.keyCode.PAGE_UP:h=a._trimAlignValue(i+(a._valueMax()-a._valueMin())/5);break;case d.ui.keyCode.PAGE_DOWN:h=a._trimAlignValue(i-(a._valueMax()-a._valueMin())/5);break;case d.ui.keyCode.UP:case d.ui.keyCode.RIGHT:if(i===a._valueMax())return;h=a._trimAlignValue(i+m);break;case d.ui.keyCode.DOWN:case d.ui.keyCode.LEFT:if(i===a._valueMin())return;h=a._trimAlignValue(i-
m);break}a._slide(g,l,h);return k}}).keyup(function(g){var k=d(this).data("index.ui-slider-handle");if(a._keySliding){a._keySliding=false;a._stop(g,k);a._change(g,k);d(this).removeClass("ui-state-active")}});this._refreshValue();this._animateOff=false},destroy:function(){this.handles.remove();this.range.remove();this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all").removeData("slider").unbind(".slider");this._mouseDestroy();
return this},_mouseCapture:function(a){var b=this.options,c,f,e,j,g;if(b.disabled)return false;this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();c=this._normValueFromMouse({x:a.pageX,y:a.pageY});f=this._valueMax()-this._valueMin()+1;j=this;this.handles.each(function(k){var l=Math.abs(c-j.values(k));if(f>l){f=l;e=d(this);g=k}});if(b.range===true&&this.values(1)===b.min){g+=1;e=d(this.handles[g])}if(this._start(a,g)===false)return false;
this._mouseSliding=true;j._handleIndex=g;e.addClass("ui-state-active").focus();b=e.offset();this._clickOffset=!d(a.target).parents().andSelf().is(".ui-slider-handle")?{left:0,top:0}:{left:a.pageX-b.left-e.width()/2,top:a.pageY-b.top-e.height()/2-(parseInt(e.css("borderTopWidth"),10)||0)-(parseInt(e.css("borderBottomWidth"),10)||0)+(parseInt(e.css("marginTop"),10)||0)};this.handles.hasClass("ui-state-hover")||this._slide(a,g,c);return this._animateOff=true},_mouseStart:function(){return true},_mouseDrag:function(a){var b=
this._normValueFromMouse({x:a.pageX,y:a.pageY});this._slide(a,this._handleIndex,b);return false},_mouseStop:function(a){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(a,this._handleIndex);this._change(a,this._handleIndex);this._clickOffset=this._handleIndex=null;return this._animateOff=false},_detectOrientation:function(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal"},_normValueFromMouse:function(a){var b;if(this.orientation==="horizontal"){b=
this.elementSize.width;a=a.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)}else{b=this.elementSize.height;a=a.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)}b=a/b;if(b>1)b=1;if(b<0)b=0;if(this.orientation==="vertical")b=1-b;a=this._valueMax()-this._valueMin();return this._trimAlignValue(this._valueMin()+b*a)},_start:function(a,b){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);
c.values=this.values()}return this._trigger("start",a,c)},_slide:function(a,b,c){var f;if(this.options.values&&this.options.values.length){f=this.values(b?0:1);if(this.options.values.length===2&&this.options.range===true&&(b===0&&c>f||b===1&&c<f))c=f;if(c!==this.values(b)){f=this.values();f[b]=c;a=this._trigger("slide",a,{handle:this.handles[b],value:c,values:f});this.values(b?0:1);a!==false&&this.values(b,c,true)}}else if(c!==this.value()){a=this._trigger("slide",a,{handle:this.handles[b],value:c});
a!==false&&this.value(c)}},_stop:function(a,b){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);c.values=this.values()}this._trigger("stop",a,c)},_change:function(a,b){if(!this._keySliding&&!this._mouseSliding){var c={handle:this.handles[b],value:this.value()};if(this.options.values&&this.options.values.length){c.value=this.values(b);c.values=this.values()}this._trigger("change",a,c)}},value:function(a){if(arguments.length){this.options.value=
this._trimAlignValue(a);this._refreshValue();this._change(null,0)}else return this._value()},values:function(a,b){var c,f,e;if(arguments.length>1){this.options.values[a]=this._trimAlignValue(b);this._refreshValue();this._change(null,a)}else if(arguments.length)if(d.isArray(arguments[0])){c=this.options.values;f=arguments[0];for(e=0;e<c.length;e+=1){c[e]=this._trimAlignValue(f[e]);this._change(null,e)}this._refreshValue()}else return this.options.values&&this.options.values.length?this._values(a):
this.value();else return this._values()},_setOption:function(a,b){var c,f=0;if(d.isArray(this.options.values))f=this.options.values.length;d.Widget.prototype._setOption.apply(this,arguments);switch(a){case "disabled":if(b){this.handles.filter(".ui-state-focus").blur();this.handles.removeClass("ui-state-hover");this.handles.propAttr("disabled",true);this.element.addClass("ui-disabled")}else{this.handles.propAttr("disabled",false);this.element.removeClass("ui-disabled")}break;case "orientation":this._detectOrientation();
this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();break;case "value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case "values":this._animateOff=true;this._refreshValue();for(c=0;c<f;c+=1)this._change(null,c);this._animateOff=false;break}},_value:function(){var a=this.options.value;return a=this._trimAlignValue(a)},_values:function(a){var b,c;if(arguments.length){b=this.options.values[a];
return b=this._trimAlignValue(b)}else{b=this.options.values.slice();for(c=0;c<b.length;c+=1)b[c]=this._trimAlignValue(b[c]);return b}},_trimAlignValue:function(a){if(a<=this._valueMin())return this._valueMin();if(a>=this._valueMax())return this._valueMax();var b=this.options.step>0?this.options.step:1,c=(a-this._valueMin())%b;a=a-c;if(Math.abs(c)*2>=b)a+=c>0?b:-b;return parseFloat(a.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var a=
this.options.range,b=this.options,c=this,f=!this._animateOff?b.animate:false,e,j={},g,k,l,i;if(this.options.values&&this.options.values.length)this.handles.each(function(h){e=(c.values(h)-c._valueMin())/(c._valueMax()-c._valueMin())*100;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";d(this).stop(1,1)[f?"animate":"css"](j,b.animate);if(c.options.range===true)if(c.orientation==="horizontal"){if(h===0)c.range.stop(1,1)[f?"animate":"css"]({left:e+"%"},b.animate);if(h===1)c.range[f?"animate":"css"]({width:e-
g+"%"},{queue:false,duration:b.animate})}else{if(h===0)c.range.stop(1,1)[f?"animate":"css"]({bottom:e+"%"},b.animate);if(h===1)c.range[f?"animate":"css"]({height:e-g+"%"},{queue:false,duration:b.animate})}g=e});else{k=this.value();l=this._valueMin();i=this._valueMax();e=i!==l?(k-l)/(i-l)*100:0;j[c.orientation==="horizontal"?"left":"bottom"]=e+"%";this.handle.stop(1,1)[f?"animate":"css"](j,b.animate);if(a==="min"&&this.orientation==="horizontal")this.range.stop(1,1)[f?"animate":"css"]({width:e+"%"},
b.animate);if(a==="max"&&this.orientation==="horizontal")this.range[f?"animate":"css"]({width:100-e+"%"},{queue:false,duration:b.animate});if(a==="min"&&this.orientation==="vertical")this.range.stop(1,1)[f?"animate":"css"]({height:e+"%"},b.animate);if(a==="max"&&this.orientation==="vertical")this.range[f?"animate":"css"]({height:100-e+"%"},{queue:false,duration:b.animate})}}});d.extend(d.ui.slider,{version:"1.8.16"})})(jQuery);
;/*
 * jQuery UI Tabs 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function(d,p){function u(){return++v}function w(){return++x}var v=0,x=0;d.widget("ui.tabs",{options:{add:null,ajaxOptions:null,cache:false,cookie:null,collapsible:false,disable:null,disabled:[],enable:null,event:"click",fx:null,idPrefix:"ui-tabs-",load:null,panelTemplate:"<div></div>",remove:null,select:null,show:null,spinner:"<em>Loading&#8230;</em>",tabTemplate:"<li><a href='#{href}'><span>#{label}</span></a></li>"},_create:function(){this._tabify(true)},_setOption:function(b,e){if(b=="selected")this.options.collapsible&&
e==this.options.selected||this.select(e);else{this.options[b]=e;this._tabify()}},_tabId:function(b){return b.title&&b.title.replace(/\s/g,"_").replace(/[^\w\u00c0-\uFFFF-]/g,"")||this.options.idPrefix+u()},_sanitizeSelector:function(b){return b.replace(/:/g,"\\:")},_cookie:function(){var b=this.cookie||(this.cookie=this.options.cookie.name||"ui-tabs-"+w());return d.cookie.apply(null,[b].concat(d.makeArray(arguments)))},_ui:function(b,e){return{tab:b,panel:e,index:this.anchors.index(b)}},_cleanup:function(){this.lis.filter(".ui-state-processing").removeClass("ui-state-processing").find("span:data(label.tabs)").each(function(){var b=
d(this);b.html(b.data("label.tabs")).removeData("label.tabs")})},_tabify:function(b){function e(g,f){g.css("display","");!d.support.opacity&&f.opacity&&g[0].style.removeAttribute("filter")}var a=this,c=this.options,h=/^#.+/;this.list=this.element.find("ol,ul").eq(0);this.lis=d(" > li:has(a[href])",this.list);this.anchors=this.lis.map(function(){return d("a",this)[0]});this.panels=d([]);this.anchors.each(function(g,f){var i=d(f).attr("href"),l=i.split("#")[0],q;if(l&&(l===location.toString().split("#")[0]||
(q=d("base")[0])&&l===q.href)){i=f.hash;f.href=i}if(h.test(i))a.panels=a.panels.add(a.element.find(a._sanitizeSelector(i)));else if(i&&i!=="#"){d.data(f,"href.tabs",i);d.data(f,"load.tabs",i.replace(/#.*$/,""));i=a._tabId(f);f.href="#"+i;f=a.element.find("#"+i);if(!f.length){f=d(c.panelTemplate).attr("id",i).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").insertAfter(a.panels[g-1]||a.list);f.data("destroy.tabs",true)}a.panels=a.panels.add(f)}else c.disabled.push(g)});if(b){this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all");
this.list.addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.lis.addClass("ui-state-default ui-corner-top");this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom");if(c.selected===p){location.hash&&this.anchors.each(function(g,f){if(f.hash==location.hash){c.selected=g;return false}});if(typeof c.selected!=="number"&&c.cookie)c.selected=parseInt(a._cookie(),10);if(typeof c.selected!=="number"&&this.lis.filter(".ui-tabs-selected").length)c.selected=
this.lis.index(this.lis.filter(".ui-tabs-selected"));c.selected=c.selected||(this.lis.length?0:-1)}else if(c.selected===null)c.selected=-1;c.selected=c.selected>=0&&this.anchors[c.selected]||c.selected<0?c.selected:0;c.disabled=d.unique(c.disabled.concat(d.map(this.lis.filter(".ui-state-disabled"),function(g){return a.lis.index(g)}))).sort();d.inArray(c.selected,c.disabled)!=-1&&c.disabled.splice(d.inArray(c.selected,c.disabled),1);this.panels.addClass("ui-tabs-hide");this.lis.removeClass("ui-tabs-selected ui-state-active");
if(c.selected>=0&&this.anchors.length){a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash)).removeClass("ui-tabs-hide");this.lis.eq(c.selected).addClass("ui-tabs-selected ui-state-active");a.element.queue("tabs",function(){a._trigger("show",null,a._ui(a.anchors[c.selected],a.element.find(a._sanitizeSelector(a.anchors[c.selected].hash))[0]))});this.load(c.selected)}d(window).bind("unload",function(){a.lis.add(a.anchors).unbind(".tabs");a.lis=a.anchors=a.panels=null})}else c.selected=this.lis.index(this.lis.filter(".ui-tabs-selected"));
this.element[c.collapsible?"addClass":"removeClass"]("ui-tabs-collapsible");c.cookie&&this._cookie(c.selected,c.cookie);b=0;for(var j;j=this.lis[b];b++)d(j)[d.inArray(b,c.disabled)!=-1&&!d(j).hasClass("ui-tabs-selected")?"addClass":"removeClass"]("ui-state-disabled");c.cache===false&&this.anchors.removeData("cache.tabs");this.lis.add(this.anchors).unbind(".tabs");if(c.event!=="mouseover"){var k=function(g,f){f.is(":not(.ui-state-disabled)")&&f.addClass("ui-state-"+g)},n=function(g,f){f.removeClass("ui-state-"+
g)};this.lis.bind("mouseover.tabs",function(){k("hover",d(this))});this.lis.bind("mouseout.tabs",function(){n("hover",d(this))});this.anchors.bind("focus.tabs",function(){k("focus",d(this).closest("li"))});this.anchors.bind("blur.tabs",function(){n("focus",d(this).closest("li"))})}var m,o;if(c.fx)if(d.isArray(c.fx)){m=c.fx[0];o=c.fx[1]}else m=o=c.fx;var r=o?function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.hide().removeClass("ui-tabs-hide").animate(o,o.duration||"normal",
function(){e(f,o);a._trigger("show",null,a._ui(g,f[0]))})}:function(g,f){d(g).closest("li").addClass("ui-tabs-selected ui-state-active");f.removeClass("ui-tabs-hide");a._trigger("show",null,a._ui(g,f[0]))},s=m?function(g,f){f.animate(m,m.duration||"normal",function(){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");e(f,m);a.element.dequeue("tabs")})}:function(g,f){a.lis.removeClass("ui-tabs-selected ui-state-active");f.addClass("ui-tabs-hide");a.element.dequeue("tabs")};
this.anchors.bind(c.event+".tabs",function(){var g=this,f=d(g).closest("li"),i=a.panels.filter(":not(.ui-tabs-hide)"),l=a.element.find(a._sanitizeSelector(g.hash));if(f.hasClass("ui-tabs-selected")&&!c.collapsible||f.hasClass("ui-state-disabled")||f.hasClass("ui-state-processing")||a.panels.filter(":animated").length||a._trigger("select",null,a._ui(this,l[0]))===false){this.blur();return false}c.selected=a.anchors.index(this);a.abort();if(c.collapsible)if(f.hasClass("ui-tabs-selected")){c.selected=
-1;c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){s(g,i)}).dequeue("tabs");this.blur();return false}else if(!i.length){c.cookie&&a._cookie(c.selected,c.cookie);a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this));this.blur();return false}c.cookie&&a._cookie(c.selected,c.cookie);if(l.length){i.length&&a.element.queue("tabs",function(){s(g,i)});a.element.queue("tabs",function(){r(g,l)});a.load(a.anchors.index(this))}else throw"jQuery UI Tabs: Mismatching fragment identifier.";
d.browser.msie&&this.blur()});this.anchors.bind("click.tabs",function(){return false})},_getIndex:function(b){if(typeof b=="string")b=this.anchors.index(this.anchors.filter("[href$="+b+"]"));return b},destroy:function(){var b=this.options;this.abort();this.element.unbind(".tabs").removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible").removeData("tabs");this.list.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all");this.anchors.each(function(){var e=
d.data(this,"href.tabs");if(e)this.href=e;var a=d(this).unbind(".tabs");d.each(["href","load","cache"],function(c,h){a.removeData(h+".tabs")})});this.lis.unbind(".tabs").add(this.panels).each(function(){d.data(this,"destroy.tabs")?d(this).remove():d(this).removeClass("ui-state-default ui-corner-top ui-tabs-selected ui-state-active ui-state-hover ui-state-focus ui-state-disabled ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide")});b.cookie&&this._cookie(null,b.cookie);return this},add:function(b,
e,a){if(a===p)a=this.anchors.length;var c=this,h=this.options;e=d(h.tabTemplate.replace(/#\{href\}/g,b).replace(/#\{label\}/g,e));b=!b.indexOf("#")?b.replace("#",""):this._tabId(d("a",e)[0]);e.addClass("ui-state-default ui-corner-top").data("destroy.tabs",true);var j=c.element.find("#"+b);j.length||(j=d(h.panelTemplate).attr("id",b).data("destroy.tabs",true));j.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide");if(a>=this.lis.length){e.appendTo(this.list);j.appendTo(this.list[0].parentNode)}else{e.insertBefore(this.lis[a]);
j.insertBefore(this.panels[a])}h.disabled=d.map(h.disabled,function(k){return k>=a?++k:k});this._tabify();if(this.anchors.length==1){h.selected=0;e.addClass("ui-tabs-selected ui-state-active");j.removeClass("ui-tabs-hide");this.element.queue("tabs",function(){c._trigger("show",null,c._ui(c.anchors[0],c.panels[0]))});this.load(0)}this._trigger("add",null,this._ui(this.anchors[a],this.panels[a]));return this},remove:function(b){b=this._getIndex(b);var e=this.options,a=this.lis.eq(b).remove(),c=this.panels.eq(b).remove();
if(a.hasClass("ui-tabs-selected")&&this.anchors.length>1)this.select(b+(b+1<this.anchors.length?1:-1));e.disabled=d.map(d.grep(e.disabled,function(h){return h!=b}),function(h){return h>=b?--h:h});this._tabify();this._trigger("remove",null,this._ui(a.find("a")[0],c[0]));return this},enable:function(b){b=this._getIndex(b);var e=this.options;if(d.inArray(b,e.disabled)!=-1){this.lis.eq(b).removeClass("ui-state-disabled");e.disabled=d.grep(e.disabled,function(a){return a!=b});this._trigger("enable",null,
this._ui(this.anchors[b],this.panels[b]));return this}},disable:function(b){b=this._getIndex(b);var e=this.options;if(b!=e.selected){this.lis.eq(b).addClass("ui-state-disabled");e.disabled.push(b);e.disabled.sort();this._trigger("disable",null,this._ui(this.anchors[b],this.panels[b]))}return this},select:function(b){b=this._getIndex(b);if(b==-1)if(this.options.collapsible&&this.options.selected!=-1)b=this.options.selected;else return this;this.anchors.eq(b).trigger(this.options.event+".tabs");return this},
load:function(b){b=this._getIndex(b);var e=this,a=this.options,c=this.anchors.eq(b)[0],h=d.data(c,"load.tabs");this.abort();if(!h||this.element.queue("tabs").length!==0&&d.data(c,"cache.tabs"))this.element.dequeue("tabs");else{this.lis.eq(b).addClass("ui-state-processing");if(a.spinner){var j=d("span",c);j.data("label.tabs",j.html()).html(a.spinner)}this.xhr=d.ajax(d.extend({},a.ajaxOptions,{url:h,success:function(k,n){e.element.find(e._sanitizeSelector(c.hash)).html(k);e._cleanup();a.cache&&d.data(c,
"cache.tabs",true);e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.success(k,n)}catch(m){}},error:function(k,n){e._cleanup();e._trigger("load",null,e._ui(e.anchors[b],e.panels[b]));try{a.ajaxOptions.error(k,n,b,c)}catch(m){}}}));e.element.dequeue("tabs");return this}},abort:function(){this.element.queue([]);this.panels.stop(false,true);this.element.queue("tabs",this.element.queue("tabs").splice(-2,2));if(this.xhr){this.xhr.abort();delete this.xhr}this._cleanup();return this},
url:function(b,e){this.anchors.eq(b).removeData("cache.tabs").data("load.tabs",e);return this},length:function(){return this.anchors.length}});d.extend(d.ui.tabs,{version:"1.8.16"});d.extend(d.ui.tabs.prototype,{rotation:null,rotate:function(b,e){var a=this,c=this.options,h=a._rotate||(a._rotate=function(j){clearTimeout(a.rotation);a.rotation=setTimeout(function(){var k=c.selected;a.select(++k<a.anchors.length?k:0)},b);j&&j.stopPropagation()});e=a._unrotate||(a._unrotate=!e?function(j){j.clientX&&
a.rotate(null)}:function(){t=c.selected;h()});if(b){this.element.bind("tabsshow",h);this.anchors.bind(c.event+".tabs",e);h()}else{clearTimeout(a.rotation);this.element.unbind("tabsshow",h);this.anchors.unbind(c.event+".tabs",e);delete this._rotate;delete this._unrotate}return this}})})(jQuery);
;/*
 * jQuery UI Datepicker 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	jquery.ui.core.js
 */
(function(d,C){function M(){this.debug=false;this._curInst=null;this._keyEvent=false;this._disabledInputs=[];this._inDialog=this._datepickerShowing=false;this._mainDivId="ui-datepicker-div";this._inlineClass="ui-datepicker-inline";this._appendClass="ui-datepicker-append";this._triggerClass="ui-datepicker-trigger";this._dialogClass="ui-datepicker-dialog";this._disableClass="ui-datepicker-disabled";this._unselectableClass="ui-datepicker-unselectable";this._currentClass="ui-datepicker-current-day";this._dayOverClass=
"ui-datepicker-days-cell-over";this.regional=[];this.regional[""]={closeText:"Done",prevText:"Prev",nextText:"Next",currentText:"Today",monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayNamesMin:["Su",
"Mo","Tu","We","Th","Fr","Sa"],weekHeader:"Wk",dateFormat:"mm/dd/yy",firstDay:0,isRTL:false,showMonthAfterYear:false,yearSuffix:""};this._defaults={showOn:"focus",showAnim:"fadeIn",showOptions:{},defaultDate:null,appendText:"",buttonText:"...",buttonImage:"",buttonImageOnly:false,hideIfNoPrevNext:false,navigationAsDateFormat:false,gotoCurrent:false,changeMonth:false,changeYear:false,yearRange:"c-10:c+10",showOtherMonths:false,selectOtherMonths:false,showWeek:false,calculateWeek:this.iso8601Week,shortYearCutoff:"+10",
minDate:null,maxDate:null,duration:"fast",beforeShowDay:null,beforeShow:null,onSelect:null,onChangeMonthYear:null,onClose:null,numberOfMonths:1,showCurrentAtPos:0,stepMonths:1,stepBigMonths:12,altField:"",altFormat:"",constrainInput:true,showButtonPanel:false,autoSize:false,disabled:false};d.extend(this._defaults,this.regional[""]);this.dpDiv=N(d('<div id="'+this._mainDivId+'" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}function N(a){return a.bind("mouseout",
function(b){b=d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");b.length&&b.removeClass("ui-state-hover ui-datepicker-prev-hover ui-datepicker-next-hover")}).bind("mouseover",function(b){b=d(b.target).closest("button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a");if(!(d.datepicker._isDisabledDatepicker(J.inline?a.parent()[0]:J.input[0])||!b.length)){b.parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
b.addClass("ui-state-hover");b.hasClass("ui-datepicker-prev")&&b.addClass("ui-datepicker-prev-hover");b.hasClass("ui-datepicker-next")&&b.addClass("ui-datepicker-next-hover")}})}function H(a,b){d.extend(a,b);for(var c in b)if(b[c]==null||b[c]==C)a[c]=b[c];return a}d.extend(d.ui,{datepicker:{version:"1.8.16"}});var B=(new Date).getTime(),J;d.extend(M.prototype,{markerClassName:"hasDatepicker",maxRows:4,log:function(){this.debug&&console.log.apply("",arguments)},_widgetDatepicker:function(){return this.dpDiv},
setDefaults:function(a){H(this._defaults,a||{});return this},_attachDatepicker:function(a,b){var c=null;for(var e in this._defaults){var f=a.getAttribute("date:"+e);if(f){c=c||{};try{c[e]=eval(f)}catch(h){c[e]=f}}}e=a.nodeName.toLowerCase();f=e=="div"||e=="span";if(!a.id){this.uuid+=1;a.id="dp"+this.uuid}var i=this._newInst(d(a),f);i.settings=d.extend({},b||{},c||{});if(e=="input")this._connectDatepicker(a,i);else f&&this._inlineDatepicker(a,i)},_newInst:function(a,b){return{id:a[0].id.replace(/([^A-Za-z0-9_-])/g,
"\\\\$1"),input:a,selectedDay:0,selectedMonth:0,selectedYear:0,drawMonth:0,drawYear:0,inline:b,dpDiv:!b?this.dpDiv:N(d('<div class="'+this._inlineClass+' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))}},_connectDatepicker:function(a,b){var c=d(a);b.append=d([]);b.trigger=d([]);if(!c.hasClass(this.markerClassName)){this._attachments(c,b);c.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp).bind("setData.datepicker",
function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});this._autoSize(b);d.data(a,"datepicker",b);b.settings.disabled&&this._disableDatepicker(a)}},_attachments:function(a,b){var c=this._get(b,"appendText"),e=this._get(b,"isRTL");b.append&&b.append.remove();if(c){b.append=d('<span class="'+this._appendClass+'">'+c+"</span>");a[e?"before":"after"](b.append)}a.unbind("focus",this._showDatepicker);b.trigger&&b.trigger.remove();c=this._get(b,"showOn");if(c==
"focus"||c=="both")a.focus(this._showDatepicker);if(c=="button"||c=="both"){c=this._get(b,"buttonText");var f=this._get(b,"buttonImage");b.trigger=d(this._get(b,"buttonImageOnly")?d("<img/>").addClass(this._triggerClass).attr({src:f,alt:c,title:c}):d('<button type="button"></button>').addClass(this._triggerClass).html(f==""?c:d("<img/>").attr({src:f,alt:c,title:c})));a[e?"before":"after"](b.trigger);b.trigger.click(function(){d.datepicker._datepickerShowing&&d.datepicker._lastInput==a[0]?d.datepicker._hideDatepicker():
d.datepicker._showDatepicker(a[0]);return false})}},_autoSize:function(a){if(this._get(a,"autoSize")&&!a.inline){var b=new Date(2009,11,20),c=this._get(a,"dateFormat");if(c.match(/[DM]/)){var e=function(f){for(var h=0,i=0,g=0;g<f.length;g++)if(f[g].length>h){h=f[g].length;i=g}return i};b.setMonth(e(this._get(a,c.match(/MM/)?"monthNames":"monthNamesShort")));b.setDate(e(this._get(a,c.match(/DD/)?"dayNames":"dayNamesShort"))+20-b.getDay())}a.input.attr("size",this._formatDate(a,b).length)}},_inlineDatepicker:function(a,
b){var c=d(a);if(!c.hasClass(this.markerClassName)){c.addClass(this.markerClassName).append(b.dpDiv).bind("setData.datepicker",function(e,f,h){b.settings[f]=h}).bind("getData.datepicker",function(e,f){return this._get(b,f)});d.data(a,"datepicker",b);this._setDate(b,this._getDefaultDate(b),true);this._updateDatepicker(b);this._updateAlternate(b);b.settings.disabled&&this._disableDatepicker(a);b.dpDiv.css("display","block")}},_dialogDatepicker:function(a,b,c,e,f){a=this._dialogInst;if(!a){this.uuid+=
1;this._dialogInput=d('<input type="text" id="'+("dp"+this.uuid)+'" style="position: absolute; top: -100px; width: 0px; z-index: -10;"/>');this._dialogInput.keydown(this._doKeyDown);d("body").append(this._dialogInput);a=this._dialogInst=this._newInst(this._dialogInput,false);a.settings={};d.data(this._dialogInput[0],"datepicker",a)}H(a.settings,e||{});b=b&&b.constructor==Date?this._formatDate(a,b):b;this._dialogInput.val(b);this._pos=f?f.length?f:[f.pageX,f.pageY]:null;if(!this._pos)this._pos=[document.documentElement.clientWidth/
2-100+(document.documentElement.scrollLeft||document.body.scrollLeft),document.documentElement.clientHeight/2-150+(document.documentElement.scrollTop||document.body.scrollTop)];this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px");a.settings.onSelect=c;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);d.blockUI&&d.blockUI(this.dpDiv);d.data(this._dialogInput[0],"datepicker",a);return this},_destroyDatepicker:function(a){var b=
d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();d.removeData(a,"datepicker");if(e=="input"){c.append.remove();c.trigger.remove();b.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp)}else if(e=="div"||e=="span")b.removeClass(this.markerClassName).empty()}},_enableDatepicker:function(a){var b=d(a),c=d.data(a,"datepicker");if(b.hasClass(this.markerClassName)){var e=
a.nodeName.toLowerCase();if(e=="input"){a.disabled=false;c.trigger.filter("button").each(function(){this.disabled=false}).end().filter("img").css({opacity:"1.0",cursor:""})}else if(e=="div"||e=="span"){b=b.children("."+this._inlineClass);b.children().removeClass("ui-state-disabled");b.find("select.ui-datepicker-month, select.ui-datepicker-year").removeAttr("disabled")}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==a?null:f})}},_disableDatepicker:function(a){var b=d(a),c=d.data(a,
"datepicker");if(b.hasClass(this.markerClassName)){var e=a.nodeName.toLowerCase();if(e=="input"){a.disabled=true;c.trigger.filter("button").each(function(){this.disabled=true}).end().filter("img").css({opacity:"0.5",cursor:"default"})}else if(e=="div"||e=="span"){b=b.children("."+this._inlineClass);b.children().addClass("ui-state-disabled");b.find("select.ui-datepicker-month, select.ui-datepicker-year").attr("disabled","disabled")}this._disabledInputs=d.map(this._disabledInputs,function(f){return f==
a?null:f});this._disabledInputs[this._disabledInputs.length]=a}},_isDisabledDatepicker:function(a){if(!a)return false;for(var b=0;b<this._disabledInputs.length;b++)if(this._disabledInputs[b]==a)return true;return false},_getInst:function(a){try{return d.data(a,"datepicker")}catch(b){throw"Missing instance data for this datepicker";}},_optionDatepicker:function(a,b,c){var e=this._getInst(a);if(arguments.length==2&&typeof b=="string")return b=="defaults"?d.extend({},d.datepicker._defaults):e?b=="all"?
d.extend({},e.settings):this._get(e,b):null;var f=b||{};if(typeof b=="string"){f={};f[b]=c}if(e){this._curInst==e&&this._hideDatepicker();var h=this._getDateDatepicker(a,true),i=this._getMinMaxDate(e,"min"),g=this._getMinMaxDate(e,"max");H(e.settings,f);if(i!==null&&f.dateFormat!==C&&f.minDate===C)e.settings.minDate=this._formatDate(e,i);if(g!==null&&f.dateFormat!==C&&f.maxDate===C)e.settings.maxDate=this._formatDate(e,g);this._attachments(d(a),e);this._autoSize(e);this._setDate(e,h);this._updateAlternate(e);
this._updateDatepicker(e)}},_changeDatepicker:function(a,b,c){this._optionDatepicker(a,b,c)},_refreshDatepicker:function(a){(a=this._getInst(a))&&this._updateDatepicker(a)},_setDateDatepicker:function(a,b){if(a=this._getInst(a)){this._setDate(a,b);this._updateDatepicker(a);this._updateAlternate(a)}},_getDateDatepicker:function(a,b){(a=this._getInst(a))&&!a.inline&&this._setDateFromField(a,b);return a?this._getDate(a):null},_doKeyDown:function(a){var b=d.datepicker._getInst(a.target),c=true,e=b.dpDiv.is(".ui-datepicker-rtl");
b._keyEvent=true;if(d.datepicker._datepickerShowing)switch(a.keyCode){case 9:d.datepicker._hideDatepicker();c=false;break;case 13:c=d("td."+d.datepicker._dayOverClass+":not(."+d.datepicker._currentClass+")",b.dpDiv);c[0]&&d.datepicker._selectDay(a.target,b.selectedMonth,b.selectedYear,c[0]);if(a=d.datepicker._get(b,"onSelect")){c=d.datepicker._formatDate(b);a.apply(b.input?b.input[0]:null,[c,b])}else d.datepicker._hideDatepicker();return false;case 27:d.datepicker._hideDatepicker();break;case 33:d.datepicker._adjustDate(a.target,
a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 34:d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,"stepMonths"),"M");break;case 35:if(a.ctrlKey||a.metaKey)d.datepicker._clearDate(a.target);c=a.ctrlKey||a.metaKey;break;case 36:if(a.ctrlKey||a.metaKey)d.datepicker._gotoToday(a.target);c=a.ctrlKey||a.metaKey;break;case 37:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?+1:-1,"D");c=
a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?-d.datepicker._get(b,"stepBigMonths"):-d.datepicker._get(b,"stepMonths"),"M");break;case 38:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,-7,"D");c=a.ctrlKey||a.metaKey;break;case 39:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,e?-1:+1,"D");c=a.ctrlKey||a.metaKey;if(a.originalEvent.altKey)d.datepicker._adjustDate(a.target,a.ctrlKey?+d.datepicker._get(b,"stepBigMonths"):+d.datepicker._get(b,
"stepMonths"),"M");break;case 40:if(a.ctrlKey||a.metaKey)d.datepicker._adjustDate(a.target,+7,"D");c=a.ctrlKey||a.metaKey;break;default:c=false}else if(a.keyCode==36&&a.ctrlKey)d.datepicker._showDatepicker(this);else c=false;if(c){a.preventDefault();a.stopPropagation()}},_doKeyPress:function(a){var b=d.datepicker._getInst(a.target);if(d.datepicker._get(b,"constrainInput")){b=d.datepicker._possibleChars(d.datepicker._get(b,"dateFormat"));var c=String.fromCharCode(a.charCode==C?a.keyCode:a.charCode);
return a.ctrlKey||a.metaKey||c<" "||!b||b.indexOf(c)>-1}},_doKeyUp:function(a){a=d.datepicker._getInst(a.target);if(a.input.val()!=a.lastVal)try{if(d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),a.input?a.input.val():null,d.datepicker._getFormatConfig(a))){d.datepicker._setDateFromField(a);d.datepicker._updateAlternate(a);d.datepicker._updateDatepicker(a)}}catch(b){d.datepicker.log(b)}return true},_showDatepicker:function(a){a=a.target||a;if(a.nodeName.toLowerCase()!="input")a=d("input",
a.parentNode)[0];if(!(d.datepicker._isDisabledDatepicker(a)||d.datepicker._lastInput==a)){var b=d.datepicker._getInst(a);if(d.datepicker._curInst&&d.datepicker._curInst!=b){d.datepicker._datepickerShowing&&d.datepicker._triggerOnClose(d.datepicker._curInst);d.datepicker._curInst.dpDiv.stop(true,true)}var c=d.datepicker._get(b,"beforeShow");c=c?c.apply(a,[a,b]):{};if(c!==false){H(b.settings,c);b.lastVal=null;d.datepicker._lastInput=a;d.datepicker._setDateFromField(b);if(d.datepicker._inDialog)a.value=
"";if(!d.datepicker._pos){d.datepicker._pos=d.datepicker._findPos(a);d.datepicker._pos[1]+=a.offsetHeight}var e=false;d(a).parents().each(function(){e|=d(this).css("position")=="fixed";return!e});if(e&&d.browser.opera){d.datepicker._pos[0]-=document.documentElement.scrollLeft;d.datepicker._pos[1]-=document.documentElement.scrollTop}c={left:d.datepicker._pos[0],top:d.datepicker._pos[1]};d.datepicker._pos=null;b.dpDiv.empty();b.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});d.datepicker._updateDatepicker(b);
c=d.datepicker._checkOffset(b,c,e);b.dpDiv.css({position:d.datepicker._inDialog&&d.blockUI?"static":e?"fixed":"absolute",display:"none",left:c.left+"px",top:c.top+"px"});if(!b.inline){c=d.datepicker._get(b,"showAnim");var f=d.datepicker._get(b,"duration"),h=function(){var i=b.dpDiv.find("iframe.ui-datepicker-cover");if(i.length){var g=d.datepicker._getBorders(b.dpDiv);i.css({left:-g[0],top:-g[1],width:b.dpDiv.outerWidth(),height:b.dpDiv.outerHeight()})}};b.dpDiv.zIndex(d(a).zIndex()+1);d.datepicker._datepickerShowing=
true;d.effects&&d.effects[c]?b.dpDiv.show(c,d.datepicker._get(b,"showOptions"),f,h):b.dpDiv[c||"show"](c?f:null,h);if(!c||!f)h();b.input.is(":visible")&&!b.input.is(":disabled")&&b.input.focus();d.datepicker._curInst=b}}}},_updateDatepicker:function(a){this.maxRows=4;var b=d.datepicker._getBorders(a.dpDiv);J=a;a.dpDiv.empty().append(this._generateHTML(a));var c=a.dpDiv.find("iframe.ui-datepicker-cover");c.length&&c.css({left:-b[0],top:-b[1],width:a.dpDiv.outerWidth(),height:a.dpDiv.outerHeight()});
a.dpDiv.find("."+this._dayOverClass+" a").mouseover();b=this._getNumberOfMonths(a);c=b[1];a.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");c>1&&a.dpDiv.addClass("ui-datepicker-multi-"+c).css("width",17*c+"em");a.dpDiv[(b[0]!=1||b[1]!=1?"add":"remove")+"Class"]("ui-datepicker-multi");a.dpDiv[(this._get(a,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");a==d.datepicker._curInst&&d.datepicker._datepickerShowing&&a.input&&a.input.is(":visible")&&
!a.input.is(":disabled")&&a.input[0]!=document.activeElement&&a.input.focus();if(a.yearshtml){var e=a.yearshtml;setTimeout(function(){e===a.yearshtml&&a.yearshtml&&a.dpDiv.find("select.ui-datepicker-year:first").replaceWith(a.yearshtml);e=a.yearshtml=null},0)}},_getBorders:function(a){var b=function(c){return{thin:1,medium:2,thick:3}[c]||c};return[parseFloat(b(a.css("border-left-width"))),parseFloat(b(a.css("border-top-width")))]},_checkOffset:function(a,b,c){var e=a.dpDiv.outerWidth(),f=a.dpDiv.outerHeight(),
h=a.input?a.input.outerWidth():0,i=a.input?a.input.outerHeight():0,g=document.documentElement.clientWidth+d(document).scrollLeft(),j=document.documentElement.clientHeight+d(document).scrollTop();b.left-=this._get(a,"isRTL")?e-h:0;b.left-=c&&b.left==a.input.offset().left?d(document).scrollLeft():0;b.top-=c&&b.top==a.input.offset().top+i?d(document).scrollTop():0;b.left-=Math.min(b.left,b.left+e>g&&g>e?Math.abs(b.left+e-g):0);b.top-=Math.min(b.top,b.top+f>j&&j>f?Math.abs(f+i):0);return b},_findPos:function(a){for(var b=
this._get(this._getInst(a),"isRTL");a&&(a.type=="hidden"||a.nodeType!=1||d.expr.filters.hidden(a));)a=a[b?"previousSibling":"nextSibling"];a=d(a).offset();return[a.left,a.top]},_triggerOnClose:function(a){var b=this._get(a,"onClose");if(b)b.apply(a.input?a.input[0]:null,[a.input?a.input.val():"",a])},_hideDatepicker:function(a){var b=this._curInst;if(!(!b||a&&b!=d.data(a,"datepicker")))if(this._datepickerShowing){a=this._get(b,"showAnim");var c=this._get(b,"duration"),e=function(){d.datepicker._tidyDialog(b);
this._curInst=null};d.effects&&d.effects[a]?b.dpDiv.hide(a,d.datepicker._get(b,"showOptions"),c,e):b.dpDiv[a=="slideDown"?"slideUp":a=="fadeIn"?"fadeOut":"hide"](a?c:null,e);a||e();d.datepicker._triggerOnClose(b);this._datepickerShowing=false;this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if(d.blockUI){d.unblockUI();d("body").append(this.dpDiv)}}this._inDialog=false}},_tidyDialog:function(a){a.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar")},
_checkExternalClick:function(a){if(d.datepicker._curInst){a=d(a.target);a[0].id!=d.datepicker._mainDivId&&a.parents("#"+d.datepicker._mainDivId).length==0&&!a.hasClass(d.datepicker.markerClassName)&&!a.hasClass(d.datepicker._triggerClass)&&d.datepicker._datepickerShowing&&!(d.datepicker._inDialog&&d.blockUI)&&d.datepicker._hideDatepicker()}},_adjustDate:function(a,b,c){a=d(a);var e=this._getInst(a[0]);if(!this._isDisabledDatepicker(a[0])){this._adjustInstDate(e,b+(c=="M"?this._get(e,"showCurrentAtPos"):
0),c);this._updateDatepicker(e)}},_gotoToday:function(a){a=d(a);var b=this._getInst(a[0]);if(this._get(b,"gotoCurrent")&&b.currentDay){b.selectedDay=b.currentDay;b.drawMonth=b.selectedMonth=b.currentMonth;b.drawYear=b.selectedYear=b.currentYear}else{var c=new Date;b.selectedDay=c.getDate();b.drawMonth=b.selectedMonth=c.getMonth();b.drawYear=b.selectedYear=c.getFullYear()}this._notifyChange(b);this._adjustDate(a)},_selectMonthYear:function(a,b,c){a=d(a);var e=this._getInst(a[0]);e["selected"+(c=="M"?
"Month":"Year")]=e["draw"+(c=="M"?"Month":"Year")]=parseInt(b.options[b.selectedIndex].value,10);this._notifyChange(e);this._adjustDate(a)},_selectDay:function(a,b,c,e){var f=d(a);if(!(d(e).hasClass(this._unselectableClass)||this._isDisabledDatepicker(f[0]))){f=this._getInst(f[0]);f.selectedDay=f.currentDay=d("a",e).html();f.selectedMonth=f.currentMonth=b;f.selectedYear=f.currentYear=c;this._selectDate(a,this._formatDate(f,f.currentDay,f.currentMonth,f.currentYear))}},_clearDate:function(a){a=d(a);
this._getInst(a[0]);this._selectDate(a,"")},_selectDate:function(a,b){a=this._getInst(d(a)[0]);b=b!=null?b:this._formatDate(a);a.input&&a.input.val(b);this._updateAlternate(a);var c=this._get(a,"onSelect");if(c)c.apply(a.input?a.input[0]:null,[b,a]);else a.input&&a.input.trigger("change");if(a.inline)this._updateDatepicker(a);else{this._hideDatepicker();this._lastInput=a.input[0];typeof a.input[0]!="object"&&a.input.focus();this._lastInput=null}},_updateAlternate:function(a){var b=this._get(a,"altField");
if(b){var c=this._get(a,"altFormat")||this._get(a,"dateFormat"),e=this._getDate(a),f=this.formatDate(c,e,this._getFormatConfig(a));d(b).each(function(){d(this).val(f)})}},noWeekends:function(a){a=a.getDay();return[a>0&&a<6,""]},iso8601Week:function(a){a=new Date(a.getTime());a.setDate(a.getDate()+4-(a.getDay()||7));var b=a.getTime();a.setMonth(0);a.setDate(1);return Math.floor(Math.round((b-a)/864E5)/7)+1},parseDate:function(a,b,c){if(a==null||b==null)throw"Invalid arguments";b=typeof b=="object"?
b.toString():b+"";if(b=="")return null;var e=(c?c.shortYearCutoff:null)||this._defaults.shortYearCutoff;e=typeof e!="string"?e:(new Date).getFullYear()%100+parseInt(e,10);for(var f=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,h=(c?c.dayNames:null)||this._defaults.dayNames,i=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort,g=(c?c.monthNames:null)||this._defaults.monthNames,j=c=-1,l=-1,u=-1,k=false,o=function(p){(p=A+1<a.length&&a.charAt(A+1)==p)&&A++;return p},m=function(p){var D=
o(p);p=new RegExp("^\\d{1,"+(p=="@"?14:p=="!"?20:p=="y"&&D?4:p=="o"?3:2)+"}");p=b.substring(q).match(p);if(!p)throw"Missing number at position "+q;q+=p[0].length;return parseInt(p[0],10)},n=function(p,D,K){p=d.map(o(p)?K:D,function(w,x){return[[x,w]]}).sort(function(w,x){return-(w[1].length-x[1].length)});var E=-1;d.each(p,function(w,x){w=x[1];if(b.substr(q,w.length).toLowerCase()==w.toLowerCase()){E=x[0];q+=w.length;return false}});if(E!=-1)return E+1;else throw"Unknown name at position "+q;},s=
function(){if(b.charAt(q)!=a.charAt(A))throw"Unexpected literal at position "+q;q++},q=0,A=0;A<a.length;A++)if(k)if(a.charAt(A)=="'"&&!o("'"))k=false;else s();else switch(a.charAt(A)){case "d":l=m("d");break;case "D":n("D",f,h);break;case "o":u=m("o");break;case "m":j=m("m");break;case "M":j=n("M",i,g);break;case "y":c=m("y");break;case "@":var v=new Date(m("@"));c=v.getFullYear();j=v.getMonth()+1;l=v.getDate();break;case "!":v=new Date((m("!")-this._ticksTo1970)/1E4);c=v.getFullYear();j=v.getMonth()+
1;l=v.getDate();break;case "'":if(o("'"))s();else k=true;break;default:s()}if(q<b.length)throw"Extra/unparsed characters found in date: "+b.substring(q);if(c==-1)c=(new Date).getFullYear();else if(c<100)c+=(new Date).getFullYear()-(new Date).getFullYear()%100+(c<=e?0:-100);if(u>-1){j=1;l=u;do{e=this._getDaysInMonth(c,j-1);if(l<=e)break;j++;l-=e}while(1)}v=this._daylightSavingAdjust(new Date(c,j-1,l));if(v.getFullYear()!=c||v.getMonth()+1!=j||v.getDate()!=l)throw"Invalid date";return v},ATOM:"yy-mm-dd",
COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",_ticksTo1970:(718685+Math.floor(492.5)-Math.floor(19.7)+Math.floor(4.925))*24*60*60*1E7,formatDate:function(a,b,c){if(!b)return"";var e=(c?c.dayNamesShort:null)||this._defaults.dayNamesShort,f=(c?c.dayNames:null)||this._defaults.dayNames,h=(c?c.monthNamesShort:null)||this._defaults.monthNamesShort;c=(c?c.monthNames:
null)||this._defaults.monthNames;var i=function(o){(o=k+1<a.length&&a.charAt(k+1)==o)&&k++;return o},g=function(o,m,n){m=""+m;if(i(o))for(;m.length<n;)m="0"+m;return m},j=function(o,m,n,s){return i(o)?s[m]:n[m]},l="",u=false;if(b)for(var k=0;k<a.length;k++)if(u)if(a.charAt(k)=="'"&&!i("'"))u=false;else l+=a.charAt(k);else switch(a.charAt(k)){case "d":l+=g("d",b.getDate(),2);break;case "D":l+=j("D",b.getDay(),e,f);break;case "o":l+=g("o",Math.round(((new Date(b.getFullYear(),b.getMonth(),b.getDate())).getTime()-
(new Date(b.getFullYear(),0,0)).getTime())/864E5),3);break;case "m":l+=g("m",b.getMonth()+1,2);break;case "M":l+=j("M",b.getMonth(),h,c);break;case "y":l+=i("y")?b.getFullYear():(b.getYear()%100<10?"0":"")+b.getYear()%100;break;case "@":l+=b.getTime();break;case "!":l+=b.getTime()*1E4+this._ticksTo1970;break;case "'":if(i("'"))l+="'";else u=true;break;default:l+=a.charAt(k)}return l},_possibleChars:function(a){for(var b="",c=false,e=function(h){(h=f+1<a.length&&a.charAt(f+1)==h)&&f++;return h},f=
0;f<a.length;f++)if(c)if(a.charAt(f)=="'"&&!e("'"))c=false;else b+=a.charAt(f);else switch(a.charAt(f)){case "d":case "m":case "y":case "@":b+="0123456789";break;case "D":case "M":return null;case "'":if(e("'"))b+="'";else c=true;break;default:b+=a.charAt(f)}return b},_get:function(a,b){return a.settings[b]!==C?a.settings[b]:this._defaults[b]},_setDateFromField:function(a,b){if(a.input.val()!=a.lastVal){var c=this._get(a,"dateFormat"),e=a.lastVal=a.input?a.input.val():null,f,h;f=h=this._getDefaultDate(a);
var i=this._getFormatConfig(a);try{f=this.parseDate(c,e,i)||h}catch(g){this.log(g);e=b?"":e}a.selectedDay=f.getDate();a.drawMonth=a.selectedMonth=f.getMonth();a.drawYear=a.selectedYear=f.getFullYear();a.currentDay=e?f.getDate():0;a.currentMonth=e?f.getMonth():0;a.currentYear=e?f.getFullYear():0;this._adjustInstDate(a)}},_getDefaultDate:function(a){return this._restrictMinMax(a,this._determineDate(a,this._get(a,"defaultDate"),new Date))},_determineDate:function(a,b,c){var e=function(h){var i=new Date;
i.setDate(i.getDate()+h);return i},f=function(h){try{return d.datepicker.parseDate(d.datepicker._get(a,"dateFormat"),h,d.datepicker._getFormatConfig(a))}catch(i){}var g=(h.toLowerCase().match(/^c/)?d.datepicker._getDate(a):null)||new Date,j=g.getFullYear(),l=g.getMonth();g=g.getDate();for(var u=/([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,k=u.exec(h);k;){switch(k[2]||"d"){case "d":case "D":g+=parseInt(k[1],10);break;case "w":case "W":g+=parseInt(k[1],10)*7;break;case "m":case "M":l+=parseInt(k[1],10);g=
Math.min(g,d.datepicker._getDaysInMonth(j,l));break;case "y":case "Y":j+=parseInt(k[1],10);g=Math.min(g,d.datepicker._getDaysInMonth(j,l));break}k=u.exec(h)}return new Date(j,l,g)};if(b=(b=b==null||b===""?c:typeof b=="string"?f(b):typeof b=="number"?isNaN(b)?c:e(b):new Date(b.getTime()))&&b.toString()=="Invalid Date"?c:b){b.setHours(0);b.setMinutes(0);b.setSeconds(0);b.setMilliseconds(0)}return this._daylightSavingAdjust(b)},_daylightSavingAdjust:function(a){if(!a)return null;a.setHours(a.getHours()>
12?a.getHours()+2:0);return a},_setDate:function(a,b,c){var e=!b,f=a.selectedMonth,h=a.selectedYear;b=this._restrictMinMax(a,this._determineDate(a,b,new Date));a.selectedDay=a.currentDay=b.getDate();a.drawMonth=a.selectedMonth=a.currentMonth=b.getMonth();a.drawYear=a.selectedYear=a.currentYear=b.getFullYear();if((f!=a.selectedMonth||h!=a.selectedYear)&&!c)this._notifyChange(a);this._adjustInstDate(a);if(a.input)a.input.val(e?"":this._formatDate(a))},_getDate:function(a){return!a.currentYear||a.input&&
a.input.val()==""?null:this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay))},_generateHTML:function(a){var b=new Date;b=this._daylightSavingAdjust(new Date(b.getFullYear(),b.getMonth(),b.getDate()));var c=this._get(a,"isRTL"),e=this._get(a,"showButtonPanel"),f=this._get(a,"hideIfNoPrevNext"),h=this._get(a,"navigationAsDateFormat"),i=this._getNumberOfMonths(a),g=this._get(a,"showCurrentAtPos"),j=this._get(a,"stepMonths"),l=i[0]!=1||i[1]!=1,u=this._daylightSavingAdjust(!a.currentDay?
new Date(9999,9,9):new Date(a.currentYear,a.currentMonth,a.currentDay)),k=this._getMinMaxDate(a,"min"),o=this._getMinMaxDate(a,"max");g=a.drawMonth-g;var m=a.drawYear;if(g<0){g+=12;m--}if(o){var n=this._daylightSavingAdjust(new Date(o.getFullYear(),o.getMonth()-i[0]*i[1]+1,o.getDate()));for(n=k&&n<k?k:n;this._daylightSavingAdjust(new Date(m,g,1))>n;){g--;if(g<0){g=11;m--}}}a.drawMonth=g;a.drawYear=m;n=this._get(a,"prevText");n=!h?n:this.formatDate(n,this._daylightSavingAdjust(new Date(m,g-j,1)),this._getFormatConfig(a));
n=this._canAdjustMonth(a,-1,m,g)?'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery_'+B+".datepicker._adjustDate('#"+a.id+"', -"+j+", 'M');\" title=\""+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>":f?"":'<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+n+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"e":"w")+'">'+n+"</span></a>";var s=this._get(a,"nextText");s=!h?s:this.formatDate(s,this._daylightSavingAdjust(new Date(m,
g+j,1)),this._getFormatConfig(a));f=this._canAdjustMonth(a,+1,m,g)?'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery_'+B+".datepicker._adjustDate('#"+a.id+"', +"+j+", 'M');\" title=\""+s+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+s+"</span></a>":f?"":'<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+s+'"><span class="ui-icon ui-icon-circle-triangle-'+(c?"w":"e")+'">'+s+"</span></a>";j=this._get(a,"currentText");s=this._get(a,"gotoCurrent")&&
a.currentDay?u:b;j=!h?j:this.formatDate(j,s,this._getFormatConfig(a));h=!a.inline?'<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery_'+B+'.datepicker._hideDatepicker();">'+this._get(a,"closeText")+"</button>":"";e=e?'<div class="ui-datepicker-buttonpane ui-widget-content">'+(c?h:"")+(this._isInRange(a,s)?'<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery_'+
B+".datepicker._gotoToday('#"+a.id+"');\">"+j+"</button>":"")+(c?"":h)+"</div>":"";h=parseInt(this._get(a,"firstDay"),10);h=isNaN(h)?0:h;j=this._get(a,"showWeek");s=this._get(a,"dayNames");this._get(a,"dayNamesShort");var q=this._get(a,"dayNamesMin"),A=this._get(a,"monthNames"),v=this._get(a,"monthNamesShort"),p=this._get(a,"beforeShowDay"),D=this._get(a,"showOtherMonths"),K=this._get(a,"selectOtherMonths");this._get(a,"calculateWeek");for(var E=this._getDefaultDate(a),w="",x=0;x<i[0];x++){var O=
"";this.maxRows=4;for(var G=0;G<i[1];G++){var P=this._daylightSavingAdjust(new Date(m,g,a.selectedDay)),t=" ui-corner-all",y="";if(l){y+='<div class="ui-datepicker-group';if(i[1]>1)switch(G){case 0:y+=" ui-datepicker-group-first";t=" ui-corner-"+(c?"right":"left");break;case i[1]-1:y+=" ui-datepicker-group-last";t=" ui-corner-"+(c?"left":"right");break;default:y+=" ui-datepicker-group-middle";t="";break}y+='">'}y+='<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix'+t+'">'+(/all|left/.test(t)&&
x==0?c?f:n:"")+(/all|right/.test(t)&&x==0?c?n:f:"")+this._generateMonthYearHeader(a,g,m,k,o,x>0||G>0,A,v)+'</div><table class="ui-datepicker-calendar"><thead><tr>';var z=j?'<th class="ui-datepicker-week-col">'+this._get(a,"weekHeader")+"</th>":"";for(t=0;t<7;t++){var r=(t+h)%7;z+="<th"+((t+h+6)%7>=5?' class="ui-datepicker-week-end"':"")+'><span title="'+s[r]+'">'+q[r]+"</span></th>"}y+=z+"</tr></thead><tbody>";z=this._getDaysInMonth(m,g);if(m==a.selectedYear&&g==a.selectedMonth)a.selectedDay=Math.min(a.selectedDay,
z);t=(this._getFirstDayOfMonth(m,g)-h+7)%7;z=Math.ceil((t+z)/7);this.maxRows=z=l?this.maxRows>z?this.maxRows:z:z;r=this._daylightSavingAdjust(new Date(m,g,1-t));for(var Q=0;Q<z;Q++){y+="<tr>";var R=!j?"":'<td class="ui-datepicker-week-col">'+this._get(a,"calculateWeek")(r)+"</td>";for(t=0;t<7;t++){var I=p?p.apply(a.input?a.input[0]:null,[r]):[true,""],F=r.getMonth()!=g,L=F&&!K||!I[0]||k&&r<k||o&&r>o;R+='<td class="'+((t+h+6)%7>=5?" ui-datepicker-week-end":"")+(F?" ui-datepicker-other-month":"")+(r.getTime()==
P.getTime()&&g==a.selectedMonth&&a._keyEvent||E.getTime()==r.getTime()&&E.getTime()==P.getTime()?" "+this._dayOverClass:"")+(L?" "+this._unselectableClass+" ui-state-disabled":"")+(F&&!D?"":" "+I[1]+(r.getTime()==u.getTime()?" "+this._currentClass:"")+(r.getTime()==b.getTime()?" ui-datepicker-today":""))+'"'+((!F||D)&&I[2]?' title="'+I[2]+'"':"")+(L?"":' onclick="DP_jQuery_'+B+".datepicker._selectDay('#"+a.id+"',"+r.getMonth()+","+r.getFullYear()+', this);return false;"')+">"+(F&&!D?"&#xa0;":L?'<span class="ui-state-default">'+
r.getDate()+"</span>":'<a class="ui-state-default'+(r.getTime()==b.getTime()?" ui-state-highlight":"")+(r.getTime()==u.getTime()?" ui-state-active":"")+(F?" ui-priority-secondary":"")+'" href="#">'+r.getDate()+"</a>")+"</td>";r.setDate(r.getDate()+1);r=this._daylightSavingAdjust(r)}y+=R+"</tr>"}g++;if(g>11){g=0;m++}y+="</tbody></table>"+(l?"</div>"+(i[0]>0&&G==i[1]-1?'<div class="ui-datepicker-row-break"></div>':""):"");O+=y}w+=O}w+=e+(d.browser.msie&&parseInt(d.browser.version,10)<7&&!a.inline?'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>':
"");a._keyEvent=false;return w},_generateMonthYearHeader:function(a,b,c,e,f,h,i,g){var j=this._get(a,"changeMonth"),l=this._get(a,"changeYear"),u=this._get(a,"showMonthAfterYear"),k='<div class="ui-datepicker-title">',o="";if(h||!j)o+='<span class="ui-datepicker-month">'+i[b]+"</span>";else{i=e&&e.getFullYear()==c;var m=f&&f.getFullYear()==c;o+='<select class="ui-datepicker-month" onchange="DP_jQuery_'+B+".datepicker._selectMonthYear('#"+a.id+"', this, 'M');\" >";for(var n=0;n<12;n++)if((!i||n>=e.getMonth())&&
(!m||n<=f.getMonth()))o+='<option value="'+n+'"'+(n==b?' selected="selected"':"")+">"+g[n]+"</option>";o+="</select>"}u||(k+=o+(h||!(j&&l)?"&#xa0;":""));if(!a.yearshtml){a.yearshtml="";if(h||!l)k+='<span class="ui-datepicker-year">'+c+"</span>";else{g=this._get(a,"yearRange").split(":");var s=(new Date).getFullYear();i=function(q){q=q.match(/c[+-].*/)?c+parseInt(q.substring(1),10):q.match(/[+-].*/)?s+parseInt(q,10):parseInt(q,10);return isNaN(q)?s:q};b=i(g[0]);g=Math.max(b,i(g[1]||""));b=e?Math.max(b,
e.getFullYear()):b;g=f?Math.min(g,f.getFullYear()):g;for(a.yearshtml+='<select class="ui-datepicker-year" onchange="DP_jQuery_'+B+".datepicker._selectMonthYear('#"+a.id+"', this, 'Y');\" >";b<=g;b++)a.yearshtml+='<option value="'+b+'"'+(b==c?' selected="selected"':"")+">"+b+"</option>";a.yearshtml+="</select>";k+=a.yearshtml;a.yearshtml=null}}k+=this._get(a,"yearSuffix");if(u)k+=(h||!(j&&l)?"&#xa0;":"")+o;k+="</div>";return k},_adjustInstDate:function(a,b,c){var e=a.drawYear+(c=="Y"?b:0),f=a.drawMonth+
(c=="M"?b:0);b=Math.min(a.selectedDay,this._getDaysInMonth(e,f))+(c=="D"?b:0);e=this._restrictMinMax(a,this._daylightSavingAdjust(new Date(e,f,b)));a.selectedDay=e.getDate();a.drawMonth=a.selectedMonth=e.getMonth();a.drawYear=a.selectedYear=e.getFullYear();if(c=="M"||c=="Y")this._notifyChange(a)},_restrictMinMax:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");b=c&&b<c?c:b;return b=a&&b>a?a:b},_notifyChange:function(a){var b=this._get(a,"onChangeMonthYear");if(b)b.apply(a.input?
a.input[0]:null,[a.selectedYear,a.selectedMonth+1,a])},_getNumberOfMonths:function(a){a=this._get(a,"numberOfMonths");return a==null?[1,1]:typeof a=="number"?[1,a]:a},_getMinMaxDate:function(a,b){return this._determineDate(a,this._get(a,b+"Date"),null)},_getDaysInMonth:function(a,b){return 32-this._daylightSavingAdjust(new Date(a,b,32)).getDate()},_getFirstDayOfMonth:function(a,b){return(new Date(a,b,1)).getDay()},_canAdjustMonth:function(a,b,c,e){var f=this._getNumberOfMonths(a);c=this._daylightSavingAdjust(new Date(c,
e+(b<0?b:f[0]*f[1]),1));b<0&&c.setDate(this._getDaysInMonth(c.getFullYear(),c.getMonth()));return this._isInRange(a,c)},_isInRange:function(a,b){var c=this._getMinMaxDate(a,"min");a=this._getMinMaxDate(a,"max");return(!c||b.getTime()>=c.getTime())&&(!a||b.getTime()<=a.getTime())},_getFormatConfig:function(a){var b=this._get(a,"shortYearCutoff");b=typeof b!="string"?b:(new Date).getFullYear()%100+parseInt(b,10);return{shortYearCutoff:b,dayNamesShort:this._get(a,"dayNamesShort"),dayNames:this._get(a,
"dayNames"),monthNamesShort:this._get(a,"monthNamesShort"),monthNames:this._get(a,"monthNames")}},_formatDate:function(a,b,c,e){if(!b){a.currentDay=a.selectedDay;a.currentMonth=a.selectedMonth;a.currentYear=a.selectedYear}b=b?typeof b=="object"?b:this._daylightSavingAdjust(new Date(e,c,b)):this._daylightSavingAdjust(new Date(a.currentYear,a.currentMonth,a.currentDay));return this.formatDate(this._get(a,"dateFormat"),b,this._getFormatConfig(a))}});d.fn.datepicker=function(a){if(!this.length)return this;
if(!d.datepicker.initialized){d(document).mousedown(d.datepicker._checkExternalClick).find("body").append(d.datepicker.dpDiv);d.datepicker.initialized=true}var b=Array.prototype.slice.call(arguments,1);if(typeof a=="string"&&(a=="isDisabled"||a=="getDate"||a=="widget"))return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));if(a=="option"&&arguments.length==2&&typeof arguments[1]=="string")return d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this[0]].concat(b));return this.each(function(){typeof a==
"string"?d.datepicker["_"+a+"Datepicker"].apply(d.datepicker,[this].concat(b)):d.datepicker._attachDatepicker(this,a)})};d.datepicker=new M;d.datepicker.initialized=false;d.datepicker.uuid=(new Date).getTime();d.datepicker.version="1.8.16";window["DP_jQuery_"+B]=d})(jQuery);
;/*
 * jQuery UI Progressbar 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 */
(function(b,d){b.widget("ui.progressbar",{options:{value:0,max:100},min:0,_create:function(){this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({role:"progressbar","aria-valuemin":this.min,"aria-valuemax":this.options.max,"aria-valuenow":this._value()});this.valueDiv=b("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this.oldValue=this._value();this._refreshValue()},destroy:function(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");
this.valueDiv.remove();b.Widget.prototype.destroy.apply(this,arguments)},value:function(a){if(a===d)return this._value();this._setOption("value",a);return this},_setOption:function(a,c){if(a==="value"){this.options.value=c;this._refreshValue();this._value()===this.options.max&&this._trigger("complete")}b.Widget.prototype._setOption.apply(this,arguments)},_value:function(){var a=this.options.value;if(typeof a!=="number")a=0;return Math.min(this.options.max,Math.max(this.min,a))},_percentage:function(){return 100*
this._value()/this.options.max},_refreshValue:function(){var a=this.value(),c=this._percentage();if(this.oldValue!==a){this.oldValue=a;this._trigger("change")}this.valueDiv.toggle(a>this.min).toggleClass("ui-corner-right",a===this.options.max).width(c.toFixed(0)+"%");this.element.attr("aria-valuenow",a)}});b.extend(b.ui.progressbar,{version:"1.8.16"})})(jQuery);
;/*
 * jQuery UI Effects 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
jQuery.effects||function(f,j){function m(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return n.transparent;return n[f.trim(c).toLowerCase()]}function s(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return m(b)}function o(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function p(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in t||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function u(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function k(c,a,b,d){if(typeof c=="object"){d=
a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}if(f.isFunction(b)){d=b;b=null}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:b in f.fx.speeds?f.fx.speeds[b]:f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}function l(c){if(!c||typeof c==="number"||f.fx.speeds[c])return true;if(typeof c==="string"&&!f.effects[c])return true;return false}f.effects={};f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor",
"borderTopColor","borderColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=s(b.elem,a);b.end=m(b.end);b.colorInit=true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}});var n={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,
0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,
211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},q=["add","remove","toggle"],t={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,
d){if(f.isFunction(b)){d=b;b=null}return this.queue(function(){var e=f(this),g=e.attr("style")||" ",h=p(o.call(this)),r,v=e.attr("class");f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});r=p(o.call(this));e.attr("class",v);e.animate(u(h,r),{queue:false,duration:a,easing:b,complete:function(){f.each(q,function(w,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments);f.dequeue(this)}})})};
f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===j?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,
[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.16",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,a){var b;switch(c[0]){case "top":b=
0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),
d=document.activeElement;c.wrap(b);if(c[0]===d||f.contains(c[0],d))f(d).focus();b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(e,g){a[g]=c.css(g);if(isNaN(parseInt(a[g],10)))a[g]="auto"});c.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"})}return b.css(a).show()},removeWrapper:function(c){var a,b=document.activeElement;
if(c.parent().is(".ui-effects-wrapper")){a=c.parent().replaceWith(c);if(c[0]===b||f.contains(c[0],b))f(b).focus();return a}return c},setTransition:function(c,a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=k.apply(this,arguments),b={options:a[1],duration:a[2],callback:a[3]};a=b.options.mode;var d=f.effects[c];if(f.fx.off||!d)return a?this[a](b.duration,b.callback):this.each(function(){b.callback&&b.callback.call(this)});
return d.call(this,b)},_show:f.fn.show,show:function(c){if(l(c))return this._show.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(l(c))return this._hide.apply(this,arguments);else{var a=k.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(l(c)||typeof c==="boolean"||f.isFunction(c))return this.__toggle.apply(this,arguments);else{var a=k.apply(this,
arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),b=[];f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,a,b,d,e){if((a/=e/2)<1)return d/
2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,a,b,d,e){return d*((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+b},easeInQuint:function(c,a,b,
d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,10*(a/e-1))+b},easeOutExpo:function(c,
a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==e)return b+d;if((a/=e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*a)+1)+b},easeInElastic:function(c,a,b,
d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,a,b,d,e){c=1.70158;var g=
0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);if(a<1)return-0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,a,b,d,e,g){if(g==j)g=1.70158;
if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,d,e)*0.5+b;return f.easing.easeOutBounce(c,
a*2-e,0,d,e)*0.5+d*0.5+b}})}(jQuery);
;/*
 * jQuery UI Effects Blind 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.blind=function(c){return this.queue(function(){var a=b(this),g=["position","top","bottom","left","right"],f=b.effects.setMode(a,c.options.mode||"hide"),d=c.options.direction||"vertical";b.effects.save(a,g);a.show();var e=b.effects.createWrapper(a).css({overflow:"hidden"}),h=d=="vertical"?"height":"width";d=d=="vertical"?e.height():e.width();f=="show"&&e.css(h,0);var i={};i[h]=f=="show"?d:0;e.animate(i,c.duration,c.options.easing,function(){f=="hide"&&a.hide();b.effects.restore(a,
g);b.effects.removeWrapper(a);c.callback&&c.callback.apply(a[0],arguments);a.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Bounce 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.bounce=function(b){return this.queue(function(){var a=e(this),l=["position","top","bottom","left","right"],h=e.effects.setMode(a,b.options.mode||"effect"),d=b.options.direction||"up",c=b.options.distance||20,m=b.options.times||5,i=b.duration||250;/show|hide/.test(h)&&l.push("opacity");e.effects.save(a,l);a.show();e.effects.createWrapper(a);var f=d=="up"||d=="down"?"top":"left";d=d=="up"||d=="left"?"pos":"neg";c=b.options.distance||(f=="top"?a.outerHeight({margin:true})/3:a.outerWidth({margin:true})/
3);if(h=="show")a.css("opacity",0).css(f,d=="pos"?-c:c);if(h=="hide")c/=m*2;h!="hide"&&m--;if(h=="show"){var g={opacity:1};g[f]=(d=="pos"?"+=":"-=")+c;a.animate(g,i/2,b.options.easing);c/=2;m--}for(g=0;g<m;g++){var j={},k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing);c=h=="hide"?c*2:c/2}if(h=="hide"){g={opacity:0};g[f]=(d=="pos"?"-=":"+=")+c;a.animate(g,i/2,b.options.easing,function(){a.hide();e.effects.restore(a,l);e.effects.removeWrapper(a);
b.callback&&b.callback.apply(this,arguments)})}else{j={};k={};j[f]=(d=="pos"?"-=":"+=")+c;k[f]=(d=="pos"?"+=":"-=")+c;a.animate(j,i/2,b.options.easing).animate(k,i/2,b.options.easing,function(){e.effects.restore(a,l);e.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments)})}a.queue("fx",function(){a.dequeue()});a.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Clip 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.clip=function(e){return this.queue(function(){var a=b(this),i=["position","top","bottom","left","right","height","width"],f=b.effects.setMode(a,e.options.mode||"hide"),c=e.options.direction||"vertical";b.effects.save(a,i);a.show();var d=b.effects.createWrapper(a).css({overflow:"hidden"});d=a[0].tagName=="IMG"?d:a;var g={size:c=="vertical"?"height":"width",position:c=="vertical"?"top":"left"};c=c=="vertical"?d.height():d.width();if(f=="show"){d.css(g.size,0);d.css(g.position,
c/2)}var h={};h[g.size]=f=="show"?c:0;h[g.position]=f=="show"?0:c/2;d.animate(h,{queue:false,duration:e.duration,easing:e.options.easing,complete:function(){f=="hide"&&a.hide();b.effects.restore(a,i);b.effects.removeWrapper(a);e.callback&&e.callback.apply(a[0],arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Drop 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.drop=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right","opacity"],e=c.effects.setMode(a,d.options.mode||"hide"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a);var f=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var g=d.options.distance||(f=="top"?a.outerHeight({margin:true})/2:a.outerWidth({margin:true})/2);if(e=="show")a.css("opacity",0).css(f,b=="pos"?-g:g);var i={opacity:e==
"show"?1:0};i[f]=(e=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+g;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){e=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Explode 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(j){j.effects.explode=function(a){return this.queue(function(){var c=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3,d=a.options.pieces?Math.round(Math.sqrt(a.options.pieces)):3;a.options.mode=a.options.mode=="toggle"?j(this).is(":visible")?"hide":"show":a.options.mode;var b=j(this).show().css("visibility","hidden"),g=b.offset();g.top-=parseInt(b.css("marginTop"),10)||0;g.left-=parseInt(b.css("marginLeft"),10)||0;for(var h=b.outerWidth(true),i=b.outerHeight(true),e=0;e<c;e++)for(var f=
0;f<d;f++)b.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-f*(h/d),top:-e*(i/c)}).parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:h/d,height:i/c,left:g.left+f*(h/d)+(a.options.mode=="show"?(f-Math.floor(d/2))*(h/d):0),top:g.top+e*(i/c)+(a.options.mode=="show"?(e-Math.floor(c/2))*(i/c):0),opacity:a.options.mode=="show"?0:1}).animate({left:g.left+f*(h/d)+(a.options.mode=="show"?0:(f-Math.floor(d/2))*(h/d)),top:g.top+
e*(i/c)+(a.options.mode=="show"?0:(e-Math.floor(c/2))*(i/c)),opacity:a.options.mode=="show"?1:0},a.duration||500);setTimeout(function(){a.options.mode=="show"?b.css({visibility:"visible"}):b.css({visibility:"visible"}).hide();a.callback&&a.callback.apply(b[0]);b.dequeue();j("div.ui-effects-explode").remove()},a.duration||500)})}})(jQuery);
;/*
 * jQuery UI Effects Fade 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fade
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.fade=function(a){return this.queue(function(){var c=b(this),d=b.effects.setMode(c,a.options.mode||"hide");c.animate({opacity:d},{queue:false,duration:a.duration,easing:a.options.easing,complete:function(){a.callback&&a.callback.apply(this,arguments);c.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Fold 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.fold=function(a){return this.queue(function(){var b=c(this),j=["position","top","bottom","left","right"],d=c.effects.setMode(b,a.options.mode||"hide"),g=a.options.size||15,h=!!a.options.horizFirst,k=a.duration?a.duration/2:c.fx.speeds._default/2;c.effects.save(b,j);b.show();var e=c.effects.createWrapper(b).css({overflow:"hidden"}),f=d=="show"!=h,l=f?["width","height"]:["height","width"];f=f?[e.width(),e.height()]:[e.height(),e.width()];var i=/([0-9]+)%/.exec(g);if(i)g=parseInt(i[1],
10)/100*f[d=="hide"?0:1];if(d=="show")e.css(h?{height:0,width:g}:{height:g,width:0});h={};i={};h[l[0]]=d=="show"?f[0]:g;i[l[1]]=d=="show"?f[1]:0;e.animate(h,k,a.options.easing).animate(i,k,a.options.easing,function(){d=="hide"&&b.hide();c.effects.restore(b,j);c.effects.removeWrapper(b);a.callback&&a.callback.apply(b[0],arguments);b.dequeue()})})}})(jQuery);
;/*
 * jQuery UI Effects Highlight 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(b){b.effects.highlight=function(c){return this.queue(function(){var a=b(this),e=["backgroundImage","backgroundColor","opacity"],d=b.effects.setMode(a,c.options.mode||"show"),f={backgroundColor:a.css("backgroundColor")};if(d=="hide")f.opacity=0;b.effects.save(a,e);a.show().css({backgroundImage:"none",backgroundColor:c.options.color||"#ffff99"}).animate(f,{queue:false,duration:c.duration,easing:c.options.easing,complete:function(){d=="hide"&&a.hide();b.effects.restore(a,e);d=="show"&&!b.support.opacity&&
this.style.removeAttribute("filter");c.callback&&c.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Pulsate 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.pulsate=function(a){return this.queue(function(){var b=d(this),c=d.effects.setMode(b,a.options.mode||"show");times=(a.options.times||5)*2-1;duration=a.duration?a.duration/2:d.fx.speeds._default/2;isVisible=b.is(":visible");animateTo=0;if(!isVisible){b.css("opacity",0).show();animateTo=1}if(c=="hide"&&isVisible||c=="show"&&!isVisible)times--;for(c=0;c<times;c++){b.animate({opacity:animateTo},duration,a.options.easing);animateTo=(animateTo+1)%2}b.animate({opacity:animateTo},duration,
a.options.easing,function(){animateTo==0&&b.hide();a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()}).dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Scale 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.puff=function(b){return this.queue(function(){var a=c(this),e=c.effects.setMode(a,b.options.mode||"hide"),g=parseInt(b.options.percent,10)||150,h=g/100,i={height:a.height(),width:a.width()};c.extend(b.options,{fade:true,mode:e,percent:e=="hide"?g:100,from:e=="hide"?i:{height:i.height*h,width:i.width*h}});a.effect("scale",b.options,b.duration,b.callback);a.dequeue()})};c.effects.scale=function(b){return this.queue(function(){var a=c(this),e=c.extend(true,{},b.options),g=c.effects.setMode(a,
b.options.mode||"effect"),h=parseInt(b.options.percent,10)||(parseInt(b.options.percent,10)==0?0:g=="hide"?0:100),i=b.options.direction||"both",f=b.options.origin;if(g!="effect"){e.origin=f||["middle","center"];e.restore=true}f={height:a.height(),width:a.width()};a.from=b.options.from||(g=="show"?{height:0,width:0}:f);h={y:i!="horizontal"?h/100:1,x:i!="vertical"?h/100:1};a.to={height:f.height*h.y,width:f.width*h.x};if(b.options.fade){if(g=="show"){a.from.opacity=0;a.to.opacity=1}if(g=="hide"){a.from.opacity=
1;a.to.opacity=0}}e.from=a.from;e.to=a.to;e.mode=g;a.effect("size",e,b.duration,b.callback);a.dequeue()})};c.effects.size=function(b){return this.queue(function(){var a=c(this),e=["position","top","bottom","left","right","width","height","overflow","opacity"],g=["position","top","bottom","left","right","overflow","opacity"],h=["width","height","overflow"],i=["fontSize"],f=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],k=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],
p=c.effects.setMode(a,b.options.mode||"effect"),n=b.options.restore||false,m=b.options.scale||"both",l=b.options.origin,j={height:a.height(),width:a.width()};a.from=b.options.from||j;a.to=b.options.to||j;if(l){l=c.effects.getBaseline(l,j);a.from.top=(j.height-a.from.height)*l.y;a.from.left=(j.width-a.from.width)*l.x;a.to.top=(j.height-a.to.height)*l.y;a.to.left=(j.width-a.to.width)*l.x}var d={from:{y:a.from.height/j.height,x:a.from.width/j.width},to:{y:a.to.height/j.height,x:a.to.width/j.width}};
if(m=="box"||m=="both"){if(d.from.y!=d.to.y){e=e.concat(f);a.from=c.effects.setTransition(a,f,d.from.y,a.from);a.to=c.effects.setTransition(a,f,d.to.y,a.to)}if(d.from.x!=d.to.x){e=e.concat(k);a.from=c.effects.setTransition(a,k,d.from.x,a.from);a.to=c.effects.setTransition(a,k,d.to.x,a.to)}}if(m=="content"||m=="both")if(d.from.y!=d.to.y){e=e.concat(i);a.from=c.effects.setTransition(a,i,d.from.y,a.from);a.to=c.effects.setTransition(a,i,d.to.y,a.to)}c.effects.save(a,n?e:g);a.show();c.effects.createWrapper(a);
a.css("overflow","hidden").css(a.from);if(m=="content"||m=="both"){f=f.concat(["marginTop","marginBottom"]).concat(i);k=k.concat(["marginLeft","marginRight"]);h=e.concat(f).concat(k);a.find("*[width]").each(function(){child=c(this);n&&c.effects.save(child,h);var o={height:child.height(),width:child.width()};child.from={height:o.height*d.from.y,width:o.width*d.from.x};child.to={height:o.height*d.to.y,width:o.width*d.to.x};if(d.from.y!=d.to.y){child.from=c.effects.setTransition(child,f,d.from.y,child.from);
child.to=c.effects.setTransition(child,f,d.to.y,child.to)}if(d.from.x!=d.to.x){child.from=c.effects.setTransition(child,k,d.from.x,child.from);child.to=c.effects.setTransition(child,k,d.to.x,child.to)}child.css(child.from);child.animate(child.to,b.duration,b.options.easing,function(){n&&c.effects.restore(child,h)})})}a.animate(a.to,{queue:false,duration:b.duration,easing:b.options.easing,complete:function(){a.to.opacity===0&&a.css("opacity",a.from.opacity);p=="hide"&&a.hide();c.effects.restore(a,
n?e:g);c.effects.removeWrapper(a);b.callback&&b.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Shake 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(d){d.effects.shake=function(a){return this.queue(function(){var b=d(this),j=["position","top","bottom","left","right"];d.effects.setMode(b,a.options.mode||"effect");var c=a.options.direction||"left",e=a.options.distance||20,l=a.options.times||3,f=a.duration||a.options.duration||140;d.effects.save(b,j);b.show();d.effects.createWrapper(b);var g=c=="up"||c=="down"?"top":"left",h=c=="up"||c=="left"?"pos":"neg";c={};var i={},k={};c[g]=(h=="pos"?"-=":"+=")+e;i[g]=(h=="pos"?"+=":"-=")+e*2;k[g]=
(h=="pos"?"-=":"+=")+e*2;b.animate(c,f,a.options.easing);for(e=1;e<l;e++)b.animate(i,f,a.options.easing).animate(k,f,a.options.easing);b.animate(i,f,a.options.easing).animate(c,f/2,a.options.easing,function(){d.effects.restore(b,j);d.effects.removeWrapper(b);a.callback&&a.callback.apply(this,arguments)});b.queue("fx",function(){b.dequeue()});b.dequeue()})}})(jQuery);
;/*
 * jQuery UI Effects Slide 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(c){c.effects.slide=function(d){return this.queue(function(){var a=c(this),h=["position","top","bottom","left","right"],f=c.effects.setMode(a,d.options.mode||"show"),b=d.options.direction||"left";c.effects.save(a,h);a.show();c.effects.createWrapper(a).css({overflow:"hidden"});var g=b=="up"||b=="down"?"top":"left";b=b=="up"||b=="left"?"pos":"neg";var e=d.options.distance||(g=="top"?a.outerHeight({margin:true}):a.outerWidth({margin:true}));if(f=="show")a.css(g,b=="pos"?isNaN(e)?"-"+e:-e:e);
var i={};i[g]=(f=="show"?b=="pos"?"+=":"-=":b=="pos"?"-=":"+=")+e;a.animate(i,{queue:false,duration:d.duration,easing:d.options.easing,complete:function(){f=="hide"&&a.hide();c.effects.restore(a,h);c.effects.removeWrapper(a);d.callback&&d.callback.apply(this,arguments);a.dequeue()}})})}})(jQuery);
;/*
 * jQuery UI Effects Transfer 1.8.16
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function(e){e.effects.transfer=function(a){return this.queue(function(){var b=e(this),c=e(a.options.to),d=c.offset();c={top:d.top,left:d.left,height:c.innerHeight(),width:c.innerWidth()};d=b.offset();var f=e('<div class="ui-effects-transfer"></div>').appendTo(document.body).addClass(a.options.className).css({top:d.top,left:d.left,height:b.innerHeight(),width:b.innerWidth(),position:"absolute"}).animate(c,a.duration,a.options.easing,function(){f.remove();a.callback&&a.callback.apply(b[0],arguments);
b.dequeue()})})}})(jQuery);
;
define("libs/jquery/jquery-ui", function(){});

/*
 * Jeditable - jQuery in place edit plugin
 *
 * Copyright (c) 2006-2009 Mika Tuupola, Dylan Verheul
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/jeditable
 *
 * Based on editable by Dylan Verheul <dylan_at_dyve.net>:
 *    http://www.dyve.net/jquery/?editable
 *
 */

/**
  * Version 1.7.2-dev
  *
  * ** means there is basic unit tests for this parameter. 
  *
  * @name  Jeditable
  * @type  jQuery
  * @param String  target             (POST) URL or function to send edited content to **
  * @param Hash    options            additional options 
  * @param String  options[method]    method to use to send edited content (POST or PUT) **
  * @param Function options[callback] Function to run after submitting edited content **
  * @param String  options[name]      POST parameter name of edited content
  * @param String  options[id]        POST parameter name of edited div id
  * @param Hash    options[submitdata] Extra parameters to send when submitting edited content.
  * @param String  options[type]      text, textarea or select (or any 3rd party input type) **
  * @param Integer options[rows]      number of rows if using textarea ** 
  * @param Integer options[cols]      number of columns if using textarea **
  * @param Mixed   options[height]    'auto', 'none' or height in pixels **
  * @param Mixed   options[width]     'auto', 'none' or width in pixels **
  * @param String  options[loadurl]   URL to fetch input content before editing **
  * @param String  options[loadtype]  Request type for load url. Should be GET or POST.
  * @param String  options[loadtext]  Text to display while loading external content.
  * @param Mixed   options[loaddata]  Extra parameters to pass when fetching content before editing.
  * @param Mixed   options[data]      Or content given as paramameter. String or function.**
  * @param String  options[indicator] indicator html to show when saving
  * @param String  options[tooltip]   optional tooltip text via title attribute **
  * @param String  options[event]     jQuery event such as 'click' of 'dblclick' **
  * @param String  options[submit]    submit button value, empty means no button **
  * @param String  options[cancel]    cancel button value, empty means no button **
  * @param String  options[cssclass]  CSS class to apply to input form. 'inherit' to copy from parent. **
  * @param String  options[style]     Style to apply to input form 'inherit' to copy from parent. **
  * @param String  options[select]    true or false, when true text is highlighted ??
  * @param String  options[placeholder] Placeholder text or html to insert when element is empty. **
  * @param String  options[onblur]    'cancel', 'submit', 'ignore' or function ??
  *             
  * @param Function options[onsubmit] function(settings, original) { ... } called before submit
  * @param Function options[onreset]  function(settings, original) { ... } called before reset
  * @param Function options[onerror]  function(settings, original, xhr) { ... } called on error
  *             
  * @param Hash    options[ajaxoptions]  jQuery Ajax options. See docs.jquery.com.
  *             
  */

(function($) {

    $.fn.editable = function(target, options) {
            
        if ('disable' == target) {
            $(this).data('disabled.editable', true);
            return;
        }
        if ('enable' == target) {
            $(this).data('disabled.editable', false);
            return;
        }
        if ('destroy' == target) {
            $(this)
                .unbind($(this).data('event.editable'))
                .removeData('disabled.editable')
                .removeData('event.editable');
            return;
        }
        
        var settings = $.extend({}, $.fn.editable.defaults, {target:target}, options);
        
        /* setup some functions */
        var plugin   = $.editable.types[settings.type].plugin || function() { };
        var submit   = $.editable.types[settings.type].submit || function() { };
        var buttons  = $.editable.types[settings.type].buttons 
                    || $.editable.types['defaults'].buttons;
        var content  = $.editable.types[settings.type].content 
                    || $.editable.types['defaults'].content;
        var element  = $.editable.types[settings.type].element 
                    || $.editable.types['defaults'].element;
        var reset    = $.editable.types[settings.type].reset 
                    || $.editable.types['defaults'].reset;
        var callback = settings.callback || function() { };
        var onedit   = settings.onedit   || function() { }; 
        var onsubmit = settings.onsubmit || function() { };
        var onreset  = settings.onreset  || function() { };
        var onerror  = settings.onerror  || reset;
          
        /* Show tooltip. */
        if (settings.tooltip) {
            $(this).attr('title', settings.tooltip);
        }
        
        settings.autowidth  = 'auto' == settings.width;
        settings.autoheight = 'auto' == settings.height;
        
        return this.each(function() {
                        
            /* Save this to self because this changes when scope changes. */
            var self = this;  
                   
            /* Inlined block elements lose their width and height after first edit. */
            /* Save them for later use as workaround. */
            var savedwidth  = $(self).width();
            var savedheight = $(self).height();

            /* Save so it can be later used by $.editable('destroy') */
            $(this).data('event.editable', settings.event);
            
            /* If element is empty add something clickable (if requested) */
            if (!$.trim($(this).html())) {
                $(this).html(settings.placeholder);
            }
            
            $(this).bind(settings.event, function(e) {
                
                /* Abort if element is disabled. */
                if (true === $(this).data('disabled.editable')) {
                    return;
                }
                
                /* Prevent throwing an exeption if edit field is clicked again. */
                if (self.editing) {
                    return;
                }
                
                /* Abort if onedit hook returns false. */
                if (false === onedit.apply(this, [settings, self])) {
                   return;
                }
                
                /* Prevent default action and bubbling. */
                e.preventDefault();
                e.stopPropagation();
                
                /* Remove tooltip. */
                if (settings.tooltip) {
                    $(self).removeAttr('title');
                }
                
                /* Figure out how wide and tall we are, saved width and height. */
                /* Workaround for http://dev.jquery.com/ticket/2190 */
                if (0 == $(self).width()) {
                    settings.width  = savedwidth;
                    settings.height = savedheight;
                } else {
                    if (settings.width != 'none') {
                        settings.width = 
                            settings.autowidth ? $(self).width()  : settings.width;
                    }
                    if (settings.height != 'none') {
                        settings.height = 
                            settings.autoheight ? $(self).height() : settings.height;
                    }
                }
                
                /* Remove placeholder text, replace is here because of IE. */
                if ($(this).html().toLowerCase().replace(/(;|"|\/)/g, '') == 
                    settings.placeholder.toLowerCase().replace(/(;|"|\/)/g, '')) {
                        $(this).html('');
                }
                                
                self.editing    = true;
                self.revert     = $(self).html();
                $(self).html('');

                /* Create the form object. */
                var form = $('<form />');
                
                /* Apply css or style or both. */
                if (settings.cssclass) {
                    if ('inherit' == settings.cssclass) {
                        form.attr('class', $(self).attr('class'));
                    } else {
                        form.attr('class', settings.cssclass);
                    }
                }

                if (settings.style) {
                    if ('inherit' == settings.style) {
                        form.attr('style', $(self).attr('style'));
                        /* IE needs the second line or display wont be inherited. */
                        form.css('display', $(self).css('display'));                
                    } else {
                        form.attr('style', settings.style);
                    }
                }

                /* Add main input element to form and store it in input. */
                var input = element.apply(form, [settings, self]);

                /* Set input content via POST, GET, given data or existing value. */
                var input_content;
                
                if (settings.loadurl) {
                    var t = setTimeout(function() {
                        input.disabled = true;
                        content.apply(form, [settings.loadtext, settings, self]);
                    }, 100);

                    var loaddata = {};
                    loaddata[settings.id] = self.id;
                    if ($.isFunction(settings.loaddata)) {
                        $.extend(loaddata, settings.loaddata.apply(self, [self.revert, settings]));
                    } else {
                        $.extend(loaddata, settings.loaddata);
                    }
                    $.ajax({
                       type : settings.loadtype,
                       url  : settings.loadurl,
                       data : loaddata,
                       async : false,
                       success: function(result) {
                          window.clearTimeout(t);
                          input_content = result;
                          input.disabled = false;
                       }
                    });
                } else if (settings.data) {
                    input_content = settings.data;
                    if ($.isFunction(settings.data)) {
                        input_content = settings.data.apply(self, [self.revert, settings]);
                    }
                } else {
                    input_content = self.revert; 
                }
                content.apply(form, [input_content, settings, self]);

                input.attr('name', settings.name);
        
                /* Add buttons to the form. */
                buttons.apply(form, [settings, self]);
         
                /* Add created form to self. */
                $(self).append(form);
         
                /* Attach 3rd party plugin if requested. */
                plugin.apply(form, [settings, self]);

                /* Focus to first visible form element. */
                $(':input:visible:enabled:first', form).focus();

                /* Highlight input contents when requested. */
                if (settings.select) {
                    input.select();
                }
        
                /* discard changes if pressing esc */
                input.keydown(function(e) {
                    if (e.keyCode == 27) {
                        e.preventDefault();
                        reset.apply(form, [settings, self]);
                    }
                });

                /* Discard, submit or nothing with changes when clicking outside. */
                /* Do nothing is usable when navigating with tab. */
                var t;
                if ('cancel' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent canceling if submit was clicked. */
                        t = setTimeout(function() {
                            reset.apply(form, [settings, self]);
                        }, 500);
                    });
                } else if ('submit' == settings.onblur) {
                    input.blur(function(e) {
                        /* Prevent double submit if submit was clicked. */
                        t = setTimeout(function() {
                            form.submit();
                        }, 200);
                    });
                } else if ($.isFunction(settings.onblur)) {
                    input.blur(function(e) {
                        settings.onblur.apply(self, [input.val(), settings]);
                    });
                } else {
                    input.blur(function(e) {
                      /* TODO: maybe something here */
                    });
                }

                form.submit(function(e) {

                    if (t) { 
                        clearTimeout(t);
                    }

                    /* Do no submit. */
                    e.preventDefault(); 
            
                    /* Call before submit hook. */
                    /* If it returns false abort submitting. */                    
                    if (false !== onsubmit.apply(form, [settings, self])) { 
                        /* Custom inputs call before submit hook. */
                        /* If it returns false abort submitting. */
                        if (false !== submit.apply(form, [settings, self])) { 

                          /* Check if given target is function */
                          if ($.isFunction(settings.target)) {
                              var str = settings.target.apply(self, [input.val(), settings]);
                              $(self).html(str);
                              self.editing = false;
                              callback.apply(self, [self.innerHTML, settings]);
                              /* TODO: this is not dry */                              
                              if (!$.trim($(self).html())) {
                                  $(self).html(settings.placeholder);
                              }
                          } else {
                              /* Add edited content and id of edited element to POST. */
                              var submitdata = {};
                              submitdata[settings.name] = input.val();
                              submitdata[settings.id] = self.id;
                              /* Add extra data to be POST:ed. */
                              if ($.isFunction(settings.submitdata)) {
                                  $.extend(submitdata, settings.submitdata.apply(self, [self.revert, settings]));
                              } else {
                                  $.extend(submitdata, settings.submitdata);
                              }

                              /* Quick and dirty PUT support. */
                              if ('PUT' == settings.method) {
                                  submitdata['_method'] = 'put';
                              }

                              /* Show the saving indicator. */
                              $(self).html(settings.indicator);
                              
                              /* Defaults for ajaxoptions. */
                              var ajaxoptions = {
                                  type    : 'POST',
                                  data    : submitdata,
                                  dataType: 'html',
                                  url     : settings.target,
                                  success : function(result, status) {
                                      if (ajaxoptions.dataType == 'html') {
                                        $(self).html(result);
                                      }
                                      self.editing = false;
                                      callback.apply(self, [result, settings]);
                                      if (!$.trim($(self).html())) {
                                          $(self).html(settings.placeholder);
                                      }
                                  },
                                  error   : function(xhr, status, error) {
                                      onerror.apply(form, [settings, self, xhr]);
                                  }
                              };
                              
                              /* Override with what is given in settings.ajaxoptions. */
                              $.extend(ajaxoptions, settings.ajaxoptions);   
                              $.ajax(ajaxoptions);          
                              
                            }
                        }
                    }
                    
                    /* Show tooltip again. */
                    $(self).attr('title', settings.tooltip);
                    
                    return false;
                });
            });
            
            /* Privileged methods */
            this.reset = function(form) {
                /* Prevent calling reset twice when blurring. */
                if (this.editing) {
                    /* Before reset hook, if it returns false abort reseting. */
                    if (false !== onreset.apply(form, [settings, self])) { 
                        $(self).html(self.revert);
                        self.editing   = false;
                        if (!$.trim($(self).html())) {
                            $(self).html(settings.placeholder);
                        }
                        /* Show tooltip again. */
                        if (settings.tooltip) {
                            $(self).attr('title', settings.tooltip);                
                        }
                    }                    
                }
            };            
        });

    };


    $.editable = {
        types: {
            defaults: {
                element : function(settings, original) {
                    var input = $('<input type="hidden"></input>');                
                    $(this).append(input);
                    return(input);
                },
                content : function(string, settings, original) {
                    $(':input:first', this).val(string);
                },
                reset : function(settings, original) {
                  original.reset(this);
                },
                buttons : function(settings, original) {
                    var form = this;
                    if (settings.submit) {
                        /* If given html string use that. */
                        if (settings.submit.match(/>$/)) {
                            var submit = $(settings.submit).click(function() {
                                if (submit.attr("type") != "submit") {
                                    form.submit();
                                }
                            });
                        /* Otherwise use button with given string as text. */
                        } else {
                            var submit = $('<button type="submit" />');
                            submit.html(settings.submit);                            
                        }
                        $(this).append(submit);
                    }
                    if (settings.cancel) {
                        /* If given html string use that. */
                        if (settings.cancel.match(/>$/)) {
                            var cancel = $(settings.cancel);
                        /* otherwise use button with given string as text */
                        } else {
                            var cancel = $('<button type="cancel" />');
                            cancel.html(settings.cancel);
                        }
                        $(this).append(cancel);

                        $(cancel).click(function(event) {
                            if ($.isFunction($.editable.types[settings.type].reset)) {
                                var reset = $.editable.types[settings.type].reset;                                                                
                            } else {
                                var reset = $.editable.types['defaults'].reset;                                
                            }
                            reset.apply(form, [settings, original]);
                            return false;
                        });
                    }
                }
            },
            text: {
                element : function(settings, original) {
                    var input = $('<input />');
                    if (settings.width  != 'none') { input.attr('width', settings.width);  }
                    if (settings.height != 'none') { input.attr('height', settings.height); }
                    /* https://bugzilla.mozilla.org/show_bug.cgi?id=236791 */
                    //input[0].setAttribute('autocomplete','off');
                    input.attr('autocomplete','off');
                    $(this).append(input);
                    return(input);
                }
            },
            textarea: {
                element : function(settings, original) {
                    var textarea = $('<textarea />');
                    if (settings.rows) {
                        textarea.attr('rows', settings.rows);
                    } else if (settings.height != "none") {
                        textarea.height(settings.height);
                    }
                    if (settings.cols) {
                        textarea.attr('cols', settings.cols);
                    } else if (settings.width != "none") {
                        textarea.width(settings.width);
                    }
                    $(this).append(textarea);
                    return(textarea);
                }
            },
            select: {
               element : function(settings, original) {
                    var select = $('<select />');
                    $(this).append(select);
                    return(select);
                },
                content : function(data, settings, original) {
                    /* If it is string assume it is json. */
                    if (String == data.constructor) {      
                        eval ('var json = ' + data);
                    } else {
                    /* Otherwise assume it is a hash already. */
                        var json = data;
                    }
                    for (var key in json) {
                        if (!json.hasOwnProperty(key)) {
                            continue;
                        }
                        if ('selected' == key) {
                            continue;
                        } 
                        var option = $('<option />').val(key).append(json[key]);
                        $('select', this).append(option);    
                    }                    
                    /* Loop option again to set selected. IE needed this... */ 
                    $('select', this).children().each(function() {
                        if ($(this).val() == json['selected'] || 
                            $(this).text() == $.trim(original.revert)) {
                                $(this).attr('selected', 'selected');
                        }
                    });
                    /* Submit on change if no submit button defined. */
                    if (!settings.submit) {
                        var form = this;
                        $('select', this).change(function() {
                            form.submit();
                        });
                    }
                }
            }
        },

        /* Add new input type */
        addInputType: function(name, input) {
            $.editable.types[name] = input;
        }
    };

    /* Publicly accessible defaults. */
    $.fn.editable.defaults = {
        name       : 'value',
        id         : 'id',
        type       : 'text',
        width      : 'auto',
        height     : 'auto',
        event      : 'click.editable',
        onblur     : 'cancel',
        loadtype   : 'GET',
        loadtext   : 'Loading...',
        placeholder: 'Click to edit',
        loaddata   : {},
        submitdata : {},
        ajaxoptions: {}
    };

})(jQuery);

define("libs/jquery/jquery.jeditable", function(){});

/*	
	Watermark plugin for jQuery
	Version: 3.1.3
	http://jquery-watermark.googlecode.com/

	Copyright (c) 2009-2011 Todd Northrop
	http://www.speednet.biz/
	
	March 22, 2011

	Requires:  jQuery 1.2.3+
	
	Dual licensed under the MIT or GPL Version 2 licenses.
	See mit-license.txt and gpl2-license.txt in the project root for details.
------------------------------------------------------*/

(function ($, window, undefined) {

var
	// String constants for data names
	dataFlag = "watermark",
	dataClass = "watermarkClass",
	dataFocus = "watermarkFocus",
	dataFormSubmit = "watermarkSubmit",
	dataMaxLen = "watermarkMaxLength",
	dataPassword = "watermarkPassword",
	dataText = "watermarkText",
	
	// Copy of native jQuery regex use to strip return characters from element value
	rreturn = /\r/g,

	// Includes only elements with watermark defined
	selWatermarkDefined = "input:data(" + dataFlag + "),textarea:data(" + dataFlag + ")",

	// Includes only elements capable of having watermark
	selWatermarkAble = "input:text,input:password,input[type=search],input:not([type]),textarea",
	
	// triggerFns:
	// Array of function names to look for in the global namespace.
	// Any such functions found will be hijacked to trigger a call to
	// hideAll() any time they are called.  The default value is the
	// ASP.NET function that validates the controls on the page
	// prior to a postback.
	// 
	// Am I missing other important trigger function(s) to look for?
	// Please leave me feedback:
	// http://code.google.com/p/jquery-watermark/issues/list
	triggerFns = [
		"Page_ClientValidate"
	],
	
	// Holds a value of true if a watermark was displayed since the last
	// hideAll() was executed. Avoids repeatedly calling hideAll().
	pageDirty = false,
	
	// Detects if the browser can handle native placeholders
	hasNativePlaceholder = ("placeholder" in document.createElement("input"));

// Best practice: this plugin adds only one method to the jQuery object.
// Also ensures that the watermark code is only added once.
$.watermark = $.watermark || {

	// Current version number of the plugin
	version: "3.1.3",
		
	runOnce: true,
	
	// Default options used when watermarks are instantiated.
	// Can be changed to affect the default behavior for all
	// new or updated watermarks.
	options: {
		
		// Default class name for all watermarks
		className: "watermark",
		
		// If true, plugin will detect and use native browser support for
		// watermarks, if available. (e.g., WebKit's placeholder attribute.)
		useNative: true,
		
		// If true, all watermarks will be hidden during the window's
		// beforeunload event. This is done mainly because WebKit
		// browsers remember the watermark text during navigation
		// and try to restore the watermark text after the user clicks
		// the Back button. We can avoid this by hiding the text before
		// the browser has a chance to save it. The regular unload event
		// was tried, but it seems the browser saves the text before
		// that event kicks off, because it didn't work.
		hideBeforeUnload: true
	},
	
	// Hide one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	hide: function (selector) {
		$(selector).filter(selWatermarkDefined).each(
			function () {
				$.watermark._hide($(this));
			}
		);
	},
	
	// Internal use only.
	_hide: function ($input, focus) {
		var elem = $input[0],
			inputVal = (elem.value || "").replace(rreturn, ""),
			inputWm = $input.data(dataText) || "",
			maxLen = $input.data(dataMaxLen) || 0,
			className = $input.data(dataClass);
	
		if ((inputWm.length) && (inputVal == inputWm)) {
			elem.value = "";
			
			// Password type?
			if ($input.data(dataPassword)) {
				
				if (($input.attr("type") || "") === "text") {
					var $pwd = $input.data(dataPassword) || [], 
						$wrap = $input.parent() || [];
						
					if (($pwd.length) && ($wrap.length)) {
						$wrap[0].removeChild($input[0]); // Can't use jQuery methods, because they destroy data
						$wrap[0].appendChild($pwd[0]);
						$input = $pwd;
					}
				}
			}
			
			if (maxLen) {
				$input.attr("maxLength", maxLen);
				$input.removeData(dataMaxLen);
			}
		
			if (focus) {
				$input.attr("autocomplete", "off");  // Avoid NS_ERROR_XPC_JS_THREW_STRING error in Firefox
				
				window.setTimeout(
					function () {
						$input.select();  // Fix missing cursor in IE
					}
				, 1);
			}
		}
		
		className && $input.removeClass(className);
	},
	
	// Display one or more watermarks by specifying any selector type
	// i.e., DOM element, string selector, jQuery matched set, etc.
	// If conditions are not right for displaying a watermark, ensures that watermark is not shown.
	show: function (selector) {
		$(selector).filter(selWatermarkDefined).each(
			function () {
				$.watermark._show($(this));
			}
		);
	},
	
	// Internal use only.
	_show: function ($input) {
		var elem = $input[0],
			val = (elem.value || "").replace(rreturn, ""),
			text = $input.data(dataText) || "",
			type = $input.attr("type") || "",
			className = $input.data(dataClass);

		if (((val.length == 0) || (val == text)) && (!$input.data(dataFocus))) {
			pageDirty = true;
		
			// Password type?
			if ($input.data(dataPassword)) {
				
				if (type === "password") {
					var $pwd = $input.data(dataPassword) || [],
						$wrap = $input.parent() || [];
						
					if (($pwd.length) && ($wrap.length)) {
						$wrap[0].removeChild($input[0]); // Can't use jQuery methods, because they destroy data
						$wrap[0].appendChild($pwd[0]);
						$input = $pwd;
						$input.attr("maxLength", text.length);
						elem = $input[0];
					}
				}
			}
		
			// Ensure maxLength big enough to hold watermark (input of type="text" or type="search" only)
			if ((type === "text") || (type === "search")) {
				var maxLen = $input.attr("maxLength") || 0;
				
				if ((maxLen > 0) && (text.length > maxLen)) {
					$input.data(dataMaxLen, maxLen);
					$input.attr("maxLength", text.length);
				}
			}
            
			className && $input.addClass(className);
			elem.value = text;
		}
		else {
			$.watermark._hide($input);
		}
	},
	
	// Hides all watermarks on the current page.
	hideAll: function () {
		if (pageDirty) {
			$.watermark.hide(selWatermarkAble);
			pageDirty = false;
		}
	},
	
	// Displays all watermarks on the current page.
	showAll: function () {
		$.watermark.show(selWatermarkAble);
	}
};

$.fn.watermark = $.fn.watermark || function (text, options) {
	///	<summary>
	///		Set watermark text and class name on all input elements of type="text/password/search" and
	/// 	textareas within the matched set. If className is not specified in options, the default is
	/// 	"watermark". Within the matched set, only input elements with type="text/password/search"
	/// 	and textareas are affected; all other elements are ignored.
	///	</summary>
	///	<returns type="jQuery">
	///		Returns the original jQuery matched set (not just the input and texarea elements).
	/// </returns>
	///	<param name="text" type="String">
	///		Text to display as a watermark when the input or textarea element has an empty value and does not
	/// 	have focus. The first time watermark() is called on an element, if this argument is empty (or not
	/// 	a String type), then the watermark will have the net effect of only changing the class name when
	/// 	the input or textarea element's value is empty and it does not have focus.
	///	</param>
	///	<param name="options" type="Object" optional="true">
	///		Provides the ability to override the default watermark options ($.watermark.options). For backward
	/// 	compatibility, if a string value is supplied, it is used as the class name that overrides the class
	/// 	name in $.watermark.options.className. Properties include:
	/// 		className: When the watermark is visible, the element will be styled using this class name.
	/// 		useNative (Boolean or Function): Specifies if native browser support for watermarks will supersede
	/// 			plugin functionality. If useNative is a function, the return value from the function will
	/// 			determine if native support is used. The function is passed one argument -- a jQuery object
	/// 			containing the element being tested as the only element in its matched set -- and the DOM
	/// 			element being tested is the object on which the function is invoked (the value of "this").
	///	</param>
	/// <remarks>
	///		The effect of changing the text and class name on an input element is called a watermark because
	///		typically light gray text is used to provide a hint as to what type of input is required. However,
	///		the appearance of the watermark can be something completely different: simply change the CSS style
	///		pertaining to the supplied class name.
	///		
	///		The first time watermark() is called on an element, the watermark text and class name are initialized,
	///		and the focus and blur events are hooked in order to control the display of the watermark.  Also, as
	/// 	of version 3.0, drag and drop events are hooked to guard against dropped text being appended to the
	/// 	watermark.  If native watermark support is provided by the browser, it is detected and used, unless
	/// 	the useNative option is set to false.
	///		
	///		Subsequently, watermark() can be called again on an element in order to change the watermark text
	///		and/or class name, and it can also be called without any arguments in order to refresh the display.
	///		
	///		For example, after changing the value of the input or textarea element programmatically, watermark()
	/// 	should be called without any arguments to refresh the display, because the change event is only
	/// 	triggered by user actions, not by programmatic changes to an input or textarea element's value.
	/// 	
	/// 	The one exception to programmatic updates is for password input elements:  you are strongly cautioned
	/// 	against changing the value of a password input element programmatically (after the page loads).
	/// 	The reason is that some fairly hairy code is required behind the scenes to make the watermarks bypass
	/// 	IE security and switch back and forth between clear text (for watermarks) and obscured text (for
	/// 	passwords).  It is *possible* to make programmatic changes, but it must be done in a certain way, and
	/// 	overall it is not recommended.
	/// </remarks>
	
	if (!this.length) {
		return this;
	}
	
	var hasClass = false,
		hasText = (typeof(text) === "string");
	
	if (hasText) {
		text = text.replace(rreturn, "");
	}
	
	if (typeof(options) === "object") {
		hasClass = (typeof(options.className) === "string");
		options = $.extend({}, $.watermark.options, options);
	}
	else if (typeof(options) === "string") {
		hasClass = true;
		options = $.extend({}, $.watermark.options, {className: options});
	}
	else {
		options = $.watermark.options;
	}
	
	if (typeof(options.useNative) !== "function") {
		options.useNative = options.useNative? function () { return true; } : function () { return false; };
	}
	
	return this.each(
		function () {
			var $input = $(this);
			
			if (!$input.is(selWatermarkAble)) {
				return;
			}
			
			// Watermark already initialized?
			if ($input.data(dataFlag)) {
			
				// If re-defining text or class, first remove existing watermark, then make changes
				if (hasText || hasClass) {
					$.watermark._hide($input);
			
					if (hasText) {
						$input.data(dataText, text);
					}
					
					if (hasClass) {
						$input.data(dataClass, options.className);
					}
				}
			}
			else {
			
				// Detect and use native browser support, if enabled in options
				if (
					(hasNativePlaceholder)
					&& (options.useNative.call(this, $input))
					&& (($input.attr("tagName") || "") !== "TEXTAREA")
				) {
					// className is not set because current placeholder standard doesn't
					// have a separate class name property for placeholders (watermarks).
					if (hasText) {
						$input.attr("placeholder", text);
					}
					
					// Only set data flag for non-native watermarks
					// [purposely commented-out] -> $input.data(dataFlag, 1);
					return;
				}
				
				$input.data(dataText, hasText? text : "");
				$input.data(dataClass, options.className);
				$input.data(dataFlag, 1); // Flag indicates watermark was initialized
				
				// Special processing for password type
				if (($input.attr("type") || "") === "password") {
					var $wrap = $input.wrap("<span>").parent(),
						$wm = $($wrap.html().replace(/type=["']?password["']?/i, 'type="text"'));
					
					$wm.data(dataText, $input.data(dataText));
					$wm.data(dataClass, $input.data(dataClass));
					$wm.data(dataFlag, 1);
					$wm.attr("maxLength", text.length);
					
					$wm.focus(
						function () {
							$.watermark._hide($wm, true);
						}
					).bind("dragenter",
						function () {
							$.watermark._hide($wm);
						}
					).bind("dragend",
						function () {
							window.setTimeout(function () { $wm.blur(); }, 1);
						}
					);
					$input.blur(
						function () {
							$.watermark._show($input);
						}
					).bind("dragleave",
						function () {
							$.watermark._show($input);
						}
					);
					
					$wm.data(dataPassword, $input);
					$input.data(dataPassword, $wm);
				}
				else {
					
					$input.focus(
						function () {
							$input.data(dataFocus, 1);
							$.watermark._hide($input, true);
						}
					).blur(
						function () {
							$input.data(dataFocus, 0);
							$.watermark._show($input);
						}
					).bind("dragenter",
						function () {
							$.watermark._hide($input);
						}
					).bind("dragleave",
						function () {
							$.watermark._show($input);
						}
					).bind("dragend",
						function () {
							window.setTimeout(function () { $.watermark._show($input); }, 1);
						}
					).bind("drop",
						// Firefox makes this lovely function necessary because the dropped text
						// is merged with the watermark before the drop event is called.
						function (evt) {
							var elem = $input[0],
								dropText = evt.originalEvent.dataTransfer.getData("Text");
							
							if ((elem.value || "").replace(rreturn, "").replace(dropText, "") === $input.data(dataText)) {
								elem.value = dropText;
							}
							
							$input.focus();
						}
					);
				}
				
				// In order to reliably clear all watermarks before form submission,
				// we need to replace the form's submit function with our own
				// function.  Otherwise watermarks won't be cleared when the form
				// is submitted programmatically.
				if (this.form) {
					var form = this.form,
						$form = $(form);
					
					if (!$form.data(dataFormSubmit)) {
						$form.submit($.watermark.hideAll);
						
						// form.submit exists for all browsers except Google Chrome
						// (see "else" below for explanation)
						if (form.submit) {
							$form.data(dataFormSubmit, form.submit);
							
							form.submit = (function (f, $f) {
								return function () {
									var nativeSubmit = $f.data(dataFormSubmit);
									
									$.watermark.hideAll();
									
									if (nativeSubmit.apply) {
										nativeSubmit.apply(f, Array.prototype.slice.call(arguments));
									}
									else {
										nativeSubmit();
									}
								};
							})(form, $form);
						}
						else {
							$form.data(dataFormSubmit, 1);
							
							// This strangeness is due to the fact that Google Chrome's
							// form.submit function is not visible to JavaScript (identifies
							// as "undefined").  I had to invent a solution here because hours
							// of Googling (ironically) for an answer did not turn up anything
							// useful.  Within my own form.submit function I delete the form's
							// submit function, and then call the non-existent function --
							// which, in the world of Google Chrome, still exists.
							form.submit = (function (f) {
								return function () {
									$.watermark.hideAll();
									delete f.submit;
									f.submit();
								};
							})(form);
						}
					}
				}
			}
			
			$.watermark._show($input);
		}
	);
};

// The code included within the following if structure is guaranteed to only run once,
// even if the watermark script file is included multiple times in the page.
if ($.watermark.runOnce) {
	$.watermark.runOnce = false;

	$.extend($.expr[":"], {

		// Extends jQuery with a custom selector - ":data(...)"
		// :data(<name>)  Includes elements that have a specific name defined in the jQuery data
		// collection. (Only the existence of the name is checked; the value is ignored.)
		// A more sophisticated version of the :data() custom selector originally part of this plugin
		// was removed for compatibility with jQuery UI. The original code can be found in the SVN
		// source listing in the file, "jquery.data.js".
		data: function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		}
	});

	// Overloads the jQuery .val() function to return the underlying input value on
	// watermarked input elements.  When .val() is being used to set values, this
	// function ensures watermarks are properly set/removed after the values are set.
	// Uses self-executing function to override the default jQuery function.
	(function (valOld) {

		$.fn.val = function () {
			
			// Best practice: return immediately if empty matched set
			if ( !this.length ) {
				return arguments.length? this : undefined;
			}

			// If no args, then we're getting the value of the first element;
			// otherwise we're setting values for all elements in matched set
			if ( !arguments.length ) {

				// If element is watermarked, get the underlying value;
				// otherwise use native jQuery .val()
				if ( this.data(dataFlag) ) {
					var v = (this[0].value || "").replace(rreturn, "");
					return (v === (this.data(dataText) || ""))? "" : v;
				}
				else {
					return valOld.apply( this, arguments );
				}
			}
			else {
				valOld.apply( this, arguments );
				$.watermark.show(this);
				return this;
			}
		};

	})($.fn.val);
	
	// Hijack any functions found in the triggerFns list
	if (triggerFns.length) {

		// Wait until DOM is ready before searching
		$(function () {
			var i, name, fn;
		
			for (i=triggerFns.length-1; i>=0; i--) {
				name = triggerFns[i];
				fn = window[name];
				
				if (typeof(fn) === "function") {
					window[name] = (function (origFn) {
						return function () {
							$.watermark.hideAll();
							return origFn.apply(null, Array.prototype.slice.call(arguments));
						};
					})(fn);
				}
			}
		});
	}

	$(window).bind("beforeunload", function () {
		if ($.watermark.options.hideBeforeUnload) {
			$.watermark.hideAll();
		}
	});
}

})(jQuery, window);

define("libs/jquery/jquery.watermark", function(){});

;
define("libs/json2", function(){});

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);

define("libs/backbone/backbone", function(){});

/**	
 * Backbone-relational.js 0.4.0
 * (c) 2011 Paul Uithol
 * 
 * Backbone-relational may be freely distributed under the MIT license.
 * For details and documentation: https://github.com/PaulUithol/Backbone-relational.
 * Depends on (as in, compeletely useless without) Backbone: https://github.com/documentcloud/backbone.
 */
(function(undefined) {

	/**
	 * CommonJS shim
	 **/
	if ( typeof window === 'undefined' ) {
		var _ = require( 'underscore' );
		var Backbone = require( 'backbone' );
		var exports = module.exports = Backbone;
	} else {
		var _ = this._;
		var Backbone = this.Backbone;
		var exports = this;
	}
	
	Backbone.Relational = {};
	
	/**
	 * Semaphore mixin; can be used as both binary and counting.
	 **/
	Backbone.Semaphore = {
		_permitsAvailable: null,
		_permitsUsed: 0,
		
		acquire: function() {
			if ( this._permitsAvailable && this._permitsUsed >= this._permitsAvailable ) {
				throw new Error( 'Max permits acquired' );
			}
			else {
				this._permitsUsed++;
			}
		},
		
		release: function() {
			if ( this._permitsUsed === 0 ) {
				throw new Error( 'All permits released' );
			}
			else {
				this._permitsUsed--;
			}
		},
		
		isLocked: function() {
			return this._permitsUsed > 0;
		},
		
		setAvailablePermits: function( amount ) {
			if ( this._permitsUsed > amount ) {
				throw new Error( 'Available permits cannot be less than used permits' );
			}
			this._permitsAvailable = amount;
		}
	};
	
	/**
	 * A BlockingQueue that accumulates items while blocked (via 'block'),
	 * and processes them when unblocked (via 'unblock').
	 * Process can also be called manually (via 'process').
	 */
	Backbone.BlockingQueue = function() {
		this._queue = [];
	};
	_.extend( Backbone.BlockingQueue.prototype, Backbone.Semaphore, {
		_queue: null,
		
		add: function( func ) {
			if ( this.isBlocked() ) {
				this._queue.push( func );
			}
			else {
				func();
			}
		},
		
		process: function() {
			while ( this._queue && this._queue.length ) {
				this._queue.shift()();
			}
		},
		
		block: function() {
			this.acquire();
		},
		
		unblock: function() {
			this.release();
			if ( !this.isBlocked() ) {
				this.process();
			}
		},
		
		isBlocked: function() {
			return this.isLocked();
		}
	});
	/**
	 * Global event queue. Accumulates external events ('add:<key>', 'remove:<key>' and 'update:<key>')
	 * until the top-level object is fully initialized (see 'Backbone.RelationalModel').
	 */
	Backbone.Relational.eventQueue = new Backbone.BlockingQueue();
	
	/**
	 * Backbone.Store keeps track of all created (and destruction of) Backbone.RelationalModel.
	 * Handles lookup for relations.
	 */
	Backbone.Store =  function() {
		this._collections = [];
		this._reverseRelations = [];
	};
	_.extend( Backbone.Store.prototype, Backbone.Events, {
		_collections: null,
		_reverseRelations: null,
		
		/**
		 * Add a reverse relation. Is added to the 'relations' property on model's prototype, and to
		 * existing instances of 'model' in the store as well.
		 * @param {object} relation; required properties:
		 *  - model, type, key and relatedModel
		 */
		addReverseRelation: function( relation ) {
			var exists = _.any( this._reverseRelations, function( rel ) {
				return _.all( relation, function( val, key ) {
					return val === rel[ key ];
				});
			});
			
			if ( !exists && relation.model && relation.type ) {
				this._reverseRelations.push( relation );
				
				if ( !relation.model.prototype.relations ) {
					relation.model.prototype.relations = [];
				}
				relation.model.prototype.relations.push( relation );
				
				this.retroFitRelation( relation );
			}
		},
		
		/**
		 * Add a 'relation' to all existing instances of 'relation.model' in the store
		 */
		retroFitRelation: function( relation ) {
			var coll = this.getCollection( relation.model );
			coll.each( function( model ) {
				var rel = new relation.type( model, relation );
			}, this);
		},
		
		/**
		 * Find the Store's collection for a certain type of model.
		 * @param model {Backbone.RelationalModel}
		 * @return {Backbone.Collection} A collection if found (or applicable for 'model'), or null
		 */
		getCollection: function( model ) {
			var coll =  _.detect( this._collections, function( c ) {
					// Check if model is the type itself (a ref to the constructor), or is of type c.model
					return model === c.model || model.constructor === c.model;
				});
			
			if ( !coll ) {
				coll = this._createCollection( model );
			}
			
			return coll;
		},
		
		/**
		 * Find a type on the global object by name. Splits name on dots.
		 * @param {string} name
		 */
		getObjectByName: function( name ) {
			var type = _.reduce( name.split( '.' ), function( memo, val ) {
				return memo[ val ];
			}, exports);
			return type !== exports ? type: null;
		},
		
		_createCollection: function( type ) {
			var coll;
			
			// If 'type' is an instance, take it's constructor
			if ( type instanceof Backbone.RelationalModel ) {
				type = type.constructor;
			}
			
			// Type should inherit from Backbone.RelationalModel.
			if ( type.prototype instanceof Backbone.RelationalModel.prototype.constructor ) {
				coll = new Backbone.Collection();
				coll.model = type;
				
				this._collections.push( coll );
			}
			
			return coll;
		},
		
		find: function( type, id ) {
			var coll = this.getCollection( type );
			return coll && coll.get( id );
		},
		
		/**
		 * Add a 'model' to it's appropriate collection. Retain the original contents of 'model.collection'.
		 */
		register: function( model ) {
			var modelColl = model.collection;
			var coll = this.getCollection( model );
			coll && coll._add( model );
			model.bind( 'destroy', this.unregister, this );
			model.collection = modelColl;
		},
		
		/**
		 * Explicitly update a model's id in it's store collection
		 */
		update: function( model ) {
			var coll = this.getCollection( model );
			coll._onModelEvent( 'change:' + model.idAttribute, model, coll );
		},
		
		/**
		 * Remove a 'model' from the store.
		 */
		unregister: function( model ) {
			model.unbind( 'destroy', this.unregister );
			var coll = this.getCollection( model );
			coll && coll.remove( model );
		}
	});
	Backbone.Relational.store = new Backbone.Store();
	
	/**
	 * The main Relation class, from which 'HasOne' and 'HasMany' inherit.
	 * @param {Backbone.RelationalModel} instance
	 * @param {object} options.
	 *  Required properties:
	 *    - {string} key
	 *    - {Backbone.RelationalModel.constructor} relatedModel
	 *  Optional properties:
	 *    - {bool} includeInJSON: create objects from the contents of keys if the object is not found in Backbone.store.
	 *    - {bool} createModels: serialize the attributes for related model(s)' in toJSON on create/update, or just their ids.
	 *    - {object} reverseRelation: Specify a bi-directional relation. If provided, Relation will reciprocate
	 *        the relation to the 'relatedModel'. Required and optional properties match 'options', except for:
	 *        - {Backbone.Relation|string} type: 'HasOne' or 'HasMany'
	 */
	Backbone.Relation = function( instance, options ) {
		this.instance = instance;
		
		// Make sure 'options' is sane, and fill with defaults from subclasses and this object's prototype
		options = ( typeof options === 'object' && options ) || {};
		this.reverseRelation = _.defaults( options.reverseRelation || {}, this.options.reverseRelation );
		this.reverseRelation.type = !_.isString( this.reverseRelation.type ) ? this.reverseRelation.type :
				Backbone[ this.reverseRelation.type ] || Backbone.Relational.store.getObjectByName( this.reverseRelation.type );
		this.options = _.defaults( options, this.options, Backbone.Relation.prototype.options );
		
		this.key = this.options.key;
		this.keyContents = this.instance.get( this.key );
		
		// 'exports' should be the global object where 'relatedModel' can be found on if given as a string.
		this.relatedModel = this.options.relatedModel;
		if ( _.isString( this.relatedModel ) ) {
			this.relatedModel = Backbone.Relational.store.getObjectByName( this.relatedModel );
		}
		
		if ( !this.checkPreconditions() ) {
			return false;
		}
		
		// Add this Relation to instance._relations
		this.instance._relations.push( this );
		
		// Add the reverse relation on 'relatedModel' to the store's reverseRelations
		if ( !this.options.isAutoRelation && this.reverseRelation.type && this.reverseRelation.key ) {
			Backbone.Relational.store.addReverseRelation( _.defaults( {
					isAutoRelation: true,
					model: this.relatedModel,
					relatedModel: this.instance.constructor,
					reverseRelation: this.options // current relation is the 'reverseRelation' for it's own reverseRelation
				},
				this.reverseRelation // Take further properties from this.reverseRelation (type, key, etc.)
			) );
		}
		
		this.initialize();
		
		_.bindAll( this, '_modelRemovedFromCollection', '_relatedModelAdded', '_relatedModelRemoved' );
		// When a model in the store is destroyed, check if it is 'this.instance'.
		Backbone.Relational.store.getCollection( this.instance )
			.bind( 'relational:remove', this._modelRemovedFromCollection );
		
		// When 'relatedModel' are created or destroyed, check if it affects this relation.
		Backbone.Relational.store.getCollection( this.relatedModel )
			.bind( 'relational:add', this._relatedModelAdded )
			.bind( 'relational:remove', this._relatedModelRemoved );
	};
	// Fix inheritance :\
	Backbone.Relation.extend = Backbone.Model.extend;
	// Set up all inheritable **Backbone.Relation** properties and methods.
	_.extend( Backbone.Relation.prototype, Backbone.Events, Backbone.Semaphore, {
		options: {
			createModels: true,
			includeInJSON: true,
			isAutoRelation: false
		},
		
		instance: null,
		key: null,
		keyContents: null,
		relatedModel: null,
		reverseRelation: null,
		related: null,
		
		_relatedModelAdded: function( model, coll, options ) {
			// Allow 'model' to set up it's relations, before calling 'tryAddRelated'
			// (which can result in a call to 'addRelated' on a relation of 'model')
			var dit = this;
			model.queue( function() {
				dit.tryAddRelated( model, options );
			});
		},
		
		_relatedModelRemoved: function( model, coll, options ) {
			this.removeRelated( model, options );
		},
		
		_modelRemovedFromCollection: function( model ) {
			if ( model === this.instance ) {
				this.destroy();
			}
		},
		
		/**
		 * Check several pre-conditions.
		 * @return {bool} True if pre-conditions are satisfied, false if they're not.
		 */
		checkPreconditions: function() {
			var i = this.instance, k = this.key, rm = this.relatedModel;
			if ( !i || !k || !rm ) {
				console && console.warn( 'Relation=%o; no instance, key or relatedModel (%o, %o, %o)', this, i, k, rm );
				return false;
			}
			// Check if 'instance' is a Backbone.RelationalModel
			if ( !( i instanceof Backbone.RelationalModel ) ) {
				console && console.warn( 'Relation=%o; instance=%o is not a Backbone.RelationalModel', this, i );
				return false;
			}
			// Check if the type in 'relatedModel' inherits from Backbone.RelationalModel
			if ( !( rm.prototype instanceof Backbone.RelationalModel.prototype.constructor ) ) {
				console && console.warn( 'Relation=%o; relatedModel does not inherit from Backbone.RelationalModel (%o)', this, rm );
				return false;
			}
			// Check if this is not a HasMany, and the reverse relation is HasMany as well
			if ( this instanceof Backbone.HasMany && this.reverseRelation.type === Backbone.HasMany.prototype.constructor ) {
				console && console.warn( 'Relation=%o; relation is a HasMany, and the reverseRelation is HasMany as well.', this );
				return false;
			}
			// Check if we're not attempting to create a duplicate relationship
			if ( i._relations.length ) {
				var exists = _.any( i._relations, function( rel ) {
					var hasReverseRelation = this.reverseRelation.key && rel.reverseRelation.key;
					return rel.relatedModel === rm && rel.key === k
						&& ( !hasReverseRelation || this.reverseRelation.key === rel.reverseRelation.key );
				}, this );
				
				if ( exists ) {
					console && console.warn( 'Relation=%o between instance=%o.%s and relatedModel=%o.%s already exists',
						this, i, k, rm, this.reverseRelation.key );
					return false;
				}
			}
			return true;
		},
		
		setRelated: function( related, options ) {
			this.related = related;
			var value = {};
			value[ this.key ] = related;
			this.instance.acquire();
			this.instance.set( value, _.defaults( options || {}, { silent: true } ) );
			this.instance.release();
		},
		
		createModel: function( item ) {
			if ( this.options.createModels && typeof( item ) === 'object' ) {
				return new this.relatedModel( item );
			}
		},
		
		/**
		 * Determine if a relation (on a different RelationalModel) is the reverse
		 * relation of the current one.
		 */
		_isReverseRelation: function( relation ) {
			if ( relation.instance instanceof this.relatedModel && this.reverseRelation.key === relation.key
					&&	this.key === relation.reverseRelation.key ) {
				return true;
			}
			return false;
		},
		
		/**
		 * Get the reverse relations (pointing back to 'this.key' on 'this.instance') for the currently related model(s).
		 * @param model {Backbone.RelationalModel} Optional; get the reverse relations for a specific model.
		 *		If not specified, 'this.related' is used.
		 */
		getReverseRelations: function( model ) {
			var reverseRelations = [];
			// Iterate over 'model', 'this.related.models' (if this.related is a Backbone.Collection), or wrap 'this.related' in an array.
			var models = !_.isUndefined( model ) ? [ model ] : this.related && ( this.related.models || [ this.related ] );
			_.each( models , function( related ) {
				_.each( related.getRelations(), function( relation ) {
					if ( this._isReverseRelation( relation ) ) {
						reverseRelations.push( relation );
					}
				}, this );
			}, this );
			
			return reverseRelations;
		},
		
		/**
		 * Rename options.silent, so add/remove events propagate properly.
		 * (for example in HasMany, from 'addRelated'->'handleAddition')
		 */
		sanitizeOptions: function( options ) {
			options || ( options = {} );
			if ( options.silent ) {
				options = _.extend( {}, options, { silentChange: true } );
				delete options.silent;
			}
			return options;
		},
		
		// Cleanup. Get reverse relation, call removeRelated on each.
		destroy: function() {
			Backbone.Relational.store.getCollection( this.instance )
				.unbind( 'relational:remove', this._modelRemovedFromCollection );
			
			Backbone.Relational.store.getCollection( this.relatedModel )
				.unbind( 'relational:add', this._relatedModelAdded )
				.unbind( 'relational:remove', this._relatedModelRemoved );
			
			_.each( this.getReverseRelations(), function( relation ) {
					relation.removeRelated( this.instance );
				}, this );
		}
	});
	
	Backbone.HasOne = Backbone.Relation.extend({
		options: {
			reverseRelation: { type: 'HasMany' }
		},
		
		initialize: function() {
			_.bindAll( this, 'onChange' );
			this.instance.bind( 'relational:change:' + this.key, this.onChange );
			
			var model = this.findRelated( { silent: true } );
			this.setRelated( model );
			
			// Notify new 'related' object of the new relation.
			var dit = this;
			_.each( dit.getReverseRelations(), function( relation ) {
					relation.addRelated( dit.instance );
				} );
		},
		
		findRelated: function( options ) {
			var item = this.keyContents;
			var model = null;
			
			if ( item instanceof this.relatedModel ) {
				model = item;
			}
			else if ( item && ( _.isString( item ) || _.isNumber( item ) || typeof( item ) === 'object' ) ) {
				// Try to find an instance of the appropriate 'relatedModel' in the store, or create it
				var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
				model = Backbone.Relational.store.find( this.relatedModel, id );
				if ( model && _.isObject( item ) ) {
					model.set( item, options );
				}
				else if ( !model ) {
					model = this.createModel( item );
				}
			}
			
			return model;
		},
		
		/**
		 * If the key is changed, notify old & new reverse relations and initialize the new relation
		 */
		onChange: function( model, attr, options ) {
			// Don't accept recursive calls to onChange (like onChange->findRelated->createModel->initializeRelations->addRelated->onChange)
			if ( this.isLocked() ) {
				return;
			}
			this.acquire();
			options = this.sanitizeOptions( options );
			
			// 'options._related' is set by 'addRelated'/'removeRelated'. If it is set, the change
			// is the result of a call from a relation. If it's not, the change is the result of 
			// a 'set' call on this.instance.
			var changed = _.isUndefined( options._related );
			var oldRelated = changed ? this.related : options._related;
			
			if ( changed ) {	
				this.keyContents = attr;
				
				// Set new 'related'
				if ( attr instanceof this.relatedModel ) {
					this.related = attr;
				}
				else if ( attr ) {
					var related = this.findRelated( options );
					this.setRelated( related );
				}
				else {
					this.setRelated( null );
				}
			}
			
			// Notify old 'related' object of the terminated relation
			if ( oldRelated && this.related !== oldRelated ) {
				_.each( this.getReverseRelations( oldRelated ), function( relation ) {
						relation.removeRelated( this.instance, options );
					}, this );
			}
			
			// Notify new 'related' object of the new relation. Note we do re-apply even if this.related is oldRelated;
			// that can be necessary for bi-directional relations if 'this.instance' was created after 'this.related'.
			// In that case, 'this.instance' will already know 'this.related', but the reverse might not exist yet.
			_.each( this.getReverseRelations(), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this);
			
			// Fire the 'update:<key>' event if 'related' was updated
			if ( !options.silentChange && this.related !== oldRelated ) {
				var dit = this;
				Backbone.Relational.eventQueue.add( function() {
					dit.instance.trigger( 'update:' + dit.key, dit.instance, dit.related, options );
				});
			}
			this.release();
		},
		
		/**
		 * If a new 'this.relatedModel' appears in the 'store', try to match it to the last set 'keyContents'
		 */
		tryAddRelated: function( model, options ) {
			if ( this.related ) {
				return;
			}
			options = this.sanitizeOptions( options );
			
			var item = this.keyContents;
			if ( item && ( _.isString( item ) || _.isNumber( item ) || typeof( item ) === 'object' ) ) {
				var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
				if ( model.id === id ) {
					this.addRelated( model, options );
				}
			}
		},
		
		addRelated: function( model, options ) {
			if ( model !== this.related ) {
				var oldRelated = this.related || null;
				this.setRelated( model );
				this.onChange( this.instance, model, { _related: oldRelated } );
			}
		},
		
		removeRelated: function( model, options ) {
			if ( !this.related ) {
				return;
			}
			
			if ( model === this.related ) {
				var oldRelated = this.related || null;
				this.setRelated( null );
				this.onChange( this.instance, model, { _related: oldRelated } );
			}
		}
	});
	
	Backbone.HasMany = Backbone.Relation.extend({
		collectionType: null,
		
		options: {
			reverseRelation: { type: 'HasOne' },
			collectionType: Backbone.Collection
		},
		
		initialize: function() {
			_.bindAll( this, 'onChange', 'handleAddition', 'handleRemoval' );
			this.instance.bind( 'relational:change:' + this.key, this.onChange );
			
			// Handle a custom 'collectionType'
			this.collectionType = this.options.collectionType;
			if ( _( this.collectionType ).isString() ) {
				this.collectionType = Backbone.Relational.store.getObjectByName( this.collectionType );
			}
			if ( !this.collectionType.prototype instanceof Backbone.Collection.prototype.constructor ){
				throw new Error( 'collectionType must inherit from Backbone.Collection' );
			}
			
			this.setRelated( this.prepareCollection( new this.collectionType() ) );
			this.findRelated( { silent: true } );
		},
		
		prepareCollection: function( collection ) {
			if ( this.related ) {
				this.related.unbind( 'relational:add', this.handleAddition ).unbind('relational:remove', this.handleRemoval );
			}
			
			collection.reset();
			collection.model = this.relatedModel;
			collection.bind( 'relational:add', this.handleAddition ).bind('relational:remove', this.handleRemoval );
			return collection;
		},
		
		findRelated: function( options ) {
			if ( this.keyContents && _.isArray( this.keyContents ) ) {
				// Try to find instances of the appropriate 'relatedModel' in the store
				_.each( this.keyContents, function( item ) {
					var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
					
					var model = Backbone.Relational.store.find( this.relatedModel, id );
					if ( model && _.isObject( item ) ) {
						model.set( item, options );
					}
					else if ( !model ) {
						model = this.createModel( item );
					}
					
					if ( model && !this.related.getByCid( model ) && !this.related.get( model ) ) {
						this.related._add( model );
					}
				}, this);
			}
		},
		
		/**
		 * If the key is changed, notify old & new reverse relations and initialize the new relation
		 */
		onChange: function( model, attr, options ) {
			options = this.sanitizeOptions( options );
			this.keyContents = attr;
			
			// Notify old 'related' object of the terminated relation
			_.each( this.getReverseRelations(), function( relation ) {
					relation.removeRelated( this.instance, options );
				}, this );
			
			// Replace 'this.related' by 'attr' if it is a Backbone.Collection
			if ( attr instanceof Backbone.Collection ) {
				this.prepareCollection( attr );
				this.related = attr;
			}
			// Otherwise, 'attr' should be an array of related object ids.
			// Re-use the current 'this.related' if it is a Backbone.Collection.
			else {
				var coll = this.related instanceof Backbone.Collection ? this.related : new this.collectionType();
				this.setRelated( this.prepareCollection( coll ) );
				this.findRelated( options );
			}
			
			// Notify new 'related' object of the new relation
			_.each( this.getReverseRelations(), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this );
			
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'update:' + dit.key, dit.instance, dit.related, options );
			});
		},
		
		tryAddRelated: function( model, options ) {
			options = this.sanitizeOptions( options );
			if ( !this.related.getByCid( model ) && !this.related.get( model ) ) {
				// Check if this new model was specified in 'this.keyContents'
				var item = _.any( this.keyContents, function( item ) {
					var id = _.isString( item ) || _.isNumber( item ) ? item : item[ this.relatedModel.prototype.idAttribute ];
					return id && id === model.id;
				}, this );
				
				if ( item ) {
					this.related._add( model, options );
				}
			}
		},
		
		/**
		 * When a model is added to a 'HasMany', trigger 'add' on 'this.instance' and notify reverse relations.
		 * (should be 'HasOne', must set 'this.instance' as their related).
		 */
		handleAddition: function( model, coll, options ) {
			//console.debug('handleAddition called; args=%o', arguments);
			// Make sure the model is in fact a valid model before continuing.
			// (it can be invalid as a result of failing validation in Backbone.Collection._prepareModel)
			if( !( model instanceof Backbone.Model ) ) {
				return;
			}
			
			options = this.sanitizeOptions( options );
			var dit = this;
			
			_.each( this.getReverseRelations( model ), function( relation ) {
					relation.addRelated( this.instance, options );
				}, this );
			
			// Only trigger 'add' once the newly added model is initialized (so, has it's relations set up)
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'add:' + dit.key, model, dit.related, options );
			});
		},
		
		/**
		 * When a model is removed from a 'HasMany', trigger 'remove' on 'this.instance' and notify reverse relations.
		 * (should be 'HasOne', which should be nullified)
		 */
		handleRemoval: function( model, coll, options ) {
			//console.debug('handleRemoval called; args=%o', arguments);
			options = this.sanitizeOptions( options );
			
			_.each( this.getReverseRelations( model ), function( relation ) {
					relation.removeRelated( this.instance, options );
				}, this );
			
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
				!options.silentChange && dit.instance.trigger( 'remove:' + dit.key, model, dit.related, options );
			});
		},
		
		addRelated: function( model, options ) {
			var dit = this;
			model.queue( function() { // Queued to avoid errors for adding 'model' to the 'this.related' set twice
				if ( dit.related && !dit.related.getByCid( model ) && !dit.related.get( model ) ) {
					dit.related._add( model, options );
				}
			});
		},
		
		removeRelated: function( model, options ) {
			if ( this.related.getByCid( model ) || this.related.get( model ) ) {
				this.related.remove( model, options );
			}
		}
	});
	
	/**
	 * New events:
	 *  - 'add:<key>' (model, related collection, options)
	 *  - 'remove:<key>' (model, related collection, options)
	 *  - 'update:<key>' (model, related model or collection, options)
	 */
	Backbone.RelationalModel = Backbone.Model.extend({
		relations: null, // Relation descriptions on the prototype
		_relations: null, // Relation instances
		_isInitialized: false,
		_deferProcessing: false,
		_queue: null,
		
		constructor: function( attributes, options ) {
			// Nasty hack, for cases like 'model.get( <HasMany key> ).add( item )'.
			// Defer 'processQueue', so that when 'Relation.createModels' is used we:
			// a) Survive 'Backbone.Collection._add'; this takes care we won't error on "can't add model to a set twice"
			//    (by creating a model from properties, having the model add itself to the collection via one of
			//    it's relations, then trying to add it to the collection).
			// b) Trigger 'HasMany' collection events only after the model is really fully set up.
			// Example that triggers both a and b: "p.get('jobs').add( { company: c, person: p } )".
			var dit = this;
			if ( options && options.collection ) {
				this._deferProcessing = true;
				
				var processQueue = function( model, coll ) {
					if ( model === dit ) {
						dit._deferProcessing = false;
						dit.processQueue();
						options.collection.unbind( 'relational:add', processQueue );
					}
				};
				options.collection.bind( 'relational:add', processQueue );
				
				// So we do process the queue eventually, regardless of whether this model really gets added to 'options.collection'.
				_.defer( function() {
					processQueue( dit );
				});
			}
			
			this._queue = new Backbone.BlockingQueue();
			this._queue.block();
			Backbone.Relational.eventQueue.block();
			
			Backbone.Model.prototype.constructor.apply( this, arguments );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
		},
		
		/**
		 * Override 'trigger' to queue 'change' and 'change:*' events
		 */
		trigger: function( eventName ) {
			if ( eventName.length > 5 && 'change' === eventName.substr( 0, 6 ) ) {
				var dit = this, args = arguments;
				Backbone.Relational.eventQueue.add( function() {
						Backbone.Model.prototype.trigger.apply( dit, args );
					});
			}
			else {
				Backbone.Model.prototype.trigger.apply( this, arguments );
			}
			
			return this;
		},
		
		/**
		 * Initialize Relations present in this.relations; determine the type (HasOne/HasMany), then creates a new instance.
		 * Invoked in the first call so 'set' (which is made from the Backbone.Model constructor).
		 */
		initializeRelations: function() {
			this.acquire(); // Setting up relations often also involve calls to 'set', and we only want to enter this function once
			this._relations = [];
			
			_.each( this.relations, function( rel ) {
					var type = !_.isString( rel.type ) ? rel.type :	Backbone[ rel.type ] || Backbone.Relational.store.getObjectByName( rel.type );
					if ( type && type.prototype instanceof Backbone.Relation.prototype.constructor ) {
						new type( this, rel ); // Also pushes the new Relation into _relations
					}
					else {
						console && console.warn( 'Relation=%o; missing or invalid type!', rel );
					}
				}, this );
			
			this._isInitialized = true;
			this.release();
			this.processQueue();
		},
		
		/**
		 * When new values are set, notify this model's relations (also if options.silent is set).
		 * (Relation.setRelated locks this model before calling 'set' on it to prevent loops)
		 */
		updateRelations: function( options ) {
			if( this._isInitialized && !this.isLocked() ) {
				_.each( this._relations, function( rel ) {
					var val = this.attributes[ rel.key ];
					if ( rel.related !== val ) {
						this.trigger('relational:change:' + rel.key, this, val, options || {} );
					}
				}, this );
			}
		},
		
		/**
		 * Either add to the queue (if we're not initialized yet), or execute right away.
		 */
		queue: function( func ) {
			this._queue.add( func );
		},
		
		/**
		 * Process _queue
		 */
		processQueue: function() {
			if ( this._isInitialized && !this._deferProcessing && this._queue.isBlocked() ) {
				this._queue.unblock();
			}
		},
		
		/**
		 * Get a specific relation.
		 * @param key {string} The relation key to look for.
		 * @return {Backbone.Relation|null} An instance of 'Backbone.Relation', if a relation was found for 'key', or null.
		 */
		getRelation: function( key ) {
			return _.detect( this._relations, function( rel ) {
					if ( rel.key === key ) {
						return true;
					}
				}, this );
		},
		
		/**
		 * Get all of the created relations.
		 * @return {array of Backbone.Relation}
		 */
		getRelations: function() {
			return this._relations;
		},
		
		/**
		 * Retrieve related objects.
		 * @param key {string} The relation key to fetch models for.
		 * @param options {object} Options for 'Backbone.Model.fetch' and 'Backbone.sync'.
		 * @return {xhr} An array of request objects
		 */
		fetchRelated: function( key, options ) {
			options || ( options = {} );
			var rel = this.getRelation( key ),
				keyContents = rel && rel.keyContents,
				toFetch = keyContents && _.select( _.isArray( keyContents ) ? keyContents : [ keyContents ], function( item ) {
						var id = _.isString( item ) || _.isNumber( item ) ? item : item[ rel.relatedModel.prototype.idAttribute ];
						return id && !Backbone.Relational.store.find( rel.relatedModel, id );
					}, this );
			
			if ( toFetch && toFetch.length ) {
				// Create a model for each entry in 'keyContents' that is to be fetched
				var models = _.map( toFetch, function( item ) {
						if ( typeof( item ) === 'object' ) {
							var model = new rel.relatedModel( item );
						}
						else {
							var attrs = {};
							attrs[ rel.relatedModel.prototype.idAttribute ] = item;
							var model = new rel.relatedModel( attrs );
						}
						return model;
					}, this );
				
				// Try if the 'collection' can provide a url to fetch a set of models in one request.
				if ( rel.related instanceof Backbone.Collection && _.isFunction( rel.related.url ) ) {
					var setUrl = rel.related.url( models );
				}
				
				// An assumption is that when 'Backbone.Collection.url' is a function, it can handle building of set urls.
				// To make sure it can, test if the url we got by supplying a list of models to fetch is different from
				// the one supplied for the default fetch action (without args to 'url').
				if ( setUrl && setUrl !== rel.related.url() ) {
					var opts = _.defaults( {
							error: function() {
									var args = arguments;
									_.each( models, function( model ) {
											model.destroy();
											options.error && options.error.apply( model, args );
										})
								},
							url: setUrl
						},
						options,
						{ add: true }
					);
					
					var requests = [ rel.related.fetch( opts ) ];
				}
				else {
					var requests = _.map( models, function( model ) {
							var opts = _.defaults( {
								error: function() {
										model.destroy();
										options.error && options.error.apply( model, arguments );
									}
								},
								options
							);
							return model.fetch( opts );
						}, this );
				}
			}
			
			return _.isUndefined( requests ) ? [] : requests;
		},
		
		set: function( attributes, options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.set.apply( this, arguments );
			
			// 'set' is called quite late in 'Backbone.Model.prototype.constructor', but before 'initialize'.
			// Ideal place to set up relations :)
			if ( !this._isInitialized && !this.isLocked() ) {
				Backbone.Relational.store.register( this );
				this.initializeRelations();
			}
			// Update the 'idAttribute' in Backbone.store if; we don't want it to miss an 'id' update due to {silent:true}
			else if ( attributes && this.idAttribute in attributes ) {
				Backbone.Relational.store.update( this );
			}
			
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		unset: function( attributes, options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.unset.apply( this, arguments );
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		clear: function( options ) {
			Backbone.Relational.eventQueue.block();
			
			var result = Backbone.Model.prototype.clear.apply( this, arguments );
			this.updateRelations( options );
			
			// Try to run the global queue holding external events
			Backbone.Relational.eventQueue.unblock();
			
			return result;
		},
		
		/**
		 * Override 'change', so the change will only execute after 'set' has finised (relations are updated),
		 * and 'previousAttributes' will be available when the event is fired.
		 */
		change: function( options ) {
			var dit = this;
			Backbone.Relational.eventQueue.add( function() {
					Backbone.Model.prototype.change.apply( dit, arguments );
				});
		},
		
		/**
		 * Convert relations to JSON, omits them when required
		 */
		toJSON: function() {
			// If this Model has already been fully serialized in this branch once, return to avoid loops
			if ( this.isLocked() ) {
				return this.id;
			}
			
			this.acquire();
			var json = Backbone.Model.prototype.toJSON.call( this );
			
			_.each( this._relations, function( rel ) {
					var value = json[ rel.key ];
					
					if ( rel.options.includeInJSON === true && value && _.isFunction( value.toJSON ) ) {
						json[ rel.key ] = value.toJSON();
					}
					else if ( _.isString( rel.options.includeInJSON ) ) {
						if ( value instanceof Backbone.Collection ) {
							json[ rel.key ] = value.pluck( rel.options.includeInJSON );
						}
						else if ( value instanceof Backbone.Model ) {
							json[ rel.key ] = value.get( rel.options.includeInJSON );
						}
					}
					else if ( _.isArray( rel.options.includeInJSON ) ) { // JA added
                        if ( value instanceof Backbone.Collection ) {
                            json[ rel.key ] = _.map(value.models, function(model) {
                                var model_subset = {};
                                _.each(rel.options.includeInJSON, function(key) {
                                    model_subset[ key ] = model.get( key );
                                })
                                return model_subset;
                            })
                        }
                        else if ( value instanceof Backbone.Model ) {
                            json[ rel.key ] = {};
                            _.each(rel.options.includeInJSON, function(key) {
                                json[ rel.key ][ key ] = value.get( key );
                            })
                        }
					}
					else {
						delete json[ rel.key ];
					}
				}, this );
			
			this.release();
			return json;
		}
	});
	_.extend( Backbone.RelationalModel.prototype, Backbone.Semaphore );
	
	/**
	 * Override Backbone.Collection._add, so objects fetched from the server multiple times will
	 * update the existing Model. Also, trigger 'relation:add'.
	 */
	var _add = Backbone.Collection.prototype._add;
	Backbone.Collection.prototype._add = function( model, options ) {
		if ( !( model instanceof Backbone.Model ) ) {
			// Try to find 'model' in Backbone.store. If it already exists, set the new properties on it.
			var found = Backbone.Relational.store.find( this.model, model[ this.model.prototype.idAttribute ] );
			if ( found ) {
				model = found.set( model, options );
			}
		}
		
		//console.debug( 'calling _add on coll=%o; model=%s (%o), options=%o', this, model.cid, model, options );
		if ( !( model instanceof Backbone.Model ) || !( this.get( model ) || this.getByCid( model ) ) ) {
			model = _add.call( this, model, options );
		}
		model && this.trigger('relational:add', model, this, options);
		
		return model;
	};
	
	/**
	 * Override 'Backbone.Collection._remove' to trigger 'relation:remove'.
	 */
	var _remove = Backbone.Collection.prototype._remove;
	Backbone.Collection.prototype._remove = function( model, options ) {
		//console.debug('calling _remove on coll=%o; model=%s (%o), options=%o', this, model.cid, model, options );
		model = _remove.call( this, model, options );
		model && this.trigger('relational:remove', model, this, options);
		
		return model;
	};
	
	/**
	 * Override 'Backbone.Collection.trigger' so 'add', 'remove' and 'reset' events are queued until relations
	 * are ready.
	 */
	var _trigger = Backbone.Collection.prototype.trigger;
	Backbone.Collection.prototype.trigger = function( eventName ) {
		if ( eventName === 'add' || eventName === 'remove' || eventName === 'reset' ) {
			var dit = this, args = arguments;
			Backbone.Relational.eventQueue.add( function() {
					_trigger.apply( dit, args );
				});
		}
		else {
			_trigger.apply( this, arguments );
		}
		
		return this;
	};
})();

define("libs/backbone/backbone-relational", function(){});

// Backbone.Memento v0.4.1
//
// Copyright (C)2011 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT Liscene
//
// Documentation and Full Licence Availabe at:
// http://github.com/derickbailey/backbone.memento

Backbone.Memento = (function(Backbone, _){
  

  // ----------------------------
  // Memento: the public API
  // ----------------------------
  var Memento = function(structure, config){
    this.version = "0.4.1";

    config = _.extend({ignore: []}, config);

    var serializer = new Serializer(structure, config);
    var mementoStack = new MementoStack(structure, config);

    var restoreState = function (previousState, restoreConfig){
      if (!previousState){ return; }
      serializer.deserialize(previousState, restoreConfig);
    };

    this.store = function(){
      var currentState = serializer.serialize();
      mementoStack.push(currentState);
    };

    this.restore = function(restoreConfig){
      var previousState = mementoStack.pop();
      restoreState(previousState, restoreConfig);
    };

    this.restart = function(restoreConfig){
      var previousState = mementoStack.rewind();
      restoreState(previousState, restoreConfig);
    };
  };

  // ----------------------------
  // TypeHelper: a consistent API for removing attributes and
  // restoring attributes, on models and collections
  // ----------------------------
  var TypeHelper = function(structure){
    if (structure instanceof Backbone.Model) {
      this.removeAttr = function(data){ structure.unset(data); };
      this.restore = function(data){ structure.set(data); };
    } else {
      this.removeAttr = function(data){ structure.remove(data); };
      this.restore = function(data){ structure.reset(data); };
    }
  };

  // ----------------------------
  // Serializer: serializer and deserialize model and collection state
  // ----------------------------
  var Serializer = function(structure, config){
    var typeHelper = new TypeHelper(structure);

    function dropIgnored(attrs, restoreConfig){
      attrs = _.clone(attrs);
      if (restoreConfig.hasOwnProperty("ignore") && restoreConfig.ignore.length > 0){
        for(var index in restoreConfig.ignore){
          var ignore = restoreConfig.ignore[index];
          delete attrs[ignore];
        }
      }
      return attrs;
    }

    function getAddedAttrDiff(newAttrs, oldAttrs){
      var removedAttrs = [];

      // guard clause to ensure we have attrs to compare
      if (!newAttrs || !oldAttrs){
        return removedAttrs;
      }

      // if the attr is found in the old set but not in
      // the new set, then it was remove in the new set
      for (var attr in oldAttrs){
        if (oldAttrs.hasOwnProperty(attr)){
          if (!newAttrs.hasOwnProperty(attr)){
            removedAttrs.push(attr);
          }
        }
      }

      return removedAttrs;
    }

    function removeAttributes(structure, attrsToRemove){
      for (var index in attrsToRemove){
        var attr = attrsToRemove[index];
        typeHelper.removeAttr(attr);
      }
    }

    function restoreState(previousState, restoreConfig){
      var oldAttrs = dropIgnored(previousState, restoreConfig);

      //get the current state
      var currentAttrs = structure.toJSON();
      currentAttrs = dropIgnored(currentAttrs, restoreConfig);

      //handle removing attributes that were added
      var removedAttrs = getAddedAttrDiff(oldAttrs, currentAttrs);
      removeAttributes(structure, removedAttrs);

      typeHelper.restore(oldAttrs);
    }

    this.serialize = function(){
      var attrs = structure.toJSON();
      attrs = dropIgnored(attrs, config);
      return attrs;
    }

    this.deserialize = function(previousState, restoreConfig){
      restoreConfig = _.extend({}, config, restoreConfig);
      restoreState(previousState, restoreConfig);
    }
      
  };

  // ----------------------------
  // MementoStack: push / pop model and collection states
  // ----------------------------
  var MementoStack = function(structure, config){
    var attributeStack;

    function initialize(){
      attributeStack = [];
    }

    this.push = function(attrs){
      attributeStack.push(attrs);
    }
    
    this.pop = function(restoreConfig){
      var oldAttrs = attributeStack.pop();
      return oldAttrs;
    }

    this.rewind = function(){
      var oldAttrs = attributeStack[0];
      initialize();
      return oldAttrs;
    }

    initialize();
  };

  return Memento;
})(Backbone, _);

define("libs/backbone/backbone.memento", function(){});

// Backbone.ModelBinding v0.4.1
//
// Copyright (C)2011 Derick Bailey, Muted Solutions, LLC
// Distributed Under MIT Liscene
//
// Documentation and Full Licence Availabe at:
// http://github.com/derickbailey/backbone.modelbinding

// ----------------------------
// Backbone.ModelBinding
// ----------------------------

Backbone.ModelBinding = (function(Backbone, _, $){
  modelBinding = {
    version: "0.4.1",

    bind: function(view, options){
      view.modelBinder = new ModelBinder(view, options);
      view.modelBinder.bind();
    },

    unbind: function(view){
      if (view.modelBinder){
        view.modelBinder.unbind()
      }
    }
  };

  ModelBinder = function(view, options){
    this.config = new modelBinding.Configuration(options);
    this.modelBindings = [];
    this.elementBindings = [];

    this.bind = function(){
      var conventions = modelBinding.Conventions;
      for (var conventionName in conventions){
        if (conventions.hasOwnProperty(conventionName)){
          var conventionElement = conventions[conventionName];
          var handler = conventionElement.handler;
          var conventionSelector = conventionElement.selector;
          handler.bind.call(this, conventionSelector, view, view.model, this.config);
        }
      }
    }

    this.unbind = function(){
      // unbind the html element bindings
      _.each(this.elementBindings, function(binding){
        binding.element.unbind(binding.eventName, binding.callback);
      });

      // unbind the model bindings
      _.each(this.modelBindings, function(binding){
        binding.model.unbind(binding.eventName, binding.callback);
      });
    }

    this.registerModelBinding = function(model, attribute_name, callback){
      // bind the model changes to the form elements
      var eventName = "change:" + attribute_name;
      model.bind(eventName, callback);
      this.modelBindings.push({model: model, eventName: eventName, callback: callback});
    }

    this.registerElementBinding = function(element, callback){
      // bind the form changes to the model
      element.bind("change", callback);
      this.elementBindings.push({element: element, eventName: "change", callback: callback});
    }
  }

  // ----------------------------
  // Model Binding Configuration
  // ----------------------------
  modelBinding.Configuration = function(options){
    this.bindingAttrConfig = {};

    _.extend(this.bindingAttrConfig, 
      modelBinding.Configuration.bindindAttrConfig,
      options
    );

    if (this.bindingAttrConfig.all){
      var attr = this.bindingAttrConfig.all;
      delete this.bindingAttrConfig.all;
      for (var inputType in this.bindingAttrConfig){
        if (this.bindingAttrConfig.hasOwnProperty(inputType)){
          this.bindingAttrConfig[inputType] = attr;
        }
      }
    }

    this.getBindingAttr = function(type){ 
      return this.bindingAttrConfig[type]; 
    };

    this.getBindingValue = function(element, type){
      var bindingAttr = this.getBindingAttr(type);
      return element.attr(bindingAttr);
    };

  };

  modelBinding.Configuration.bindindAttrConfig = {
    text: "id",
    textarea: "id",
    password: "id",
    radio: "name",
    checkbox: "id",
    select: "id",
    number: "id",
    range: "id",
    tel: "id",
    search: "id",
    url: "id",
    email: "id"

  };

  modelBinding.Configuration.store = function(){
    modelBinding.Configuration.originalConfig = _.clone(modelBinding.Configuration.bindindAttrConfig);
  };

  modelBinding.Configuration.restore = function(){
    modelBinding.Configuration.bindindAttrConfig = modelBinding.Configuration.originalConfig;
  };

  modelBinding.Configuration.configureBindingAttributes = function(options){
    if (options.all){
      this.configureAllBindingAttributes(options.all);
      delete options.all;
    }
    _.extend(modelBinding.Configuration.bindindAttrConfig, options);
  };

  modelBinding.Configuration.configureAllBindingAttributes = function(attribute){
    var config = modelBinding.Configuration.bindindAttrConfig;
    config.text = attribute;
    config.textarea = attribute;
    config.password = attribute;
    config.radio = attribute;
    config.checkbox = attribute;
    config.select = attribute;
    config.number = attribute;
    config.range = attribute;
    config.tel = attribute;
    config.search = attribute;
    config.url = attribute;
    config.email = attribute;
  };

  // ----------------------------
  // Text, Textarea, and Password Bi-Directional Binding Methods
  // ----------------------------
  StandardBinding = (function(Backbone){
    var methods = {};

    var _getElementType = function(element) {
      var type = element[0].tagName.toLowerCase();
      if (type == "input"){
        type = element.attr("type");
        if (type == undefined || type == ''){
          type = 'text';
        }
      }
      return type;
    };

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var elementType = _getElementType(element);
        var attribute_name = config.getBindingValue(element, elementType);

        var modelChange = function(changed_model, val){ element.val(val); };

        var setModelValue = function(attr_name, value){
          var data = {};
          data[attr_name] = value;
          model.set(data);
        };

        var elementChange = function(ev){
          setModelValue(attribute_name, view.$(ev.target).val());
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        // set the default value on the form, from the model
        var attr_value = model.get(attribute_name);
        if (typeof attr_value !== "undefined" && attr_value !== null) {
          element.val(attr_value);
        } else {
          var elVal = element.val();
          if (elVal){
            setModelValue(attribute_name, elVal);
          }
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Select Box Bi-Directional Binding Methods
  // ----------------------------
  SelectBoxBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var attribute_name = config.getBindingValue(element, 'select');

        var modelChange = function(changed_model, val){ element.val(val); };

        var setModelValue = function(attr, val, text){
          var data = {};
          data[attr] = val;
          data[attr + "_text"] = text;
          model.set(data);
        };

        var elementChange = function(ev){
          var targetEl = view.$(ev.target);
          var value = targetEl.val();
          var text = targetEl.find(":selected").text();
          setModelValue(attribute_name, value, text);
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        // set the default value on the form, from the model
        var attr_value = model.get(attribute_name);
        if (typeof attr_value !== "undefined" && attr_value !== null) {
          element.val(attr_value);
        } 

        // set the model to the form's value if there is no model value
        if (element.val() != attr_value) {
          var value = element.val();
          var text = element.find(":selected").text();
          setModelValue(attribute_name, value, text);
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Radio Button Group Bi-Directional Binding Methods
  // ----------------------------
  RadioGroupBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      var foundElements = [];
      view.$(selector).each(function(index){
        var element = view.$(this);

        var group_name = config.getBindingValue(element, 'radio');
        if (!foundElements[group_name]) {
          foundElements[group_name] = true;
          var bindingAttr = config.getBindingAttr('radio');

          var modelChange = function(model, val){
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "][value=" + val + "]";
            view.$(value_selector).attr("checked", "checked");
          };
          modelBinder.registerModelBinding(model, group_name, modelChange);

          var setModelValue = function(attr, val){
            var data = {};
            data[attr] = val;
            model.set(data);
          };

          // bind the form changes to the model
          var elementChange = function(ev){
            var element = view.$(ev.currentTarget);
            if (element.is(":checked")){
              setModelValue(group_name, element.val());
            }
          };

          var group_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "]";
          view.$(group_selector).each(function(){
            var groupEl = $(this);
            modelBinder.registerElementBinding(groupEl, elementChange);
          });

          var attr_value = model.get(group_name);
          if (typeof attr_value !== "undefined" && attr_value !== null) {
            // set the default value on the form, from the model
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "][value=" + attr_value + "]";
            view.$(value_selector).attr("checked", "checked");
          } else {
            // set the model to the currently selected radio button
            var value_selector = "input[type=radio][" + bindingAttr + "=" + group_name + "]:checked";
            var value = view.$(value_selector).val();
            setModelValue(group_name, value);
          }
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Checkbox Bi-Directional Binding Methods
  // ----------------------------
  CheckboxBinding = (function(Backbone){
    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var bindingAttr = config.getBindingAttr('checkbox');
        var attribute_name = config.getBindingValue(element, 'checkbox');

        var modelChange = function(model, val){
          if (val){
            element.attr("checked", "checked");
          }
          else{
            element.removeAttr("checked");
          }
        };

        var setModelValue = function(attr_name, value){
          var data = {};
          data[attr_name] = value;
          model.set(data);
        };

        var elementChange = function(ev){
          var changedElement = view.$(ev.target);
          var checked = changedElement.is(":checked")? true : false;
          setModelValue(attribute_name, checked);
        };

        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);

        var attr_exists = model.attributes.hasOwnProperty(attribute_name);
        if (attr_exists) {
          // set the default value on the form, from the model
          var attr_value = model.get(attribute_name);
          if (typeof attr_value !== "undefined" && attr_value !== null && attr_value != false) {
            element.attr("checked", "checked");
          }
          else{
            element.removeAttr("checked");
          }
        } else {
          // bind the form's value to the model
          var checked = element.is(":checked")? true : false;
          setModelValue(attribute_name, checked);
        }
      });
    };

    return methods;
  })(Backbone);

  // ----------------------------
  // Data-Bind Binding Methods
  // ----------------------------
  DataBindBinding = (function(Backbone, _, $){
    var dataBindSubstConfig = {
      "default": ""
    };

    modelBinding.Configuration.dataBindSubst = function(config){
      this.storeDataBindSubstConfig();
      _.extend(dataBindSubstConfig, config);
    };

    modelBinding.Configuration.storeDataBindSubstConfig = function(){
      modelBinding.Configuration._dataBindSubstConfig = _.clone(dataBindSubstConfig);
    };

    modelBinding.Configuration.restoreDataBindSubstConfig = function(){
      if (modelBinding.Configuration._dataBindSubstConfig){
        dataBindSubstConfig = modelBinding.Configuration._dataBindSubstConfig;
        delete modelBinding.Configuration._dataBindSubstConfig;
      }
    };

    modelBinding.Configuration.getDataBindSubst = function(elementType, value){
      var returnValue = value;
      if (value === undefined){
        if (dataBindSubstConfig.hasOwnProperty(elementType)){
          returnValue = dataBindSubstConfig[elementType];
        } else {
          returnValue = dataBindSubstConfig["default"];
        }
      }
      return returnValue;
    };

    setOnElement = function(element, attr, val){
      var valBefore = val;
      val = modelBinding.Configuration.getDataBindSubst(attr, val);
      switch(attr){
        case "html":
          element.html(val);
          break;
        case "text":
          element.text(val);
          break;
        case "enabled":
          element.attr("disabled", !val);
          break;
        case "displayed":
          element[val? "show" : "hide"]();
          break;
        case "hidden":
          element[val? "hide" : "show"]();
          break;
        default:
          element.attr(attr, val);
      }
    };

    splitBindingAttr = function(element)
    {
      var dataBindConfigList = [];
      var databindList = element.attr("data-bind").split(";");
      _.each(databindList, function(attrbind){
        var databind = $.trim(attrbind).split(" ");

        // make the default special case "text" if none specified
        if( databind.length == 1 ) databind.unshift("text");

        dataBindConfigList.push({
          elementAttr: databind[0],
          modelAttr: databind[1]
        });
      });
      return dataBindConfigList;
    };

    var methods = {};

    methods.bind = function(selector, view, model, config){
      var modelBinder = this;

      view.$(selector).each(function(index){
        var element = view.$(this);
        var databindList = splitBindingAttr(element);

        _.each(databindList, function(databind){
          var modelChange = function(model, val){
            setOnElement(element, databind.elementAttr, val);
          };

          modelBinder.registerModelBinding(model, databind.modelAttr, modelChange);

          // set default on data-bind element
          setOnElement(element, databind.elementAttr, model.get(databind.modelAttr));
        });

      });
    };

    return methods;
  })(Backbone, _, $);


  // ----------------------------
  // Binding Conventions
  // ----------------------------
  modelBinding.Conventions = {
    text: {selector: "input:text", handler: StandardBinding},
    textarea: {selector: "textarea", handler: StandardBinding},
    password: {selector: "input:password", handler: StandardBinding},
    radio: {selector: "input:radio", handler: RadioGroupBinding},
    checkbox: {selector: "input:checkbox", handler: CheckboxBinding},
    select: {selector: "select", handler: SelectBoxBinding},
    databind: { selector: "*[data-bind]", handler: DataBindBinding},
    // HTML5 input
    number: {selector: "input[type=number]", handler: StandardBinding},
    range: {selector: "input[type=range]", handler: StandardBinding},
    tel: {selector: "input[type=tel]", handler: StandardBinding},
    search: {selector: "input[type=search]", handler: StandardBinding},
    url: {selector: "input[type=url]", handler: StandardBinding},
    email: {selector: "input[type=email]", handler: StandardBinding}
  };

  return modelBinding;
})(Backbone, _, jQuery);


define("libs/backbone/backbone.modelbinding", function(){});

// lib/handlebars/base.js
var Handlebars = {};

Handlebars.VERSION = "1.0.beta.6";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
    return fn(context);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var ret = "";

  if(context && context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context) {
  Handlebars.log(context);
});
;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  for (var p in tmp) {
    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }
  }

  this.message = tmp.message;
};
Handlebars.Exception.prototype = new Error;

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /&(?!\w+;)|[<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial);
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;

define("libs/handlebars/handlebars.runtime-1.0.0.beta.6", function(){});

var old_Handlebars = window.Handlebars

define('libs/handlebars/wrapper',['./handlebars.runtime-1.0.0.beta.6'], function(handlebars) {
	if (old_Handlebars) window.Handlebars = old_Handlebars
})
;
/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

(function(){CKEDITOR.config.jqueryOverrideVal=typeof CKEDITOR.config.jqueryOverrideVal=='undefined'?true:CKEDITOR.config.jqueryOverrideVal;var a=window.jQuery;if(typeof a=='undefined')return;a.extend(a.fn,{ckeditorGet:function(){var b=this.eq(0).data('ckeditorInstance');if(!b)throw 'CKEditor not yet initialized, use ckeditor() with callback.';return b;},ckeditor:function(b,c){if(!CKEDITOR.env.isCompatible)return this;if(!a.isFunction(b)){var d=c;c=b;b=d;}c=c||{};this.filter('textarea, div, p').each(function(){var e=a(this),f=e.data('ckeditorInstance'),g=e.data('_ckeditorInstanceLock'),h=this;if(f&&!g){if(b)b.apply(f,[this]);}else if(!g){if(c.autoUpdateElement||typeof c.autoUpdateElement=='undefined'&&CKEDITOR.config.autoUpdateElement)c.autoUpdateElementJquery=true;c.autoUpdateElement=false;e.data('_ckeditorInstanceLock',true);f=CKEDITOR.replace(h,c);e.data('ckeditorInstance',f);f.on('instanceReady',function(i){var j=i.editor;setTimeout(function(){if(!j.element){setTimeout(arguments.callee,100);return;}i.removeListener('instanceReady',this.callee);j.on('dataReady',function(){e.trigger('setData.ckeditor',[j]);});j.on('getData',function(l){e.trigger('getData.ckeditor',[j,l.data]);},999);j.on('destroy',function(){e.trigger('destroy.ckeditor',[j]);});if(j.config.autoUpdateElementJquery&&e.is('textarea')&&e.parents('form').length){var k=function(){e.ckeditor(function(){j.updateElement();});};e.parents('form').submit(k);e.parents('form').bind('form-pre-serialize',k);e.bind('destroy.ckeditor',function(){e.parents('form').unbind('submit',k);e.parents('form').unbind('form-pre-serialize',k);});}j.on('destroy',function(){e.data('ckeditorInstance',null);});e.data('_ckeditorInstanceLock',null);e.trigger('instanceReady.ckeditor',[j]);if(b)b.apply(j,[h]);},0);},null,null,9999);}else CKEDITOR.on('instanceReady',function(i){var j=i.editor;setTimeout(function(){if(!j.element){setTimeout(arguments.callee,100);return;}if(j.element.$==h)if(b)b.apply(j,[h]);},0);},null,null,9999);});return this;}});if(CKEDITOR.config.jqueryOverrideVal)a.fn.val=CKEDITOR.tools.override(a.fn.val,function(b){return function(c,d){var e=typeof c!='undefined',f;this.each(function(){var g=a(this),h=g.data('ckeditorInstance');if(!d&&g.is('textarea')&&h){if(e)h.setData(c);else{f=h.getData();return null;}}else if(e)b.call(g,c);else{f=b.call(g);return null;}return true;});return e?this:f;};});})();

define("libs/ckeditor/adapters/jquery", function(){});

/**
 * @license cs 0.3.1 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details
 *
 * CoffeeScript is Copyright (c) 2011 Jeremy Ashkenas
 * http://jashkenas.github.com/coffee-script/
 * CoffeeScriptVersion: '1.1.2'
 */

/* Yes, deliciously evil. */
/*jslint evil: true, strict: false, plusplus: false, regexp: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, process: false, window: false */

(function () {


    define('cs',{

        
        version: '0.3.1',

        load: function (name, parentRequire, load, config) {
                    }
    });

}());
(function() {
  define('cs!utils/formatters',[], function() {
    var date_from_string;
    date_from_string = function(date) {
      if (date instanceof Date) {
        return date;
      }
      date = new Date(date);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date;
    };
    return {
      date_from_string: date_from_string
    };
  });
}).call(this);

(function() {
  define('cs!utils/sanitizers',[], function() {
    var evaluate, http_only, initial_underscore, sanitize, sanitize_attribute_value, sanitize_classname, strict_options;
    http_only = function(val) {
      return val.slice(0, 7) === "http://";
    };
    initial_underscore = function(val) {
      return val[0] === "_";
    };
    strict_options = {
      tags: {
        a: {
          href: http_only,
          target: initial_underscore
        },
        b: {},
        h1: {},
        h2: {},
        h3: {},
        span: {},
        p: {}
      },
      styles: {
        background: true,
        color: true
      },
      classes: {
        test: true,
        bigger: true
      }
    };
    evaluate = function(func_or_val, arg) {
      if (_.isFunction(func_or_val)) {
        return func_or_val(arg);
      }
      return func_or_val;
    };
    sanitize_classname = function(classname) {
      classname = classname.trim();
      if (!/^[_a-z]+[_a-z0-9-]*$/i.test(classname)) {
        return "";
      }
      return classname;
    };
    sanitize_attribute_value = function(attrval) {
      return CKEDITOR.tools.htmlEncode(attrval);
    };
    sanitize = function(html, options) {
      var parser, results;
      if (options == null) {
        options = strict_options;
      }
      results = "";
      parser = new CKEDITOR.htmlParser;
      parser.onTagOpen = function(tag, attrs, unary) {
        var allowed_attributes, attr, classes, cls, style, stylename, styles, styleval, _i, _j, _len, _len2, _ref, _ref2, _ref3;
        if (!(tag in options.tags)) {
          return;
        }
        results += "<" + tag;
        allowed_attributes = _.extend({
          style: true,
          "class": true
        }, options.tags[tag]);
        for (attr in attrs) {
          if (attr in allowed_attributes) {
            if (!evaluate(allowed_attributes[attr], attrs[attr])) {
              continue;
            }
            if (attr === "style") {
              styles = [];
              _ref = attrs[attr].split(";");
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                style = _ref[_i];
                _ref2 = style.split(":"), stylename = _ref2[0], styleval = _ref2[1];
                if (evaluate(options.styles[stylename.trim()], styleval)) {
                  styles.push(style);
                }
              }
              if (!styles.length) {
                continue;
              }
              attrs[attr] = styles.join(";");
            }
            if (attr === "class") {
              classes = [];
              _ref3 = attrs[attr].split(" ");
              for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
                cls = _ref3[_j];
                if (evaluate(options.classes[cls], tag)) {
                  classes.push(cls);
                }
              }
              if (!classes.length) {
                continue;
              }
              attrs[attr] = classes.join(" ");
            }
            results += " " + attr + "=\"" + attrs[attr] + "\"";
          }
        }
        return results += (unary ? "/" : "") + ">";
      };
      parser.onTagClose = function(tag) {
        if (!(tag in options.tags)) {
          return;
        }
        return results += "</" + tag + ">";
      };
      parser.onText = function(text) {
        return results += text;
      };
      parser.onCDATA = function(cdata) {
        return alert("Parsed HTML contained CDATA: " + cdata);
      };
      parser.parse(html);
      return results;
    };
    return {
      sanitize: sanitize,
      strict_options: strict_options,
      sanitize_classname: sanitize_classname
    };
  });
}).call(this);

(function() {
  define('cs!utils/handlebars',["cs!./formatters", "cs!./sanitizers"], function(formatters, sanitizers) {
    Handlebars.partials = Handlebars.templates || (Handlebars.templates = {});
    Handlebars.registerHelper("$date", function(date) {
      date = formatters.date_from_string(date);
      return $.datepicker.formatDate("D, M d, yy", date);
    });
    Handlebars.registerHelper("each_with_index", function(array, fn) {
      var buffer, i, item, _len;
      buffer = "";
      for (i = 0, _len = array.length; i < _len; i++) {
        item = array[i];
        item.index = i;
        buffer += fn(item);
      }
      return buffer;
    });
    Handlebars.registerHelper("join_with_commas", function(array, fn) {
      var val;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = array.length; _i < _len; _i++) {
          val = array[_i];
          _results.push(fn(val));
        }
        return _results;
      })()).join(" / ");
    });
    return Handlebars.registerHelper("sanitize", function(html) {
      html = sanitizers.sanitize(html);
      return new Handlebars.SafeString(html);
    });
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  define('cs!base/models',["cs!utils/formatters"], function(formatters) {
    var BaseCollection, BaseModel, LazyCollection, LazyModel, get_url, hash_chars, hash_id, idAttribute;
    idAttribute = Backbone.Model.prototype.idAttribute = "_id";
    hash_chars = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    hash_id = function(id) {
      var base, hash, machpid, pidinc, revtime, slug;
      if (!(id instanceof String)) {
        id = id.toString();
      }
      revtime = parseInt(id.slice(0, 8).split("").reverse().join(""), 16);
      machpid = parseInt(id.slice(8, 16), 16);
      pidinc = parseInt(id.slice(16, 24), 16);
      hash = Math.abs(revtime ^ machpid ^ pidinc);
      slug = "";
      base = hash_chars.length;
      while (hash) {
        slug += hash_chars[hash % base];
        hash = parseInt(hash / base);
      }
      return slug;
    };
    get_url = function(urlref) {
      if (!urlref) {
        return "";
      }
      if (urlref instanceof Function) {
        urlref = urlref();
      }
      return urlref;
    };
    BaseModel = (function() {
      __extends(BaseModel, Backbone.Model);
      function BaseModel() {
        this.getKeyWhenReady = __bind(this.getKeyWhenReady, this);
        this.toJSON = __bind(this.toJSON, this);
        this.matches = __bind(this.matches, this);
        this.slug = __bind(this.slug, this);
        this.save = __bind(this.save, this);
        this.getClassName = __bind(this.getClassName, this);
        this.getDate = __bind(this.getDate, this);
        this.url = __bind(this.url, this);
        BaseModel.__super__.constructor.apply(this, arguments);
      }
      BaseModel.prototype.url = function() {
        var rootUrl, _ref;
        rootUrl = get_url((_ref = this.collection) != null ? _ref.url : void 0) || (this.apiCollection && ("/api/" + this.apiCollection));
        if (rootUrl) {
          return rootUrl + "/" + (this.id || "");
        }
      };
      BaseModel.prototype.getDate = function(attr) {
        var d, date, _i, _len, _results;
        date = this.get(attr);
        if (!date) {} else if (date instanceof Array) {
          _results = [];
          for (_i = 0, _len = date.length; _i < _len; _i++) {
            d = date[_i];
            _results.push(formatters.date_from_string(d));
          }
          return _results;
        } else {
          return formatters.date_from_string(date);
        }
      };
      BaseModel.prototype.getClassName = function() {
        return this.constructor.name || this.constructor.toString().match(/^function\s(.+)\(/)[1];
      };
      BaseModel.prototype.save = function() {
        var result;
        this.trigger("save", this);
        result = BaseModel.__super__.save.apply(this, arguments);
        return result;
      };
      BaseModel.prototype.slug = function() {
        if (!this.get("slug") && this.get(idAttribute)) {
          this.set({
            slug: hash_id(this.get(idAttribute))
          }, {
            silent: true
          });
        }
        return this.get("slug") || this.get(idAttribute) || "";
      };
      BaseModel.prototype.matches = function(slug) {
        var _ref;
        return _ref = slug.replace("/", ""), __indexOf.call(slug_fields, _ref) >= 0;
      };
      BaseModel.prototype.toJSON = function() {
        var json;
        json = BaseModel.__super__.toJSON.apply(this, arguments);
        try {
          json._course = require("app").get("course").id;
        } catch (err) {

        }
        return json;
      };
      BaseModel.prototype.getKeyWhenReady = function(key, callback) {
        var performCallback;
        if (this.has(key)) {
          return callback(this.get(key));
        }
        performCallback = __bind(function() {
          if (this.has(key)) {
            this.unbind("change:" + key, performCallback);
            return callback(this.get(key));
          }
        }, this);
        return this.bind("change:" + key, performCallback);
      };
      return BaseModel;
    })();
    LazyModel = (function() {
      __extends(LazyModel, BaseModel);
      LazyModel.prototype._loaded = false;
      LazyModel.prototype.loading = false;
      LazyModel.prototype.loaded = function() {
        return (this.includeInJSON === true || this._loaded) && !this.loading;
      };
      function LazyModel(attributes, options) {
        this.unsaved = __bind(this.unsaved, this);
        this.saveRecursive = __bind(this.saveRecursive, this);
        this.save = __bind(this.save, this);
        this.url = __bind(this.url, this);
        this.toJSON = __bind(this.toJSON, this);
        this.whenLoaded = __bind(this.whenLoaded, this);
        this.fetch = __bind(this.fetch, this);
        this.loaded = __bind(this.loaded, this);
        var key, new_attributes, relation, _base, _ref;
        if (_.isString(attributes)) {
          new_attributes = {};
          new_attributes[idAttribute] = attributes;
          attributes = new_attributes;
        }
        this.relations = (typeof this.relations === "function" ? this.relations() : void 0) || this.relations || {};
        _ref = this.relations;
        for (key in _ref) {
          relation = _ref[key];
          if (!(relation.model || relation.collection)) {
            throw Error("All relations must specify either a model or a collection (key: '" + key + "' in " + this.constructor.name + ")");
          }
          if (relation.model && !((new relation.model) instanceof Backbone.Model)) {
            throw Error("Backbone.Model class expected but found " + relation.model.name);
          }
          if (relation.collection && !((new relation.collection) instanceof Backbone.Collection)) {
            throw Error("Backbone.Collection class expected but found " + relation.collection.name);
          }
          relation.includeInJSON || (relation.includeInJSON = []);
          if (typeof (_base = relation.includeInJSON).push === "function") {
            _base.push(Backbone.Model.prototype.idAttribute);
          }
        }
        LazyModel.__super__.constructor.call(this, attributes, options);
      }
      LazyModel.prototype.fetch = function() {
        var xhdr;
        if (this.loading) {
          console.log("Model", this, "is already being loaded; aborting 'fetch()'.");
          return;
        }
        if (!this.id) {
          return;
        }
        this.loading = true;
        xhdr = LazyModel.__super__.fetch.apply(this, arguments);
        xhdr.success(__bind(function() {
          this.loading = false;
          this._loaded = true;
          return this.trigger("loaded");
        }, this));
        xhdr.error(__bind(function() {
          this.loading = false;
          return this._loaded = false;
        }, this));
        return xhdr;
      };
      LazyModel.prototype.whenLoaded = function(callback) {
        if (this.loaded()) {
          return callback();
        }
        return this.bind("loaded", callback);
      };
      LazyModel.prototype.set = function(key, value, options) {
        var attr, bind_to_collection, collection, model, newmodel, oldmodel, opts, _i, _j, _len, _len2, _ref, _ref2, _ref3;
        if (_.isObject(key) || key === null) {
          attr = key;
          options = value;
        } else {
          attr = {};
          attr[key] = value;
        }
        if (options != null ? options.unset : void 0) {
          return LazyModel.__super__.set.apply(this, arguments);
        }
        attr = _.clone(attr);
        _ref = this.relations;
        for (key in _ref) {
          opts = _ref[key];
          if (opts.collection) {
            if (!(key in attr) && !(key in this.attributes)) {
              attr[key] = [];
            }
            if ((collection = this.attributes[key]) instanceof opts.collection) {
              if (attr[key] instanceof opts.collection) {
                attr[key] = attr[key].models;
              }
              _ref2 = attr[key] || [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                newmodel = _ref2[_i];
                if ((oldmodel = collection.get(newmodel[idAttribute]))) {
                  oldmodel.set(newmodel);
                } else {
                  collection.add(newmodel);
                }
              }
              delete attr[key];
            } else {
              bind_to_collection = __bind(function() {
                var includeInJSON, parent, _base;
                parent = {
                  model: this,
                  key: key
                };
                includeInJSON = (typeof (_base = opts.includeInJSON).slice === "function" ? _base.slice(0) : void 0) || opts.includeInJSON;
                collection = attr[key] = new opts.collection(attr[key]);
                collection.includeInJSON = includeInJSON;
                collection.parent = parent;
                return collection.bind("add", __bind(function(model) {
                  model.parent = parent;
                  return model.includeInJSON = includeInJSON;
                }, this));
              }, this);
              bind_to_collection();
              _ref3 = collection.models;
              for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
                model = _ref3[_j];
                collection.trigger("add", model);
              }
            }
          } else if (opts.model) {
            if (!(key in attr) && !(key in this.attributes)) {
              attr[key] = {};
            }
            if (_.isString(attr[key])) {
              attr[key] = {
                _id: attr[key]
              };
            }
            if (_.isObject(attr[key])) {
              if ((oldmodel = this.attributes[key]) instanceof opts.model) {
                if (attr[key] instanceof opts.model) {
                  attr[key] = attr[key].attributes;
                }
                oldmodel.set(attr[key]);
                delete attr[key];
              } else {
                model = attr[key] = new opts.model(attr[key]);
                model.parent = {
                  model: this,
                  key: key
                };
                model.includeInJSON = opts.includeInJSON;
              }
            }
          }
        }
        return LazyModel.__super__.set.call(this, attr, options);
      };
      LazyModel.prototype.toJSON = function(full) {
        var attrs, key, model, modelkey, models, relation, _i, _len;
        attrs = _.extend({}, LazyModel.__super__.toJSON.apply(this, arguments));
        if (this.parent && (this.includeInJSON !== true)) {
          attrs.parent = {
            model: this.parent.model.getClassName(),
            key: this.parent.key
          };
          if (this.parent.model.apiCollection) {
            attrs.parent.apiCollection = this.parent.model.apiCollection;
          }
          if (this.parent.model.id) {
            attrs.parent._id = this.parent.model.id;
            attrs.parent.url = get_url(this.parent.model.url);
          }
        }
        for (key in attrs) {
          if (key in this.relations) {
            attrs[key] = attrs[key].toJSON(full);
            relation = this.relations[key];
            if (relation.includeInJSON === true || full) {
              continue;
            }
            models = attrs[key];
            if (!(models instanceof Array)) {
              models = [models];
            }
            for (_i = 0, _len = models.length; _i < _len; _i++) {
              model = models[_i];
              for (modelkey in model) {
                if (__indexOf.call(relation.includeInJSON, modelkey) < 0 && modelkey[0] !== "_") {
                  delete model[modelkey];
                }
              }
            }
          }
        }
        return attrs;
      };
      LazyModel.prototype.url = function() {
        var parent_url, url, _ref, _ref2;
        if ((parent_url = get_url((_ref = this.parent) != null ? (_ref2 = _ref.model) != null ? _ref2.url : void 0 : void 0))) {
          url = parent_url + "/" + this.parent.key;
          if (this.id && this.collection) {
            url += "/" + this.id;
          }
        } else {
          url = LazyModel.__super__.url.apply(this, arguments);
        }
        return url;
      };
      LazyModel.prototype.save = function() {
        if (this.parent && this.parent.model && this.parent.model.unsaved() && this.parent.url) {
          return this.saveRecursive();
        } else {
          return LazyModel.__super__.save.apply(this, arguments);
        }
      };
      LazyModel.prototype.saveRecursive = function(arguments, callback) {
        if (this.parent && this.parent.model && this.parent.model.unsaved() && this.parent.url) {
          clog("Parent of", this, "is unsaved, so first saving", this.parent.model, this.id);
          return this.parent.model.saveRecursive(null, __bind(function() {
            clog("Finished saving", this.parent.model, "(now we can actually save", this, "at", get_url(this.url), ")", this.id);
            return BaseModel.prototype.save.apply(this).success(__bind(function() {
              clog("saving", this, "is complete", this.id);
              return typeof callback === "function" ? callback() : void 0;
            }, this));
          }, this));
        } else {
          return this.save.apply(this, arguments).success(callback);
        }
      };
      LazyModel.prototype.unsaved = function() {
        return this.id === void 0;
      };
      return LazyModel;
    })();
    BaseCollection = (function() {
      __extends(BaseCollection, Backbone.Collection);
      function BaseCollection() {
        this._onModelEvent = __bind(this._onModelEvent, this);
        this.get = __bind(this.get, this);
        this.remove = __bind(this.remove, this);
        this.add = __bind(this.add, this);
        this._addToSlugIndex = __bind(this._addToSlugIndex, this);        this._bySlug = {};
        BaseCollection.__super__.constructor.apply(this, arguments);
      }
      BaseCollection.prototype._addToSlugIndex = function(model) {
        var id, slug;
        id = model.id || model[idAttribute] || "";
        if (!id) {
          return;
        }
        slug = model.slug || hash_id(id);
        if (_.isFunction(slug)) {
          slug = slug();
        }
        if (!slug) {
          console.log("missing", this, slug);
          return;
        }
        return this._bySlug[slug] = id;
      };
      BaseCollection.prototype.add = function(models, options) {
        var model, _i, _len;
        models = _.isArray(models) ? models.slice() : [models];
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          this._addToSlugIndex(model);
        }
        return BaseCollection.__super__.add.apply(this, arguments);
      };
      BaseCollection.prototype.remove = function(models, options) {
        var model, _i, _len;
        models = _.isArray(models) ? models.slice() : [models];
        for (_i = 0, _len = models.length; _i < _len; _i++) {
          model = models[_i];
          delete this._bySlug[model.slug()];
        }
        return BaseCollection.__super__.remove.apply(this, arguments);
      };
      BaseCollection.prototype.get = function(idOrSlug) {
        var replacedSlug;
        if (idOrSlug in this._bySlug) {
          return this.get(this._bySlug[idOrSlug]);
        }
        replacedSlug = idOrSlug.toLowerCase().replace(/o/g, "0").replace(/i|l/g, "1");
        if (replacedSlug in this._bySlug) {
          return this.get(this._bySlug[replacedSlug]);
        }
        return BaseCollection.__super__.get.apply(this, arguments);
      };
      BaseCollection.prototype._onModelEvent = function(event, model, collection, options) {
        if (model) {
          if (event === 'change:' + model.idAttribute && !model.get("slug")) {
            model.set({
              slug: model.slug()
            }, {
              silent: true
            });
            this._addToSlugIndex(model);
          } else if (event === 'change:slug') {
            delete this._bySlug[model.previous("slug")];
            this._addToSlugIndex(model);
          }
        }
        return BaseCollection.__super__._onModelEvent.apply(this, arguments);
      };
      return BaseCollection;
    })();
    LazyCollection = (function() {
      __extends(LazyCollection, BaseCollection);
      function LazyCollection() {
        this.url = __bind(this.url, this);
        this.toJSON = __bind(this.toJSON, this);        LazyCollection.__super__.constructor.apply(this, arguments);
        this.apiCollection = this.model.prototype.apiCollection;
      }
      LazyCollection.prototype.toJSON = function() {
        var models;
        models = LazyCollection.__super__.toJSON.apply(this, arguments);
        models = _.filter(models, function(model) {
          return model.includeInJSON || idAttribute in model;
        });
        return models;
      };
      LazyCollection.prototype.url = function() {
        var parent_url, rootUrl, _ref, _ref2;
        if (parent_url = get_url((_ref = this.parent) != null ? (_ref2 = _ref.model) != null ? _ref2.url : void 0 : void 0)) {
          return rootUrl = parent_url + "/" + this.parent.key;
        } else if (this.apiCollection) {
          return rootUrl = "/api/" + this.apiCollection + "/";
        }
      };
      return LazyCollection;
    })();
    return {
      BaseModel: BaseModel,
      LazyModel: LazyModel,
      BaseCollection: BaseCollection,
      LazyCollection: LazyCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!auth/models',["cs!base/models"], function(basemodels) {
    var UserCollection, UserModel;
    UserModel = (function() {
      __extends(UserModel, basemodels.LazyModel);
      function UserModel() {
        UserModel.__super__.constructor.apply(this, arguments);
      }
      UserModel.prototype.apiCollection = "user";
      return UserModel;
    })();
    UserCollection = (function() {
      __extends(UserCollection, basemodels.LazyCollection);
      function UserCollection() {
        UserCollection.__super__.constructor.apply(this, arguments);
      }
      UserCollection.prototype.model = UserModel;
      return UserCollection;
    })();
    return {
      UserModel: UserModel,
      UserCollection: UserCollection
    };
  });
}).call(this);

(function() {
  define('cs!base/modelbinding',[], function() {
    var StandardBindingIgnoringActiveInput, _getElementType;
    Backbone.ModelBinding.Configuration.configureAllBindingAttributes("data");
    StandardBindingIgnoringActiveInput = {};
    _getElementType = function(element) {
      var type;
      type = element[0].tagName.toLowerCase();
      if (type === "input") {
        type = element.attr("type") || "text";
      }
      return type;
    };
    StandardBindingIgnoringActiveInput.bind = function(selector, view, model, config) {
      var modelBinder;
      modelBinder = this;
      return view.$(selector).each(function(index) {
        var attr_value, attribute_name, elVal, element, elementChange, elementType, modelChange, setModelValue;
        element = view.$(this);
        elementType = _getElementType(element);
        attribute_name = config.getBindingValue(element, elementType);
        modelChange = function(changed_model, val) {
          if (!element.is(":focus")) {
            return element.val(val);
          }
        };
        setModelValue = function(attr_name, value) {
          var data;
          data = {};
          data[attr_name] = value;
          return model.set(data);
        };
        elementChange = function(ev) {
          return setModelValue(attribute_name, view.$(ev.target).val());
        };
        modelBinder.registerModelBinding(model, attribute_name, modelChange);
        modelBinder.registerElementBinding(element, elementChange);
        attr_value = model.get(attribute_name);
        if (attr_value != null) {
          return element.val(attr_value);
        } else {
          elVal = element.val();
          if (elVal) {
            return setModelValue(attribute_name, elVal);
          }
        }
      });
    };
    Backbone.ModelBinding.Conventions.text.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.textarea.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.password.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.number.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.tel.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.search.handler = StandardBindingIgnoringActiveInput;
    Backbone.ModelBinding.Conventions.url.handler = StandardBindingIgnoringActiveInput;
    return Backbone.ModelBinding.Conventions.email.handler = StandardBindingIgnoringActiveInput;
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!schedule/models',["cs!base/models"], function(basemodels) {
    var BoilerCollection, BoilerModel;
    BoilerModel = (function() {
      __extends(BoilerModel, basemodels.LazyModel);
      function BoilerModel() {
        BoilerModel.__super__.constructor.apply(this, arguments);
      }
      BoilerModel.prototype.apiCollection = "boiler";
      return BoilerModel;
    })();
    BoilerCollection = (function() {
      __extends(BoilerCollection, basemodels.LazyCollection);
      function BoilerCollection() {
        BoilerCollection.__super__.constructor.apply(this, arguments);
      }
      BoilerCollection.prototype.model = BoilerModel;
      return BoilerCollection;
    })();
    return {
      BoilerModel: BoilerModel,
      BoilerCollection: BoilerCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!ckeditor/models',["cs!base/models"], function(basemodels) {
    var BoilerCollection, BoilerModel;
    BoilerModel = (function() {
      __extends(BoilerModel, basemodels.LazyModel);
      function BoilerModel() {
        BoilerModel.__super__.constructor.apply(this, arguments);
      }
      BoilerModel.prototype.apiCollection = "boiler";
      return BoilerModel;
    })();
    BoilerCollection = (function() {
      __extends(BoilerCollection, basemodels.LazyCollection);
      function BoilerCollection() {
        BoilerCollection.__super__.constructor.apply(this, arguments);
      }
      BoilerCollection.prototype.model = BoilerModel;
      return BoilerCollection;
    })();
    return {
      BoilerModel: BoilerModel,
      BoilerCollection: BoilerCollection
    };
  });
}).call(this);

/*
 * FancyBox - jQuery Plugin
 * Simple and fancy lightbox alternative
 *
 * Examples and documentation at: http://fancybox.net
 *
 * Copyright (c) 2008 - 2010 Janis Skarnelis
 * That said, it is hardly a one-person project. Many people have submitted bugs, code, and offered their advice freely. Their support is greatly appreciated.
 *
 * Version: 1.3.4 (11/11/2010)
 * Requires: jQuery v1.3+
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function($) {
	var tmp, loading, overlay, wrap, outer, content, close, title, nav_left, nav_right,

		selectedIndex = 0, selectedOpts = {}, selectedArray = [], currentIndex = 0, currentOpts = {}, currentArray = [],

		ajaxLoader = null, imgPreloader = new Image(), imgRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i, swfRegExp = /[^\.]\.(swf)\s*$/i,

		loadingTimer, loadingFrame = 1,

		titleHeight = 0, titleStr = '', start_pos, final_pos, busy = false, fx = $.extend($('<div/>')[0], { prop: 0 }),

		isIE6 = $.browser.msie && $.browser.version < 7 && !window.XMLHttpRequest,

		/*
		 * Private methods 
		 */

		_abort = function() {
			loading.hide();

			imgPreloader.onerror = imgPreloader.onload = null;

			if (ajaxLoader) {
				ajaxLoader.abort();
			}

			tmp.empty();
		},

		_error = function() {
			if (false === selectedOpts.onError(selectedArray, selectedIndex, selectedOpts)) {
				loading.hide();
				busy = false;
				return;
			}

			selectedOpts.titleShow = false;

			selectedOpts.width = 'auto';
			selectedOpts.height = 'auto';

			tmp.html( '<p id="fancybox-error">The requested content cannot be loaded.<br />Please try again later.</p>' );

			_process_inline();
		},

		_start = function() {
			var obj = selectedArray[ selectedIndex ],
				href, 
				type, 
				title,
				str,
				emb,
				ret;

			_abort();

			selectedOpts = $.extend({}, $.fn.fancybox.defaults, (typeof $(obj).data('fancybox') == 'undefined' ? selectedOpts : $(obj).data('fancybox')));

			ret = selectedOpts.onStart(selectedArray, selectedIndex, selectedOpts);

			if (ret === false) {
				busy = false;
				return;
			} else if (typeof ret == 'object') {
				selectedOpts = $.extend(selectedOpts, ret);
			}

			title = selectedOpts.title || (obj.nodeName ? $(obj).attr('title') : obj.title) || '';

			if (obj.nodeName && !selectedOpts.orig) {
				selectedOpts.orig = $(obj).children("img:first").length ? $(obj).children("img:first") : $(obj);
			}

			if (title === '' && selectedOpts.orig && selectedOpts.titleFromAlt) {
				title = selectedOpts.orig.attr('alt');
			}

			href = selectedOpts.href || (obj.nodeName ? $(obj).attr('href') : obj.href) || null;

			if ((/^(?:javascript)/i).test(href) || href == '#') {
				href = null;
			}

			if (selectedOpts.type) {
				type = selectedOpts.type;

				if (!href) {
					href = selectedOpts.content;
				}

			} else if (selectedOpts.content) {
				type = 'html';

			} else if (href) {
				if (href.match(imgRegExp)) {
					type = 'image';

				} else if (href.match(swfRegExp)) {
					type = 'swf';

				} else if ($(obj).hasClass("iframe")) {
					type = 'iframe';

				} else if (href.indexOf("#") === 0) {
					type = 'inline';

				} else {
					type = 'ajax';
				}
			}

			if (!type) {
				_error();
				return;
			}

			if (type == 'inline') {
				obj	= href.substr(href.indexOf("#"));
				type = $(obj).length > 0 ? 'inline' : 'ajax';
			}

			selectedOpts.type = type;
			selectedOpts.href = href;
			selectedOpts.title = title;

			if (selectedOpts.autoDimensions) {
				if (selectedOpts.type == 'html' || selectedOpts.type == 'inline' || selectedOpts.type == 'ajax') {
					selectedOpts.width = 'auto';
					selectedOpts.height = 'auto';
				} else {
					selectedOpts.autoDimensions = false;	
				}
			}

			if (selectedOpts.modal) {
				selectedOpts.overlayShow = true;
				selectedOpts.hideOnOverlayClick = false;
				selectedOpts.hideOnContentClick = false;
				selectedOpts.enableEscapeButton = false;
				selectedOpts.showCloseButton = false;
			}

			selectedOpts.padding = parseInt(selectedOpts.padding, 10);
			selectedOpts.margin = parseInt(selectedOpts.margin, 10);

			tmp.css('padding', (selectedOpts.padding + selectedOpts.margin));

			$('.fancybox-inline-tmp').unbind('fancybox-cancel').bind('fancybox-change', function() {
				$(this).replaceWith(content.children());				
			});

			switch (type) {
				case 'html' :
					tmp.html( selectedOpts.content );
					_process_inline();
				break;

				case 'inline' :
					if ( $(obj).parent().is('#fancybox-content') === true) {
						busy = false;
						return;
					}

					$('<div class="fancybox-inline-tmp" />')
						.hide()
						.insertBefore( $(obj) )
						.bind('fancybox-cleanup', function() {
							$(this).replaceWith(content.children());
						}).bind('fancybox-cancel', function() {
							$(this).replaceWith(tmp.children());
						});

					$(obj).appendTo(tmp);

					_process_inline();
				break;

				case 'image':
					busy = false;

					$.fancybox.showActivity();

					imgPreloader = new Image();

					imgPreloader.onerror = function() {
						_error();
					};

					imgPreloader.onload = function() {
						busy = true;

						imgPreloader.onerror = imgPreloader.onload = null;

						_process_image();
					};

					imgPreloader.src = href;
				break;

				case 'swf':
					selectedOpts.scrolling = 'no';

					str = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"><param name="movie" value="' + href + '"></param>';
					emb = '';

					$.each(selectedOpts.swf, function(name, val) {
						str += '<param name="' + name + '" value="' + val + '"></param>';
						emb += ' ' + name + '="' + val + '"';
					});

					str += '<embed src="' + href + '" type="application/x-shockwave-flash" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"' + emb + '></embed></object>';

					tmp.html(str);

					_process_inline();
				break;

				case 'ajax':
					busy = false;

					$.fancybox.showActivity();

					selectedOpts.ajax.win = selectedOpts.ajax.success;

					ajaxLoader = $.ajax($.extend({}, selectedOpts.ajax, {
						url	: href,
						data : selectedOpts.ajax.data || {},
						error : function(XMLHttpRequest, textStatus, errorThrown) {
							if ( XMLHttpRequest.status > 0 ) {
								_error();
							}
						},
						success : function(data, textStatus, XMLHttpRequest) {
							var o = typeof XMLHttpRequest == 'object' ? XMLHttpRequest : ajaxLoader;
							if (o.status == 200) {
								if ( typeof selectedOpts.ajax.win == 'function' ) {
									ret = selectedOpts.ajax.win(href, data, textStatus, XMLHttpRequest);

									if (ret === false) {
										loading.hide();
										return;
									} else if (typeof ret == 'string' || typeof ret == 'object') {
										data = ret;
									}
								}

								tmp.html( data );
								_process_inline();
							}
						}
					}));

				break;

				case 'iframe':
					_show();
				break;
			}
		},

		_process_inline = function() {
			var
				w = selectedOpts.width,
				h = selectedOpts.height;

			if (w.toString().indexOf('%') > -1) {
				w = parseInt( ($(window).width() - (selectedOpts.margin * 2)) * parseFloat(w) / 100, 10) + 'px';

			} else {
				w = w == 'auto' ? 'auto' : w + 'px';	
			}

			if (h.toString().indexOf('%') > -1) {
				h = parseInt( ($(window).height() - (selectedOpts.margin * 2)) * parseFloat(h) / 100, 10) + 'px';

			} else {
				h = h == 'auto' ? 'auto' : h + 'px';	
			}

			tmp.wrapInner('<div style="width:' + w + ';height:' + h + ';overflow: ' + (selectedOpts.scrolling == 'auto' ? 'auto' : (selectedOpts.scrolling == 'yes' ? 'scroll' : 'hidden')) + ';position:relative;"></div>');

			selectedOpts.width = tmp.width();
			selectedOpts.height = tmp.height();

			_show();
		},

		_process_image = function() {
			selectedOpts.width = imgPreloader.width;
			selectedOpts.height = imgPreloader.height;

			$("<img />").attr({
				'id' : 'fancybox-img',
				'src' : imgPreloader.src,
				'alt' : selectedOpts.title
			}).appendTo( tmp );

			_show();
		},

		_show = function() {
			var pos, equal;

			loading.hide();

			if (wrap.is(":visible") && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
				$.event.trigger('fancybox-cancel');

				busy = false;
				return;
			}

			busy = true;

			$(content.add( overlay )).unbind();

			$(window).unbind("resize.fb scroll.fb");
			$(document).unbind('keydown.fb');

			if (wrap.is(":visible") && currentOpts.titlePosition !== 'outside') {
				wrap.css('height', wrap.height());
			}

			currentArray = selectedArray;
			currentIndex = selectedIndex;
			currentOpts = selectedOpts;

			if (currentOpts.overlayShow) {
				overlay.css({
					'background-color' : currentOpts.overlayColor,
					'opacity' : currentOpts.overlayOpacity,
					'cursor' : currentOpts.hideOnOverlayClick ? 'pointer' : 'auto',
					'height' : $(document).height()
				});

				if (!overlay.is(':visible')) {
					if (isIE6) {
						$('select:not(#fancybox-tmp select)').filter(function() {
							return this.style.visibility !== 'hidden';
						}).css({'visibility' : 'hidden'}).one('fancybox-cleanup', function() {
							this.style.visibility = 'inherit';
						});
					}

					overlay.show();
				}
			} else {
				overlay.hide();
			}

			final_pos = _get_zoom_to();

			_process_title();

			if (wrap.is(":visible")) {
				$( close.add( nav_left ).add( nav_right ) ).hide();

				pos = wrap.position(),

				start_pos = {
					top	 : pos.top,
					left : pos.left,
					width : wrap.width(),
					height : wrap.height()
				};

				equal = (start_pos.width == final_pos.width && start_pos.height == final_pos.height);

				content.fadeTo(currentOpts.changeFade, 0.3, function() {
					var finish_resizing = function() {
						content.html( tmp.contents() ).fadeTo(currentOpts.changeFade, 1, _finish);
					};

					$.event.trigger('fancybox-change');

					content
						.empty()
						.removeAttr('filter')
						.css({
							'border-width' : currentOpts.padding,
							'width'	: final_pos.width - currentOpts.padding * 2,
							'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
						});

					if (equal) {
						finish_resizing();

					} else {
						fx.prop = 0;

						$(fx).animate({prop: 1}, {
							 duration : currentOpts.changeSpeed,
							 easing : currentOpts.easingChange,
							 step : _draw,
							 complete : finish_resizing
						});
					}
				});

				return;
			}

			wrap.removeAttr("style");

			content.css('border-width', currentOpts.padding);

			if (currentOpts.transitionIn == 'elastic') {
				start_pos = _get_zoom_from();

				content.html( tmp.contents() );

				wrap.show();

				if (currentOpts.opacity) {
					final_pos.opacity = 0;
				}

				fx.prop = 0;

				$(fx).animate({prop: 1}, {
					 duration : currentOpts.speedIn,
					 easing : currentOpts.easingIn,
					 step : _draw,
					 complete : _finish
				});

				return;
			}

			if (currentOpts.titlePosition == 'inside' && titleHeight > 0) {	
				title.show();	
			}

			content
				.css({
					'width' : final_pos.width - currentOpts.padding * 2,
					'height' : selectedOpts.autoDimensions ? 'auto' : final_pos.height - titleHeight - currentOpts.padding * 2
				})
				.html( tmp.contents() );

			wrap
				.css(final_pos)
				.fadeIn( currentOpts.transitionIn == 'none' ? 0 : currentOpts.speedIn, _finish );
		},

		_format_title = function(title) {
			if (title && title.length) {
				if (currentOpts.titlePosition == 'float') {
					return '<table id="fancybox-title-float-wrap" cellpadding="0" cellspacing="0"><tr><td id="fancybox-title-float-left"></td><td id="fancybox-title-float-main">' + title + '</td><td id="fancybox-title-float-right"></td></tr></table>';
				}

				return '<div id="fancybox-title-' + currentOpts.titlePosition + '">' + title + '</div>';
			}

			return false;
		},

		_process_title = function() {
			titleStr = currentOpts.title || '';
			titleHeight = 0;

			title
				.empty()
				.removeAttr('style')
				.removeClass();

			if (currentOpts.titleShow === false) {
				title.hide();
				return;
			}

			titleStr = $.isFunction(currentOpts.titleFormat) ? currentOpts.titleFormat(titleStr, currentArray, currentIndex, currentOpts) : _format_title(titleStr);

			if (!titleStr || titleStr === '') {
				title.hide();
				return;
			}

			title
				.addClass('fancybox-title-' + currentOpts.titlePosition)
				.html( titleStr )
				.appendTo( 'body' )
				.show();

			switch (currentOpts.titlePosition) {
				case 'inside':
					title
						.css({
							'width' : final_pos.width - (currentOpts.padding * 2),
							'marginLeft' : currentOpts.padding,
							'marginRight' : currentOpts.padding
						});

					titleHeight = title.outerHeight(true);

					title.appendTo( outer );

					final_pos.height += titleHeight;
				break;

				case 'over':
					title
						.css({
							'marginLeft' : currentOpts.padding,
							'width'	: final_pos.width - (currentOpts.padding * 2),
							'bottom' : currentOpts.padding
						})
						.appendTo( outer );
				break;

				case 'float':
					title
						.css('left', parseInt((title.width() - final_pos.width - 40)/ 2, 10) * -1)
						.appendTo( wrap );
				break;

				default:
					title
						.css({
							'width' : final_pos.width - (currentOpts.padding * 2),
							'paddingLeft' : currentOpts.padding,
							'paddingRight' : currentOpts.padding
						})
						.appendTo( wrap );
				break;
			}

			title.hide();
		},

		_set_navigation = function() {
			if (currentOpts.enableEscapeButton || currentOpts.enableKeyboardNav) {
				$(document).bind('keydown.fb', function(e) {
					if (e.keyCode == 27 && currentOpts.enableEscapeButton) {
						e.preventDefault();
						$.fancybox.close();

					} else if ((e.keyCode == 37 || e.keyCode == 39) && currentOpts.enableKeyboardNav && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
						e.preventDefault();
						$.fancybox[ e.keyCode == 37 ? 'prev' : 'next']();
					}
				});
			}

			if (!currentOpts.showNavArrows) { 
				nav_left.hide();
				nav_right.hide();
				return;
			}

			if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex !== 0) {
				nav_left.show();
			}

			if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex != (currentArray.length -1)) {
				nav_right.show();
			}
		},

		_finish = function () {
			if (!$.support.opacity) {
				content.get(0).style.removeAttribute('filter');
				wrap.get(0).style.removeAttribute('filter');
			}

			if (selectedOpts.autoDimensions) {
				content.css('height', 'auto');
			}

			wrap.css('height', 'auto');

			if (titleStr && titleStr.length) {
				title.show();
			}

			if (currentOpts.showCloseButton) {
				close.show();
			}

			_set_navigation();
	
			if (currentOpts.hideOnContentClick)	{
				content.bind('click', $.fancybox.close);
			}

			if (currentOpts.hideOnOverlayClick)	{
				overlay.bind('click', $.fancybox.close);
			}

			$(window).bind("resize.fb", $.fancybox.resize);

			if (currentOpts.centerOnScroll) {
				$(window).bind("scroll.fb", $.fancybox.center);
			}

			if (currentOpts.type == 'iframe') {
				$('<iframe id="fancybox-frame" name="fancybox-frame' + new Date().getTime() + '" frameborder="0" hspace="0" ' + ($.browser.msie ? 'allowtransparency="true""' : '') + ' scrolling="' + selectedOpts.scrolling + '" src="' + currentOpts.href + '"></iframe>').appendTo(content);
			}

			wrap.show();

			busy = false;

			$.fancybox.center();

			currentOpts.onComplete(currentArray, currentIndex, currentOpts);

			_preload_images();
		},

		_preload_images = function() {
			var href, 
				objNext;

			if ((currentArray.length -1) > currentIndex) {
				href = currentArray[ currentIndex + 1 ].href;

				if (typeof href !== 'undefined' && href.match(imgRegExp)) {
					objNext = new Image();
					objNext.src = href;
				}
			}

			if (currentIndex > 0) {
				href = currentArray[ currentIndex - 1 ].href;

				if (typeof href !== 'undefined' && href.match(imgRegExp)) {
					objNext = new Image();
					objNext.src = href;
				}
			}
		},

		_draw = function(pos) {
			var dim = {
				width : parseInt(start_pos.width + (final_pos.width - start_pos.width) * pos, 10),
				height : parseInt(start_pos.height + (final_pos.height - start_pos.height) * pos, 10),

				top : parseInt(start_pos.top + (final_pos.top - start_pos.top) * pos, 10),
				left : parseInt(start_pos.left + (final_pos.left - start_pos.left) * pos, 10)
			};

			if (typeof final_pos.opacity !== 'undefined') {
				dim.opacity = pos < 0.5 ? 0.5 : pos;
			}

			wrap.css(dim);

			content.css({
				'width' : dim.width - currentOpts.padding * 2,
				'height' : dim.height - (titleHeight * pos) - currentOpts.padding * 2
			});
		},

		_get_viewport = function() {
			return [
				$(window).width() - (currentOpts.margin * 2),
				$(window).height() - (currentOpts.margin * 2),
				$(document).scrollLeft() + currentOpts.margin,
				$(document).scrollTop() + currentOpts.margin
			];
		},

		_get_zoom_to = function () {
			var view = _get_viewport(),
				to = {},
				resize = currentOpts.autoScale,
				double_padding = currentOpts.padding * 2,
				ratio;

			if (currentOpts.width.toString().indexOf('%') > -1) {
				to.width = parseInt((view[0] * parseFloat(currentOpts.width)) / 100, 10);
			} else {
				to.width = currentOpts.width + double_padding;
			}

			if (currentOpts.height.toString().indexOf('%') > -1) {
				to.height = parseInt((view[1] * parseFloat(currentOpts.height)) / 100, 10);
			} else {
				to.height = currentOpts.height + double_padding;
			}

			if (resize && (to.width > view[0] || to.height > view[1])) {
				if (selectedOpts.type == 'image' || selectedOpts.type == 'swf') {
					ratio = (currentOpts.width ) / (currentOpts.height );

					if ((to.width ) > view[0]) {
						to.width = view[0];
						to.height = parseInt(((to.width - double_padding) / ratio) + double_padding, 10);
					}

					if ((to.height) > view[1]) {
						to.height = view[1];
						to.width = parseInt(((to.height - double_padding) * ratio) + double_padding, 10);
					}

				} else {
					to.width = Math.min(to.width, view[0]);
					to.height = Math.min(to.height, view[1]);
				}
			}

			to.top = parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - to.height - 40) * 0.5)), 10);
			to.left = parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - to.width - 40) * 0.5)), 10);

			return to;
		},

		_get_obj_pos = function(obj) {
			var pos = obj.offset();

			pos.top += parseInt( obj.css('paddingTop'), 10 ) || 0;
			pos.left += parseInt( obj.css('paddingLeft'), 10 ) || 0;

			pos.top += parseInt( obj.css('border-top-width'), 10 ) || 0;
			pos.left += parseInt( obj.css('border-left-width'), 10 ) || 0;

			pos.width = obj.width();
			pos.height = obj.height();

			return pos;
		},

		_get_zoom_from = function() {
			var orig = selectedOpts.orig ? $(selectedOpts.orig) : false,
				from = {},
				pos,
				view;

			if (orig && orig.length) {
				pos = _get_obj_pos(orig);

				from = {
					width : pos.width + (currentOpts.padding * 2),
					height : pos.height + (currentOpts.padding * 2),
					top	: pos.top - currentOpts.padding - 20,
					left : pos.left - currentOpts.padding - 20
				};

			} else {
				view = _get_viewport();

				from = {
					width : currentOpts.padding * 2,
					height : currentOpts.padding * 2,
					top	: parseInt(view[3] + view[1] * 0.5, 10),
					left : parseInt(view[2] + view[0] * 0.5, 10)
				};
			}

			return from;
		},

		_animate_loading = function() {
			if (!loading.is(':visible')){
				clearInterval(loadingTimer);
				return;
			}

			$('div', loading).css('top', (loadingFrame * -40) + 'px');

			loadingFrame = (loadingFrame + 1) % 12;
		};

	/*
	 * Public methods 
	 */

	$.fn.fancybox = function(options) {
		if (!$(this).length) {
			return this;
		}

		$(this)
			.data('fancybox', $.extend({}, options, ($.metadata ? $(this).metadata() : {})))
			.unbind('click.fb')
			.bind('click.fb', function(e) {
				e.preventDefault();

				if (busy) {
					return;
				}

				busy = true;

				$(this).blur();

				selectedArray = [];
				selectedIndex = 0;

				var rel = $(this).attr('rel') || '';

				if (!rel || rel == '' || rel === 'nofollow') {
					selectedArray.push(this);

				} else {
					selectedArray = $("a[rel=" + rel + "], area[rel=" + rel + "]");
					selectedIndex = selectedArray.index( this );
				}

				_start();

				return;
			});

		return this;
	};

	$.fancybox = function(obj) {
		var opts;

		if (busy) {
			return;
		}

		busy = true;
		opts = typeof arguments[1] !== 'undefined' ? arguments[1] : {};

		selectedArray = [];
		selectedIndex = parseInt(opts.index, 10) || 0;

		if ($.isArray(obj)) {
			for (var i = 0, j = obj.length; i < j; i++) {
				if (typeof obj[i] == 'object') {
					$(obj[i]).data('fancybox', $.extend({}, opts, obj[i]));
				} else {
					obj[i] = $({}).data('fancybox', $.extend({content : obj[i]}, opts));
				}
			}

			selectedArray = jQuery.merge(selectedArray, obj);

		} else {
			if (typeof obj == 'object') {
				$(obj).data('fancybox', $.extend({}, opts, obj));
			} else {
				obj = $({}).data('fancybox', $.extend({content : obj}, opts));
			}

			selectedArray.push(obj);
		}

		if (selectedIndex > selectedArray.length || selectedIndex < 0) {
			selectedIndex = 0;
		}

		_start();
	};

	$.fancybox.showActivity = function() {
		clearInterval(loadingTimer);

		loading.show();
		loadingTimer = setInterval(_animate_loading, 66);
	};

	$.fancybox.hideActivity = function() {
		loading.hide();
	};

	$.fancybox.next = function() {
		return $.fancybox.pos( currentIndex + 1);
	};

	$.fancybox.prev = function() {
		return $.fancybox.pos( currentIndex - 1);
	};

	$.fancybox.pos = function(pos) {
		if (busy) {
			return;
		}

		pos = parseInt(pos);

		selectedArray = currentArray;

		if (pos > -1 && pos < currentArray.length) {
			selectedIndex = pos;
			_start();

		} else if (currentOpts.cyclic && currentArray.length > 1) {
			selectedIndex = pos >= currentArray.length ? 0 : currentArray.length - 1;
			_start();
		}

		return;
	};

	$.fancybox.cancel = function() {
		if (busy) {
			return;
		}

		busy = true;

		$.event.trigger('fancybox-cancel');

		_abort();

		selectedOpts.onCancel(selectedArray, selectedIndex, selectedOpts);

		busy = false;
	};

	// Note: within an iframe use - parent.$.fancybox.close();
	$.fancybox.close = function() {
		if (busy || wrap.is(':hidden')) {
			return;
		}

		busy = true;

		if (currentOpts && false === currentOpts.onCleanup(currentArray, currentIndex, currentOpts)) {
			busy = false;
			return;
		}

		_abort();

		$(close.add( nav_left ).add( nav_right )).hide();

		$(content.add( overlay )).unbind();

		$(window).unbind("resize.fb scroll.fb");
		$(document).unbind('keydown.fb');

		content.find('iframe').attr('src', isIE6 && /^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank');

		if (currentOpts.titlePosition !== 'inside') {
			title.empty();
		}

		wrap.stop();

		function _cleanup() {
			overlay.fadeOut('fast');

			title.empty().hide();
			wrap.hide();

			$.event.trigger('fancybox-cleanup');

			content.empty();

			currentOpts.onClosed(currentArray, currentIndex, currentOpts);

			currentArray = selectedOpts	= [];
			currentIndex = selectedIndex = 0;
			currentOpts = selectedOpts	= {};

			busy = false;
		}

		if (currentOpts.transitionOut == 'elastic') {
			start_pos = _get_zoom_from();

			var pos = wrap.position();

			final_pos = {
				top	 : pos.top ,
				left : pos.left,
				width :	wrap.width(),
				height : wrap.height()
			};

			if (currentOpts.opacity) {
				final_pos.opacity = 1;
			}

			title.empty().hide();

			fx.prop = 1;

			$(fx).animate({ prop: 0 }, {
				 duration : currentOpts.speedOut,
				 easing : currentOpts.easingOut,
				 step : _draw,
				 complete : _cleanup
			});

		} else {
			wrap.fadeOut( currentOpts.transitionOut == 'none' ? 0 : currentOpts.speedOut, _cleanup);
		}
	};

	$.fancybox.resize = function() {
		if (overlay.is(':visible')) {
			overlay.css('height', $(document).height());
		}

		$.fancybox.center(true);
	};

	$.fancybox.center = function() {
		var view, align;

		if (busy) {
			return;	
		}

		align = arguments[0] === true ? 1 : 0;
		view = _get_viewport();

		if (!align && (wrap.width() > view[0] || wrap.height() > view[1])) {
			return;	
		}

		wrap
			.stop()
			.animate({
				'top' : parseInt(Math.max(view[3] - 20, view[3] + ((view[1] - content.height() - 40) * 0.5) - currentOpts.padding)),
				'left' : parseInt(Math.max(view[2] - 20, view[2] + ((view[0] - content.width() - 40) * 0.5) - currentOpts.padding))
			}, typeof arguments[0] == 'number' ? arguments[0] : 200);
	};

	$.fancybox.init = function() {
		if ($("#fancybox-wrap").length) {
			return;
		}

		$('body').append(
			tmp	= $('<div id="fancybox-tmp"></div>'),
			loading	= $('<div id="fancybox-loading"><div></div></div>'),
			overlay	= $('<div id="fancybox-overlay"></div>'),
			wrap = $('<div id="fancybox-wrap"></div>')
		);

		outer = $('<div id="fancybox-outer"></div>')
			.append('<div class="fancybox-bg" id="fancybox-bg-n"></div><div class="fancybox-bg" id="fancybox-bg-ne"></div><div class="fancybox-bg" id="fancybox-bg-e"></div><div class="fancybox-bg" id="fancybox-bg-se"></div><div class="fancybox-bg" id="fancybox-bg-s"></div><div class="fancybox-bg" id="fancybox-bg-sw"></div><div class="fancybox-bg" id="fancybox-bg-w"></div><div class="fancybox-bg" id="fancybox-bg-nw"></div>')
			.appendTo( wrap );

		outer.append(
			content = $('<div id="fancybox-content"></div>'),
			close = $('<a id="fancybox-close"></a>'),
			title = $('<div id="fancybox-title"></div>'),

			nav_left = $('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),
			nav_right = $('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>')
		);

		close.click($.fancybox.close);
		loading.click($.fancybox.cancel);

		nav_left.click(function(e) {
			e.preventDefault();
			$.fancybox.prev();
		});

		nav_right.click(function(e) {
			e.preventDefault();
			$.fancybox.next();
		});

		if ($.fn.mousewheel) {
			wrap.bind('mousewheel.fb', function(e, delta) {
				if (busy) {
					e.preventDefault();

				} else if ($(e.target).get(0).clientHeight == 0 || $(e.target).get(0).scrollHeight === $(e.target).get(0).clientHeight) {
					e.preventDefault();
					$.fancybox[ delta > 0 ? 'prev' : 'next']();
				}
			});
		}

		if (!$.support.opacity) {
			wrap.addClass('fancybox-ie');
		}

		if (isIE6) {
			loading.addClass('fancybox-ie6');
			wrap.addClass('fancybox-ie6');

			$('<iframe id="fancybox-hide-sel-frame" src="' + (/^https/i.test(window.location.href || '') ? 'javascript:void(false)' : 'about:blank' ) + '" scrolling="no" border="0" frameborder="0" tabindex="-1"></iframe>').prependTo(outer);
		}
	};

	$.fn.fancybox.defaults = {
		padding : 10,
		margin : 40,
		opacity : false,
		modal : false,
		cyclic : false,
		scrolling : 'auto',	// 'auto', 'yes' or 'no'

		width : 560,
		height : 340,

		autoScale : true,
		autoDimensions : true,
		centerOnScroll : false,

		ajax : {},
		swf : { wmode: 'transparent' },

		hideOnOverlayClick : true,
		hideOnContentClick : false,

		overlayShow : true,
		overlayOpacity : 0.7,
		overlayColor : '#777',

		titleShow : true,
		titlePosition : 'float', // 'float', 'outside', 'inside' or 'over'
		titleFormat : null,
		titleFromAlt : false,

		transitionIn : 'fade', // 'elastic', 'fade' or 'none'
		transitionOut : 'fade', // 'elastic', 'fade' or 'none'

		speedIn : 300,
		speedOut : 300,

		changeSpeed : 300,
		changeFade : 'fast',

		easingIn : 'swing',
		easingOut : 'swing',

		showCloseButton	 : true,
		showNavArrows : true,
		enableEscapeButton : true,
		enableKeyboardNav : true,

		onStart : function(){},
		onCancel : function(){},
		onComplete : function(){},
		onCleanup : function(){},
		onClosed : function(){},
		onError : function(){}
	};

	$(document).ready(function() {
		$.fancybox.init();
	});

})(jQuery);
define("libs/fancybox/jquery.fancybox-1.3.4", function(){});

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!content/models',["cs!base/models"], function(basemodels) {
    var ContentCollection, ContentModel, ItemCollection, ItemModel, SectionCollection, SectionModel;
    ContentModel = (function() {
      __extends(ContentModel, basemodels.LazyModel);
      function ContentModel() {
        this.getWidth = __bind(this.getWidth, this);
        ContentModel.__super__.constructor.apply(this, arguments);
      }
      ContentModel.prototype.apiCollection = "content";
      ContentModel.prototype.getWidth = function() {
        var _ref, _ref2;
        return Math.min(this.get("width") || 16, ((_ref = this.parent) != null ? (_ref2 = _ref.model) != null ? typeof _ref2.getWidth === "function" ? _ref2.getWidth() : void 0 : void 0 : void 0) || 16);
      };
      ContentModel.prototype.relations = function() {
        return {
          sections: {
            collection: SectionCollection,
            includeInJSON: true
          }
        };
      };
      return ContentModel;
    })();
    ContentCollection = (function() {
      __extends(ContentCollection, basemodels.LazyCollection);
      function ContentCollection() {
        ContentCollection.__super__.constructor.apply(this, arguments);
      }
      ContentCollection.prototype.model = ContentModel;
      return ContentCollection;
    })();
    SectionModel = (function() {
      __extends(SectionModel, basemodels.LazyModel);
      function SectionModel() {
        this.getWidth = __bind(this.getWidth, this);
        SectionModel.__super__.constructor.apply(this, arguments);
      }
      SectionModel.prototype.initialize = function() {};
      SectionModel.prototype.getWidth = function() {
        var _ref, _ref2;
        return Math.min(this.get("width") || 16, (_ref = this.parent) != null ? (_ref2 = _ref.model) != null ? _ref2.getWidth() : void 0 : void 0);
      };
      SectionModel.prototype.relations = function() {
        return {
          items: {
            collection: ItemCollection,
            includeInJSON: true
          }
        };
      };
      return SectionModel;
    })();
    SectionCollection = (function() {
      __extends(SectionCollection, basemodels.LazyCollection);
      function SectionCollection() {
        SectionCollection.__super__.constructor.apply(this, arguments);
      }
      SectionCollection.prototype.model = SectionModel;
      return SectionCollection;
    })();
    ItemModel = (function() {
      __extends(ItemModel, basemodels.LazyModel);
      function ItemModel() {
        this.getWidth = __bind(this.getWidth, this);
        ItemModel.__super__.constructor.apply(this, arguments);
      }
      ItemModel.prototype.getWidth = function() {
        var _ref, _ref2;
        return Math.min(this.get("width") || 16, ((_ref = this.parent) != null ? (_ref2 = _ref.model) != null ? _ref2.getWidth() : void 0 : void 0) || 16);
      };
      return ItemModel;
    })();
    ItemCollection = (function() {
      __extends(ItemCollection, basemodels.LazyCollection);
      function ItemCollection() {
        ItemCollection.__super__.constructor.apply(this, arguments);
      }
      ItemCollection.prototype.model = ItemModel;
      return ItemCollection;
    })();
    return {
      ContentModel: ContentModel,
      ContentCollection: ContentCollection
    };
  });
}).call(this);

(function() {
  define('cs!home/models',["cs!base/models"], function(models) {
    return {};
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!page/models',["cs!base/models", "cs!content/models"], function(basemodels, contentmodels) {
    var PageCollection, PageModel;
    PageModel = (function() {
      __extends(PageModel, basemodels.LazyModel);
      function PageModel() {
        this.getWidth = __bind(this.getWidth, this);
        PageModel.__super__.constructor.apply(this, arguments);
      }
      PageModel.prototype.defaults = {
        width: 12
      };
      PageModel.prototype.apiCollection = "page";
      PageModel.prototype.getWidth = function() {
        return this.get("width") || 12;
      };
      PageModel.prototype.relations = function() {
        return {
          contents: {
            collection: contentmodels.ContentCollection,
            includeInJSON: ["title"]
          }
        };
      };
      return PageModel;
    })();
    PageCollection = (function() {
      __extends(PageCollection, basemodels.LazyCollection);
      function PageCollection() {
        PageCollection.__super__.constructor.apply(this, arguments);
      }
      PageCollection.prototype.model = PageModel;
      PageCollection.prototype.comparator = function(page) {
        return page.id;
      };
      return PageCollection;
    })();
    return {
      PageModel: PageModel,
      PageCollection: PageCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!lecture/models',["cs!base/models", "cs!content/models", "cs!page/models"], function(basemodels, contentmodels, pagemodels) {
    var LectureCollection, LectureModel;
    LectureModel = (function() {
      __extends(LectureModel, basemodels.LazyModel);
      function LectureModel() {
        LectureModel.__super__.constructor.apply(this, arguments);
      }
      LectureModel.prototype.apiCollection = "lecture";
      LectureModel.prototype.defaults = {
        scheduled: []
      };
      LectureModel.prototype.relations = function() {
        return {
          page: {
            model: pagemodels.PageModel,
            includeInJSON: true
          }
        };
      };
      return LectureModel;
    })();
    LectureCollection = (function() {
      __extends(LectureCollection, basemodels.LazyCollection);
      function LectureCollection() {
        LectureCollection.__super__.constructor.apply(this, arguments);
      }
      LectureCollection.prototype.model = LectureModel;
      LectureCollection.prototype.comparator = function(model) {
        return model.get("order");
      };
      return LectureCollection;
    })();
    return {
      LectureModel: LectureModel,
      LectureCollection: LectureCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!assignment/models',["cs!base/models", "cs!page/models"], function(basemodels, pagemodels) {
    var AssignmentCollection, AssignmentModel;
    AssignmentModel = (function() {
      __extends(AssignmentModel, basemodels.LazyModel);
      function AssignmentModel() {
        AssignmentModel.__super__.constructor.apply(this, arguments);
      }
      AssignmentModel.prototype.apiCollection = "assignment";
      AssignmentModel.prototype.relations = function() {
        return {
          page: {
            model: pagemodels.PageModel,
            includeInJSON: true
          }
        };
      };
      return AssignmentModel;
    })();
    AssignmentCollection = (function() {
      __extends(AssignmentCollection, basemodels.LazyCollection);
      function AssignmentCollection() {
        AssignmentCollection.__super__.constructor.apply(this, arguments);
      }
      AssignmentCollection.prototype.model = AssignmentModel;
      return AssignmentCollection;
    })();
    return {
      AssignmentModel: AssignmentModel,
      AssignmentCollection: AssignmentCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define('cs!probe/models',["cs!base/models"], function(basemodels) {
    var AnswerCollection, AnswerModel, ProbeCollection, ProbeModel;
    AnswerModel = (function() {
      __extends(AnswerModel, basemodels.LazyModel);
      function AnswerModel() {
        AnswerModel.__super__.constructor.apply(this, arguments);
      }
      return AnswerModel;
    })();
    AnswerCollection = (function() {
      __extends(AnswerCollection, basemodels.LazyCollection);
      function AnswerCollection() {
        AnswerCollection.__super__.constructor.apply(this, arguments);
      }
      AnswerCollection.prototype.model = AnswerModel;
      return AnswerCollection;
    })();
    ProbeModel = (function() {
      __extends(ProbeModel, basemodels.LazyModel);
      function ProbeModel() {
        this.url = __bind(this.url, this);
        ProbeModel.__super__.constructor.apply(this, arguments);
      }
      ProbeModel.prototype.url = function() {
        return "/api/probe/" + this.id;
      };
      ProbeModel.prototype.apiCollection = "probe";
      ProbeModel.prototype.relations = function() {
        return {
          answers: {
            collection: AnswerCollection,
            includeInJSON: true
          }
        };
      };
      return ProbeModel;
    })();
    ProbeCollection = (function() {
      __extends(ProbeCollection, basemodels.LazyCollection);
      function ProbeCollection() {
        ProbeCollection.__super__.constructor.apply(this, arguments);
      }
      ProbeCollection.prototype.model = ProbeModel;
      return ProbeCollection;
    })();
    return {
      AnswerModel: AnswerModel,
      AnswerCollection: AnswerCollection,
      ProbeModel: ProbeModel,
      ProbeCollection: ProbeCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define('cs!nugget/models',["cs!base/models", "cs!page/models", "cs!probe/models"], function(basemodels, pagemodels, probemodels) {
    var NuggetCollection, NuggetModel;
    NuggetModel = (function() {
      __extends(NuggetModel, basemodels.LazyModel);
      function NuggetModel() {
        NuggetModel.__super__.constructor.apply(this, arguments);
      }
      NuggetModel.prototype.relations = function() {
        return {
          page: {
            model: pagemodels.PageModel,
            includeInJSON: false
          },
          probeset: {
            collection: probemodels.ProbeCollection,
            includeInJSON: false
          }
        };
      };
      return NuggetModel;
    })();
    NuggetCollection = (function() {
      __extends(NuggetCollection, basemodels.LazyCollection);
      function NuggetCollection() {
        NuggetCollection.__super__.constructor.apply(this, arguments);
      }
      NuggetCollection.prototype.model = NuggetModel;
      NuggetCollection.prototype.selectNuggets = function(query) {
        var claimed, filteredcollection, filteredlist, tag, taglist;
        if (query) {
          if (query.tags) {
            taglist = (function() {
              var _i, _len, _ref, _results;
              _ref = decodeURIComponent(query.tags).split(';');
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                tag = _ref[_i];
                _results.push(tag.trim().toLowerCase());
              }
              return _results;
            })();
          } else {
            taglist = [];
          }
          claimed = query.claimed || '';
          filteredlist = this.filter(__bind(function(nugget) {
            var nuggettags, select, tag, tagged;
            switch (claimed) {
              case '1':
                if (require('app').get('user').get('claimed').get(nugget.id)) {
                  select = 1;
                }
                break;
              case '0':
                if (!require('app').get('user').get('claimed').get(nugget.id)) {
                  select = 1;
                }
                break;
              default:
                select = 1;
            }
            nuggettags = (function() {
              var _i, _len, _ref, _results;
              _ref = nugget.get('tags') || [];
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                tag = _ref[_i];
                _results.push(tag.trim().toLowerCase());
              }
              return _results;
            })();
            tagged = taglist ? _.isEqual(_.intersection(nuggettags, taglist).sort(), taglist.sort()) : true;
            return tagged && select && nugget.get('title');
          }, this));
        } else {
          filteredlist = this.models;
        }
        return filteredcollection = new Backbone.Collection(filteredlist);
      };
      return NuggetCollection;
    })();
    return {
      NuggetModel: NuggetModel,
      NuggetCollection: NuggetCollection
    };
  });
}).call(this);

(function() {
  define('cs!nugget/hardcode',[], function() {
    var knowledgestructure;
    knowledgestructure = {
      'L01': {
        'clusters': {
          'C01': 'Qualities',
          'C02': 'Perception and Attention',
          'C03': 'Memory',
          'C04': 'Feeling States',
          'C05': 'Decision Making'
        },
        'title': 'Emotion and Cognition',
        'minpoints': 10
      },
      'L02': {
        'clusters': {
          'C01': 'Model',
          'C02': 'Appraisal',
          'C03': 'Production',
          'C04': 'Regulation'
        },
        'title': 'Emotion Regulation',
        'minpoints': 10
      },
      'L03': {
        'clusters': {
          'C01': 'Prediction Error Theory',
          'C02': 'Three Processes',
          'C03': 'Reward Value',
          'C04': 'Predicting Value',
          'C05': 'Decisions'
        },
        'title': 'Reward Representation and Learning',
        'minpoints': 10
      },
      'L04': {
        'clusters': {
          'C01': 'Public Health',
          'C02': 'Depression',
          'C03': 'Genetic Risk',
          'C04': 'Addiction'
        },
        'title': 'Depression and Addiction',
        'minpoints': 10
      },
      'L05': {
        'clusters': {
          'C01': 'What Attentions',
          'C02': 'Visual Search',
          'C03': 'Selective Attention',
          'C04': 'Salience Maps',
          'C05': 'Attention Networks'
        },
        'title': 'Attention Networks',
        'minpoints': 10
      },
      'L06': {
        'clusters': {
          'C01': 'Two Systems',
          'C02': 'Dorsal System',
          'C03': 'Ventral System',
          'C04': 'Two Systems Summary',
          'C05': 'Spatial Neglect',
          'C06': 'Blindsight',
          'C07': 'Inattention'
        },
        'title': 'Attention Control & Inattention',
        'minpoints': 10
      },
      'L07': {
        'clusters': {
          'C01': 'Behavioral Models',
          'C02': 'Memory Guided Saccades',
          'C03': 'Material Specificity',
          'C04': 'Functional Connectivity',
          'C05': 'Top Down',
          'C06': 'Summary'
        },
        'title': 'Working Memory',
        'minpoints': 10
      },
      'L08': {
        'clusters': {
          'C01': 'Neural Circuit',
          'C02': 'Definition',
          'C03': 'Measuring Inhibition',
          'C04': 'Anatomical Evidence',
          'C05': 'Disorders of Inhibition',
          'C06': 'Drug Addiction',
          'C07': 'Functional Overlap',
          'C08': 'Age & Gender'
        },
        'title': 'Response Inhibition',
        'minpoints': 10
      },
      'L09': {
        'clusters': {
          'C01': 'Overview',
          'C02': 'Conceptual Processing',
          'C03': 'Object Properties',
          'C04': 'Object Categories'
        },
        'title': 'Object Concepts',
        'minpoints': 10
      },
      'L10': {
        'clusters': {
          'C01': 'Neural Basis',
          'C02': 'Remote Memory Models',
          'C03': 'Memory vs Perception',
          'C04': 'Amnesia'
        },
        'title': 'Memory and Brain',
        'minpoints': 10
      },
      'L11': {
        'clusters': {
          'C01': 'The Importance of Social Cognition',
          'C02': 'Social cognition requirements',
          'C03': 'Self-awareness',
          'C04': 'Theory of Mind',
          'C05': 'Right TPJ: behavioral scope',
          'C06': 'Alternate theories of TPJ function'
        },
        'title': 'Social Cognition and Theory of Mind',
        'minpoints': 10
      },
      'L12': {
        'clusters': {
          'C01': 'Social Cognition, Communication, & Language',
          'C02': 'Social Communication',
          'C03': 'Language and communication',
          'C04': 'Language and Theory of Mind'
        },
        'title': 'Social Cognition, Communication, & Language',
        'minpoints': 10
      },
      'L13': {
        'clusters': {
          'C01': 'Language Lateralization',
          'C02': 'Regional Specialization',
          'C03': 'Written Word Processing',
          'C04': 'Modeling Language Processing',
          'C05': 'Measuring Meaning',
          'C06': 'Semantic relatedness and the N400'
        },
        'title': 'Language and meaning in the brain',
        'minpoints': 10
      },
      'L14': {
        'clusters': {
          'C01': 'Why Study Music?',
          'C02': 'Music & Emotion',
          'C03': 'Amusia',
          'C04': 'Music structure and expectation',
          'C05': 'Therapeutic Uses of Music'
        },
        'title': 'Music, Language, and the Brain',
        'minpoints': 10
      },
      'L15': {
        'clusters': {
          'C01': 'Neuro-Anatomy of COGS107C'
        },
        'title': 'Neuro-Anatomy',
        'minpoints': 10
      },
      'L16': {
        'clusters': {
          'C01': 'Behavioral studies of aging',
          'C02': 'Age-related brain differences: animal models',
          'C03': 'Age-related brain differences: people',
          'C04': 'Age-related brain differences: function',
          'C05': 'Interventions: mental exercises'
        },
        'title': 'Cognitive Aging and the Brain',
        'minpoints': 10
      }
    };
    return {
      knowledgestructure: knowledgestructure
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!analytics/models',["cs!base/models"], function(basemodels) {
    var StudentStatisticsCollection, StudentStatisticsModel;
    StudentStatisticsModel = (function() {
      __extends(StudentStatisticsModel, Backbone.Model);
      function StudentStatisticsModel() {
        this.set = __bind(this.set, this);
        StudentStatisticsModel.__super__.constructor.apply(this, arguments);
      }
      StudentStatisticsModel.prototype.set = function(obj) {
        var nugget, _i, _len, _ref;
        obj.total_points = 0;
        _ref = obj.claimed;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          nugget = _ref[_i];
          obj.total_points += nugget.points;
        }
        return StudentStatisticsModel.__super__.set.apply(this, arguments);
      };
      return StudentStatisticsModel;
    })();
    StudentStatisticsCollection = (function() {
      __extends(StudentStatisticsCollection, Backbone.Collection);
      function StudentStatisticsCollection() {
        StudentStatisticsCollection.__super__.constructor.apply(this, arguments);
      }
      StudentStatisticsCollection.prototype.model = StudentStatisticsModel;
      return StudentStatisticsCollection;
    })();
    return {
      StudentStatisticsModel: StudentStatisticsModel,
      StudentStatisticsCollection: StudentStatisticsCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!file/models',["cs!base/models"], function(basemodels) {
    var FileCollection, FileModel;
    FileModel = (function() {
      __extends(FileModel, basemodels.LazyModel);
      function FileModel() {
        FileModel.__super__.constructor.apply(this, arguments);
      }
      FileModel.prototype.apiCollection = "file";
      return FileModel;
    })();
    FileCollection = (function() {
      __extends(FileCollection, basemodels.LazyCollection);
      function FileCollection() {
        FileCollection.__super__.constructor.apply(this, arguments);
      }
      FileCollection.prototype.model = FileModel;
      return FileCollection;
    })();
    return {
      FileModel: FileModel,
      FileCollection: FileCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!grade/models',["cs!base/models"], function(basemodels) {
    var GradeCollection, GradeModel;
    GradeModel = (function() {
      __extends(GradeModel, basemodels.LazyModel);
      function GradeModel() {
        GradeModel.__super__.constructor.apply(this, arguments);
      }
      GradeModel.prototype.apiCollection = "grade";
      return GradeModel;
    })();
    GradeCollection = (function() {
      __extends(GradeCollection, basemodels.LazyCollection);
      function GradeCollection() {
        GradeCollection.__super__.constructor.apply(this, arguments);
      }
      GradeCollection.prototype.model = GradeModel;
      return GradeCollection;
    })();
    return {
      GradeModel: GradeModel,
      GradeCollection: GradeCollection
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define('cs!auth/utils',[], function() {
    return {
      get_cookie_token: function() {
        var cookie, cookies, i, _results;
        cookies = document.cookie.split(";");
        i = 0;
        _results = [];
        while (i < cookies.length) {
          cookie = cookies[i].split("=");
          if (cookie[0] === "token") {
            return cookie[1];
          }
          _results.push(i++);
        }
        return _results;
      },
      login: function(user, email, password) {
        var xhdr;
        xhdr = $.post("/login", {
          email: email,
          password: password
        }, __bind(function(response) {
          if (response.email === email) {
            user.set(response);
            return user.set({
              loggedIn: true
            });
          }
        }, this));
        return xhdr;
      },
      logout: function(user) {
        var xhdr;
        xhdr = $.post("/logout", __bind(function() {
          return user.set({
            loggedIn: false,
            email: void 0
          });
        }, this));
        return xhdr;
      },
      check: function(user) {
        return $.get("/check", function(response) {
          user.set(response);
          if (response.email) {
            return user.set({
              loggedIn: true
            });
          } else {
            return user.set({
              loggedIn: false
            });
          }
        });
      }
    };
  });
}).call(this);

define('hb',[],function() {
	
	
    return {
        load: function() {}
    }
})
;
define("hb!app/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['root'] = templates['root'] = Handlebars.templates['root'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div id=\"container-outer\">\n        <div id=\"toptabs\"><div id=\"authbar\" style=\"float: right; padding-top: 10px; padding-right: 10px;\"></div></div>\n        <div id=\"container\">\n            <div id=\"content\"></div>\n        </div>\n        <br/>\n        \n        <br/>\n    </div>";});
  Handlebars.partials['item_edit_buttons'] = templates['item_edit_buttons'] = Handlebars.templates['item_edit_buttons'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div>\n        <button class=\"save btn success\" data-loading-text=\"Saving...\" data-complete-text=\"Saved\">Save</button>\n        <button class=\"cancel btn\">Cancel</button>\n    </div>\n    <div class=\"errors\"></div>";});
  Handlebars.partials['top_tabs'] = templates['top_tabs'] = Handlebars.templates['top_tabs'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n    <li id=\"toptab_";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.slug;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.slug", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.classes;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.classes", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"><a href=\"";
  stack1 = helpers.root_url || depth1.root_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...root_url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.slug;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.slug", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n    ";
  return buffer;}

  stack1 = helpers.models || depth0.models
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program1, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }});
  return templates;
});
define("hb!home/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['home'] = templates['home'] = Handlebars.templates['home'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h2 class=\"home-title\">";
  stack1 = helpers.model || depth0.model
  stack1 = stack1.attributes;
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "model.attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2>\n    <br/>\n    <div class=\"schedule\"></div>\n    <br/>\n    <div class=\"content\"></div>";
  return buffer;});
  return templates;
});
define("hb!schedule/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['schedule_date'] = templates['schedule_date'] = Handlebars.templates['schedule_date'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<th><strong class=\"date\">";
  stack1 = helpers.date || depth0.date
  stack2 = helpers.$date || depth0.$date
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "$date", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</strong></th>\n    <td class=\"schedule-items\"></td>";
  return buffer;});
  Handlebars.partials['schedule_item'] = templates['schedule_item'] = Handlebars.templates['schedule_item'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return " <i>(continued)</i>";}

  buffer += "<h4 class=\"schedule-item\">\n        <span class=\"label type\">";
  stack1 = helpers.options || depth0.options
  stack1 = stack1.type;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "options.type", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\n        <a class=\"title\" href=\"";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = helpers.item || depth0.item
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "item.title", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.options || depth0.options
  stack1 = stack1.continued;
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a>\n    </h4>\n    <div class=\"description\">";
  stack1 = helpers.item || depth0.item
  stack1 = stack1.description;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "item.description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>";
  return buffer;});
  Handlebars.partials['schedule_section'] = templates['schedule_section'] = Handlebars.templates['schedule_section'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"span14\">\n        <table class=\"zebra-striped bordered-table schedule-inner\">\n        </table>\n    </div>";});
  return templates;
});
define("hb!content/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['content'] = templates['content'] = Handlebars.templates['content'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"content-inner\">\n\n         <div class='sections row'></div>\n         \n         <div class=\"editor-only\">\n             <select class=\"content-button add-section-type\">\n                 <option value=\"freeform\">Freeform</option>\n                 <option value=\"gallery\">Gallery</option>\n                 <option value=\"\">Generic</option>\n             </select>\n             <button class=\"content-button add-button btn success\">Add section</button>\n         </div>\n\n         <div class=\"clearfix\"></div>\n    </div>";});
  Handlebars.partials['section'] = templates['section'] = Handlebars.templates['section'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"section-inner\">\n        <span class=\"editor-only\"><div class=\"section-button drag-button\"></div></span>\n        <h3 class='sectiontitle'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h3>\n        <div class='items row'></div>\n        \n        <div class=\"editor-only\">\n            <button class=\"section-button add-button btn success\">Add item</button>\n            <button class=\"section-button delete-button btn danger\">X</button>\n        </div>\n        \n    </div>";
  return buffer;});
  return templates;
});
define("hb!content/items/freeform/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['item_freeform'] = templates['item_freeform'] = Handlebars.templates['item_freeform'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0;


  stack1 = helpers.html || depth0.html
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "html", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <div class=\"clearfix\"></div>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_buttons, 'item_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['item_freeform_edit'] = templates['item_freeform_edit'] = Handlebars.templates['item_freeform_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0;


  buffer += "<textarea class=\"ckeditor\">";
  stack1 = helpers.html || depth0.html
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "html", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</textarea>\n    <br/>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_edit_buttons, 'item_edit_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  return templates;
});
define("hb!content/items/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['item_buttons'] = templates['item_buttons'] = Handlebars.templates['item_buttons'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"editor-only\">\n        <div class=\"item-button drag-button\"></div>\n        <button class=\"item-button edit-button btn success\">Edit</button>\n        <button class=\"item-button delete-button btn danger\">X</button>\n    </div>";});
  return templates;
});
define("hb!ckeditor/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['ckeditor'] = templates['ckeditor'] = Handlebars.templates['ckeditor'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0;


  buffer += "<textarea class=\"ckeditor\">";
  stack1 = helpers.html || depth0.html
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "html", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</textarea>";
  return buffer;});
  return templates;
});
define("hb!content/items/gallery/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['item_gallery'] = templates['item_gallery'] = Handlebars.templates['item_gallery'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " (<a target=\"_blank\" href=\"";
  stack1 = helpers.model || depth0.model
  stack1 = stack1.attributes;
  stack1 = stack1.url;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "model.attributes.url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">link</a>)";
  return buffer;}

  buffer += "<h4 class='itemtitle' data=\"title\"></h4>\n    <a href=\"";
  stack1 = helpers.get_image_url || depth0.get_image_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "get_image_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" target=\"_blank\" class=\"imagelink\" rel=\"gallery_";
  stack1 = helpers.model || depth0.model
  stack1 = stack1.parent;
  stack1 = stack1.model;
  stack1 = stack1.id;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "model.parent.model.id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">\n        <img src=\"";
  stack1 = helpers.get_thumb_url || depth0.get_thumb_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "get_thumb_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"thumb\" />\n    </a>\n    <p class=\"notes\">";
  stack1 = helpers.notes || depth0.notes
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "notes", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.model || depth0.model
  stack1 = stack1.attributes;
  stack1 = stack1.url;
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_buttons, 'item_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['item_gallery_edit'] = templates['item_gallery_edit'] = Handlebars.templates['item_gallery_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this;


  buffer += "<input type=\"text\" data=\"title\" placeholder=\"Title\"/>\n    <input class=\"hasfile-only\" type=\"text\" data=\"file\" placeholder=\"File ID\"/>\n    <input class=\"nofile-only\" type=\"text\" data=\"image_url\" placeholder=\"Image URL\"/>\n    <input class=\"nofile-only\" type=\"text\" data=\"thumb_url\" placeholder=\"Thumbnail URL\"/>\n    <iframe class=\"uploader\"></iframe>\n    <input type=\"text\" data=\"url\" placeholder=\"Link URL\"/>\n    <textarea data=\"notes\" placeholder=\"Notes...\"/>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_edit_buttons, 'item_edit_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['item_gallery_title'] = templates['item_gallery_title'] = Handlebars.templates['item_gallery_title'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + ": ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        (<a target=\"_blank\" href=\"";
  stack1 = helpers.model || depth0.model
  stack1 = stack1.attributes;
  stack1 = stack1.url;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "model.attributes.url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\">link</a>)\n    ";
  return buffer;}

  buffer += "<b>\n        ";
  stack1 = helpers.title || depth0.title
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <span class=\"notes\">";
  stack1 = helpers.notes || depth0.notes
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "notes", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span>\n    </b>\n    ";
  stack1 = helpers.model || depth0.model
  stack1 = stack1.attributes;
  stack1 = stack1.url;
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  return templates;
});
define("hb!ui/dialogs/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['delete_dialog'] = templates['delete_dialog'] = Handlebars.templates['delete_dialog'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        the entire ";
  stack1 = helpers.type || depth0.type
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
  buffer += escapeExpression(stack1) + " entitled \"";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\"?\n    ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        this entire ";
  stack1 = helpers.type || depth0.type
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
  buffer += escapeExpression(stack1) + "?\n    ";
  return buffer;}

  buffer += "Are you SURE you want to permanently delete\n    ";
  stack1 = helpers.title || depth0.title
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  return templates;
});
define("hb!lecture/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['lecture_list'] = templates['lecture_list'] = Handlebars.templates['lecture_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            <li><a href=\"";
  stack1 = helpers.url || depth1.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n        ";
  return buffer;}

function program3(depth0,data) {
  
  
  return "<button class=\"add-button btn success\">Add lecture</button>";}

  buffer += "<h2>Lectures</h2>\n\n    <ul>\n        ";
  stack1 = helpers.collection || depth0.collection
  stack1 = stack1.models;
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program1, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n\n    ";
  stack1 = helpers._editor || depth0._editor
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['lecture'] = templates['lecture'] = Handlebars.templates['lecture'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"lecture-top\"></div>\n\n    <hr/>\n\n    <div class=\"lecture-page\"></div>";});
  Handlebars.partials['lecture_top'] = templates['lecture_top'] = Handlebars.templates['lecture_top'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n    <br/>\n    <div><b>Scheduled for:</b>\n    ";
  stack1 = helpers.scheduled || depth0.scheduled
  stack2 = helpers.join_with_commas || depth0.join_with_commas
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>\n    ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n    ";
  stack1 = depth0;
  stack2 = helpers.$date || depth0.$date
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "$date", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "\n    ";
  return buffer;}

function program4(depth0,data) {
  
  
  return "<button class=\"item-button edit-button btn success\">Edit lecture details</button>";}

  buffer += "<h2>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2>\n\n    <div class=\"description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n\n    ";
  stack1 = helpers.scheduled || depth0.scheduled
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    ";
  stack1 = helpers._editor || depth0._editor
  stack2 = helpers['if']
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['lecture_edit'] = templates['lecture_edit'] = Handlebars.templates['lecture_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<input class=\"span12\" type=\"text\" data=\"title\" placeholder=\"Lecture Title\"/>\n    <textarea class=\"span12\" data=\"description\" placeholder=\"Lecture Description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    <br/>\n    <div class=\"scheduled-dates\"></div>\n    <br/><br/>";
  return buffer;});
  Handlebars.partials['date_list'] = templates['date_list'] = Handlebars.templates['date_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "<b>Scheduled dates:</b>";}

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n        ";
  stack1 = depth0;
  stack2 = helpers.$date || depth0.$date
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "$date", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + " (<a index=\"";
  stack1 = helpers.index || depth0.index
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "index", { hash: {} }); }
  buffer += escapeExpression(stack1) + "\" class=\"remove-date\">remove</a>)<br/>\n    ";
  return buffer;}

  stack1 = helpers.dates || depth0.dates
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.dates || depth0.dates
  stack2 = helpers.each_with_index || depth0.each_with_index
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, tmp1); }
  else { stack1 = blockHelperMissing.call(depth0, stack2, stack1, tmp1); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <input type=\"hidden\" class=\"scheduled-date\"/>";
  return buffer;});
  return templates;
});
define("hb!page/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['page'] = templates['page'] = Handlebars.templates['page'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"contents\"></div>\n    <div class=\"navigation\">\n        <h4>Contents</h4>\n        <div class=\"nav-links\"></div>\n        <button class=\"page-button add-button btn success editor-only\">Add subpage</button>\n    </div>";});
  Handlebars.partials['page_nav_row'] = templates['page_nav_row'] = Handlebars.templates['page_nav_row'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<a href=\"";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "page/";
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/\">";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a>";
  return buffer;});
  return templates;
});
define("hb!assignment/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['assignment'] = templates['assignment'] = Handlebars.templates['assignment'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"assignment-top\"></div>\n\n    <hr/>\n\n    <div class=\"assignment-page\"></div>";});
  Handlebars.partials['assignment_top_edit'] = templates['assignment_top_edit'] = Handlebars.templates['assignment_top_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<input class=\"span12\" type=\"text\" data=\"title\" placeholder=\"Assignment Title\"/>\n    <textarea class=\"span12\" data=\"description\" placeholder=\"Assignment Description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    <br/>Due date: <input class=\"span3 due-date\">\n    <br/><br/>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_edit_buttons, 'item_edit_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['assignment_list'] = templates['assignment_list'] = Handlebars.templates['assignment_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n            <li><a href=\"";
  stack1 = helpers.url || depth1.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n        ";
  return buffer;}

  buffer += "<h2>Assignments</h2>\n    <ul>\n        ";
  stack1 = helpers.collection || depth0.collection
  stack1 = stack1.models;
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program1, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n\n    <span class=\"editor-only\"><button class=\"add-button btn success\">Add assignment</button></span>";
  return buffer;});
  Handlebars.partials['assignment_top'] = templates['assignment_top'] = Handlebars.templates['assignment_top'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "<br/><b>Due:</b> ";
  stack1 = helpers.due || depth0.due
  stack2 = helpers.$date || depth0.$date
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "$date", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "<br/>";
  return buffer;}

  buffer += "<h2 data=\"title\">";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2 >\n\n    <div class=\"description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n\n    ";
  stack1 = helpers.due || depth0.due
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    <span class=\"editor-only\"><button class=\"item-button edit-button btn success\">Edit assignment details</button></span>";
  return buffer;});
  return templates;
});
define("hb!nugget/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['nugget'] = templates['nugget'] = Handlebars.templates['nugget'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"nugget-top\"></div>\n    <hr/>\n    <div class=\"nugget-bottom\"></div>";});
  Handlebars.partials['nugget_top_edit'] = templates['nugget_top_edit'] = Handlebars.templates['nugget_top_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<input class=\"span12\" type=\"text\" data=\"title\" placeholder=\"Nugget Title\"/>\n    <textarea class=\"span12\" data=\"description\" placeholder=\"Nugget Description\">";
  stack1 = helpers.description || depth0.description
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    <p>Tags: <input type=\"text\" class=\"tags\" data=\"tags\"/></p>\n    <br/><br/>\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.item_edit_buttons, 'item_edit_buttons', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['nugget_list'] = templates['nugget_list'] = Handlebars.templates['nugget_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                ";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  stack2 = helpers['if']
  tmp1 = self.programWithDepth(program2, data, depth1);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;}
function program2(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<li><a href=\"";
  stack1 = helpers.url || depth2.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "......url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.slug || depth0.slug
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>";
  return buffer;}

  buffer += "<h2>Nuggets</h2>\n    \n    <p><i>Please use the tags and filters to review and quiz yourself on specific nuggets; to explore nuggets organized by lecture and cluster (subtopic), please use the \"<a href=\"/course/study/\">Study</a>\" tab.</i></p>\n    \n    <div class=\"nuggetlist\">\n        <ul>\n            ";
  stack1 = helpers.collection || depth0.collection
  stack1 = stack1.models;
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program1, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n        <span class=\"editor-only\"><button class=\"add-button btn success\">Add nugget</button></span>\n    </div>\n\n    <div class=\"tagselectorview\"></div>";
  return buffer;});
  Handlebars.partials['tag_selector'] = templates['tag_selector'] = Handlebars.templates['tag_selector'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "<li ";
  stack1 = helpers.selected || depth0.selected
  stack2 = helpers['if']
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "><a href='";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>";
  stack1 = helpers.text || depth0.text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>";
  return buffer;}
function program2(depth0,data) {
  
  
  return "class='active'";}

function program4(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "<a href='";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'><span class='label ";
  stack1 = helpers.selected || depth0.selected
  stack2 = helpers['if']
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>";
  stack1 = helpers.tagname || depth0.tagname
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "tagname", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span></a>";
  return buffer;}
function program5(depth0,data) {
  
  
  return "success";}

  buffer += "<div class='logged-in-only quizme'><a href ='";
  stack1 = helpers.quiz || depth0.quiz
  stack1 = stack1.url;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "quiz.url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' class='item-button btn primary quizme' title=\"Test yourself on the quiz questions in the selected nuggets\">Quiz Me (with Feedback)</a></br></br>\n    <a href ='";
  stack1 = helpers.test || depth0.test
  stack1 = stack1.url;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "test.url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' class='item-button btn danger quizme' title=\"Take a practice test on the selected nuggets\">Quiz Me (in Exam Mode)</a></div>\n    <div class=\"pagination logged-in-only\">\n        <ul>\n            ";
  stack1 = helpers.claimfilter || depth0.claimfilter
  stack2 = helpers.each
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n    </div>\n        ";
  stack1 = helpers.taglist || depth0.taglist
  stack2 = helpers.each
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['nugget_top'] = templates['nugget_top'] = Handlebars.templates['nugget_top'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<h2 data=\"title\"></h2 >\n\n    <div class=\"description\" data=\"description\"></div>\n\n    <br/>\n    <b>Tags:</b>\n    <span data=\"tags\">";
  stack1 = helpers.tags || depth0.tags
  stack2 = helpers.comma_join || depth0.comma_join
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "comma_join", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  buffer += escapeExpression(stack1) + "</span>\n    <br/>";
  stack1 = helpers.tags || depth0.tags
  stack2 = helpers.navlink || depth0.navlink
  if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
  else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "navlink", stack1, { hash: {} }); }
  else { stack1 = stack2; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    \n    <span class=\"probetoggle logged-in-only\"></span>\n\n    <span class=\"editor-only\"><button class=\"item-button edit-button btn success\">Edit nugget details</button></span>";
  return buffer;});
  Handlebars.partials['probe_enable'] = templates['probe_enable'] = Handlebars.templates['probe_enable'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<a href='";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "quiz/' class='item-button btn primary quizme'>Quiz Me</a>";
  return buffer;}

function program3(depth0,data) {
  
  
  return "<a href='#' class='item-button btn danger quizme unclaim'>Unclaim Nugget</a><div class=\"claimed\">Claimed!</div>";}

  stack1 = helpers.probeset || depth0.probeset
  stack1 = stack1.length;
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <span class='editor-only'><a href='";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "quiz/edit/' class='item-button btn success quizme'>Edit Probes</a></span>\n    ";
  stack1 = helpers.status || depth0.status
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
  Handlebars.partials['probe_disable'] = templates['probe_disable'] = Handlebars.templates['probe_disable'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<a href='";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "../' class='item-button btn danger quizme'>Exit Quiz</a>";
  return buffer;});
  Handlebars.partials['nugget_lecture_list'] = templates['nugget_lecture_list'] = Handlebars.templates['nugget_lecture_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <li id='";
  stack1 = helpers.lecture || depth0.lecture
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lecture", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'><a href='";
  stack1 = helpers.url || depth1.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "...url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "lecture/";
  stack1 = helpers.lecture || depth0.lecture
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lecture", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/' class='lecture ";
  stack1 = helpers.status || depth0.status
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "status", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'><div><p id='";
  stack1 = helpers.lecture || depth0.lecture
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lecture", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>";
  stack1 = helpers.title || depth0.title
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</p><div class='points'><p id='";
  stack1 = helpers.lecture || depth0.lecture
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lecture", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'><strong id='";
  stack1 = helpers.lecture || depth0.lecture
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lecture", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>";
  stack1 = helpers.points || depth0.points
  stack2 = helpers['if']
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</strong></p></div></div></a></li>\n            ";
  return buffer;}
function program2(depth0,data) {
  
  var stack1;
  stack1 = helpers.points || depth0.points
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "points", { hash: {} }); }
  return escapeExpression(stack1);}

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<h2>Total Points: ";
  stack1 = helpers.totalpoints || depth0.totalpoints
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "totalpoints", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h2>";
  return buffer;}

  buffer += "<h1>Lectures</h1>\n\n    <div id='studyapp' class='container'>\n    <div id='lectureview' class='view'>\n        <ul class='nav nav-pills'>\n            ";
  stack1 = helpers.lecture || depth0.lecture
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program1, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n    </div>\n    ";
  stack1 = helpers.totalpoints || depth0.totalpoints
  stack2 = helpers['if']
  tmp1 = self.program(4, program4, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;});
  Handlebars.partials['filtered_nugget_list'] = templates['filtered_nugget_list'] = Handlebars.templates['filtered_nugget_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <li><a href='";
  stack1 = helpers.root_url || depth0.root_url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "root_url", { hash: {} }); }
  buffer += escapeExpression(stack1) + "nuggets/";
  stack1 = helpers.slug || depth0.slug
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/' rel='tooltip' title='";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' class='nugget ";
  stack1 = helpers.status || depth0.status
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "status", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>\n        ";
  return buffer;}

  buffer += "<hr/>\n    <ul class='nav nav-pills'>\n        ";
  stack1 = helpers.nuggets || depth0.nuggets
  stack2 = helpers.each
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>";
  return buffer;});
  return templates;
});
define("hb!chat/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['chat'] = templates['chat'] = Handlebars.templates['chat'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "?name=";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1);
  return buffer;}

  buffer += "<iframe src=\"http://coursechatter.com/";
  stack1 = helpers.name || depth0.name
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"></iframe>";
  return buffer;});
  return templates;
});
define("hb!analytics/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['analytics'] = templates['analytics'] = Handlebars.templates['analytics'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div id=\"point-histogram\"></div>\n    \n    <table class=\"student-stats\"></table>\n    \n    <button class=\"btn success load-statistics\">Load Statistics</button>\n    \n    <button class=\"btn danger hide-student-details\">Hide Student Details</button>";});
  Handlebars.partials['student_stats_header'] = templates['student_stats_header'] = Handlebars.templates['student_stats_header'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<tr>\n        <th>Student email</th>\n        <th>Total points</th>\n        <th>Nuggets claimed</th>\n        <th>Nuggets attempted</th>\n        <th>Questions correct</th>\n        <th>Questions incorrect</th>\n        <th>Percent correct</th>\n    </tr>";});
  Handlebars.partials['student_stats_row'] = templates['student_stats_row'] = Handlebars.templates['student_stats_row'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  stack1 = helpers.percent || depth0.percent
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "percent", { hash: {} }); }
  buffer += escapeExpression(stack1) + "%";
  return buffer;}

  buffer += "<tr>\n        <td title=\"Student email\">";
  stack1 = helpers.email || depth0.email
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Total points\">";
  stack1 = helpers.total_points || depth0.total_points
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total_points", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Nuggets claimed\">";
  stack1 = helpers.claimed || depth0.claimed
  stack1 = stack1.length;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "claimed.length", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Nuggets attempted\">";
  stack1 = helpers.attempted || depth0.attempted
  stack1 = stack1.length;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attempted.length", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Questions correct\">";
  stack1 = helpers.correct || depth0.correct
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "correct", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Questions incorrect\">";
  stack1 = helpers.incorrect || depth0.incorrect
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "incorrect", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</td>\n        <td title=\"Percent correct\">";
  stack1 = helpers.percent || depth0.percent
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</td>\n    </tr>";
  return buffer;});
  return templates;
});
define("hb!file/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['filerow'] = templates['filerow'] = Handlebars.templates['filerow'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<img class='thumbnail' src='";
  stack1 = helpers.thumburl || depth0.thumburl
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "thumburl", { hash: {} }); }
  buffer += escapeExpression(stack1) + "' alt='Thumbnail' />\n            ";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<span class='label label-info'><i class='icon-";
  stack1 = helpers.type || depth0.type
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "type", { hash: {} }); }
  buffer += escapeExpression(stack1) + " icon-white'></i></span>\n            ";
  return buffer;}

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<span class='label label-warning'>";
  stack1 = depth0;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</span> ";
  return buffer;}

  buffer += "<div class='row-fluid file'>\n        <div class='span2'>\n            ";
  stack1 = helpers.thumburl || depth0.thumburl
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n        <div class='span6 display'>\n            <h3><fn class='filename'>";
  stack1 = helpers.name || depth0.name
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "name", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</fn>\n                <button class='btn btn-danger trash'>\n                    <i class='icon-trash icon-white'></i>\n                </button>\n            </h3>\n        </div>\n        <div class='span6 edit'>\n            <input class='fileinput' type='text' value='' />\n        </div>\n        <div class='span4'>\n            <div class='tags'>\n                ";
  stack1 = helpers.tags || depth0.tags
  stack2 = helpers.each
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n        </div>\n    </div>";
  return buffer;});
  Handlebars.partials['filebrowser'] = templates['filebrowser'] = Handlebars.templates['filebrowser'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class='row-fluid filelist'>\n        <div class='row-fluid'>\n            <div class='span8'>\n                <ul class='nav nav-pills'>\n                    <li><a class='selectors' id='all'>All</a></li>\n                    <li><a class='selectors' id='picture'>Images</a></li>\n                    <li><a class='selectors' id='file'>Documents</a></li>\n                    <li><a class='selectors' id='th-large'>Misc</a></li>\n                </ul>\n            </div>\n            <div class='span4'>\n                <ul class='nav nav-pills'>\n                    <li class='dropdown'><a class='dropdown-toggle taghead' data-toggle='dropdown'>Tags<b class='caret'></b></a>\n                        <ul class='dropdown-menu taglist'>\n                        </ul>\n                    </li>\n                </ul>\n            </div>\n        </div>\n    </div>\n    <div class='btn-group' id='upchoose'>\n        <iframe class='uploader'></iframe>\n        <button class='btn' id='select'>Use This File</button>\n    </div>";});
  return templates;
});
define("hb!probe/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['probe_container'] = templates['probe_container'] = Handlebars.templates['probe_container'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this;

function program1(depth0,data) {
  
  
  return "<button class='button btn danger skipbutton'>Skip Question</button>";}

  buffer += "<div class='probe container'>\n        <div class='timer'></div>\n        <div class='probequestion container'></div>\n        <button class='button btn success answerbtn'>Submit Answer</button>\n        ";
  stack1 = helpers.allowskipping || depth0.allowskipping
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </div>";
  return buffer;});
  Handlebars.partials['probe'] = templates['probe'] = Handlebars.templates['probe'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<h6>Nugget: ";
  stack1 = helpers.nuggettitle || depth0.nuggettitle
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "nuggettitle", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h6>";
  return buffer;}

  buffer += "<h6>Question ";
  stack1 = helpers.increment || depth0.increment
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "increment", { hash: {} }); }
  buffer += escapeExpression(stack1) + " out of ";
  stack1 = helpers.total || depth0.total
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "total", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h6>\n    ";
  stack1 = helpers.nuggettitle || depth0.nuggettitle
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <h3 class='question'>";
  stack1 = helpers.question_text || depth0.question_text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "question_text", { hash: {} }); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h3>\n    <ol class='answerlist'>\n        </ol>\n    <div class='proberesponse container'>\n        <div class='header'>\n            <h3 class='questionstatus'></h3>\n            <div class='feedback' id='qfeedback'>\n            </div>\n            <button class='button btn success nextquestion'>Next Question</button>\n            <button class='button btn primary' id='feedbut'>View Feedback</button>\n        </div>\n    </div>";
  return buffer;});
  Handlebars.partials['probe_answer'] = templates['probe_answer'] = Handlebars.templates['probe_answer'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<li class='answer'>\n        <div class='answertext'>";
  stack1 = helpers.text || depth0.text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</div>\n        <div class='checkorcross'></div>\n        <div class='feedback'></div>\n    </li>";
  return buffer;});
  Handlebars.partials['probe_edit'] = templates['probe_edit'] = Handlebars.templates['probe_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var stack1;
  stack1 = helpers.question_text || depth0.question_text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "question_text", { hash: {} }); }
  return escapeExpression(stack1);}

function program3(depth0,data) {
  
  
  return "&nbsp;";}

function program5(depth0,data) {
  
  var stack1;
  stack1 = helpers.feedback || depth0.feedback
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "feedback", { hash: {} }); }
  return escapeExpression(stack1);}

function program7(depth0,data) {
  
  
  return "&nbsp;";}

function program9(depth0,data) {
  
  var stack1;
  stack1 = helpers.feedback || depth0.feedback
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "feedback", { hash: {} }); }
  return escapeExpression(stack1);}

function program11(depth0,data) {
  
  
  return "&nbsp;";}

  buffer += "<div class='probeedit container'>\n    <h5>Question:</h5>\n    <div class='display question'>\n        <h3>";
  stack1 = helpers.question_text || depth0.question_text
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h3>\n    </div>\n    <div class='question edit'>\n        <textarea class='input-xlarge question_text' type='text' rows='3'>";
  stack1 = helpers.question_text || depth0.question_text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "question_text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n    </div>\n    <h5>Feedback:</h5>\n    <div class='display questionfeedback'>\n        <p>";
  stack1 = helpers.feedback || depth0.feedback
  stack2 = helpers['if']
  tmp1 = self.program(5, program5, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(7, program7, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n    </div>\n    <div class='edit questionfeedback'>\n        <textarea class='input-xlarge feedback_text' type='text' rows='3'>";
  stack1 = helpers.feedback || depth0.feedback
  stack2 = helpers['if']
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(11, program11, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</textarea>\n    </div>\n    <div class='row'>\n    <ul class='answerlist'>\n    <li>\n        <div class='row'>\n            <div class='span8'>\n                <h5>Answer Text</h5>\n            </div>\n            <div class='span1'>\n                <p>Correct?</p>\n            </div>\n            <div class='span1'>\n                <p>Delete<p>\n            </div>\n\n        </div>\n    </li>\n    </ul>\n    </div>\n    <button class='btn primary addanswer'>Add Answer</button><br/><br/>\n    <button class='btn success save'>Save</button>\n    <button class='btn danger cancel'>Cancel</button>\n</div>";
  return buffer;});
  Handlebars.partials['probe_answer_edit'] = templates['probe_answer_edit'] = Handlebars.templates['probe_answer_edit'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "checked='checked'";}

function program3(depth0,data) {
  
  
  return " ";}

function program5(depth0,data) {
  
  
  return " hidden ";}

function program7(depth0,data) {
  
  var stack1;
  stack1 = helpers.feedback || depth0.feedback
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "feedback", { hash: {} }); }
  return escapeExpression(stack1);}

function program9(depth0,data) {
  
  
  return "&nbsp;";}

function program11(depth0,data) {
  
  
  return "checked='checked'";}

  buffer += "<li><div class='row'>\n            <div class='span8'>\n                <div class='text answer display'>\n                    <p>";
  stack1 = helpers.text || depth0.text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</p>\n                </div>\n                <div class='text answer edit'>\n                    <input class='answertext' type='text' value='";
  stack1 = helpers.text || depth0.text
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "text", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'></input>\n                </div>\n                <h6 class='inline'>Answer Feedback?</h6><input class='answerfeedback' type='checkbox' ";
  stack1 = helpers.feedback || depth0.feedback
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "value='answerfeedback'></input>\n                <div class='text display feedback feedback_text";
  stack1 = helpers.feedback || depth0.feedback
  stack2 = helpers['if']
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(5, program5, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "'>\n                    <p>";
  stack1 = helpers.feedback || depth0.feedback
  stack2 = helpers['if']
  tmp1 = self.program(7, program7, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(9, program9, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\n                </div>\n                <div class='text edit feedback'>\n                    <textarea class='input answerfeedbacktext' type='text' rows='2'>";
  stack1 = helpers.feedback || depth0.feedback
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "feedback", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</textarea>\n                </div>\n            </div>\n            <div class='span1 middlealign'>\n                <input class='check_correct' type='checkbox' value='correct' ";
  stack1 = helpers.correct || depth0.correct
  stack2 = helpers['if']
  tmp1 = self.program(11, program11, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "></input>\n            </div>\n            <div class='span1 middlealign'>\n                <button class=\"section-button delete-button btn danger\">X</button>\n            </div>\n\n        </div>\n        </li>";
  return buffer;});
  Handlebars.partials['probe_list'] = templates['probe_list'] = Handlebars.templates['probe_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n            <li><a href='";
  stack1 = helpers.id || depth0.id
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
  buffer += escapeExpression(stack1) + "'>";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.question_text;
  stack2 = helpers['if']
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(4, program4, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a></li>\n        ";
  return buffer;}
function program2(depth0,data) {
  
  var stack1;
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.question_text;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.question_text", { hash: {} }); }
  return escapeExpression(stack1);}

function program4(depth0,data) {
  
  
  return "No Title";}

  buffer += "<h2>Probes</h2>\n    <ul>\n        ";
  stack1 = helpers.collection || depth0.collection
  stack1 = stack1.models;
  stack2 = helpers.each
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    </ul>\n\n    <span class=\"editor-only\"><button class=\"add-button btn success\">Add Probe</button></span>";
  return buffer;});
  Handlebars.partials['nugget_review_list'] = templates['nugget_review_list'] = Handlebars.templates['nugget_review_list'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "<h4>Consider Reviewing these Nuggets</h4>";}

function program3(depth0,data) {
  
  
  return "<h3>Congratulations! You got those all correct!</h3>";}

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                ";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  stack2 = helpers['if']
  tmp1 = self.programWithDepth(program6, data, depth1);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;}
function program6(depth0,data,depth2) {
  
  var buffer = "", stack1;
  buffer += "<li><a href=\"../";
  stack1 = helpers.url || depth2.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "......url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.slug || depth0.slug
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "slug", { hash: {} }); }
  buffer += escapeExpression(stack1) + "/\" target=\"_blank\">";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</a></li>";
  return buffer;}

function program8(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "?tags=";
  stack1 = helpers.query || depth0.query
  stack1 = stack1.tags;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "query.tags", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.query || depth0.query
  stack1 = stack1.claimed;
  stack2 = helpers['if']
  tmp1 = self.program(9, program9, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;}
function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "&claimed=";
  stack1 = helpers.query || depth0.query
  stack1 = stack1.claimed;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "query.claimed", { hash: {} }); }
  buffer += escapeExpression(stack1);
  return buffer;}

function program11(depth0,data) {
  
  var stack1, stack2;
  stack1 = helpers.query || depth0.query
  stack1 = stack1.claimed;
  stack2 = helpers['if']
  tmp1 = self.program(12, program12, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }}
function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "?claimed=";
  stack1 = helpers.query || depth0.query
  stack1 = stack1.claimed;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "query.claimed", { hash: {} }); }
  buffer += escapeExpression(stack1);
  return buffer;}

  stack1 = helpers.collection || depth0.collection
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(3, program3, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    <h5>Total points attained: ";
  stack1 = helpers.earnedpoints || depth0.earnedpoints
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "earnedpoints", { hash: {} }); }
  buffer += escapeExpression(stack1) + " out of ";
  stack1 = helpers.totalpoints || depth0.totalpoints
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "totalpoints", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</h5>\n    \n    <div class=\"nuggetlist\">\n        <ul>\n            ";
  stack1 = helpers.collection || depth0.collection
  stack1 = stack1.models;
  stack2 = helpers.each
  tmp1 = self.programWithDepth(program5, data, depth0);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </ul>\n        <a href=\"../";
  stack1 = helpers.url || depth0.url
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "url", { hash: {} }); }
  buffer += escapeExpression(stack1);
  stack1 = helpers.query || depth0.query
  stack1 = stack1.tags;
  stack2 = helpers['if']
  tmp1 = self.program(8, program8, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(11, program11, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"<p>Return to Nugget List</p></a>\n    </div>";
  return buffer;});
  Handlebars.partials['exam_entry_screen'] = templates['exam_entry_screen'] = Handlebars.templates['exam_entry_screen'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class='logged-in-only'>\n        <p>You have claimed nuggets totalling ";
  stack1 = helpers.points || depth0.points
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "points", { hash: {} }); }
  buffer += escapeExpression(stack1) + " points.</p>\n        <p>If you get every single question correct, you will get a grade of ";
  stack1 = helpers.grade || depth0.grade
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "grade", { hash: {} }); }
  buffer += escapeExpression(stack1) + ".</p>\n        <p>Enter the 4-Digit code here; do not begin the exam before 3pm.</p>\n        <input class='entrycode' type='text' value=''></input>\n        <p>You may choose to take the exam you have constructed through claiming, or you may take a generic exam that is composed of questions worth 350 points taken from the course. Once you make this choice, this will be the exam you take, so choose wisely.</p>\n        <span><button class='btn primary large claimed'>Take My Claimed Exam</button>\n        <button class='btn info large generic'>Take Generic Exam</button></span>\n    </div>";
  return buffer;});
  return templates;
});
define("hb!grade/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['grades'] = templates['grades'] = Handlebars.templates['grades'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n    <h3>Your Score</h3>\n    ";
  stack1 = helpers.models || depth0.models
  stack2 = helpers.each
  tmp1 = self.program(2, program2, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<b>";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.title;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.title", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</b>: score of ";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.points;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.points", { hash: {} }); }
  buffer += escapeExpression(stack1) + " points, which is a grade of ";
  stack1 = helpers.attributes || depth0.attributes
  stack1 = stack1.grade;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "attributes.grade", { hash: {} }); }
  buffer += escapeExpression(stack1) + "<br/>";
  return buffer;}

function program4(depth0,data) {
  
  
  return "\n    <p>You do not yet have a score assigned for the midterm (or it is still loading...)</p>\n    ";}

  stack1 = helpers.models || depth0.models
  stack1 = stack1.length;
  stack2 = helpers['if']
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.program(4, program4, data);
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n    <br/><br/><br/>\n\n    <h3>Midterm Grading Scheme</h3>\n    <table style=\"width: 250px; padding: \">\n        <tr valign=top>\n            <td>\n                <p><b>Letter grade</b></p>\n            </td>\n            <td>\n                <p><b>Midterm score</b></p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>A+</p>\n            </td>\n            <td>\n                <p>&gt;= 188</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>A</p>\n            </td>\n            <td>\n                <p>180 - 187</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>A-</p>\n            </td>\n            <td>\n                <p>174 - 179</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>B+</p>\n            </td>\n            <td>\n                <p>168 - 173</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>B</p>\n            </td>\n            <td>\n                <p>160 - 167</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>B-</p>\n            </td>\n            <td>\n                <p>157 - 159</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>C+</p>\n            </td>\n            <td>\n                <p>154 - 156</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>C</p>\n            </td>\n            <td>\n                <p>150 -153</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>C-</p>\n            </td>\n            <td>\n                <p>147 - 149</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>D</p>\n            </td>\n            <td>\n                <p>137 - 146</p>\n            </td>\n        </tr>\n        <tr valign=top>\n            <td>\n                <p>F</p>\n            </td>\n            <td>\n                <p>&lt;= 136</p>\n            </td>\n        </tr>\n    </table>";
  return buffer;});
  return templates;
});
define("hb!auth/templates.handlebars", function() {
  var templates = {};
  Handlebars.templates = Handlebars.templates || {};
  Handlebars.partials['login'] = templates['login'] = Handlebars.templates['login'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<input type=\"text\" class=\"email\" placeholder=\"Email\"/>\n    <input type=\"password\" class=\"password\" placeholder=\"Password\"/>\n    <a class=\"btn login-button\">Login</a>";});
  Handlebars.partials['logout'] = templates['logout'] = Handlebars.templates['logout'] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "Logged in as ";
  stack1 = helpers.email || depth0.email
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
  buffer += escapeExpression(stack1) + " <a class=\"btn logout-button\">Logout</a>";
  return buffer;});
  return templates;
});
define('less',[],function() {	
 
 		
    return {
        load: function() {}
    }	
	
})

;
define('less!libs/bootstrap/bootstrap', function() { return; });
define('less!app/styles', function() { return; });
define('less!base/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!base/views',["cs!./modelbinding", "less!./styles"], function(modelbinding) {
    var BaseView, GenericTemplateView, LoadingView, NavRouterView, RouterView;
    BaseView = (function() {
      __extends(BaseView, Backbone.View);
      BaseView.prototype.events = function() {
        return {};
      };
      function BaseView(options) {
        var eventobject;
        if (options == null) {
          options = {};
        }
        this.mementoRestore = __bind(this.mementoRestore, this);
        this.mementoStore = __bind(this.mementoStore, this);
        this.enablePlaceholders = __bind(this.enablePlaceholders, this);
        this.updateWidth = __bind(this.updateWidth, this);
        this.context = __bind(this.context, this);
        this.close_subview = __bind(this.close_subview, this);
        this.add_subview = __bind(this.add_subview, this);
        this.add_lazy_subview = __bind(this.add_lazy_subview, this);
        this.navigateToShow = __bind(this.navigateToShow, this);
        this.navigate = __bind(this.navigate, this);
        this.close = __bind(this.close, this);
        this.hide = __bind(this.hide, this);
        this.show = __bind(this.show, this);
        this.bind_data = __bind(this.bind_data, this);
        this.bind_links = __bind(this.bind_links, this);
        this.getClassName = __bind(this.getClassName, this);
        this.subviews = {};
        if (!(this.events instanceof Function)) {
          eventobject = this.events;
          this.events = __bind(function() {
            return eventobject;
          }, this);
        }
        BaseView.__super__.constructor.apply(this, arguments);
        this.$el.addClass(this.getClassName());
        this.nonpersistent = options.nonpersistent || false;
        this.visible = true;
        if (options && options.visible === false) {
          this.hide();
        }
        if (options != null ? options.url : void 0) {
          this.url = options.url;
        }
        this.bind_links();
        this.closed = false;
      }
      BaseView.prototype.getClassName = function() {
        return this.constructor.name || this.constructor.toString().match(/^function\s(.+)\(/)[1];
      };
      BaseView.prototype.bind_links = function() {
        return this.$el.on("click", "a", function(ev) {
          var pathname, _ref;
          pathname = "/" + ev.currentTarget.pathname.replace(/^\/+/, "") + ev.currentTarget.search;
          if (ev.shiftKey || ev.ctrlKey) {
            return true;
          }
          if (ev.currentTarget.origin !== document.location.origin || ev.currentTarget.target === "_blank" || ((_ref = pathname.split("/")[1]) !== "course" && _ref !== "src")) {
            ev.currentTarget.target = "_blank";
            return true;
          }
          require("app").navigate(pathname);
          return false;
        });
      };
      BaseView.prototype.bind_data = function() {
        if (!(this.model instanceof Backbone.Model)) {
          throw new Error("View must have a model attached before you can bind_data");
        }
        return this.$("[data][data!='']").each(__bind(function(ind, el) {
          var $el, attr, elChanged;
          $el = $(el);
          attr = $el.attr("data");
          switch (el.tagName.toLowerCase()) {
            case "input":
            case "textarea":
            case "select":
              $el.val(this.model.get(attr));
              elChanged = __bind(function() {
                var newdata;
                newdata = {};
                newdata[attr] = $(el).val();
                return this.model.set(newdata);
              }, this);
              $(el).change(elChanged);
              $(el).keyup(elChanged);
              return this.model.bind("change:" + attr, __bind(function() {
                if (!$el.is(":focus")) {
                  return $el.val(this.model.get(attr));
                }
              }, this));
            default:
              $(el).text(this.model.get(attr));
              return this.model.bind("change:" + attr, __bind(function() {
                return $el.text(this.model.get(attr));
              }, this));
          }
        }, this));
      };
      BaseView.prototype.show = function() {
        if (!this.visible) {
          this.visible = true;
          return this.$el.show();
        }
      };
      BaseView.prototype.hide = function() {
        if (this.visible) {
          this.visible = false;
          if (this.nonpersistent) {
            return this.close();
          } else {
            return this.$el.hide();
          }
        }
      };
      BaseView.prototype.close = function() {
        var name, subview, _ref;
        this.closed = true;
        this.off();
        this.remove();
        Backbone.ModelBinding.unbind(this);
        _ref = this.subviews;
        for (name in _ref) {
          subview = _ref[name];
          if (typeof subview.close === "function") {
            subview.close();
          }
        }
        return this;
      };
      BaseView.prototype.navigate = function(fragment, query) {
        var name, subview, _ref;
        if (query == null) {
          query = {};
        }
        this.fragment = fragment;
        this.query = query;
        _ref = this.subviews;
        for (name in _ref) {
          subview = _ref[name];
          subview.navigate(fragment, query);
        }
        return false;
      };
      BaseView.prototype.navigateToShow = function() {
        if (this.url) {
          return require("app").navigate((typeof this.url === "function" ? this.url() : void 0) || this.url);
        }
      };
      BaseView.prototype.add_lazy_subview = function(options, callback) {
        var create_subview_if_ready, key, subview_created, viewoptions, _i, _len, _ref;
        if (options == null) {
          options = {};
        }
        if (!options.view) {
          clog(this, options);
          throw Error("You must specify a view class when calling add_lazy_subview");
        }
        if (options.datasource === "model" && !(this.model instanceof Backbone.Model)) {
          throw Error("The parent view must already have @model instantiated when add_subview called with datasource 'model':", this);
        }
        if (options.datasource === "collection" && !(this.collection instanceof Backbone.Collection)) {
          throw Error("The parent view must already have @collection instantiated when add_subview called with datasource 'collection'", this);
        }
        viewoptions = _.clone(options);
        _ref = ['datasource', 'view', 'key'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          delete viewoptions[key];
        }
        subview_created = false;
        create_subview_if_ready = __bind(function() {
          var do_create_subview, obj, xhdr, _ref2, _ref3;
          if (subview_created) {
            return;
          }
          do_create_subview = __bind(function() {
            var subview;
            subview = new options.view(viewoptions);
            this.add_subview(options.name, subview, options.target);
            subview_created = true;
            if (typeof callback === "function") {
              callback(subview);
            }
            return $("body").removeClass("wait");
          }, this);
          if (options.key) {
            obj = (_ref2 = this[options.datasource]) != null ? typeof _ref2.get === "function" ? _ref2.get(options.key) : void 0 : void 0;
          } else if (_.isNumber(options.index)) {
            obj = (_ref3 = this[options.datasource]) != null ? typeof _ref3.at === "function" ? _ref3.at(options.index) : void 0 : void 0;
          } else if (options.datasource) {
            obj = this[options.datasource];
          } else {
            do_create_subview();
          }
          if (obj instanceof Backbone.Model) {
            viewoptions.model = obj;
            if (!obj.loaded()) {
              $("body").addClass("wait");
              xhdr = obj.fetch();
              if (xhdr != null ? xhdr.success : void 0) {
                return xhdr.success(do_create_subview);
              } else {
                return do_create_subview();
              }
            } else {
              return do_create_subview();
            }
          } else if (obj instanceof Backbone.Collection) {
            viewoptions.collection = obj;
            return do_create_subview();
          }
        }, this);
        create_subview_if_ready();
        if (!subview_created) {
          this.add_subview(options.name, new LoadingView, options.target);
          if (options.datasource === "model") {
            return this.model.bind("change:" + options.key, create_subview_if_ready);
          } else if (options.datasource === "collection") {
            this.collection.bind("add", create_subview_if_ready);
            return this.collection.bind("change", create_subview_if_ready);
          }
        }
      };
      BaseView.prototype.add_subview = function(name, view, element) {
        var target, _base;
        if (name in this.subviews) {
          if (typeof (_base = this.subviews[name]).close === "function") {
            _base.close();
          }
        }
        view.parent = this;
        view.url || (view.url = this.url);
        this.subviews[name] = view;
        view.fragment = this.fragment;
        view.query = this.query;
        if (element) {
          target = this.$(element);
          if (!target.length) {
            target = $(element);
          }
        } else {
          target = this.$el;
        }
        view.render();
        target.append(view.el);
        return view;
      };
      BaseView.prototype.close_subview = function(name) {
        var _ref;
        if ((_ref = this.subviews[name]) != null) {
          if (typeof _ref.close === "function") {
            _ref.close();
          }
        }
        return delete this.subviews[name];
      };
      BaseView.prototype.context = function(extra) {
        var data, _ref, _ref2, _ref3, _ref4, _ref5;
        data = _.extend({}, this);
        if (this.model) {
          data = _.extend(data, this.model != null);
        }
        if (this.model) {
          data = _.extend(data, (_ref = this.model) != null ? _ref.attributes : void 0);
        }
        _.extend(data, extra);
        if (this.url) {
          data['url'] = this.url;
        }
        if (this.model) {
          data['model'] = this.model;
        }
        if (this.collection) {
          data['collection'] = this.collection;
        }
        if (this.collection) {
          data['models'] = this.collection.models;
        }
        data['course'] = ((_ref2 = require("app")) != null ? (_ref3 = _ref2.get("course")) != null ? _ref3.attributes : void 0 : void 0) || {};
        data['user'] = ((_ref4 = require("app")) != null ? (_ref5 = _ref4.get("user")) != null ? _ref5.attributes : void 0 : void 0) || {};
        if (this.model) {
          data['id'] = this.model.get(Backbone.Model.prototype.idAttribute);
        }
        return data;
      };
      BaseView.prototype.updateWidth = function() {
        var width, _base;
        this.$el.attr("class", this.$el[0].className.replace(/\w*\bspan\d+\b/g, ""));
        width = Math.max((typeof (_base = this.model).getWidth === "function" ? _base.getWidth() : void 0) || this.model.get("width") || 4, this.minwidth || 2);
        if (isFinite(width)) {
          this.$el.addClass("span" + width);
        }
        return require("app").trigger("resized");
      };
      BaseView.prototype.enablePlaceholders = function() {
        return this.$("[placeholder]").each(function(ind, el) {
          $(el).watermark($(el).attr("placeholder"), {});
          return $(el).attr("title", $(el).attr("placeholder"));
        });
      };
      BaseView.prototype.mementoStore = function() {
        var key, params;
        if (!this.model) {
          return;
        }
        if (!this.memento) {
          params = {
            ignore: ((function() {
              var _results;
              if (this.model.relations) {
                _results = [];
                for (key in this.model.relations) {
                  _results.push(key);
                }
                return _results;
              }
            }).call(this)) || []
          };
          this.memento = new Backbone.Memento(this.model, params);
        }
        return this.memento.store();
      };
      BaseView.prototype.mementoRestore = function() {
        var _ref;
        return (_ref = this.memento) != null ? _ref.restore() : void 0;
      };
      return BaseView;
    })();
    LoadingView = (function() {
      __extends(LoadingView, BaseView);
      function LoadingView() {
        this.render = __bind(this.render, this);
        LoadingView.__super__.constructor.apply(this, arguments);
      }
      LoadingView.prototype.render = function() {
        return this.$el.html("<b>Loading...</b>");
      };
      return LoadingView;
    })();
    GenericTemplateView = (function() {
      __extends(GenericTemplateView, BaseView);
      function GenericTemplateView(options) {
        this.render = __bind(this.render, this);        if (!(options.template instanceof Function)) {
          throw "GenericTemplateView's constructor must be passed an options.template.";
        }
        this.template = options.template;
        GenericTemplateView.__super__.constructor.apply(this, arguments);
      }
      GenericTemplateView.prototype.render = function() {
        return this.$el.html(this.template(this.context()));
      };
      return GenericTemplateView;
    })();
    RouterView = (function() {
      __extends(RouterView, BaseView);
      RouterView.prototype._routeToRegExp = Backbone.Router.prototype._routeToRegExp;
      function RouterView() {
        this.navigate = __bind(this.navigate, this);
        this.route = __bind(this.route, this);
        var callback, route, _ref;
        this.handlers = [];
        this.subviews = {};
        this.routes = (typeof this.routes === "function" ? this.routes() : void 0) || this.routes;
        _ref = this.routes;
        for (route in _ref) {
          callback = _ref[route];
          this.route(route, callback);
        }
        RouterView.__super__.constructor.apply(this, arguments);
      }
      RouterView.prototype.route = function(route, callback) {
        if (_.isString(callback)) {
          callback = this[callback];
        }
        if (!_.isRegExp(route)) {
          route = this._routeToRegExp(route);
        }
        route = new RegExp("(" + route.source.replace("$", "") + ")(.*)$", "i");
        return this.handlers.unshift({
          route: route,
          callback: function(fragment) {
            return callback.apply(null, route.exec(fragment).slice(2, -1));
          },
          get_match: function(fragment) {
            return route.exec(fragment)[1];
          },
          get_splat: function(fragment) {
            return route.exec(fragment).slice(-1)[0];
          }
        });
      };
      RouterView.prototype.navigate = function(fragment, query) {
        var handler, match, show_and_navigate, splat, subview, subviewoptions, _i, _len, _ref;
        if (query == null) {
          query = {};
        }
        this.query = query;
        _ref = this.handlers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          handler = _ref[_i];
          if (handler.route.test(fragment)) {
            match = handler.get_match(fragment);
            splat = handler.get_splat(fragment);
            this.fragment = match + splat;
            subview = this.subviews[match];
            show_and_navigate = __bind(function(subview) {
              var route, success, view, _ref2;
              _ref2 = this.subviews;
              for (route in _ref2) {
                view = _ref2[route];
                if (!(view === subview)) {
                  view.hide();
                }
              }
              if (subview != null) {
                if (typeof subview.show === "function") {
                  subview.show();
                }
              }
              return success = subview.navigate(splat, query);
            }, this);
            if (subview && !subview.closed) {
              show_and_navigate(subview);
            } else {
              subviewoptions = handler.callback(fragment);
              subviewoptions.url = this.url + match;
              subviewoptions.name = match;
              this.add_lazy_subview(subviewoptions, show_and_navigate);
            }
            return true;
          }
        }
        return false;
      };
      return RouterView;
    })();
    NavRouterView = (function() {
      __extends(NavRouterView, BaseView);
      NavRouterView.prototype.tagName = "ul";
      NavRouterView.prototype.childTagName = "li";
      function NavRouterView() {
        this.navigate = __bind(this.navigate, this);
        this.render = __bind(this.render, this);
        this.removeItem = __bind(this.removeItem, this);
        this.addItem = __bind(this.addItem, this);
        this.createUrl = __bind(this.createUrl, this);        this.collection = new Backbone.Collection;
        NavRouterView.__super__.constructor.apply(this, arguments);
      }
      NavRouterView.prototype.createUrl = function(slugs) {
        var slug, url, _i, _len;
        if (slugs instanceof Backbone.Model) {
          slugs = (typeof slugs.slug === "function" ? slugs.slug() : void 0) || slugs.get("slug") || slugs.get("slugs") || "";
        }
        url = this.url + this.pattern;
        if (_.isString(slugs)) {
          slugs = [slugs];
        }
        for (_i = 0, _len = slugs.length; _i < _len; _i++) {
          slug = slugs[_i];
          url = url.replace(/:\w+/, slug);
        }
        url = url.replace(/:\w+\/$/, "");
        url = url.replace("//", "/");
        return url;
      };
      NavRouterView.prototype.addItem = function(slug, title, tooltip) {
        if (tooltip == null) {
          tooltip = "";
        }
        this.collection.add({
          slug: slug,
          title: title || (slug.substr(0, 1).toUpperCase() + slug.substr(1)),
          tooltip: tooltip
        });
        return this.render();
      };
      NavRouterView.prototype.removeItem = function(slug) {
        return this.render();
      };
      NavRouterView.prototype.render = function() {
        var html, model, _i, _len, _ref;
        html = "";
        _ref = this.collection.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          html += "<" + this.childTagName + " title='" + (model.get('tooltip')) + "'><a href='" + (this.createUrl(model)) + "'>" + (model.get('title')) + "</a></" + this.childTagName + ">";
        }
        this.$el.html(html);
        return this.navigate(this.subfragment, this.query);
      };
      NavRouterView.prototype.navigate = function(fragment, query) {
        var a, links, path, pathname, selected, _i, _len;
        if (query == null) {
          query = {};
        }
        if (!fragment) {
          return;
        }
        this.subfragment = fragment;
        this.query = query;
        this.$("a, " + this.childTagName).removeClass("active");
        path = this.url + fragment;
        selected = null;
        links = this.$("a");
        for (_i = 0, _len = links.length; _i < _len; _i++) {
          a = links[_i];
          pathname = "/" + a.pathname.replace(/^\//, "");
          if (path.slice(0, pathname.length) === pathname) {
            if (!selected || a.pathname.length > selected.pathname.length) {
              selected = a;
            }
          }
        }
        if (selected) {
          $(selected).addClass("active");
          return $(selected).parents(this.childTagName).first().addClass("active");
        }
      };
      return NavRouterView;
    })();
    return {
      BaseView: BaseView,
      GenericTemplateView: GenericTemplateView,
      RouterView: RouterView,
      NavRouterView: NavRouterView
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!content/items/views',["cs!base/views", "hb!./templates.handlebars"], function(baseviews, templates) {
    var ItemDisplayView, ItemEditInlineView, ItemEditPopupView, ItemEditView, ItemView;
    ItemView = (function() {
      __extends(ItemView, baseviews.BaseView);
      function ItemView() {
        this["delete"] = __bind(this["delete"], this);
        this.edit = __bind(this.edit, this);
        this.hideActionButtons = __bind(this.hideActionButtons, this);
        this.showActionButtons = __bind(this.showActionButtons, this);
        ItemView.__super__.constructor.apply(this, arguments);
      }
      ItemView.prototype.tagName = "span";
      ItemView.prototype.className = "ItemView";
      ItemView.prototype.render = function() {
        this.$el.html("");
        this.add_subview("displayview", new this.DisplayView({
          model: this.model
        }));
        this.$el.append(templates.item_buttons());
        return this.updateWidth();
      };
      ItemView.prototype.events = function() {
        return {
          "click .edit-button": "edit",
          "click .delete-button": "delete",
          "mouseenter": "showActionButtons",
          "mouseleave": "hideActionButtons"
        };
      };
      ItemView.prototype.initialize = function() {
        if (!this.DisplayView) {
          throw new Error(this.getClassName() + " does not have a DisplayView specified (must be a subclass of ItemDisplayView).");
        }
        if (!this.EditView) {
          throw new Error(this.getClassName() + " does not have an EditView specified (must be a subclass of ItemEditView).");
        }
        return this.model.bind("change:width", this.updateWidth);
      };
      ItemView.prototype.showActionButtons = function() {
        if (this.subviews.editview && !this.subviews.editview.closed) {
          return;
        }
        return this.$(".item-button").show();
      };
      ItemView.prototype.hideActionButtons = function() {
        return this.$(".item-button").hide();
      };
      ItemView.prototype.edit = function() {
        this.hideActionButtons();
        this.add_subview("editview", new this.EditView({
          model: this.model
        }));
        if (this.subviews.editview instanceof ItemEditInlineView) {
          this.subviews.displayview.hide();
        }
        return false;
      };
      ItemView.prototype["delete"] = function() {
        this.model.destroy();
        return false;
      };
      return ItemView;
    })();
    ItemDisplayView = (function() {
      __extends(ItemDisplayView, baseviews.BaseView);
      function ItemDisplayView() {
        this.close = __bind(this.close, this);
        this.render = __bind(this.render, this);
        ItemDisplayView.__super__.constructor.apply(this, arguments);
      }
      ItemDisplayView.prototype.className = "ItemDisplayView";
      ItemDisplayView.prototype.render = function() {};
      ItemDisplayView.prototype.initialize = function() {
        return this.model.bind("change", this.render);
      };
      ItemDisplayView.prototype.close = function() {
        this.model.unbind("change", this.render);
        return ItemDisplayView.__super__.close.apply(this, arguments);
      };
      return ItemDisplayView;
    })();
    ItemEditView = (function() {
      __extends(ItemEditView, baseviews.BaseView);
      function ItemEditView() {
        this.close = __bind(this.close, this);
        this.cancel = __bind(this.cancel, this);
        this.saved = __bind(this.saved, this);
        this.save = __bind(this.save, this);
        this.focusFirstInput = __bind(this.focusFirstInput, this);
        this.render = __bind(this.render, this);
        ItemEditView.__super__.constructor.apply(this, arguments);
      }
      ItemEditView.prototype.render = function() {
        return Backbone.ModelBinding.bind(this);
      };
      ItemEditView.prototype.events = function() {
        return _.extend(ItemEditView.__super__.events.apply(this, arguments), {
          "click .save": "save",
          "click .cancel": "cancel",
          "change input": "change"
        });
      };
      ItemEditView.prototype.initialize = function() {
        this.memento = new Backbone.Memento(this.model);
        return this.memento.store();
      };
      ItemEditView.prototype.focusFirstInput = function() {
        return _.defer(function() {
          return this.$("input:first").focus();
        });
      };
      ItemEditView.prototype.save = function() {
        this.$("input").blur();
        this.$(".save.btn").button("loading");
        return this.model.save({}, {
          success: __bind(function() {
            this.$(".save.btn").button("complete");
            return this.saved();
          }, this),
          error: __bind(function(model, err) {
            var msg;
            msg = "An unknown error occurred while saving. Please try again.";
            switch (err.status) {
              case 0:
                msg = "Unable to connect; please check internet connectivity and then try again.";
                break;
              case 404:
                msg = "The object could not be found on the server; it may have been deleted.";
            }
            this.$(".errors").text(msg);
            return this.$(".save.btn").button("complete");
          }, this)
        });
      };
      ItemEditView.prototype.saved = function() {};
      ItemEditView.prototype.cancel = function() {
        this.memento.restore();
        if (!this.model.id) {
          this.model.destroy();
        }
        return this.close();
      };
      ItemEditView.prototype.change = function(ev) {};
      ItemEditView.prototype.close = function() {
        this.model.editing = false;
        this.parent.updateWidth();
        return ItemEditView.__super__.close.apply(this, arguments);
      };
      return ItemEditView;
    })();
    ItemEditInlineView = (function() {
      __extends(ItemEditInlineView, ItemEditView);
      function ItemEditInlineView() {
        this.events = __bind(this.events, this);
        this.render = __bind(this.render, this);
        ItemEditInlineView.__super__.constructor.apply(this, arguments);
      }
      ItemEditInlineView.prototype.className = "ItemEditView ItemEditInlineView";
      ItemEditInlineView.prototype.minwidth = 6;
      ItemEditInlineView.prototype.render = function() {
        ItemEditInlineView.__super__.render.apply(this, arguments);
        return _.defer(this.parent.updateWidth);
      };
      ItemEditInlineView.prototype.events = function() {
        return _.extend(ItemEditInlineView.__super__.events.apply(this, arguments), {
          "keyup input": "keyup"
        });
      };
      ItemEditInlineView.prototype.keyup = function(ev) {
        if (ev.metaKey || ev.shiftKey || ev.altKey || ev.ctrlKey) {
          return;
        }
        switch (ev.which) {
          case 13:
            return this.save();
          case 27:
            return this.cancel();
        }
      };
      ItemEditInlineView.prototype.saved = function() {
        return this.close();
      };
      ItemEditInlineView.prototype.close = function() {
        ItemEditInlineView.__super__.close.apply(this, arguments);
        return this.parent.subviews.displayview.show();
      };
      return ItemEditInlineView;
    })();
    ItemEditPopupView = (function() {
      __extends(ItemEditPopupView, ItemEditView);
      function ItemEditPopupView() {
        this.scrollToShow = __bind(this.scrollToShow, this);
        this.saved = __bind(this.saved, this);
        this.bringToTop = __bind(this.bringToTop, this);
        this.keyup = __bind(this.keyup, this);
        this.change = __bind(this.change, this);
        this.close = __bind(this.close, this);
        ItemEditPopupView.__super__.constructor.apply(this, arguments);
      }
      ItemEditPopupView.prototype.className = "ItemEditView ItemEditPopupView";
      ItemEditPopupView.prototype.render = function() {
        return ItemEditPopupView.__super__.render.apply(this, arguments);
      };
      ItemEditPopupView.prototype.events = function() {
        return _.extend(ItemEditPopupView.__super__.events.apply(this, arguments), {
          "focus input": "scrollToShow",
          "keyup input": "keyup",
          "mouseenter": "bringToTop"
        });
      };
      ItemEditPopupView.prototype.initialize = function() {
        ItemEditPopupView.__super__.initialize.apply(this, arguments);
        this.scrollToShow();
        return require("app").bind("resized", this.reposition);
      };
      ItemEditPopupView.prototype.close = function() {
        require("app").unbind("resized", this.reposition);
        return ItemEditPopupView.__super__.close.apply(this, arguments);
      };
      ItemEditPopupView.prototype.change = function() {
        return ItemEditPopupView.__super__.change.apply(this, arguments);
      };
      ItemEditPopupView.prototype.keyup = function(ev) {
        $(ev.target).change();
        switch (ev.which) {
          case 13:
            return this.save();
          case 27:
            return this.cancel();
        }
      };
      ItemEditPopupView.prototype.bringToTop = function() {
        $(".item-edit-popup").css("z-index", 50);
        return this.$el.css("z-index", 100);
      };
      ItemEditPopupView.prototype.saved = function() {
        return this.$el.animate({
          opacity: 0
        }, 300, this.close);
      };
      ItemEditPopupView.prototype.scrollToShow = function() {
        $("html, body").stop();
        return _.defer(__bind(function() {
          var current_scroll, target_scroll_offset;
          current_scroll = $("body").scrollTop();
          target_scroll_offset = current_scroll;
          if (current_scroll > this.$el.offset().top || this.$el.height() > $(window).height()) {
            console.log("scroll up");
            target_scroll_offset = this.$el.offset().top;
          } else if (current_scroll + $(window).height() < this.$el.offset().top + this.$el.height()) {
            console.log("scroll down", this.$el.offset().top, this.$el.height(), $(window).height());
            target_scroll_offset = this.$el.offset().top + this.$el.height() - $(window).height();
          }
          if (target_scroll_offset > 0 && target_scroll_offset !== current_scroll) {
            console.log("scrolling to " + target_scroll_offset);
            return $("html, body").stop().animate({
              scrollTop: target_scroll_offset
            }, 400);
          }
        }, this));
      };
      return ItemEditPopupView;
    })();
    return {
      ItemView: ItemView,
      ItemDisplayView: ItemDisplayView,
      ItemEditInlineView: ItemEditInlineView,
      ItemEditPopupView: ItemEditPopupView
    };
  });
}).call(this);

define('less!schedule/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!schedule/views',["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, templates, styles) {
    var ScheduleDateView, ScheduleItemView, ScheduleView;
    ScheduleView = (function() {
      __extends(ScheduleView, baseviews.BaseView);
      function ScheduleView() {
        this.render = __bind(this.render, this);
        ScheduleView.__super__.constructor.apply(this, arguments);
      }
      ScheduleView.prototype.className = "section border2";
      ScheduleView.prototype.buttonFadeSpeed = 60;
      ScheduleView.prototype.render = function() {
        return this.$el.html(templates.schedule_section(this.context()));
      };
      ScheduleView.prototype.initialize = function() {
        var assignment, lecture, _i, _j, _len, _len2, _ref, _ref2, _results;
        this.dateViews = {};
        this.model || (this.model = require("app").get("course"));
        this.model.bind("add:lectures", this.addLectures);
        this.model.bind("add:assignments", this.addAssignments);
        _ref = this.model.get("lectures").models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          lecture = _ref[_i];
          this.addLectures(lecture, this.model.get("lectures"));
        }
        _ref2 = this.model.get("assignments").models;
        _results = [];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          assignment = _ref2[_j];
          _results.push(this.addAssignments(assignment, this.model.get("assignments")));
        }
        return _results;
      };
      ScheduleView.prototype.addAssignments = function(model, coll) {
        return this.addScheduleItems({
          model: model,
          type: "**Assignment**",
          url: "assignments/" + model.id
        }, model.getDate("due"));
      };
      ScheduleView.prototype.addLectures = function(model, coll) {
        return this.addScheduleItems({
          model: model,
          type: "Lecture",
          url: "lectures/" + model.id
        }, model.getDate("scheduled"));
      };
      ScheduleView.prototype.addScheduleItems = function(itemViewSettings, dates) {
        var date, _i, _len, _results;
        if (!dates) {
          return;
        }
        if (!(dates instanceof Array)) {
          dates = [dates];
        }
        _results = [];
        for (_i = 0, _len = dates.length; _i < _len; _i++) {
          date = dates[_i];
          this.getOrCreateDateView(date).add_subview(itemViewSettings.model.cid, new ScheduleItemView(itemViewSettings), ".schedule-items");
          _results.push(itemViewSettings.continued = true);
        }
        return _results;
      };
      ScheduleView.prototype.getOrCreateDateView = function(date) {
        var insertAfter, oldDate;
        if (!date) {
          return;
        }
        if (!this.dateViews[date]) {
          insertAfter = null;
          for (oldDate in this.dateViews) {
            oldDate = new Date(oldDate);
            if (oldDate < date && (!insertAfter || (insertAfter < oldDate))) {
              insertAfter = oldDate;
            }
          }
          this.dateViews[date] = new ScheduleDateView({
            date: date
          });
          if (insertAfter) {
            this.dateViews[insertAfter].el.after(this.dateViews[date].render().el);
          } else {
            this.$(".schedule-inner").prepend(this.dateViews[date].render().el);
          }
        }
        return this.dateViews[date];
      };
      return ScheduleView;
    })();
    ScheduleDateView = (function() {
      __extends(ScheduleDateView, baseviews.BaseView);
      function ScheduleDateView() {
        this.render = __bind(this.render, this);
        ScheduleDateView.__super__.constructor.apply(this, arguments);
      }
      ScheduleDateView.prototype.tagName = "tr";
      ScheduleDateView.prototype.className = "date";
      ScheduleDateView.prototype.render = function() {
        return this.$el.html(templates.schedule_date({
          date: this.options.date
        }));
      };
      return ScheduleDateView;
    })();
    ScheduleItemView = (function() {
      __extends(ScheduleItemView, baseviews.BaseView);
      function ScheduleItemView() {
        this.render = __bind(this.render, this);
        ScheduleItemView.__super__.constructor.apply(this, arguments);
      }
      ScheduleItemView.prototype.tagName = "tr";
      ScheduleItemView.prototype.className = "date";
      ScheduleItemView.prototype.render = function() {
        return this.$el.html(templates.schedule_item(this.context()));
      };
      return ScheduleItemView;
    })();
    return {
      ScheduleView: ScheduleView,
      ScheduleDateView: ScheduleDateView,
      ScheduleItemView: ScheduleItemView
    };
  });
}).call(this);

define('less!content/styles', function() { return; });
define('less!content/items/freeform/styles', function() { return; });
define('less!ckeditor/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!ckeditor/views',["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, templates, styles) {
    var CKEditorView, get_config;
    get_config = __bind(function() {
      var config;
      config = {};
      config.toolbar = [
        {
          name: "document",
          items: ["Source", "-", "Save", "-", "Templates"]
        }, {
          name: "clipboard",
          items: ["Cut", "Copy", "Paste", "PasteText", "PasteFromWord", "-", "Undo", "Redo"]
        }, {
          name: "basicstyles",
          items: ["Bold", "Italic", "Underline", "Strike", "Subscript", "Superscript", "-", "RemoveFormat"]
        }, {
          name: "paragraph",
          items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent", "-", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"]
        }, {
          name: "links",
          items: ["Link", "Unlink"]
        }, {
          name: "insert",
          items: ["Image", "Table", "HorizontalRule", "SpecialChar"]
        }, {
          name: "styles",
          items: ["Styles", "Format", "Font", "FontSize"]
        }, {
          name: "colors",
          items: ["TextColor", "BGColor"]
        }, {
          name: "tools",
          items: ["Maximize", "ShowBlocks"]
        }
      ];
      config.extraPlugins = "autogrow";
      config.autoGrow_bottomSpace = 30;
      config.autoGrow_maxHeight = 1000;
      config.autoGrow_minHeight = 300;
      config.autoGrow_onStartup = true;
      config.filebrowserBrowseUrl = '/static/coffeetest/filebrowse.html?typefilter=all&courseid=' + course_id;
      config.filebrowserImageBrowseUrl = '/static/coffeetest/filebrowse.html?typefilter=picture&courseid=' + course_id;
      return config;
    }, this);
    CKEditorView = (function() {
      __extends(CKEditorView, baseviews.BaseView);
      function CKEditorView() {
        this.html = __bind(this.html, this);
        this.initialize = __bind(this.initialize, this);
        CKEditorView.__super__.constructor.apply(this, arguments);
      }
      CKEditorView.prototype.initialize = function() {
        this.$el.html(templates.ckeditor({
          html: this.options.html
        }));
        return _.defer(__bind(function() {
          return this.$(".ckeditor").ckeditor(config);
        }, this));
      };
      CKEditorView.prototype.html = function() {
        return this.$(".ckeditor").val();
      };
      return CKEditorView;
    })();
    return {
      CKEditorView: CKEditorView,
      get_config: get_config
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!content/items/freeform/views',["cs!../views", "cs!base/views", "cs!ckeditor/views", "hb!./templates.handlebars", "less!./styles"], function(itemviews, baseviews, ckeditorviews, templates, styles) {
    var FreeformItemDisplayView, FreeformItemEditView, FreeformItemView;
    FreeformItemEditView = (function() {
      __extends(FreeformItemEditView, itemviews.ItemEditInlineView);
      function FreeformItemEditView() {
        this.close = __bind(this.close, this);
        this.save = __bind(this.save, this);
        this.render = __bind(this.render, this);
        FreeformItemEditView.__super__.constructor.apply(this, arguments);
      }
      FreeformItemEditView.prototype.minwidth = 12;
      FreeformItemEditView.prototype.render = function() {
        FreeformItemEditView.__super__.render.apply(this, arguments);
        this.$el.html(templates.item_freeform_edit(this.context()));
        return _.defer(__bind(function() {
          return $(".ckeditor").ckeditor(ckeditorviews.get_config());
        }, this));
      };
      FreeformItemEditView.prototype.save = function() {
        this.model.set({
          html: this.$(".ckeditor").val()
        });
        return FreeformItemEditView.__super__.save.apply(this, arguments);
      };
      FreeformItemEditView.prototype.close = function() {
        return FreeformItemEditView.__super__.close.apply(this, arguments);
      };
      return FreeformItemEditView;
    })();
    FreeformItemDisplayView = (function() {
      __extends(FreeformItemDisplayView, itemviews.ItemDisplayView);
      function FreeformItemDisplayView() {
        this.render = __bind(this.render, this);
        FreeformItemDisplayView.__super__.constructor.apply(this, arguments);
      }
      FreeformItemDisplayView.prototype.initialize = function() {
        this.model.set({
          width: Math.min(15, this.model.parent.model.get("width"))
        });
        return FreeformItemDisplayView.__super__.initialize.apply(this, arguments);
      };
      FreeformItemDisplayView.prototype.render = function() {
        FreeformItemDisplayView.__super__.render.apply(this, arguments);
        return this.$el.html(templates.item_freeform(this.context()));
      };
      return FreeformItemDisplayView;
    })();
    FreeformItemView = (function() {
      __extends(FreeformItemView, itemviews.ItemView);
      function FreeformItemView() {
        FreeformItemView.__super__.constructor.apply(this, arguments);
      }
      FreeformItemView.prototype.EditView = FreeformItemEditView;
      FreeformItemView.prototype.DisplayView = FreeformItemDisplayView;
      return FreeformItemView;
    })();
    return {
      title: "Freeform",
      description: "Arbitrary content in an editor (visual, or HTML source)",
      ItemView: FreeformItemView
    };
  });
}).call(this);

define('less!content/items/gallery/styles', function() { return; });
define('less!libs/fancybox/jquery.fancybox-1.3.4', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!content/items/gallery/views',["cs!../views", "cs!base/views", "cs!../../models", "hb!./templates.handlebars", "less!./styles", 'less!libs/fancybox/jquery.fancybox-1.3.4', 'libs/fancybox/jquery.fancybox-1.3.4'], function(itemviews, baseviews, contentmodels, templates, styles, fancyboxstyles, fancybox) {
    var GalleryItemDisplayView, GalleryItemEditView, GalleryItemView;
    GalleryItemEditView = (function() {
      __extends(GalleryItemEditView, itemviews.ItemEditInlineView);
      function GalleryItemEditView() {
        this.loadDownloadFrame = __bind(this.loadDownloadFrame, this);
        this.render = __bind(this.render, this);
        GalleryItemEditView.__super__.constructor.apply(this, arguments);
      }
      GalleryItemEditView.prototype.minwidth = 4;
      GalleryItemEditView.prototype.render = function() {
        this.$el.html(templates.item_gallery_edit(this.context()));
        this.$el.toggleClass("nofile", !this.model.get("file"));
        this.$el.toggleClass("hasfile", !!this.model.get("file"));
        this.bind_data();
        this.enablePlaceholders();
        this.$("iframe.uploader").load(__bind(function() {
          var response_json, response_text;
          response_text = $("body", $("iframe").contents()).text();
          try {
            response_json = JSON.parse(response_text);
          } catch (err) {
            response_json = {};
          }
          if (response_json.md5) {
            this.loadDownloadFrame("Success!");
            this.$("input[data=file]").val(response_json._id).change();
            this.$("input[data=thumb_url],input[data=image_url]").val("");
            return this.$el.removeClass("nofile").addClass("hasfile");
          } else if (response_json._error) {
            return this.loadDownloadFrame("Error!");
          }
        }, this));
        return this.loadDownloadFrame();
      };
      GalleryItemEditView.prototype.loadDownloadFrame = function(message) {
        return $.get("/s3?" + Math.random(), __bind(function(policy_params) {
          var url;
          url = "https://thiscourse.s3.amazonaws.com/uploader/imageupload.html?" + Math.random() + "#policy:" + policy_params.policy + ",signature:" + policy_params.signature;
          if (message) {
            url += ",message:" + message;
          }
          return this.$("iframe.uploader").attr("src", url);
        }, this));
      };
      return GalleryItemEditView;
    })();
    GalleryItemDisplayView = (function() {
      __extends(GalleryItemDisplayView, itemviews.ItemDisplayView);
      function GalleryItemDisplayView() {
        this.get_thumb_url = __bind(this.get_thumb_url, this);
        this.get_image_url = __bind(this.get_image_url, this);
        this.initialize = __bind(this.initialize, this);
        this.render = __bind(this.render, this);
        GalleryItemDisplayView.__super__.constructor.apply(this, arguments);
      }
      GalleryItemDisplayView.prototype.render = function() {
        var settings;
        GalleryItemDisplayView.__super__.render.apply(this, arguments);
        this.$el.html(templates.item_gallery(this.context()));
        this.bind_data();
        settings = {
          cyclic: true,
          type: "image",
          hideOnContentClick: true,
          overlayOpacity: 0.2,
          showCloseButton: false,
          titlePosition: "over",
          onComplete: __bind(function() {
            $("#fancybox-wrap").mousemove(__bind(function() {
              return $("#fancybox-title").fadeIn(200);
            }, this));
            $("#fancybox-wrap").mouseleave(__bind(function() {
              return $("#fancybox-title").stop().fadeOut(200);
            }, this));
            return $("#fancybox-title").hide();
          }, this)
        };
        if (this.model.get("title") || this.model.get("url") || this.model.get("notes")) {
          settings.title = templates.item_gallery_title(this.context());
        }
        return this.$(".imagelink").fancybox(settings);
      };
      GalleryItemDisplayView.prototype.initialize = function() {
        this.model.attributes.width = 4;
        return GalleryItemDisplayView.__super__.initialize.apply(this, arguments);
      };
      GalleryItemDisplayView.prototype.get_image_url = function() {
        return this.model.get("file") && ("/s3/file_redirect?id=" + this.model.get("file")) || this.model.get("image_url") || "";
      };
      GalleryItemDisplayView.prototype.get_thumb_url = function() {
        return this.model.get("file") && ("/s3/thumb_redirect?id=" + this.model.get("file")) || this.model.get("thumb_url") || "";
      };
      return GalleryItemDisplayView;
    })();
    GalleryItemView = (function() {
      __extends(GalleryItemView, itemviews.ItemView);
      function GalleryItemView() {
        GalleryItemView.__super__.constructor.apply(this, arguments);
      }
      GalleryItemView.prototype.EditView = GalleryItemEditView;
      GalleryItemView.prototype.DisplayView = GalleryItemDisplayView;
      return GalleryItemView;
    })();
    return {
      title: "Gallery",
      description: "A gallery of photos, with expandable thumbnails",
      ItemView: GalleryItemView
    };
  });
}).call(this);

define('less!ui/dialogs/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!ui/dialogs/views',["cs!base/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, templates, styles) {
    var DialogView, delete_confirmation, dialog_confirmation, dialog_from_template, dialog_request_response, show_dialog;
    DialogView = (function() {
      __extends(DialogView, baseviews.BaseView);
      function DialogView() {
        this.render = __bind(this.render, this);
        DialogView.__super__.constructor.apply(this, arguments);
      }
      DialogView.prototype.render = function() {};
      return DialogView;
    })();
    dialog_from_template = function(template_name, data, options) {
      return show_dialog(Handlebars.templates[template_name](data), options);
    };
    show_dialog = function(html, options) {
      return $("<div>" + html + "</div>").dialog(_.extend({
        resizable: false,
        modal: true,
        dialogClass: "alert"
      }, options));
    };
    delete_confirmation = function(model, type, delete_callback, options) {
      return dialog_from_template("delete_dialog", {
        title: model.get("title"),
        type: type
      }, _.extend({
        buttons: {
          "delete": {
            html: "Yes, delete!",
            "class": "btn danger",
            click: function() {
              delete_callback();
              return $(this).dialog("close");
            }
          },
          cancel: {
            html: "Cancel",
            "class": "btn",
            click: function() {
              return $(this).dialog("close");
            }
          }
        },
        closeOnEscape: true
      }, options));
    };
    dialog_confirmation = function(title, request, dialog_callback, options) {
      var cancel_button, confirm_button, dialog;
      confirm_button = options.confirm_button || "Yes!";
      cancel_button = options.cancel_button || "Cancel";
      return dialog = show_dialog(request, {
        title: title,
        buttons: {
          "delete": {
            html: confirm_button,
            "class": "btn danger",
            click: function() {
              dialog_callback();
              return $(this).dialog("close");
            }
          },
          cancel: {
            html: cancel_button,
            "class": "btn",
            click: function() {
              if (typeof options.cancel_callback === "function") {
                options.cancel_callback();
              }
              return $(this).dialog("close");
            }
          }
        },
        closeOnEscape: true
      });
    };
    dialog_request_response = function(request, callback, confirm_button, cancel_button) {
      var dialog, rand_id;
      if (!confirm_button) {
        confirm_button = "Confirm";
      }
      if (!cancel_button) {
        cancel_button = "Cancel";
      }
      rand_id = Math.random().toString().slice(2);
      dialog = show_dialog("<input id='" + rand_id + "' />", {
        title: request,
        buttons: {
          save: {
            html: confirm_button,
            "class": "btn success dialog-save-button",
            click: function() {
              if ($("#" + rand_id).val()) {
                callback($("#" + rand_id).val());
                $("#" + rand_id).val("");
              }
              return $(this).dialog("close");
            }
          },
          cancel: {
            html: cancel_button,
            "class": "btn",
            click: function() {
              return $(this).dialog("close");
            }
          }
        }
      });
      return dialog.keypress(function(ev) {
        if (ev.which === 13) {
          $(".dialog-save-button").click();
          return false;
        }
      });
    };
    return {
      DialogView: DialogView,
      dialog_from_template: dialog_from_template,
      show_dialog: show_dialog,
      delete_confirmation: delete_confirmation,
      dialog_confirmation: dialog_confirmation,
      dialog_request_response: dialog_request_response
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!content/views',["less!./styles", "cs!base/views", "cs!ui/dialogs/views", "cs!./models", "hb!./templates.handlebars"], function(styles, baseviews, dialogviews, models, templates) {
    var ContentView, SectionView;
    ContentView = (function() {
      __extends(ContentView, baseviews.BaseView);
      function ContentView() {
        this.update = __bind(this.update, this);
        this.makeSortable = __bind(this.makeSortable, this);
        this.makeEditable = __bind(this.makeEditable, this);
        this.removeSections = __bind(this.removeSections, this);
        this.addSections = __bind(this.addSections, this);
        this.addNewSection = __bind(this.addNewSection, this);
        this.hideActionButtons = __bind(this.hideActionButtons, this);
        this.showActionButtons = __bind(this.showActionButtons, this);
        this.initialize = __bind(this.initialize, this);
        this.render = __bind(this.render, this);
        ContentView.__super__.constructor.apply(this, arguments);
      }
      ContentView.prototype.className = "content";
      ContentView.prototype.events = {
        "click .content-button.add-button": "addNewSection"
      };
      ContentView.prototype.render = function() {
        var model, _i, _len, _ref, _results;
        this.$el.html(templates.content(this.context()));
        this.update();
        _ref = this.model.get("sections").models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(this.addSections(model, this.model.get("sections")));
        }
        return _results;
      };
      ContentView.prototype.initialize = function() {
        this.model.bind("change", this.update);
        this.model.get("sections").bind("add", this.addSections);
        this.model.get("sections").bind("remove", this.removeSections);
        return this.model.bind("save", this.saved);
      };
      ContentView.prototype.showActionButtons = function() {
        return this.$(".content-button").show();
      };
      ContentView.prototype.hideActionButtons = function() {
        this.$(".content-button").hide();
        return false;
      };
      ContentView.prototype.addNewSection = function() {
        var new_section;
        new_section = {
          type: this.$(".add-section-type").val()
        };
        this.model.get("sections").create(new_section);
        return clog(this.model.get("sections"));
      };
      ContentView.prototype.addSections = function(model, coll) {
        return this.add_subview(model.cid, new SectionView({
          model: model
        }), ".sections");
      };
      ContentView.prototype.removeSections = function(model, coll) {
        return this.subviews[model.cid].$el.stop().show().fadeOut(300, __bind(function() {
          return this.close_subview(model.cid);
        }, this));
      };
      ContentView.prototype.makeEditable = function() {};
      ContentView.prototype.makeSortable = function() {};
      ContentView.prototype.update = function() {
        return this.$(".title").text(this.model.get("title"));
      };
      return ContentView;
    })();
    SectionView = (function() {
      __extends(SectionView, baseviews.BaseView);
      function SectionView() {
        this.update = __bind(this.update, this);
        this.removeItems = __bind(this.removeItems, this);
        this.addItems = __bind(this.addItems, this);
        this["delete"] = __bind(this["delete"], this);
        this.edit = __bind(this.edit, this);
        this.addNewItem = __bind(this.addNewItem, this);
        this.makeSortable = __bind(this.makeSortable, this);
        this.hideAllActionButtons = __bind(this.hideAllActionButtons, this);
        this.hideTopActionButtons = __bind(this.hideTopActionButtons, this);
        this.showTopActionButtons = __bind(this.showTopActionButtons, this);
        this.hideBottomActionButtons = __bind(this.hideBottomActionButtons, this);
        this.showBottomActionButtons = __bind(this.showBottomActionButtons, this);
        this.render = __bind(this.render, this);
        SectionView.__super__.constructor.apply(this, arguments);
      }
      SectionView.prototype.className = "section border2";
      SectionView.prototype.buttonFadeSpeed = 60;
      SectionView.prototype.render = function() {
        var model, _i, _len, _ref, _results;
        this.$el.html(templates.section(this.context));
        this.updateWidth();
        this.makeSortable();
        this.update();
        _ref = this.model.get("items").models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(this.addItems(model, this.model.get("items")));
        }
        return _results;
      };
      SectionView.prototype.events = function() {
        return _.extend(SectionView.__super__.events.apply(this, arguments), {
          "mouseenter .section-inner": "showBottomActionButtons",
          "mouseleave .section-inner": "hideAllActionButtons",
          "mouseenter .sectiontitle": "showTopActionButtons",
          "mouseenter .items": "hideTopActionButtons",
          "click .section-button.add-button": "addNewItem",
          "click .section-button.delete-button": "delete"
        });
      };
      SectionView.prototype.showBottomActionButtons = function() {
        return this.$(".section-button.add-button").show();
      };
      SectionView.prototype.hideBottomActionButtons = function() {
        return this.$(".section-button.add-button").hide();
      };
      SectionView.prototype.showTopActionButtons = function() {
        this.$(".section-button.drag-button").show();
        return this.$(".section-button.delete-button").show();
      };
      SectionView.prototype.hideTopActionButtons = function() {
        this.$(".section-button.drag-button").hide();
        return this.$(".section-button.delete-button").hide();
      };
      SectionView.prototype.hideAllActionButtons = function() {
        return this.$(".section-button").hide();
      };
      SectionView.prototype.initialize = function() {
        this.$el.attr("id", this.model.id);
        this.model.bind("change", this.update);
        this.model.get('items').bind("add", this.addItems);
        this.model.get('items').bind("remove", this.removeItems);
        this.model.bind("change:width", this.updateWidth);
        return this.updateWidth();
      };
      SectionView.prototype.makeSortable = function() {};
      SectionView.prototype.addNewItem = function() {
        return this.model.get("items").add({});
      };
      SectionView.prototype.edit = function() {
        return alert("editing! " + this.model.attributes);
      };
      SectionView.prototype["delete"] = function() {
        if (this.model.get("items").length) {
          return dialogviews.delete_confirmation(this.model, "section", __bind(function() {
            return this.model.destroy();
          }, this));
        } else {
          return this.model.destroy();
        }
      };
      SectionView.prototype.addItems = function(model, coll) {
        var type;
        type = model.get("type") || this.model.get("type") || "freeform";
        return require(["cs!content/items/" + type + "/views"], __bind(function(itemviews) {
          var view;
          view = new itemviews.ItemView({
            model: model
          });
          this.add_subview(model.cid, view, ".items");
          if (!model.id) {
            return view.edit();
          }
        }, this));
      };
      SectionView.prototype.removeItems = function(model, coll) {
        return this.subviews[model.cid].$el.stop().show().fadeOut(300, __bind(function() {
          return this.close_subview(model.cid);
        }, this));
      };
      SectionView.prototype.update = function() {
        return this.$(".sectiontitle").text(this.model.get("title"));
      };
      return SectionView;
    })();
    return {
      ContentView: ContentView,
      SectionView: SectionView
    };
  });
  require(["cs!content/items/freeform/views", "cs!content/items/gallery/views"], __bind(function(itemviews) {}, this));
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!home/views',["cs!base/views", "cs!schedule/views", "cs!content/views", "cs!./models", "hb!./templates.handlebars"], function(baseviews, scheduleviews, contentviews, models, templates) {
    var HomeView;
    HomeView = (function() {
      __extends(HomeView, baseviews.BaseView);
      function HomeView() {
        this.updateTitle = __bind(this.updateTitle, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        HomeView.__super__.constructor.apply(this, arguments);
      }
      HomeView.prototype.initialize = function() {
        return this.model.bind("change:title", this.updateTitle);
      };
      HomeView.prototype.render = function() {
        this.$el.html(templates.home(this.context()));
        this.add_subview("schedule", new scheduleviews.ScheduleView({
          model: this.model
        }, ".schedule"));
        this.add_lazy_subview({
          name: "content",
          view: contentviews.ContentView,
          datasource: "model",
          key: "content",
          target: ".content"
        });
        return this.updateTitle();
      };
      HomeView.prototype.updateTitle = function() {
        return this.$(".home-title").text(this.model.get("title") || "");
      };
      return HomeView;
    })();
    return {
      HomeView: HomeView
    };
  });
}).call(this);

define('less!lecture/styles', function() { return; });
define('less!page/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!page/views',["cs!base/views", "cs!./models", "cs!content/views", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, contentviews, dialogviews, templates, styles) {
    var PageNavRouterView, PageRouterView, PageView;
    PageView = (function() {
      __extends(PageView, baseviews.BaseView);
      function PageView() {
        this.createNewContent = __bind(this.createNewContent, this);
        this.addNewContent = __bind(this.addNewContent, this);
        this.render = __bind(this.render, this);
        PageView.__super__.constructor.apply(this, arguments);
      }
      PageView.prototype.events = function() {
        return _.extend(PageView.__super__.events.apply(this, arguments), {
          "click .page-button.add-button": "addNewContent"
        });
      };
      PageView.prototype.showActionButtons = function() {
        return this.$(".page-button").show();
      };
      PageView.prototype.hideActionButtons = function() {
        this.$(".page-button").hide();
        return false;
      };
      PageView.prototype.render = function() {
        this.$el.html(templates.page(this.context()));
        this.add_subview("pagerouter", new PageRouterView({
          collection: this.model.get("contents")
        }), ".contents");
        return this.add_subview("pagenavrouter", new PageNavRouterView({
          collection: this.model.get("contents")
        }), ".nav-links");
      };
      PageView.prototype.initialize = function() {
        return PageView.__super__.initialize.apply(this, arguments);
      };
      PageView.prototype.addNewContent = function() {
        return dialogviews.dialog_request_response("Please enter a title:", __bind(function(title) {
          if (this.model.isNew()) {
            return this.model.save().success(__bind(function() {
              return this.createNewContent(title);
            }, this));
          } else {
            return this.createNewContent(title);
          }
        }, this));
      };
      PageView.prototype.createNewContent = function(title) {
        return this.model.get("contents").create({
          title: title,
          width: 12
        }, {
          wait: true
        });
      };
      PageView.prototype.makeSortable = function() {};
      PageView.prototype.close = function() {
        this.model.unbind("change", this.update);
        this.model.unbind("change:_editor", this.render);
        return PageView.__super__.close.apply(this, arguments);
      };
      return PageView;
    })();
    PageRouterView = (function() {
      __extends(PageRouterView, baseviews.RouterView);
      function PageRouterView() {
        this.navigate = __bind(this.navigate, this);
        this.handlePageNavigation = __bind(this.handlePageNavigation, this);
        this.routes = __bind(this.routes, this);
        PageRouterView.__super__.constructor.apply(this, arguments);
      }
      PageRouterView.prototype.routes = function() {
        return {
          "page/:id/": this.handlePageNavigation
        };
      };
      PageRouterView.prototype.initialize = function() {
        PageRouterView.__super__.initialize.apply(this, arguments);
        return this.render();
      };
      PageRouterView.prototype.handlePageNavigation = function(content_id) {
        return {
          view: contentviews.ContentView,
          datasource: "collection",
          key: content_id
        };
      };
      PageRouterView.prototype.navigate = function() {
        return PageRouterView.__super__.navigate.apply(this, arguments);
      };
      return PageRouterView;
    })();
    PageNavRouterView = (function() {
      __extends(PageNavRouterView, baseviews.NavRouterView);
      function PageNavRouterView() {
        this.addItem = __bind(this.addItem, this);
        this.navigate = __bind(this.navigate, this);
        this.render = __bind(this.render, this);
        PageNavRouterView.__super__.constructor.apply(this, arguments);
      }
      PageNavRouterView.prototype.pattern = "page/:page_id/";
      PageNavRouterView.prototype.render = function() {
        return PageNavRouterView.__super__.render.apply(this, arguments);
      };
      PageNavRouterView.prototype.navigate = function(fragment) {
        var links;
        links = this.$("a");
        if (links.length && fragment === "") {
          return require("app").navigate(links[0].pathname, {
            replace: true
          });
        } else {
          return PageNavRouterView.__super__.navigate.apply(this, arguments);
        }
      };
      PageNavRouterView.prototype.initialize = function() {
        return this.collection.bind("add", this.addItem);
      };
      PageNavRouterView.prototype.addItem = function(model, collection) {
        this.render();
        return this.$("a").last().click();
      };
      return PageNavRouterView;
    })();
    return {
      PageView: PageView,
      PageRouterView: PageRouterView
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!lecture/views',["cs!base/views", "cs!./models", "cs!page/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, pageviews, templates, styles) {
    var LectureListView, LectureRouterView, LectureView;
    LectureRouterView = (function() {
      __extends(LectureRouterView, baseviews.RouterView);
      function LectureRouterView() {
        this.routes = __bind(this.routes, this);
        LectureRouterView.__super__.constructor.apply(this, arguments);
      }
      LectureRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: LectureListView,
              datasource: "collection"
            };
          }, this),
          ":lecture_id/": __bind(function(lecture_id) {
            return {
              view: LectureView,
              datasource: "collection",
              key: lecture_id
            };
          }, this)
        };
      };
      return LectureRouterView;
    })();
    LectureListView = (function() {
      __extends(LectureListView, baseviews.BaseView);
      function LectureListView() {
        this.render = __bind(this.render, this);
        LectureListView.__super__.constructor.apply(this, arguments);
      }
      LectureListView.prototype.render = function() {
        return this.$el.html(templates.lecture_list(this.context()));
      };
      return LectureListView;
    })();
    LectureView = (function() {
      __extends(LectureView, baseviews.BaseView);
      function LectureView() {
        this.actually_render = __bind(this.actually_render, this);
        this.render = __bind(this.render, this);
        LectureView.__super__.constructor.apply(this, arguments);
      }
      LectureView.prototype.render = function() {
        this.$el.text("Loading lecture...");
        return setTimeout(this.actually_render, 500);
      };
      LectureView.prototype.actually_render = function() {
        var html, page, _i, _len, _ref;
        html = "This is lecture #" + this.model.id + ": " + this.model.get("title");
        _ref = this.model.get("pages").models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          page = _ref[_i];
          html += "<li><a href='" + this.url + "page/" + page.id + "/'>" + page.id + ": " + page.get("title") + "</a></li>";
        }
        html += "</ul>";
        return this.$el.html(html);
      };
      return LectureView;
    })();
    return {
      LectureRouterView: LectureRouterView,
      LectureListView: LectureListView,
      LectureView: LectureView
    };
  });
}).call(this);

define('less!assignment/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!assignment/views',["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, pageviews, itemviews, dialogviews, templates, styles) {
    var AssignmentListView, AssignmentRouterView, AssignmentTopEditView, AssignmentTopView, AssignmentView;
    AssignmentRouterView = (function() {
      __extends(AssignmentRouterView, baseviews.RouterView);
      function AssignmentRouterView() {
        this.routes = __bind(this.routes, this);
        AssignmentRouterView.__super__.constructor.apply(this, arguments);
      }
      AssignmentRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: AssignmentListView,
              datasource: "collection"
            };
          }, this),
          ":assignment_id/": __bind(function(assignment_id) {
            return {
              view: AssignmentView,
              datasource: "collection",
              key: assignment_id
            };
          }, this)
        };
      };
      AssignmentRouterView.prototype.initialize = function() {
        console.log("AssignmentRouterView init");
        return AssignmentRouterView.__super__.initialize.apply(this, arguments);
      };
      return AssignmentRouterView;
    })();
    AssignmentListView = (function() {
      __extends(AssignmentListView, baseviews.BaseView);
      function AssignmentListView() {
        this.deleteAssignment = __bind(this.deleteAssignment, this);
        this.addNewAssignment = __bind(this.addNewAssignment, this);
        this.render = __bind(this.render, this);
        AssignmentListView.__super__.constructor.apply(this, arguments);
      }
      AssignmentListView.prototype.events = {
        "click .add-button": "addNewAssignment",
        "click .delete-button": "addNewAssignment"
      };
      AssignmentListView.prototype.render = function() {
        console.log("rendering AssignmentListView");
        this.$el.html(templates.assignment_list(this.context()));
        return this.makeSortable();
      };
      AssignmentListView.prototype.initialize = function() {
        console.log("init AssignmentListView");
        this.collection.bind("change", this.render);
        this.collection.bind("remove", this.render);
        return this.collection.bind("add", this.render);
      };
      AssignmentListView.prototype.addNewAssignment = function() {
        return dialogviews.dialog_request_response("Please enter a title:", __bind(function(title) {
          return this.collection.create({
            title: title
          });
        }, this));
      };
      AssignmentListView.prototype.deleteAssignment = function(ev) {
        var assignment;
        assignment = this.collection.get(ev.target.id);
        return dialogviews.delete_confirmation(assignment, "assignment", __bind(function() {
          return this.collection.remove(assignment);
        }, this));
      };
      AssignmentListView.prototype.makeSortable = function() {};
      return AssignmentListView;
    })();
    AssignmentView = (function() {
      __extends(AssignmentView, baseviews.BaseView);
      function AssignmentView() {
        this.editDone = __bind(this.editDone, this);
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        AssignmentView.__super__.constructor.apply(this, arguments);
      }
      AssignmentView.prototype.events = {
        "click .edit-button": "edit"
      };
      AssignmentView.prototype.render = function() {
        this.$el.html(templates.assignment(this.context()));
        this.add_subview("topview", new AssignmentTopView({
          model: this.model
        }), ".assignment-top");
        return this.add_lazy_subview({
          name: "pageview",
          view: pageviews.PageView,
          datasource: "model",
          key: "page",
          target: ".assignment-page"
        });
      };
      AssignmentView.prototype.edit = function() {
        this.subviews.topview.hide();
        return this.add_subview("topeditview", new AssignmentTopEditView({
          model: this.model
        }), ".assignment-top");
      };
      AssignmentView.prototype.editDone = function() {
        this.close_subview("topeditview");
        this.subviews.topview.render();
        return this.subviews.topview.show();
      };
      return AssignmentView;
    })();
    AssignmentTopView = (function() {
      __extends(AssignmentTopView, baseviews.BaseView);
      function AssignmentTopView() {
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        this.events = __bind(this.events, this);
        AssignmentTopView.__super__.constructor.apply(this, arguments);
      }
      AssignmentTopView.prototype.events = function() {
        return _.extend(AssignmentTopView.__super__.events.apply(this, arguments), {
          "click .edit-button": "edit"
        });
      };
      AssignmentTopView.prototype.render = function() {
        this.$el.html(templates.assignment_top(this.context()));
        return Backbone.ModelBinding.bind(this);
      };
      AssignmentTopView.prototype.edit = function() {
        return this.parent.edit();
      };
      return AssignmentTopView;
    })();
    AssignmentTopEditView = (function() {
      __extends(AssignmentTopEditView, baseviews.BaseView);
      function AssignmentTopEditView() {
        this.cancel = __bind(this.cancel, this);
        this.save = __bind(this.save, this);
        this.render = __bind(this.render, this);
        AssignmentTopEditView.__super__.constructor.apply(this, arguments);
      }
      AssignmentTopEditView.prototype.initialize = function() {
        this.mementoStore();
        return AssignmentTopEditView.__super__.initialize.apply(this, arguments);
      };
      AssignmentTopEditView.prototype.render = function() {
        var due;
        this.$el.html(templates.assignment_top_edit(this.context()));
        Backbone.ModelBinding.bind(this);
        this.enablePlaceholders();
        due = this.model.getDate("due");
        if (due) {
          this.$(".due-date").val((due.getMonth() + 1) + "/" + due.getDate() + "/" + due.getFullYear());
        }
        return this.$(".due-date").datepicker({
          onSelect: function(date) {
            return $(".due-date:visible").val(date);
          }
        });
      };
      AssignmentTopEditView.prototype.events = {
        "click button.save": "save",
        "click button.cancel": "cancel"
      };
      AssignmentTopEditView.prototype.save = function() {
        var due;
        due = $(".due-date:visible").val() || null;
        if (due) {
          due = new Date(due);
        }
        this.model.set({
          due: due
        });
        this.$("input").blur();
        this.$(".save.btn").button("loading");
        return this.model.save().success(__bind(function() {
          this.parent.render();
          return this.parent.editDone();
        }, this));
      };
      AssignmentTopEditView.prototype.cancel = function() {
        this.mementoRestore();
        return this.parent.editDone();
      };
      return AssignmentTopEditView;
    })();
    return {
      AssignmentRouterView: AssignmentRouterView,
      AssignmentListView: AssignmentListView,
      AssignmentView: AssignmentView,
      AssignmentTopView: AssignmentTopView,
      AssignmentTopEditView: AssignmentTopEditView
    };
  });
}).call(this);

define('less!nugget/styles', function() { return; });
define('less!chat/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!chat/views',["cs!base/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, templates, styles) {
    var ChatView;
    ChatView = (function() {
      __extends(ChatView, baseviews.BaseView);
      function ChatView() {
        this.render = __bind(this.render, this);
        this.updateName = __bind(this.updateName, this);
        ChatView.__super__.constructor.apply(this, arguments);
      }
      ChatView.prototype.initialize = function() {
        require("app").get("user").bind("change:email", __bind(function() {
          this.updateName();
          return this.render();
        }, this));
        return this.updateName();
      };
      ChatView.prototype.updateName = function() {
        var _ref;
        return this.name = ((_ref = require("app").get("user").get("email")) != null ? _ref.split("@")[0] : void 0) || "";
      };
      ChatView.prototype.render = function() {
        return this.$el.html(templates.chat(this.context({
          name: this.name
        })));
      };
      return ChatView;
    })();
    return {
      ChatView: ChatView
    };
  });
}).call(this);

define('less!analytics/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!analytics/views',["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, templates, styles) {
    var AnalyticsView;
    AnalyticsView = (function() {
      __extends(AnalyticsView, baseviews.BaseView);
      function AnalyticsView() {
        this.hideStudentDetails = __bind(this.hideStudentDetails, this);
        this.loadStatistics = __bind(this.loadStatistics, this);
        this.render = __bind(this.render, this);
        AnalyticsView.__super__.constructor.apply(this, arguments);
      }
      AnalyticsView.prototype.className = "editor-only";
      AnalyticsView.prototype.events = function() {
        return {
          "click .load-statistics": "loadStatistics",
          "click .hide-student-details": "hideStudentDetails"
        };
      };
      AnalyticsView.prototype.render = function() {
        return this.$el.html(templates.analytics(this.context()));
      };
      AnalyticsView.prototype.loadStatistics = function() {
        this.$(".load-statistics").attr("disabled", "disabled").text("Loading...");
        return $.get("/analytics/studentstatistics/", __bind(function(students) {
          var points, student, _i, _len;
          this.$(".load-statistics").removeAttr("disabled").text("Refresh Statistics");
          this.$(".student-stats").html(templates.student_stats_header());
          students = new models.StudentStatisticsCollection(students).models;
          students = _.sortBy(students, __bind(function(student) {
            return student.get("total_points");
          }, this));
          points = [];
          for (_i = 0, _len = students.length; _i < _len; _i++) {
            student = students[_i];
            this.$(".student-stats").append(templates.student_stats_row(student.attributes));
            points.push(student.get("total_points"));
          }
          require(["libs/protovis/protovis.min"], __bind(function() {
            var bins, h, vis, w, x, y;
            w = 910;
            h = 200;
            x = pv.Scale.linear(0, pv.max(points)).range(0, w);
            bins = pv.histogram(points).bins(x.ticks(30));
            y = pv.Scale.linear(0, pv.max(bins, function(d) {
              return d.y;
            })).range(0, h);
            vis = new pv.Panel().width(w).height(h).margin(20).canvas('point-histogram');
            vis.add(pv.Bar).data(bins).bottom(0).left(function(d) {
              return x(d.x);
            }).width(function(d) {
              return x(d.dx);
            }).height(function(d) {
              return y(d.y);
            }).fillStyle("#aaa").strokeStyle("rgba(255, 255, 255, .2)").lineWidth(1);
            vis.add(pv.Rule).data(y.ticks(5)).bottom(y).strokeStyle("#fff").anchor("left").add(pv.Label).text(y.tickFormat);
            vis.add(pv.Rule).data(x.ticks()).left(x).bottom(-5).height(5).anchor("bottom").add(pv.Label).text(x.tickFormat);
            vis.add(pv.Rule).bottom(0);
            return vis.render();
          }, this));
          return this.$(".hide-student-details").show();
        }, this));
      };
      AnalyticsView.prototype.hideStudentDetails = function() {
        if (this.$(".student-stats").is(":visible")) {
          this.$(".student-stats").fadeOut();
          return this.$(".hide-student-details").text("Show Student Details");
        } else {
          this.$(".student-stats").fadeIn();
          return this.$(".hide-student-details").text("Hide Student Details");
        }
      };
      return AnalyticsView;
    })();
    return {
      AnalyticsView: AnalyticsView
    };
  });
}).call(this);

define('less!file/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!file/views',["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, templates, styles) {
    var FileBrowserView;
    FileBrowserView = (function() {
      __extends(FileBrowserView, baseviews.BaseView);
      function FileBrowserView() {
        this.render = __bind(this.render, this);
        FileBrowserView.__super__.constructor.apply(this, arguments);
      }
      FileBrowserView.prototype.el = "#content";
      FileBrowserView.prototype.initialize = function() {
        return this.render();
      };
      FileBrowserView.prototype.render = function() {
        return this.$el.html(templates.filebrowser(this.context()));
      };
      return FileBrowserView;
    })();
    return {
      FileBrowserView: FileBrowserView
    };
  });
}).call(this);

define('less!probe/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!probe/views',["cs!base/views", "cs!./models", "cs!ui/dialogs/views", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, dialogviews, templates, styles) {
    var FinalAnalytics, FinalView, MidtermAnalytics, MidtermView, PostTestAnalytics, PostTestView, ProbeAnswerEditView, ProbeAnswerView, ProbeContainerView, ProbeEditView, ProbeListView, ProbeRouterView, ProbeView, QuizAnalytics, QuizView, doPost, doPut, handleError, probe_nugget_title;
    ProbeRouterView = (function() {
      __extends(ProbeRouterView, baseviews.RouterView);
      function ProbeRouterView() {
        this.routes = __bind(this.routes, this);
        ProbeRouterView.__super__.constructor.apply(this, arguments);
      }
      ProbeRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: ProbeContainerView,
              datasource: "collection",
              notclaiming: this.options.notclaiming,
              nofeedback: this.options.nofeedback,
              sync: QuizAnalytics
            };
          }, this),
          "edit/": __bind(function() {
            return {
              view: ProbeListView,
              datasource: "collection"
            };
          }, this),
          "edit/:probe_id/": __bind(function(probe_id) {
            return {
              view: ProbeEditView,
              datasource: "collection",
              key: probe_id
            };
          }, this)
        };
      };
      ProbeRouterView.prototype.initialize = function() {
        return ProbeRouterView.__super__.initialize.apply(this, arguments);
      };
      return ProbeRouterView;
    })();
    ProbeListView = (function() {
      __extends(ProbeListView, baseviews.BaseView);
      function ProbeListView() {
        this.deleteProbe = __bind(this.deleteProbe, this);
        this.addNewProbe = __bind(this.addNewProbe, this);
        this.render = __bind(this.render, this);
        ProbeListView.__super__.constructor.apply(this, arguments);
      }
      ProbeListView.prototype.events = {
        "click .add-button": "addNewProbe",
        "click .delete-button": "addNewProbe"
      };
      ProbeListView.prototype.render = function() {
        this.$el.html(templates.probe_list(this.context()));
        return this.makeSortable();
      };
      ProbeListView.prototype.initialize = function() {
        var model, _i, _len, _ref;
        _ref = this.collection.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          model.fetch();
        }
        this.collection.bind("change", this.render);
        this.collection.bind("remove", this.render);
        return this.collection.bind("add", this.render);
      };
      ProbeListView.prototype.addNewProbe = function() {
        return this.collection.create({}, {
          success: __bind(function(model) {
            return require("app").navigate(model.id);
          }, this)
        });
      };
      ProbeListView.prototype.deleteProbe = function(ev) {
        var probe;
        probe = this.collection.get(ev.target.id);
        return dialogviews.delete_confirmation(probe, "probe", __bind(function() {
          return this.collection.remove(probe);
        }, this));
      };
      ProbeListView.prototype.makeSortable = function() {};
      return ProbeListView;
    })();
    doPost = function(url, data, success) {
      return $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        success: success,
        contentType: 'application/json'
      });
    };
    doPut = function(url, data, success) {
      return $.ajax({
        type: 'PUT',
        url: url,
        data: JSON.stringify(data),
        success: success,
        contentType: 'application/json'
      });
    };
    handleError = function() {
      return alert("There was an error loading; please check your internet connection and then refresh the page to continue...");
    };
    QuizAnalytics = {
      submitQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/proberesponse/', response, __bind(function(data) {
          return callback(data);
        }, this));
        return xhdr.error(handleError);
      }, this),
      nuggetAttempt: __bind(function(nuggetattempt, callback) {
        var xhdr;
        xhdr = doPost('/analytics/nuggetattempt/', nuggetattempt, __bind(function() {
          return callback();
        }, this));
        return xhdr.error(handleError);
      }, this),
      skipQuestion: __bind(function(response, callback) {
        return callback();
      }, this)
    };
    MidtermAnalytics = {
      submitQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/midterm/', response, __bind(function(data) {
          return callback(data);
        }, this));
        return xhdr.error(handleError);
      }, this),
      skipQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/midterm/', response, __bind(function() {
          return callback();
        }, this));
        return xhdr.error(handleError);
      }, this)
    };
    FinalAnalytics = {
      submitQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/final/', response, __bind(function(data) {
          return callback(data);
        }, this));
        return xhdr.error(handleError);
      }, this),
      skipQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/final/', response, __bind(function() {
          return callback();
        }, this));
        return xhdr.error(handleError);
      }, this)
    };
    PostTestAnalytics = {
      submitQuestion: __bind(function(response, callback) {
        var xhdr;
        xhdr = doPost('/analytics/posttest/', response, __bind(function(data) {
          return callback(data);
        }, this));
        return xhdr.error(handleError);
      }, this)
    };
    MidtermView = (function() {
      __extends(MidtermView, baseviews.BaseView);
      function MidtermView() {
        this.chooseGeneric = __bind(this.chooseGeneric, this);
        this.generic = __bind(this.generic, this);
        this.claimed = __bind(this.claimed, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        MidtermView.__super__.constructor.apply(this, arguments);
      }
      MidtermView.prototype.events = {
        "click .claimed": "claimed",
        "click .generic": "generic"
      };
      MidtermView.prototype.initialize = function() {
        return require("app").get("user").bind("change:loggedIn", this.render);
      };
      MidtermView.prototype.render = function() {
        var xhdr;
        if (!require("app").get("user").get("loggedIn")) {
          this.$el.html("<p>Please log in to take your midterm...</p>");
          return;
        }
        xhdr = $.get('/analytics/midterm/', __bind(function(data) {
          var grades, midtermgradeboundaries, probe, probes, x;
          if (data.points) {
            midtermgradeboundaries = [180, 160, 150, 140, 0];
            grades = ['A', 'B', 'C', 'D', 'F'];
            return this.$el.html(templates.exam_entry_screen({
              points: data.points,
              grade: grades[((function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = midtermgradeboundaries.length; _i < _len; _i++) {
                  x = midtermgradeboundaries[_i];
                  _results.push(Number(data.points) >= x);
                }
                return _results;
              })()).indexOf(true)]
            }));
          } else if (typeof data === "object") {
            this.$el.html("");
            probes = (function() {
              var _i, _len, _ref, _results;
              _ref = data.probes.reverse();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                probe = _ref[_i];
                _results.push({
                  _id: probe
                });
              }
              return _results;
            })();
            if (probes.length === 0) {
              this.$el.html("You're done. Finito. Finished!! If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished.");
              return;
            }
            probes = new models.ProbeCollection(probes);
            probes.url = "/api/probe";
            return this.add_subview("probecontainer", new ProbeContainerView({
              collection: probes,
              notclaiming: true,
              nofeedback: true,
              progress: data.progress,
              sync: MidtermAnalytics
            }));
          }
        }, this));
        return xhdr.error(handleError);
      };
      MidtermView.prototype.claimed = function() {
        this.code = this.$('.entrycode').val();
        if (this.code.length !== 4) {
          alert("You must enter the 4 digit code given to you by your instructor.");
          return;
        }
        return dialogviews.dialog_confirmation("Take Claimed Midterm", "This will choose the midterm you have created. Once you choose this, it cannot be undone.", __bind(function() {
          return this.chooseGeneric(false);
        }, this), {
          confirm_button: "Choose",
          cancel_button: "Cancel"
        });
      };
      MidtermView.prototype.generic = function() {
        this.code = this.$('.entrycode').val();
        if (this.code.length !== 4) {
          alert("You must enter the 4 digit code given to you by your instructor.");
          return;
        }
        return dialogviews.dialog_confirmation("Take Generic Midterm", "This will choose a generic midterm with a particular if you have created your own midterm, this option is not recommended. Once you choose this, it cannot be undone.", __bind(function() {
          return this.chooseGeneric(true);
        }, this), {
          confirm_button: "Choose",
          cancel_button: "Cancel"
        });
      };
      MidtermView.prototype.chooseGeneric = function(choice) {
        console.log("CODE:", this.code);
        return doPut('/analytics/midterm/', {
          alternate: choice,
          code: this.code
        }, this.render);
      };
      return MidtermView;
    })();
    FinalView = (function() {
      __extends(FinalView, baseviews.BaseView);
      function FinalView() {
        this.chooseGeneric = __bind(this.chooseGeneric, this);
        this.generic = __bind(this.generic, this);
        this.claimed = __bind(this.claimed, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        FinalView.__super__.constructor.apply(this, arguments);
      }
      FinalView.prototype.events = {
        "click .claimed": "claimed",
        "click .generic": "generic"
      };
      FinalView.prototype.initialize = function() {
        return require("app").get("user").bind("change:loggedIn", this.render);
      };
      FinalView.prototype.render = function() {
        var xhdr;
        if (!require("app").get("user").get("loggedIn")) {
          this.$el.html("<p>Please log in to take your final...</p>");
          return;
        }
        xhdr = $.get('/analytics/final/', __bind(function(data) {
          var finalgradeboundaries, grades, probe, probes, x;
          if (data.points) {
            finalgradeboundaries = [315, 280, 263, 240, 0];
            grades = ['A', 'B', 'C', 'D', 'F'];
            return this.$el.html(templates.exam_entry_screen({
              points: data.points,
              grade: grades[((function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = finalgradeboundaries.length; _i < _len; _i++) {
                  x = finalgradeboundaries[_i];
                  _results.push(Number(data.points) >= x);
                }
                return _results;
              })()).indexOf(true)]
            }));
          } else if (typeof data === "object") {
            this.$el.html("");
            probes = (function() {
              var _i, _len, _ref, _results;
              _ref = data.probes.reverse();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                probe = _ref[_i];
                _results.push({
                  _id: probe
                });
              }
              return _results;
            })();
            if (probes.length === 0) {
              this.$el.html("You're done. Finito. Finished!! If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished.");
              return;
            }
            probes = new models.ProbeCollection(probes);
            probes.url = "/api/probe";
            return this.add_subview("probecontainer", new ProbeContainerView({
              collection: probes,
              notclaiming: true,
              nofeedback: true,
              progress: data.progress,
              sync: FinalAnalytics
            }));
          }
        }, this));
        return xhdr.error(handleError);
      };
      FinalView.prototype.claimed = function() {
        this.code = this.$('.entrycode').val();
        if (this.code.length !== 4) {
          alert("You must enter the 4 digit code given to you by your instructor.");
          return;
        }
        return dialogviews.dialog_confirmation("Take Claimed Final", "This will choose the final you have created. Once you choose this, it cannot be undone.", __bind(function() {
          return this.chooseGeneric(false);
        }, this), {
          confirm_button: "Choose",
          cancel_button: "Cancel"
        });
      };
      FinalView.prototype.generic = function() {
        this.code = this.$('.entrycode').val();
        if (this.code.length !== 4) {
          alert("You must enter the 4 digit code given to you by your instructor.");
          return;
        }
        return dialogviews.dialog_confirmation("Take Generic Final", "This will choose a generic final with a particular if you have created your own final, this option is not recommended. Once you choose this, it cannot be undone.", __bind(function() {
          return this.chooseGeneric(true);
        }, this), {
          confirm_button: "Choose",
          cancel_button: "Cancel"
        });
      };
      FinalView.prototype.chooseGeneric = function(choice) {
        console.log("CODE:", this.code);
        return doPut('/analytics/final/', {
          alternate: choice,
          code: this.code
        }, this.render);
      };
      return FinalView;
    })();
    PostTestView = (function() {
      __extends(PostTestView, baseviews.BaseView);
      function PostTestView() {
        this.redirect = __bind(this.redirect, this);
        this.complete = __bind(this.complete, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        PostTestView.__super__.constructor.apply(this, arguments);
      }
      PostTestView.prototype.initialize = function() {
        return require("app").get("user").bind("change:loggedIn", this.render);
      };
      PostTestView.prototype.render = function() {
        var xhdr;
        if (!require("app").get("user").get("loggedIn")) {
          this.$el.html("<p>Please log in to take your post-test...</p>");
          return;
        }
        xhdr = $.get('/analytics/posttest/', __bind(function(data) {
          var probe, probes;
          this.$el.html("");
          probes = (function() {
            var _i, _len, _ref, _results;
            _ref = data.probes.reverse();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              probe = _ref[_i];
              _results.push({
                _id: probe
              });
            }
            return _results;
          })();
          if (probes.length === 0) {
            this.$el.html("You're done. Finito. Finished!!");
            return;
          }
          probes = new models.ProbeCollection(probes);
          return this.add_subview("probecontainer", new ProbeContainerView({
            collection: probes,
            notclaiming: true,
            nofeedback: true,
            noskipping: true,
            progress: data.progress,
            sync: PostTestAnalytics,
            complete: this.complete
          }));
        }, this));
        return xhdr.error(handleError);
      };
      PostTestView.prototype.complete = function() {
        this.$el.html("Thanks, ALMOST done! You will now be redirected to an <a href='http://bit.ly/M9mlCF'>anonymous feedback form</a>.");
        return setTimeout(this.redirect, 5000);
      };
      PostTestView.prototype.redirect = function() {
        return window.location = "http://bit.ly/M9mlCF";
      };
      return PostTestView;
    })();
    QuizView = (function() {
      __extends(QuizView, baseviews.BaseView);
      function QuizView() {
        this.navigate = __bind(this.navigate, this);
        this.render = __bind(this.render, this);
        QuizView.__super__.constructor.apply(this, arguments);
      }
      QuizView.prototype.initialize = function() {
        return this.collection.bind("add", _.debounce(this.render));
      };
      QuizView.prototype.render = function() {
        var nugget, probe, probes, _i, _j, _len, _len2, _ref, _ref2;
        probes = [];
        _ref = this.collection.selectNuggets(this.query).models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          nugget = _ref[_i];
          _ref2 = nugget.get('probeset').models;
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            probe = _ref2[_j];
            probes.push(probe);
          }
        }
        if (probes.length === 0) {
          return;
        }
        probes = new models.ProbeCollection(_.shuffle(probes));
        return this.add_subview("probecontainer", new ProbeContainerView({
          collection: probes,
          notclaiming: true,
          nofeedback: this.options.nofeedback,
          sync: QuizAnalytics
        }));
      };
      QuizView.prototype.navigate = function(fragment, query) {
        QuizView.__super__.navigate.apply(this, arguments);
        return this.render();
      };
      return QuizView;
    })();
    ProbeContainerView = (function() {
      __extends(ProbeContainerView, baseviews.BaseView);
      function ProbeContainerView() {
        this.performQuestionSkipping = __bind(this.performQuestionSkipping, this);
        this.skipQuestion = __bind(this.skipQuestion, this);
        this.submitAnswer = __bind(this.submitAnswer, this);
        this.prefetchProbe = __bind(this.prefetchProbe, this);
        this.showNextProbe = __bind(this.showNextProbe, this);
        this.showReviewFeedback = __bind(this.showReviewFeedback, this);
        this.nextProbe = __bind(this.nextProbe, this);
        this.render = __bind(this.render, this);
        ProbeContainerView.__super__.constructor.apply(this, arguments);
      }
      ProbeContainerView.prototype.events = {
        "click .answerbtn": "submitAnswer",
        "click .nextquestion": "nextProbe",
        "click .skipbutton": "skipQuestion"
      };
      ProbeContainerView.prototype.initialize = function() {
        var xhdr;
        if (this.options.notclaiming) {
          this.review = [];
        }
        if (this.options.nofeedback && !this.options.noskipping) {
          require("app").bind("windowBlur", this.performQuestionSkipping);
        }
        this.claimed = true;
        this.progress = Number(this.options.progress || 0);
        this.points = 0;
        this.inc = this.options.inc || 0;
        this.earnedpoints = 0;
        this.submitting = 0;
        this.showNextProbe();
        xhdr = this.model.fetch();
        return xhdr != null ? xhdr.error(handleError) : void 0;
      };
      ProbeContainerView.prototype.render = function() {
        this.$el.html(templates.probe_container({
          allowskipping: this.options.notclaiming && !this.options.noskipping
        }));
        if (this.submitting === 1) {
          this.$('.answerbtn, .skipbutton').attr('disabled', 'disabled');
          this.$('.answerbtn, .skipbutton').text('Loading');
        }
        return this.add_subview("probeview", new ProbeView({
          model: this.model
        }), ".probequestion");
      };
      ProbeContainerView.prototype.nextProbe = function() {
        var nuggetattempt;
        if (this.$('.nextquestion').attr('disabled')) {
          return;
        }
        this.$('.nextquestion').attr('disabled', 'disabled');
        if (this.inc >= this.collection.length) {
          require("app").unbind("windowBlur", this.performQuestionSkipping);
          this.inc += 1;
          if (!this.options.notclaiming) {
            nuggetattempt = {
              claimed: this.claimed,
              nugget: this.model.parent.model.id,
              points: this.points
            };
            this.options.sync.nuggetAttempt(nuggetattempt, __bind(function() {
              if (this.claimed) {
                this.$el.html("<h4>Nugget Claimed!</h4>");
                return require('app').get('user').get('claimed').add({
                  _id: this.model.parent.model.id,
                  points: this.points
                });
              } else {
                this.$el.html("<h4>Practice makes better!</h4>");
                return require('app').get('user').get('partial').add({
                  _id: this.model.parent.model.id
                });
              }
            }, this));
          } else {
            this.showReviewFeedback();
          }
        } else {
          return this.showNextProbe();
        }
      };
      ProbeContainerView.prototype.showReviewFeedback = function() {
        console.log(this.review);
        console.log(this.earnedpoints);
        if (this.review.length > 0) {
          return this.$el.html(templates.nugget_review_list({
            collection: new Backbone.Collection(_.uniq(this.review)),
            query: this.query,
            totalpoints: this.points,
            earnedpoints: this.earnedpoints
          }));
        } else if (this.earnedpoints > 0) {
          return this.$el.html(templates.nugget_review_list({
            query: this.query,
            totalpoints: this.points,
            earnedpoints: this.earnedpoints
          }));
        } else if (this.options.complete) {
          return this.options.complete();
        } else {
          return this.$el.html("Test Complete - Your grade will be available on the course site after grading. If you want to leave early, please come and sign out at the front of the room. Otherwise, please close your laptop now so we know you're finished.");
        }
      };
      ProbeContainerView.prototype.showNextProbe = function() {
        this.model = this.collection.at(this.inc);
        this.inc += 1;
        this.model.whenLoaded(this.render);
        return this.prefetchProbe();
      };
      ProbeContainerView.prototype.prefetchProbe = function() {
        var xhdr, _ref;
        xhdr = (_ref = this.collection.at(this.inc)) != null ? _ref.fetch() : void 0;
        return xhdr != null ? xhdr.error(handleError) : void 0;
      };
      ProbeContainerView.prototype.submitAnswer = function() {
        var key, response, responsetime, subview, _ref;
        if (this.options.nofeedback) {
          this.submitting = 1;
        }
        if (this.$('.answerbtn').attr('disabled')) {
          return;
        }
        this.$('.answerbtn').attr('disabled', 'disabled');
        this.$('.answerbtn').text('Loading');
        this.$('.skipbutton').attr('disabled', 'disabled');
        this.$('.skipbutton').text('Loading');
        responsetime = new Date - this.subviews.probeview.timestamp_load;
        response = {
          probe: this.model.id,
          type: "proberesponse",
          answers: [],
          responsetime: responsetime
        };
        _ref = this.subviews.probeview.subviews;
        for (key in _ref) {
          subview = _ref[key];
          if (subview.selected) {
            response.answers.push(subview.model.id);
          }
        }
        if (response.answers.length === 0) {
          alert("Please select at least one answer");
          this.$('.answerbtn').removeAttr('disabled');
          return;
        }
        console.log(require('app').get('user').get('email'), "answered question", response.probe, "with", response.answers);
        this.options.sync.submitQuestion(response, __bind(function(data) {
          var answer, correct, increment;
          if (!this.options.nofeedback) {
            this.$('.answerbtn, .skipbutton').hide();
          }
          if (this.options.sync.nuggetAttempt) {
            if (!data.correct) {
              this.claimed = false;
              if (this.options.notclaiming) {
                this.review.push(this.model.parent.model);
              }
            }
            correct = (function() {
              var _i, _len, _ref2, _results;
              _ref2 = data.probe.answers;
              _results = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                answer = _ref2[_i];
                if (answer.correct) {
                  _results.push(answer._id);
                }
              }
              return _results;
            })();
            increment = response.answers.length <= correct.length ? _.intersection(response.answers, correct).length : _.intersection(response.answers, correct).length - (response.answers.length - correct.length);
            this.earnedpoints += Math.max(0, increment);
            this.points += correct.length;
            if (!this.options.nofeedback) {
              this.subviews.probeview.answered(data);
            }
          }
          if (this.options.nofeedback) {
            this.$('.answerbtn').removeAttr('disabled');
            this.$('.answerbtn').text('Submit Answer');
            this.$('.skipbutton').removeAttr('disabled');
            this.$('.skipbutton').text('Skip Question');
            this.submitting = 0;
            if (this.inc > this.collection.length) {
              return this.showReviewFeedback();
            }
          }
        }, this));
        if (this.options.nofeedback && this.inc <= this.collection.length) {
          return this.nextProbe();
        }
      };
      ProbeContainerView.prototype.skipQuestion = function() {
        var key, subview;
        console.log("skipping question");
        if (this.$('.skipbutton').attr('disabled')) {
          return;
        }
        if (((function() {
          var _ref, _results;
          _ref = this.subviews.probeview.subviews;
          _results = [];
          for (key in _ref) {
            subview = _ref[key];
            if (subview.selected) {
              _results.push(subview);
            }
          }
          return _results;
        }).call(this)).length > 0) {
          return dialogviews.dialog_confirmation("Skip Question", "This will skip this question, your answers will not be saved", __bind(function() {
            return this.performQuestionSkipping(true);
          }, this), {
            confirm_button: "Skip",
            cancel_button: "Cancel"
          });
        } else {
          return this.performQuestionSkipping(true);
        }
      };
      ProbeContainerView.prototype.performQuestionSkipping = function(manual) {
        var skipmodel, _base;
        if (this.options.nofeedback) {
          this.submitting = 1;
        }
        this.$('.answerbtn').attr('disabled', 'disabled');
        this.$('.answerbtn').text('Loading');
        this.$('.skipbutton').attr('disabled', 'disabled');
        this.$('.skipbutton').text('Loading');
        if (typeof (_base = this.options.sync).skipQuestion === "function") {
          _base.skipQuestion({
            probe: this.model.id,
            skipped: true,
            manual: manual || false
          }, __bind(function() {
            this.$('.answerbtn').removeAttr('disabled');
            this.$('.answerbtn').text('Submit Answer');
            this.$('.skipbutton').removeAttr('disabled');
            this.$('.skipbutton').text('Skip Question');
            return this.submitting = 0;
          }, this));
        }
        skipmodel = this.collection.models.splice(this.inc - 1, 1);
        this.collection.models.push(skipmodel[0]);
        this.model = this.collection.at(this.inc - 1);
        this.model.whenLoaded(this.render);
        return this.prefetchProbe();
      };
      return ProbeContainerView;
    })();
    probe_nugget_title = {
      '4f8439aee6afa5c8260028f7': 'Attention Network Test',
      '4f8439afe6afa5c8260028f8': 'Attention Network Test',
      '4f8439b1e6afa5c8260028f9': 'Attention Network Test',
      '4f8439dae6afa5c82600292c': 'Genetic Variants',
      '4f8439d4e6afa5c826002925': 'Three Networks',
      '4f8439d5e6afa5c826002926': 'Three Networks',
      '4f843a14e6afa5c826002970': 'Hebb',
      '4f843a16e6afa5c826002972': 'Hebb',
      '4f843a17e6afa5c826002973': 'Hebb',
      '4f843a19e6afa5c826002975': 'Hebb',
      '4f8439a0e6afa5c8260028e4': '',
      '4f84396ae6afa5c826002898': 'Alerting',
      '4f84396be6afa5c826002899': 'Alerting',
      '4f84396ce6afa5c82600289b': 'Alerting',
      '4f843976e6afa5c8260028a9': 'Orienting',
      '4f843977e6afa5c8260028aa': '',
      '4f843977e6afa5c8260028ab': 'Orienting',
      '4f843978e6afa5c8260028ac': 'Orienting',
      '4f843978e6afa5c8260028ad': 'Orienting',
      '4f84397ae6afa5c8260028af': 'Orienting',
      '4f843a09e6afa5c826002963': 'Executive Attention',
      '4f843a0ae6afa5c826002964': 'Executive Attention',
      '4f843a0ce6afa5c826002967': 'Executive Attention',
      '4f843a0de6afa5c826002968': 'Executive Attention',
      '4f843979e6afa5c8260028ae': 'Network Summary',
      '4f84397be6afa5c8260028b0': 'Network Summary',
      '4f84397be6afa5c8260028b1': 'Network Summary',
      '4f84397ce6afa5c8260028b2': 'Network Summary',
      '4f84397de6afa5c8260028b3': 'Network Summary',
      '4f84397de6afa5c8260028b4': 'Network Summary',
      '4f84397ee6afa5c8260028b5': 'Network Summary',
      '4f84397fe6afa5c8260028b6': 'Network Summary',
      '4f84397fe6afa5c8260028b7': 'Network Summary',
      '4f843962e6afa5c82600288b': '',
      '4f843962e6afa5c82600288c': 'Corbetta & Shulman\'s Neglect Model',
      '4f843963e6afa5c82600288d': 'Corbetta & Shulman\'s Neglect Model',
      '4f84398ae6afa5c8260028c6': 'Test Performance',
      '4f8439bbe6afa5c826002906': 'Not Just Sensory',
      '4f843999e6afa5c8260028db': 'Description',
      '4f843a11e6afa5c82600296c': 'Definition',
      '4f843994e6afa5c8260028d4': 'Definitions',
      '4f84396fe6afa5c82600289e': 'Kinds of Attention',
      '4f84396fe6afa5c82600289f': 'Kinds of Attention',
      '4f843970e6afa5c8260028a0': 'Kinds of Attention',
      '4f843971e6afa5c8260028a1': 'Kinds of Attention',
      '4f843971e6afa5c8260028a2': 'Kinds of Attention',
      '4f843972e6afa5c8260028a3': 'Kinds of Attention',
      '4f8439ece6afa5c826002941': 'Age & Gender',
      '4f843a04e6afa5c82600295e': 'Attention',
      '4f843982e6afa5c8260028bb': 'Working Memory',
      '4f8439ace6afa5c8260028f4': 'Response Selection',
      '4f843975e6afa5c8260028a8': 'Two Kinds',
      '4f843a01e6afa5c82600295a': 'Central Executive',
      '4f843a03e6afa5c82600295c': 'Central Executive',
      '4f843a03e6afa5c82600295d': 'Central Executive',
      '4f84398be6afa5c8260028c7': 'Color Attributes vs Perception',
      '4f84398ce6afa5c8260028c9': 'Color Attributes vs Perception',
      '4f843a12e6afa5c82600296e': 'Other Object Properties',
      '4f8439aae6afa5c8260028f1': 'Property Dissociations',
      '4f8439abe6afa5c8260028f3': 'Property Dissociations',
      '4f843961e6afa5c82600288a': 'Neural Circuit',
      '4f8439bde6afa5c826002908': 'Three Tasks',
      '4f8439bde6afa5c826002909': 'Three Tasks',
      '4f8439bfe6afa5c82600290b': '',
      '4f8439c0e6afa5c82600290c': 'Three Tasks',
      '4f8439c1e6afa5c82600290d': 'Three Tasks',
      '4f8439e7e6afa5c82600293c': 'Two Systems Summary',
      '4f8439e8e6afa5c82600293d': 'Two Systems Summary',
      '4f8439e9e6afa5c82600293e': 'Two Systems Summary',
      '4f8439eae6afa5c82600293f': 'Two Systems Summary',
      '4f8439ebe6afa5c826002940': 'Two Systems Summary',
      '4f8439ece6afa5c826002942': 'Two Systems Summary',
      '4f8439ede6afa5c826002943': 'Two Systems Summary',
      '4f843996e6afa5c8260028d7': '',
      '4f843964e6afa5c82600288e': 'Object Concepts: Overview',
      '4f843964e6afa5c82600288f': 'Object Concepts: Overview',
      '4f843965e6afa5c826002890': 'Object Concepts: Overview',
      '4f843966e6afa5c826002891': 'Object Concepts: Overview',
      '4f843966e6afa5c826002892': 'Object Concepts: Overview',
      '4f843967e6afa5c826002893': 'Object Concepts: Overview',
      '4f843968e6afa5c826002894': 'Object Concepts: Overview',
      '4f843968e6afa5c826002895': 'Object Concepts: Overview',
      '4f843969e6afa5c826002896': 'Object Concepts: Overview',
      '4f84396ae6afa5c826002897': 'Object Concepts: Overview',
      '4f84396ce6afa5c82600289a': 'Object Concepts: Overview',
      '4f843988e6afa5c8260028c3': 'Object Concepts: Anatomy',
      '4f843988e6afa5c8260028c4': 'Object Concepts: Anatomy',
      '4f843984e6afa5c8260028be': 'Drug Addiction',
      '4f8439f2e6afa5c826002949': '',
      '4f8439f5e6afa5c82600294c': '',
      '4f8439f6e6afa5c82600294d': 'ADHD',
      '4f8439f8e6afa5c826002950': 'Neuromodulators',
      '4f843998e6afa5c8260028da': '',
      '4f8439cfe6afa5c82600291f': 'Baddeley Model',
      '4f8439d0e6afa5c826002920': 'Baddeley Model',
      '4f8439d3e6afa5c826002924': 'Baddeley Model',
      '4f843995e6afa5c8260028d6': '',
      '4f843a15e6afa5c826002971': '',
      '4f843992e6afa5c8260028d2': 'Feature Integration Theory',
      '4f8439d7e6afa5c826002928': 'Prevalence',
      '4f8d9e77e7c1e3251700001b': 'Prevalence',
      '4f8439b5e6afa5c8260028fe': 'Gradient of Effects',
      '4f8439ade6afa5c8260028f5': 'Activity Increases',
      '4f8439aee6afa5c8260028f6': 'Activity Increases',
      '4f8439c3e6afa5c826002910': 'Summary',
      '4f8439c5e6afa5c826002912': 'Summary',
      '4f8439c5e6afa5c826002913': 'Summary',
      '4f8439c6e6afa5c826002914': '',
      '4f8439c7e6afa5c826002915': 'Summary',
      '4f8439c8e6afa5c826002916': 'Summary',
      '4f8439c9e6afa5c826002917': 'Summary',
      '4f8f24bb8222299f190013f5': 'Visual Salience',
      '4f84399ee6afa5c8260028e1': 'Receptive Fields',
      '4f8439e5e6afa5c826002939': 'Summary',
      '4f8439b9e6afa5c826002904': 'Opponent Process',
      '4f843989e6afa5c8260028c5': '',
      '4f843a0be6afa5c826002966': 'Dependence',
      '4f8439d8e6afa5c826002929': 'Antireward Recruitment',
      '4f8439d8e6afa5c82600292a': '',
      '4f8439d9e6afa5c82600292b': 'Antireward Recruitment',
      '4f84396de6afa5c82600289c': 'Material Specificity',
      '4f843a18e6afa5c826002974': 'Drug Reward',
      '4f8439b2e6afa5c8260028fb': 'Vulnerability',
      '4f8439efe6afa5c826002945': 'Reward System Adaptation',
      '4f8439e3e6afa5c826002937': 'Emotional Sensitivity',
      '4f843985e6afa5c8260028bf': 'Neural Circuits',
      '4f8439b7e6afa5c826002901': 'Functional Connectivity',
      '4f843a0ae6afa5c826002965': '',
      '4f843a08e6afa5c826002962': 'Behavioral Phenotypes',
      '4f8439b3e6afa5c8260028fc': 'Prediction Error Signal',
      '4f8439b4e6afa5c8260028fd': 'Prediction Error Signal',
      '4f8439fae6afa5c826002952': 'Stimulus or Response',
      '4f8439fbe6afa5c826002953': 'Stimulus or Response',
      '4f843974e6afa5c8260028a6': 'Beyond Form and Motion',
      '4f84399fe6afa5c8260028e2': 'Form and Motion',
      '4f84399fe6afa5c8260028e3': 'Form and Motion',
      '4f843980e6afa5c8260028b8': 'Object Category Effects',
      '4f843981e6afa5c8260028b9': 'Object Category Effects',
      '4f843982e6afa5c8260028ba': 'Object Category Effects',
      '4f843983e6afa5c8260028bc': 'Object Category Effects',
      '4f8439e6e6afa5c82600293a': 'Overview',
      '4f8439bce6afa5c826002907': 'Dual Roles',
      '4f8439f9e6afa5c826002951': 'The Race Model',
      '4f8439fce6afa5c826002954': 'The Race Model',
      '4f8439fde6afa5c826002955': 'The Race Model',
      '4f8439ffe6afa5c826002958': 'The Race Model',
      '4f843a07e6afa5c826002961': 'Inducing Emotion',
      '4f8439a5e6afa5c8260028eb': 'Pre-SMA',
      '4f84396ee6afa5c82600289d': 'Basal Gangli',
      '4f8439f0e6afa5c826002946': 'Right IFG',
      '4f8439cee6afa5c82600291d': '',
      '4f843a06e6afa5c826002960': 'Training',
      '4f8439d6e6afa5c826002927': 'Hippocampus',
      '4f8439a7e6afa5c8260028ee': 'Processing vs Imagery',
      '4f8439a8e6afa5c8260028ef': 'Processing vs Imagery',
      '4f8439a9e6afa5c8260028f0': 'Processing vs Imagery',
      '4f8439f2e6afa5c826002948': 'Functional Connectivity',
      '4f843997e6afa5c8260028d9': 'Model',
      '4f843984e6afa5c8260028bd': 'Conceptual Processing: Conceptual?',
      '4f843986e6afa5c8260028c0': 'Conceptual Processing: Conceptual?',
      '4f843986e6afa5c8260028c1': 'Conceptual Processing: Conceptual?',
      '4f843987e6afa5c8260028c2': 'Conceptual Processing: Conceptual?',
      '4f843a0fe6afa5c82600296a': 'Symptoms',
      '4f8439a3e6afa5c8260028e8': 'Conceptual Processing: Clinical and Lesion Studies',
      '4f8439a4e6afa5c8260028e9': 'Conceptual Processing: Clinical and Lesion Studies',
      '4f8439a6e6afa5c8260028ec': 'Subgenual Anterior Cingulate',
      '4f8439a7e6afa5c8260028ed': '',
      '4f8439c1e6afa5c82600290e': 'Qualities',
      '4f8439c2e6afa5c82600290f': 'Qualities',
      '4f8439c4e6afa5c826002911': 'Qualities',
      '4f8439b8e6afa5c826002902': 'Reward Value',
      '4f8439b2e6afa5c8260028fa': '',
      '4f8439fee6afa5c826002956': 'Feeling States',
      '4f8439fee6afa5c826002957': 'Feeling States',
      '4f843a00e6afa5c826002959': '',
      '4f843a02e6afa5c82600295b': 'Feeling States',
      '4f8439a1e6afa5c8260028e5': 'Distinction',
      '4f8439a2e6afa5c8260028e7': 'Distinction',
      '4f8439d2e6afa5c826002922': 'Behavior',
      '4f8439d3e6afa5c826002923': 'Behavior',
      '4f84399de6afa5c8260028e0': 'Fear Stimuli',
      '4f843a19e6afa5c826002976': 'Neural Correlates',
      '4f843975e6afa5c8260028a7': 'Inattention',
      '4f843973e6afa5c8260028a4': '',
      '4f843973e6afa5c8260028a5': 'Salience or Reward',
      '4f8439dbe6afa5c82600292d': '',
      '4f8439dce6afa5c82600292e': 'Bridging the Delay',
      '4f8439dde6afa5c826002930': '',
      '4f8439f7e6afa5c82600294e': 'The Task',
      '4f8439f7e6afa5c82600294f': 'The Task',
      '4f8439dee6afa5c826002931': 'Two Systems',
      '4f8439f1e6afa5c826002947': 'Ventrolateral Trend',
      '4f8439cae6afa5c826002918': 'Dorsal Trend',
      '4f8439cae6afa5c826002919': 'Dorsal Trend',
      '4f843997e6afa5c8260028d8': 'Mentalizing',
      '4f84398be6afa5c8260028c8': 'Balance',
      '4f84398de6afa5c8260028ca': 'Balance',
      '4f84398de6afa5c8260028cb': 'Balance',
      '4f84398ee6afa5c8260028cc': 'Balance',
      '4f84398fe6afa5c8260028cd': 'Balance',
      '4f843990e6afa5c8260028cf': 'Balance',
      '4f843991e6afa5c8260028d0': '',
      '4f8439bee6afa5c82600290a': 'Motion',
      '4f843a0ee6afa5c826002969': 'Attention Set',
      '4f843a10e6afa5c82600296b': 'Attention Set',
      '4f8439b6e6afa5c8260028ff': 'Salience Modulation',
      '4f8439e2e6afa5c826002936': 'Visceral Knowledge',
      '4f843a05e6afa5c82600295f': 'Other Sets',
      '4f8439b6e6afa5c826002900': 'Attention Set and Working Memory',
      '4f8439a2e6afa5c8260028e6': 'Temporal Difference Learning',
      '4f8439a4e6afa5c8260028ea': 'Temporal Difference Learning',
      '4f8439eee6afa5c826002944': 'Learning',
      '4f843a12e6afa5c82600296d': '',
      '4f843a1ae6afa5c826002977': 'Self-Stimulation',
      '4f8439e1e6afa5c826002934': 'Somatic Markers',
      '4f8439e1e6afa5c826002935': '',
      '4f8439e4e6afa5c826002938': 'Somatic Markers',
      '4f84399ae6afa5c8260028dc': 'Explicit Memory',
      '4f84399be6afa5c8260028dd': 'Explicit Memory',
      '4f84399be6afa5c8260028de': 'Explicit Memory',
      '4f84399ce6afa5c8260028df': 'Explicit Memory',
      '4f8439dfe6afa5c826002932': 'Striatum',
      '4f8439cbe6afa5c82600291a': 'Classical Conditioning',
      '4f8439cce6afa5c82600291b': 'Classical Conditioning',
      '4f8439cde6afa5c82600291c': 'Classical Conditioning',
      '4f8439cee6afa5c82600291e': 'Classical Conditioning',
      '4f8439d1e6afa5c826002921': 'Classical Conditioning',
      '4f843995e6afa5c8260028d5': 'Cortical Structures',
      '4f8439f3e6afa5c82600294a': 'Stimulation Studies',
      '4f8439f4e6afa5c82600294b': 'Stimulation Studies',
      '4f843990e6afa5c8260028ce': 'Amygdala',
      '4f843992e6afa5c8260028d1': 'Amygdala',
      '4f843a13e6afa5c82600296f': 'Insula',
      '4f8439bae6afa5c826002905': 'Network',
      '4f8439b9e6afa5c826002903': 'Summary',
      '4f8439dde6afa5c82600292f': 'Example & Video',
      '4f8439e0e6afa5c826002933': 'Example & Video',
      '4f8439abe6afa5c8260028f2': '',
      '4f8439e7e6afa5c82600293b': 'Integration',
      '4f843993e6afa5c8260028d3': 'Choices',
      '4f9a5b72477b5e7d2a001ba6': 'Social Cognition Communication & Language',
      '4f96f5c1477b5e7d2a000077': 'Social Cognition Requirements: Testing',
      '4f96f42e477b5e7d2a000064': 'Social Cognition Requirements',
      '4f9a4545477b5e7d2a001b4a': 'Right TPJ: Outcome monitoring',
      '4f9a3fac477b5e7d2a001b3b': 'Right TPJ: Moral judgment',
      '4f9a38bf477b5e7d2a001b04': 'Right TPJ: Behavioral scope',
      '4f9af859477b5e7d2a001c81': 'Language and Theory of Mind',
      '4f9a37dd477b5e7d2a001afc': 'Theory of Mind: Right TPJ',
      '4f9ae7e2477b5e7d2a001c1b': 'Chameleon effect: Social factors',
      '4f9ae4cd477b5e7d2a001bf5': 'Social Communication: Chameleon effect',
      '4f9a5d2f477b5e7d2a001baf': 'Social Communication',
      '4f9ae376477b5e7d2a001bef': 'Social communication: The yawning brain',
      '4f9a5f64477b5e7d2a001bbc': 'Social Communication: Imitation',
      '4f9a4d8b477b5e7d2a001b69': 'Alternate theories of TPJ function: Attention',
      '4f9a508b477b5e7d2a001b93': 'Alternate theories of TPJ function: Re-test',
      '4f9a46d3477b5e7d2a001b4f': 'Alternate theories of TPJ function',
      '4f9a5411477b5e7d2a001b9b': 'Alternate Theories: Mirror neurons',
      '4f9a55cd477b5e7d2a001ba0': 'Theory of Mind: Summary',
      '4f970521477b5e7d2a00010f': 'Theory of Mind',
      '4f978696477b5e7d2a000bf8': 'Theory of Mind: Role in normal behavior',
      '4f985cde477b5e7d2a000ec8': 'Theory of Mind: Comparison with self-awareness',
      '4f99ba82477b5e7d2a0014c6': 'Theory of Mind: fMRI',
      '4f99bb49477b5e7d2a001535': 'Theory of Mind: fMRI',
      '4f99cbc6477b5e7d2a00183d': 'TPJ: Mental states or false stories?',
      '4f99ccd8477b5e7d2a001848': 'Theory of Mind: Temporo-parietal junction',
      '4f9a326a477b5e7d2a001ae5': 'Theory of Mind: Additional regions',
      '4f9667ad8222299f190038d9': 'The Importance of Social Cognition',
      '4f9aed4c477b5e7d2a001c51': 'Language elements: Speech units',
      '4f9aef30477b5e7d2a001c5d': 'Language elements: Speech structure',
      '4f9aea26477b5e7d2a001c2f': 'Language and communication',
      '4f9af45e477b5e7d2a001c7c': 'Language Structure',
      '4f96fae5477b5e7d2a000092': 'Self-awareness: Testing',
      '4f9706ef477b5e7d2a00011e': 'Theory of Mind: Attributing Mental States',
      '4f8da71ee7c1e3251700004f': 'Theory of Mind: Testing',
      '4f9e340f2a198b3138000dab': 'Language Lateralization',
      '4f9e39ec2a198b3138000dc5': 'Language Lateralization: Wada test',
      '4f9ece702a198b3138000e85': 'Language Lateralization: Split-brain',
      '4f9ed5252a198b3138000ed8': 'Regional Specialization: Broca’s aphasia ',
      '4f9ed90b2a198b3138000ee9': 'Regional Specialization: Wernicke’s aphasia ',
      '4f9edb7d2a198b3138000f03': 'Lateralization & Specialization Summary ',
      '4f9ee6592a198b3138000f68': 'Neural Basis',
      '4fa04e9d65d886154400032a': 'Neural Basis',
      '4f9eed3e2a198b3138000fc4': 'Written Word Processing ',
      '4f9ef2702a198b3138001008': 'Written Word Processing: VWFA ',
      '4f9ef7d82a198b31380010a5': 'VWFA: Why left lateralized?',
      '4fa0300f65d8861544000096': 'Three Models',
      '4fa0314865d88615440000c6': 'Three Models',
      '4f9efc3c2a198b31380010c4': 'Modeling Speech Processing',
      '4fa031cb65d88615440000dd': 'Cognitive Map Theory',
      '4f9f023a2a198b3138001117': 'Modeling Speech Processing: Dual streams ',
      '4fa032a765d88615440000f0': 'Standard Consolidation Theory',
      '4fa0334865d8861544000101': 'Multiple Trace Theory',
      '4fa0342f65d886154400012e': 'SC vs MTT',
      '4fa0350165d886154400015d': 'SC vs MTT',
      '4fa0353f65d886154400016a': 'SC vs MTT',
      '4fa0356265d8861544000176': 'SC vs MTT',
      '4fa0356465d8861544000177': 'SC vs MTT',
      '4fa0360765d8861544000195': 'Suzuki Position',
      '4f9f03d22a198b3138001132': 'Measuring Meaning ',
      '4f9f06872a198b3138001174': 'Measuring meaning: EEG & ERPs ',
      '4fa0367065d88615440001a1': 'Baxter Position',
      '4fa0373b65d88615440001ba': 'Hippocampus and DNMS',
      '4fa0377465d88615440001c6': 'Hippocampus and DNMS',
      '4f9f09cf2a198b31380011f1': 'Measuring meaning: ERP characteristics ',
      '4fa0380865d88615440001da': 'No Delay Needed',
      '4fa0383865d88615440001dd': 'No Delay Needed',
      '4f9f0d932a198b313800123f': 'Measuring meaning: ERPs in practice',
      '4fa038f865d88615440001f3': 'Oddity Tasks',
      '4fa0393f65d88615440001f8': 'Feature Ambiguity',
      '4f9f10252a198b3138001257': 'Semantic relatedness and the N400',
      '4fa08b9965d88615440010c3': 'Patient Studies',
      '4fa08c2865d88615440010cb': 'Patient Studies',
      '4fa08c9865d88615440010cf': 'Patient Studies',
      '4f9f19fc2a198b3138001323': 'N400 scope',
      '4f9f1ba12a198b313800134b': 'N400 anatomical localization',
      '4fa08f8365d88615440010e2': 'Suzuki & Baxter Overview',
      '4fa0918b65d88615440010ef': 'Clive Wearing',
      '4f9f815d2a198b3138001b80': 'Behavioral studies of aging',
      '4f9f8b4d2a198b3138001ca6': 'Behavioral studies of aging: SLS',
      '4f9f8c3d2a198b3138001cc2': 'Behavioral studies of aging: SLS',
      '4f9f8c762a198b3138001cc5': 'Behavioral studies of aging: SLS',
      '4fa032f765d88615440000fa': 'SLS: Difference vs. change ',
      '4fa037bb65d88615440001d0': 'SLS: Interventions ',
      '4fa03ba965d8861544000220': 'Age-related brain differences: Animal models',
      '4fa04b0e65d88615440002ec': 'Age-related brain differences: People',
      '4fa04e8265d8861544000325': 'Age-related brain differences: Structure',
      '4fa0505265d8861544000350': 'Age-related brain differences: DTI',
      '4fa0540965d88615440004a6': 'Age-related brain differences: White matter integrity',
      '4fa057e965d88615440006fe': 'Age-related brain differences: Function',
      '4fa05a7165d88615440008a6': 'Interventions: Mental exercises',
      '4fa05ba665d886154400094f': 'Interventions: Aerobic fitness',
      '4fc468515dd1f95c42000d90': 'Why study music?',
      '4fc46f445dd1f95c42000d9c': 'Why study music: Universality',
      '4fc46fc5932d7a6942000dad': 'Why study music: Universality',
      '4fc470585dd1f95c42000d9f': 'Why study music: Universality',
      '4fc474bb5dd1f95c42000da4': 'Music & Emotion',
      '4fc47605932d7a6942000db4': 'Music & Emotion: Universal?',
      '4fc4778e151d276242000e27': 'Amusia',
      '4fc47b2c5dd1f95c42000dae': 'Amusia: Dissociation from language',
      '4fc480ad151d276242000e46': 'Amusia: Neuroanatomical abnormalities',
      '4fc4829f6f1b417042000e38': 'Music structure & expectation',
      '4fc8e5de932d7a69420016c6': 'Expectation & meaning ',
      '4fc4861f5dd1f95c42000ded': 'Expectation,ructure & meaning: Summary ',
      '4fc48799932d7a6942000dfa': 'Therapeutic uses of music ',
      '4fc48c33151d276242000e6c': 'MIT',
      '4fcad5b8932d7a6942001c01': 'Cortical Structures II',
      '4fcad5b9932d7a6942001c02': 'Cortical Structures II',
      '4fcad7db5dd1f95c42001c6c': 'Cortical Structures II',
      '4fcad7e2151d276242001cde': 'Cortical Structures II',
      '4fcae15a932d7a6942001c20': 'Cortical Structures II',
      '4fcae15b151d276242001cfb': 'Cortical Structures II',
      '4fcae165151d276242001cfc': 'Cortical Structures II',
      '4fcae16c932d7a6942001c21': 'Cortical Structures II',
      '4fcbfe7d6f1b4170420020af': 'Cortical Structures I',
      '4fcbff2c5dd1f95c420020d7': 'Cortical Structures I',
      '4fcbffc35dd1f95c420020e4': 'Cortical Structures I',
      '4fcc01976f1b4170420020eb': 'Cortical Structures I',
      '4fcc01f6932d7a6942002061': 'Cortical Structures I',
      '4fcc0ae4932d7a694200208d': 'Cortical Structures I',
      '4fcc0c0b6f1b417042002123': 'Cortical Structures I',
      '4fcc0c7d6f1b417042002126': 'Cortical Structures I',
      '4fcc0dbe5dd1f95c42002138': 'Cortical Structures I',
      '4fcc0f2f5dd1f95c4200213b': 'Cortical Structures I',
      '4fcc0f955dd1f95c4200213d': 'Cortical Structures I',
      '4fcc10316f1b41704200212e': 'Cortical Structures I',
      '4fcc10bc151d276242002154': 'Cortical Structures I',
      '4fcbf21e5dd1f95c42001fda': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbf5976f1b417042001fee': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbf5f9932d7a6942001f74': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbf660932d7a6942001f7d': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbf6ec932d7a6942001f89': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbf72e151d276242002035': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbfa1f5dd1f95c42002064': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbfa6d5dd1f95c4200206f': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcbfcac151d2762420020b2': 'Deep Structures of the Limbic System and Basal Ganglia II',
      '4fcb8dca932d7a6942001d7d': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb939f5dd1f95c42001df3': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb93fa932d7a6942001d85': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb963d151d276242001e5a': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb9779151d276242001e5f': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb977a5dd1f95c42001dfc': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb98986f1b417042001e1e': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fcb993f6f1b417042001e20': 'Deep Structures of the Limbic System and Basal Ganglia I',
      '4fc9a70d6f1b4170420018a5': 'Major Divisions',
      '4fc9accc151d2762420018cd': 'Major Divisions',
      '4fc9aefa5dd1f95c4200186d': 'Major Divisions',
      '4fc9aff66f1b4170420018ac': 'Major Divisions',
      '4fc9b95c151d2762420018de': 'Major Divisions'
    };
    ProbeView = (function() {
      __extends(ProbeView, baseviews.BaseView);
      function ProbeView() {
        this.showFeedback = __bind(this.showFeedback, this);
        this.addFeedback = __bind(this.addFeedback, this);
        this.answered = __bind(this.answered, this);
        this.addAnswers = __bind(this.addAnswers, this);
        this.render = __bind(this.render, this);
        ProbeView.__super__.constructor.apply(this, arguments);
      }
      ProbeView.prototype.events = {
        "click #feedbut": "showFeedback"
      };
      ProbeView.prototype.render = function() {
        var answer, nuggettitle, _i, _len, _ref, _ref2, _ref3;
        if (!this.model) {
          return;
        }
        nuggettitle = this.parent.options.notclaiming && ((_ref = this.model.parent) != null ? (_ref2 = _ref.model) != null ? _ref2.get('title') : void 0 : void 0) || probe_nugget_title[this.model.id] || "";
        this.$el.html(templates.probe(this.context({
          increment: this.parent.inc + this.parent.progress,
          total: this.parent.collection.length + this.parent.progress,
          nuggettitle: nuggettitle
        })));
        this.$('.question').html(this.model.get('questiontext'));
        _ref3 = _.shuffle(this.model.get('answers').models);
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          answer = _ref3[_i];
          this.addAnswers(answer, this.model.get("answers"));
        }
        return this.timestamp_load = new Date;
      };
      ProbeView.prototype.addAnswers = function(model, coll) {
        return this.add_subview("answerview_" + model.id, new ProbeAnswerView({
          model: model
        }), ".answerlist");
      };
      ProbeView.prototype.answered = function(response) {
        var key, subview, _ref;
        this.model.set(response.probe);
        if (response.correct) {
          this.$('.questionstatus').append('<h3 style="color:#22FF22">Correct</h3>');
        } else {
          this.$('.questionstatus').append('<h3 style="color:#FF2222">Incorrect</h3>');
        }
        this.$('.nextquestion').show();
        if (this.parent.inc === this.parent.collection.length) {
          if (this.parent.claimed === true && !this.parent.options.notclaiming) {
            this.$('.nextquestion').text('Claim Nugget!');
          } else {
            this.$('.nextquestion').text('Finish Quiz');
          }
        }
        _ref = this.subviews;
        for (key in _ref) {
          subview = _ref[key];
          subview.showFeedback();
        }
        if (this.model.get('feedback')) {
          this.feedback = true;
          this.addFeedback();
        }
        if (this.feedback) {
          return this.$('#feedbut').show();
        }
      };
      ProbeView.prototype.addFeedback = function() {
        return this.$('#qfeedback').append(this.model.get('feedback'));
      };
      ProbeView.prototype.showFeedback = function() {
        return this.$('.feedback').stop().slideDown();
      };
      return ProbeView;
    })();
    ProbeAnswerView = (function() {
      __extends(ProbeAnswerView, baseviews.BaseView);
      function ProbeAnswerView() {
        this.addFeedback = __bind(this.addFeedback, this);
        this.showFeedback = __bind(this.showFeedback, this);
        this.selectAnswer = __bind(this.selectAnswer, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        ProbeAnswerView.__super__.constructor.apply(this, arguments);
      }
      ProbeAnswerView.prototype.events = {
        "click .answer": "selectAnswer"
      };
      ProbeAnswerView.prototype.initialize = function() {
        return this.selected = false;
      };
      ProbeAnswerView.prototype.render = function() {
        return this.$el.html(templates.probe_answer(this.context()));
      };
      ProbeAnswerView.prototype.selectAnswer = function() {
        this.$('.answer').toggleClass('select');
        return this.selected = !this.selected;
      };
      ProbeAnswerView.prototype.showFeedback = function() {
        if (this.model.get('correct')) {
          this.$('.answertext').addClass('showing');
          if (this.model.get('feedback')) {
            this.$('.feedback').append(this.model.get('feedback'));
            this.parent.feedback = true;
          }
        }
        if (this.selected) {
          return this.addFeedback();
        }
      };
      ProbeAnswerView.prototype.addFeedback = function() {
        var checkorcross;
        if (this.model.get('correct')) {
          checkorcross = '<span class="check">&#10003;</span>';
        } else {
          checkorcross = '<span class="cross">&#10005;</span>';
          if (this.model.get('feedback')) {
            this.$('.feedback').append(this.model.get('feedback'));
            this.parent.feedback = true;
          }
        }
        return this.$('.checkorcross').append(checkorcross);
      };
      return ProbeAnswerView;
    })();
    ProbeEditView = (function() {
      __extends(ProbeEditView, baseviews.BaseView);
      function ProbeEditView() {
        this.addAnswers = __bind(this.addAnswers, this);
        this.createAnswer = __bind(this.createAnswer, this);
        this["return"] = __bind(this["return"], this);
        this.updateOnEnter = __bind(this.updateOnEnter, this);
        this.updateFeedbackOnEnter = __bind(this.updateFeedbackOnEnter, this);
        this.updateQuestionOnEnter = __bind(this.updateQuestionOnEnter, this);
        this.finish = __bind(this.finish, this);
        this.editFeedback = __bind(this.editFeedback, this);
        this.editQuestion = __bind(this.editQuestion, this);
        this.stopEdit = __bind(this.stopEdit, this);
        this.edit = __bind(this.edit, this);
        this.cancel = __bind(this.cancel, this);
        this.save = __bind(this.save, this);
        this.render = __bind(this.render, this);
        ProbeEditView.__super__.constructor.apply(this, arguments);
      }
      ProbeEditView.prototype.initialize = function() {
        this.mementoStore();
        this.model.bind("change", this.render);
        return this.newans = 0;
      };
      ProbeEditView.prototype.render = function() {
        var answer, _i, _len, _ref, _results;
        this.$el.html(templates.probe_edit(this.context()));
        _ref = this.model.get('answers').models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          answer = _ref[_i];
          _results.push(this.addAnswers(answer, this.model.get("answers")));
        }
        return _results;
      };
      ProbeEditView.prototype.events = {
        "click button.save": "save",
        "click button.cancel": "cancel",
        "dblclick .question": "editQuestion",
        "dblclick .questionfeedback": "editFeedback",
        "keypress .question_text": "updateQuestionOnEnter",
        "keypress .feedback_text": "updateFeedbackOnEnter",
        "click .addanswer": "createAnswer"
      };
      ProbeEditView.prototype.save = function() {
        this.$("input").blur();
        this.$(".save.btn").button("loading");
        return this.model.save().success(__bind(function() {
          console.log(this.url);
          return this["return"]();
        }, this));
      };
      ProbeEditView.prototype.cancel = function() {
        this.mementoRestore();
        return this["return"]();
      };
      ProbeEditView.prototype.edit = function(aclass) {
        return this.$(aclass).addClass('editing');
      };
      ProbeEditView.prototype.stopEdit = function(aclass) {
        return this.$(aclass).removeClass('editing');
      };
      ProbeEditView.prototype.editQuestion = function() {
        return this.edit('.question');
      };
      ProbeEditView.prototype.editFeedback = function() {
        return this.edit('.questionfeedback');
      };
      ProbeEditView.prototype.finish = function(aclass) {
        if (aclass === '.question') {
          this.model.set({
            question_text: this.$('.question_text')[0].value
          });
          return this.stopEdit(aclass);
        } else if (aclass === '.questionfeedback') {
          this.model.set({
            feedback: this.$('.feedback_text')[0].value
          });
          return this.stopEdit(aclass);
        }
      };
      ProbeEditView.prototype.updateQuestionOnEnter = function(event) {
        return this.updateOnEnter(event, '.question');
      };
      ProbeEditView.prototype.updateFeedbackOnEnter = function(event) {
        return this.updateOnEnter(event, '.questionfeedback');
      };
      ProbeEditView.prototype.updateOnEnter = function(event, aclass) {
        if (event.keyCode === 13) {
          return this.finish(aclass);
        }
      };
      ProbeEditView.prototype["return"] = function() {
        return require("app").navigate(this.url + "..");
      };
      ProbeEditView.prototype.createAnswer = function() {
        var answer;
        answer = this.model.get('answers').create({});
        this.addAnswers(answer, this.model.get('answers'));
        return this.newans += 1;
      };
      ProbeEditView.prototype.addAnswers = function(model, coll) {
        var viewid;
        viewid = model.id || this.newans;
        return this.add_subview("answerview_" + viewid, new ProbeAnswerEditView({
          model: model
        }), ".answerlist");
      };
      return ProbeEditView;
    })();
    ProbeAnswerEditView = (function() {
      __extends(ProbeAnswerEditView, baseviews.BaseView);
      function ProbeAnswerEditView() {
        this.toggleCorrect = __bind(this.toggleCorrect, this);
        this.toggleFeedback = __bind(this.toggleFeedback, this);
        this.updateOnEnter = __bind(this.updateOnEnter, this);
        this.updateFeedbackOnEnter = __bind(this.updateFeedbackOnEnter, this);
        this.updateAnswerOnEnter = __bind(this.updateAnswerOnEnter, this);
        this.finish = __bind(this.finish, this);
        this.editFeedback = __bind(this.editFeedback, this);
        this.editAnswer = __bind(this.editAnswer, this);
        this.stopEdit = __bind(this.stopEdit, this);
        this.edit = __bind(this.edit, this);
        this["delete"] = __bind(this["delete"], this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        ProbeAnswerEditView.__super__.constructor.apply(this, arguments);
      }
      ProbeAnswerEditView.prototype.events = {
        "dblclick .answer": "editAnswer",
        "dblclick .feedback": "editFeedback",
        "keypress .answertext": "updateAnswerOnEnter",
        "keypress .answerfeedbacktext": "updateFeedbackOnEnter",
        "click .answerfeedback": "toggleFeedback",
        "click .delete-button": "delete",
        "click .check_correct": "toggleCorrect"
      };
      ProbeAnswerEditView.prototype.initialize = function() {
        this.model.bind("change", this.render);
        this.model.bind("destroy", this.close);
        return this.editing = '';
      };
      ProbeAnswerEditView.prototype.render = function() {
        return this.$el.html(templates.probe_answer_edit(this.context()));
      };
      ProbeAnswerEditView.prototype["delete"] = function() {
        return this.model.destroy();
      };
      ProbeAnswerEditView.prototype.edit = function(aclass) {
        this.$(aclass).addClass('editing');
        return this.editing = aclass;
      };
      ProbeAnswerEditView.prototype.stopEdit = function(aclass) {
        this.$(aclass).removeClass('editing');
        return this.editing = '';
      };
      ProbeAnswerEditView.prototype.editAnswer = function() {
        if (this.editing) {
          this.finish(this.editing);
        }
        return this.edit('.answer');
      };
      ProbeAnswerEditView.prototype.editFeedback = function() {
        if (this.editing) {
          this.finish(this.editing);
        }
        return this.edit('.feedback');
      };
      ProbeAnswerEditView.prototype.finish = function(aclass) {
        if (aclass === '.answer') {
          this.stopEdit(aclass);
          return this.model.set({
            text: this.$('.answertext')[0].value
          });
        } else if (aclass === '.feedback') {
          this.stopEdit(aclass);
          return this.model.set({
            feedback: this.$('.answerfeedbacktext')[0].value
          });
        }
      };
      ProbeAnswerEditView.prototype.updateAnswerOnEnter = function(event) {
        return this.updateOnEnter(event, '.answer');
      };
      ProbeAnswerEditView.prototype.updateFeedbackOnEnter = function(event) {
        return this.updateOnEnter(event, '.feedback');
      };
      ProbeAnswerEditView.prototype.updateOnEnter = function(event, aclass) {
        if (event.keyCode === 13) {
          return this.finish(aclass);
        }
      };
      ProbeAnswerEditView.prototype.toggleFeedback = function(event) {
        if (this.editing) {
          this.finish(this.editing);
        }
        this.$('.feedback_text').toggleClass('hidden');
        if (this.$(event.target).is(':checked')) {
          return this.finish('.feedback');
        } else {
          return this.model.set({
            feedback: ''
          });
        }
      };
      ProbeAnswerEditView.prototype.toggleCorrect = function() {
        if (this.editing) {
          this.finish(this.editing);
        }
        return this.model.set({
          correct: !this.model.get('correct')
        });
      };
      return ProbeAnswerEditView;
    })();
    return {
      ProbeRouterView: ProbeRouterView,
      ProbeListView: ProbeListView,
      ProbeView: ProbeView,
      ProbeContainerView: ProbeContainerView,
      MidtermView: MidtermView,
      FinalView: FinalView,
      PostTestView: PostTestView,
      QuizView: QuizView,
      ProbeTopEditView: ProbeEditView
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  define('cs!nugget/views',["cs!base/views", "cs!./models", "cs!page/views", "cs!content/items/views", "cs!ui/dialogs/views", "cs!probe/views", "hb!./templates.handlebars", "cs!./hardcode", "less!./styles"], function(baseviews, models, pageviews, itemviews, dialogviews, probeviews, templates, hardcode, styles) {
    var ClusterListView, FilteredNuggetListView, LectureBottomView, LectureListView, LectureView, NuggetBottomRouterView, NuggetListView, NuggetRouterView, NuggetTopEditView, NuggetTopView, NuggetView, ProbeToggleEnableView, ProbeToggleRouterView, StudyRouterView, TagSelectorView, doPost, refreshNuggetAnalytics;
    refreshNuggetAnalytics = __bind(function() {
      return $.get('/analytics/nuggetattempt/', __bind(function(nuggetattempt) {
        var claimed, partial;
        partial = nuggetattempt.attempted;
        claimed = nuggetattempt.claimed;
        require('app').get('user').set({
          claimed: new Backbone.Collection(claimed),
          partial: new Backbone.Collection(partial)
        });
        return require('app').trigger("nuggetAnalyticsChanged");
      }, this));
    }, this);
    refreshNuggetAnalytics();
    _.defer(__bind(function() {
      return require("app").bind("loginChanged", refreshNuggetAnalytics);
    }, this));
    StudyRouterView = (function() {
      __extends(StudyRouterView, baseviews.RouterView);
      function StudyRouterView() {
        this.routes = __bind(this.routes, this);
        StudyRouterView.__super__.constructor.apply(this, arguments);
      }
      StudyRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: LectureListView,
              datasource: "collection",
              nonpersistent: true
            };
          }, this),
          ":nugget_id/": __bind(function(nugget_id) {
            return {
              view: NuggetView,
              datasource: "collection",
              key: nugget_id
            };
          }, this),
          "lecture/:lecture_id/": __bind(function(lecture_id) {
            return {
              view: LectureView,
              datasource: "collection",
              lecture: lecture_id,
              nonpersistent: true
            };
          }, this)
        };
      };
      StudyRouterView.prototype.initialize = function() {
        return StudyRouterView.__super__.initialize.apply(this, arguments);
      };
      return StudyRouterView;
    })();
    NuggetRouterView = (function() {
      __extends(NuggetRouterView, baseviews.RouterView);
      function NuggetRouterView() {
        this.routes = __bind(this.routes, this);
        NuggetRouterView.__super__.constructor.apply(this, arguments);
      }
      NuggetRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: NuggetListView,
              datasource: "collection",
              nonpersistent: true
            };
          }, this),
          ":nugget_id/": __bind(function(nugget_id) {
            return {
              view: NuggetView,
              datasource: "collection",
              key: nugget_id
            };
          }, this),
          "quiz/": __bind(function() {
            return {
              view: probeviews.QuizView,
              datasource: "collection",
              nonpersistent: true,
              notclaiming: true
            };
          }, this),
          "test/": __bind(function() {
            return {
              view: probeviews.QuizView,
              datasource: "collection",
              nonpersistent: true,
              notclaiming: true,
              nofeedback: true
            };
          }, this)
        };
      };
      NuggetRouterView.prototype.initialize = function() {
        return NuggetRouterView.__super__.initialize.apply(this, arguments);
      };
      return NuggetRouterView;
    })();
    NuggetListView = (function() {
      __extends(NuggetListView, baseviews.BaseView);
      function NuggetListView() {
        this.deleteNugget = __bind(this.deleteNugget, this);
        this.addNewNugget = __bind(this.addNewNugget, this);
        this.navigate = __bind(this.navigate, this);
        this.render = __bind(this.render, this);
        NuggetListView.__super__.constructor.apply(this, arguments);
      }
      NuggetListView.prototype.events = {
        "click .add-button": "addNewNugget",
        "click .delete-button": "deleteNugget"
      };
      NuggetListView.prototype.render = function() {
        this.filteredcollection = this.collection.selectNuggets(this.query);
        this.$el.html(templates.nugget_list({
          collection: this.filteredcollection
        }));
        this.makeSortable();
        return this.add_subview("tagselectorview", new TagSelectorView({
          collection: this.filteredcollection
        }), ".tagselectorview");
      };
      NuggetListView.prototype.initialize = function() {
        this.collection.bind("change", this.render);
        this.collection.bind("remove", this.render);
        return this.collection.bind("add", _.debounce(this.render, 50));
      };
      NuggetListView.prototype.navigate = function(fragment, query) {
        if (!_.isEqual(query, this.query)) {
          _.defer(this.render);
        }
        return NuggetListView.__super__.navigate.apply(this, arguments);
      };
      NuggetListView.prototype.addNewNugget = function() {
        return dialogviews.dialog_request_response("Please enter a title:", __bind(function(title) {
          return this.collection.create({
            title: title
          });
        }, this));
      };
      NuggetListView.prototype.deleteNugget = function(ev) {
        var nugget;
        nugget = this.collection.get(ev.target.id);
        return dialogviews.delete_confirmation(nugget, "nugget", __bind(function() {
          return this.collection.remove(nugget);
        }, this));
      };
      NuggetListView.prototype.makeSortable = function() {};
      return NuggetListView;
    })();
    TagSelectorView = (function() {
      __extends(TagSelectorView, baseviews.BaseView);
      function TagSelectorView() {
        this.quizUrl = __bind(this.quizUrl, this);
        this.tagUrl = __bind(this.tagUrl, this);
        this.claimedUrl = __bind(this.claimedUrl, this);
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        TagSelectorView.__super__.constructor.apply(this, arguments);
      }
      TagSelectorView.prototype.initialize = function() {};
      TagSelectorView.prototype.render = function() {
        var nugget, tag, tags, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
        this.taglist = [];
        tags = [];
        if (this.query) {
          this.claimfilter = this.claimedUrl();
          _ref = this.collection.models;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            nugget = _ref[_i];
            _ref2 = nugget.get('tags') || [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              tag = _ref2[_j];
              tags.push(tag.trim().toLowerCase());
            }
          }
          tags = _.uniq(tags);
          tags.sort();
          for (_k = 0, _len3 = tags.length; _k < _len3; _k++) {
            tag = tags[_k];
            if (__indexOf.call((decodeURIComponent(this.query.tags) || '').split(';'), tag) >= 0) {
              this.taglist.push({
                tagname: tag,
                selected: true,
                url: this.tagUrl(tag, true)
              });
            } else {
              this.taglist.push({
                tagname: tag,
                url: this.tagUrl(tag, false)
              });
            }
          }
        }
        this.quiz = this.quizUrl('quiz/');
        this.test = this.quizUrl('test/');
        return this.$el.html(templates.tag_selector(this.context(this.taglist, this.claimfilter, this.quiz)));
      };
      TagSelectorView.prototype.claimedUrl = function() {
        var all, claimed, claimfilter, tags, unclaimed;
        tags = this.query.tags ? 'tags=' + this.query.tags : '';
        all = {
          text: 'All',
          selected: !this.query.claimed,
          url: tags ? this.url + '?' + tags : this.url
        };
        claimed = {
          text: 'Claimed',
          selected: this.query.claimed === '1',
          url: tags ? this.url + '?' + tags + '&' + 'claimed=1' : this.url + '?' + 'claimed=1'
        };
        unclaimed = {
          text: 'Unclaimed',
          selected: this.query.claimed === '0',
          url: tags ? this.url + '?' + tags + '&' + 'claimed=0' : this.url + '?' + 'claimed=0'
        };
        return claimfilter = [all, claimed, unclaimed];
      };
      TagSelectorView.prototype.tagUrl = function(tagname, selected) {
        var claimed, tag, taglist, tags, url;
        claimed = this.query.claimed ? 'claimed=' + this.query.claimed : '';
        taglist = this.query.tags ? (function() {
          var _i, _len, _ref, _results;
          _ref = this.query.tags.split(';');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tag = _ref[_i];
            _results.push(tag);
          }
          return _results;
        }).call(this) : [];
        if (selected) {
          taglist = _.without(taglist, encodeURIComponent(tagname));
        } else {
          taglist.push(tagname);
        }
        tags = taglist.join(';') ? 'tags=' + taglist.join(';') : '';
        return url = tags ? this.url + '?' + tags + (claimed ? '&' + claimed : '') : this.url + (claimed ? '?' + claimed : '');
      };
      TagSelectorView.prototype.quizUrl = function(quiz) {
        var claimed, quizUrl, tags;
        claimed = this.query.claimed ? 'claimed=' + this.query.claimed : '';
        tags = this.query.tags ? 'tags=' + this.query.tags : '';
        return quizUrl = {
          url: tags ? this.url + quiz + '?' + tags + (claimed ? '&' + claimed : '') : this.url + quiz + (claimed ? '?' + claimed : '')
        };
      };
      return TagSelectorView;
    })();
    LectureListView = (function() {
      __extends(LectureListView, baseviews.RouterView);
      function LectureListView() {
        this.clusterView = __bind(this.clusterView, this);
        this.initialize = __bind(this.initialize, this);
        this.render = __bind(this.render, this);
        this.routes = __bind(this.routes, this);
        LectureListView.__super__.constructor.apply(this, arguments);
      }
      LectureListView.prototype.routes = function() {
        return {
          "lecture/:lecture_id/": __bind(function(lecture_id) {
            return {
              view: LectureView,
              datasource: "collection",
              lecture: lecture_id
            };
          }, this)
        };
      };
      LectureListView.prototype.render = function() {
        var lect, lecture, relec;
        this.$el.html(templates.nugget_lecture_list(this.context(this.lecturelist)));
        this.lecturelist = {
          lecture: (function() {
            var _ref, _results;
            _ref = hardcode.knowledgestructure;
            _results = [];
            for (lecture in _ref) {
              lect = _ref[lecture];
              _results.push({
                title: lect.title,
                lecture: lecture,
                points: 0,
                status: 'unclaimed',
                minpoints: lect.minpoints
              });
            }
            return _results;
          })(),
          totalpoints: 0
        };
        relec = new RegExp('(L[0-9]+)');
        return require('app').get('user').getKeyWhenReady('claimed', __bind(function(claimed) {
          return require('app').get("course").whenLoaded(__bind(function() {
            var lec, lecture, nuggetitem, tag, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
            _ref = this.lecturelist.lecture;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              lecture = _ref[_i];
              lecture.points = 0;
              lecture.status = 'unclaimed';
            }
            _ref2 = claimed.models;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              nuggetitem = _ref2[_j];
              lec = '';
              _ref4 = ((_ref3 = require('app').get('course').get('nuggets').get(nuggetitem.id)) != null ? _ref3.get('tags') : void 0) || [];
              for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
                tag = _ref4[_k];
                lec = ((_ref5 = relec.exec(tag)) != null ? _ref5[0] : void 0) || lec;
              }
              if (!lec) {
                continue;
              }
              if ((_ref6 = _.find(this.lecturelist.lecture, function(lect) {
                return lect.lecture === lec;
              })) != null) {
                _ref6.points += nuggetitem.get('points');
              }
            }
            this.lecturelist.totalpoints = 0;
            _ref7 = this.lecturelist.lecture;
            for (_l = 0, _len4 = _ref7.length; _l < _len4; _l++) {
              lecture = _ref7[_l];
              this.lecturelist.totalpoints += lecture.points;
              if (lecture.points >= lecture.minpoints) {
                lecture.status = 'claimed';
              }
            }
            return this.$el.html(templates.nugget_lecture_list(this.context(this.lecturelist)));
          }, this));
        }, this));
      };
      LectureListView.prototype.initialize = function() {
        return require('app').bind("nuggetAnalyticsChanged", this.render);
      };
      LectureListView.prototype.clusterView = function(ev) {
        var clustercollection, lecture;
        lecture = ev.target.id;
        this.$(".view").toggleClass('hidden');
        this.lecturecollection = this.collection.filter(__bind(function(model) {
          return __indexOf.call(model.get('tags') || [], lecture) >= 0;
        }, this));
        clustercollection = hardcode.knowledgestructure[lecture];
        console.log(hardcode.knowledgestructure);
        console.log(clustercollection);
        return this.add_subview("clusterview", new NuggetSpaceClusterView({
          collection: this.lecturecollection,
          clusters: clustercollection
        }), ".clusterview");
      };
      return LectureListView;
    })();
    LectureView = (function() {
      __extends(LectureView, baseviews.BaseView);
      function LectureView() {
        this.render = __bind(this.render, this);
        LectureView.__super__.constructor.apply(this, arguments);
      }
      LectureView.prototype.render = function() {
        var html;
        html = "<h2>Lecture " + (Number(this.options.lecture.slice(1))) + ": " + hardcode.knowledgestructure[this.options.lecture].title + "</h2>";
        this.$el.html(html + "<div class='navigation pagination'></div><div class='body'></div>");
        this.add_subview("top", new ClusterListView({
          lecture: this.options.lecture
        }), ".navigation");
        return this.add_subview("bottom", new LectureBottomView({
          collection: this.collection,
          lecture: this.options.lecture
        }), ".body");
      };
      return LectureView;
    })();
    ClusterListView = (function() {
      __extends(ClusterListView, baseviews.NavRouterView);
      function ClusterListView() {
        ClusterListView.__super__.constructor.apply(this, arguments);
      }
      ClusterListView.prototype.className = "nav";
      ClusterListView.prototype.pattern = "cluster/:cluster_id/";
      ClusterListView.prototype.initialize = function() {
        var id, name, _ref, _results;
        _ref = hardcode.knowledgestructure[this.options.lecture].clusters;
        _results = [];
        for (id in _ref) {
          name = _ref[id];
          _results.push(this.addItem(id, name));
        }
        return _results;
      };
      return ClusterListView;
    })();
    LectureBottomView = (function() {
      __extends(LectureBottomView, baseviews.RouterView);
      function LectureBottomView() {
        this.routes = __bind(this.routes, this);
        LectureBottomView.__super__.constructor.apply(this, arguments);
      }
      LectureBottomView.prototype.routes = function() {
        return {
          "cluster/:cluster_id/": __bind(function(cluster_id) {
            return {
              view: FilteredNuggetListView,
              datasource: "collection",
              cluster: cluster_id,
              lecture: this.options.lecture,
              nonpersistent: true
            };
          }, this)
        };
      };
      return LectureBottomView;
    })();
    FilteredNuggetListView = (function() {
      __extends(FilteredNuggetListView, baseviews.BaseView);
      function FilteredNuggetListView() {
        this.render = __bind(this.render, this);
        this.initialize = __bind(this.initialize, this);
        FilteredNuggetListView.__super__.constructor.apply(this, arguments);
      }
      FilteredNuggetListView.prototype.initialize = function() {
        this.collection.bind("add", this.render);
        return require('app').bind("nuggetAnalyticsChanged", this.render);
      };
      FilteredNuggetListView.prototype.render = function() {
        var nugget, nuggetlist, _i, _len, _ref, _ref2, _ref3;
        nuggetlist = {
          nuggets: this.collection.selectNuggets({
            tags: this.options.lecture + ";" + this.options.cluster
          }).models
        };
        nuggetlist.nuggets = _.sortBy(nuggetlist.nuggets, function(nugget) {
          var nug, renug, tag, _i, _len, _ref, _ref2;
          nug = '';
          renug = new RegExp('N([0-9]+)');
          _ref = nugget.attributes.tags;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            tag = _ref[_i];
            nug = ((_ref2 = renug.exec(tag)) != null ? _ref2[1] : void 0) || nug;
          }
          return Number(nug);
        });
        _ref = nuggetlist.nuggets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          nugget = _ref[_i];
          if ((_ref2 = require('app').get('user').get('claimed')) != null ? _ref2.get(nugget.id) : void 0) {
            nugget.status = 'claimed';
          } else if ((_ref3 = require('app').get('user').get('partial')) != null ? _ref3.get(nugget.id) : void 0) {
            nugget.status = 'partial';
          } else {
            nugget.status = 'unclaimed';
          }
        }
        return this.$el.html(templates.filtered_nugget_list(nuggetlist));
      };
      return FilteredNuggetListView;
    })();
    doPost = function(url, data, success) {
      return $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        success: success,
        contentType: 'application/json'
      });
    };
    ProbeToggleEnableView = (function() {
      __extends(ProbeToggleEnableView, baseviews.BaseView);
      function ProbeToggleEnableView() {
        this.unClaim = __bind(this.unClaim, this);
        this.render = __bind(this.render, this);
        ProbeToggleEnableView.__super__.constructor.apply(this, arguments);
      }
      ProbeToggleEnableView.prototype.events = {
        "click .unclaim": "unClaim"
      };
      ProbeToggleEnableView.prototype.initialize = function() {
        return require('app').bind("nuggetAnalyticsChanged", this.render);
      };
      ProbeToggleEnableView.prototype.render = function() {
        var _ref;
        return this.$el.html(templates.probe_enable(this.context({
          status: (_ref = require('app').get('user').get('claimed')) != null ? _ref.get(this.model.id) : void 0
        })));
      };
      ProbeToggleEnableView.prototype.unClaim = function() {
        return dialogviews.dialog_confirmation("Unclaim Nugget", "Do you really want to Unclaim this Nugget? (you will need to take the quiz again if you want to reclaim it later)", __bind(function() {
          var nuggetattempt;
          nuggetattempt = {
            unclaimed: true,
            nugget: this.parent.model.id
          };
          return doPost('/analytics/nuggetattempt/', nuggetattempt, refreshNuggetAnalytics);
        }, this), {
          confirm_button: "Unclaim",
          cancel_button: "Cancel"
        });
      };
      return ProbeToggleEnableView;
    })();
    ProbeToggleRouterView = (function() {
      __extends(ProbeToggleRouterView, baseviews.RouterView);
      function ProbeToggleRouterView() {
        this.routes = __bind(this.routes, this);
        ProbeToggleRouterView.__super__.constructor.apply(this, arguments);
      }
      ProbeToggleRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: ProbeToggleEnableView,
              datasource: "model",
              nonpersistent: true
            };
          }, this),
          "quiz/": __bind(function() {
            return {
              view: baseviews.GenericTemplateView,
              template: templates.probe_disable
            };
          }, this)
        };
      };
      return ProbeToggleRouterView;
    })();
    NuggetView = (function() {
      __extends(NuggetView, baseviews.BaseView);
      function NuggetView() {
        this.editDone = __bind(this.editDone, this);
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        NuggetView.__super__.constructor.apply(this, arguments);
      }
      NuggetView.prototype.render = function() {
        this.$el.html(templates.nugget(this.context()));
        this.add_subview("topview", new NuggetTopView({
          model: this.model
        }), ".nugget-top");
        return this.add_subview("bottomview", new NuggetBottomRouterView({
          model: this.model
        }), '.nugget-bottom');
      };
      NuggetView.prototype.edit = function() {
        this.subviews.topview.hide();
        return this.add_subview("topeditview", new NuggetTopEditView({
          model: this.model
        }), ".nugget-top");
      };
      NuggetView.prototype.editDone = function() {
        this.close_subview("topeditview");
        return this.subviews.topview.show();
      };
      return NuggetView;
    })();
    NuggetBottomRouterView = (function() {
      __extends(NuggetBottomRouterView, baseviews.RouterView);
      function NuggetBottomRouterView() {
        this.routes = __bind(this.routes, this);
        NuggetBottomRouterView.__super__.constructor.apply(this, arguments);
      }
      NuggetBottomRouterView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              name: "pageview",
              view: pageviews.PageView,
              datasource: "model",
              key: "page"
            };
          }, this),
          "quiz/": __bind(function() {
            return {
              view: probeviews.ProbeRouterView,
              datasource: "model",
              key: "probeset",
              nonpersistent: true
            };
          }, this)
        };
      };
      NuggetBottomRouterView.prototype.initialize = function() {
        return NuggetBottomRouterView.__super__.initialize.apply(this, arguments);
      };
      return NuggetBottomRouterView;
    })();
    NuggetTopView = (function() {
      __extends(NuggetTopView, baseviews.BaseView);
      function NuggetTopView() {
        this.edit = __bind(this.edit, this);
        this.render = __bind(this.render, this);
        this.events = __bind(this.events, this);
        NuggetTopView.__super__.constructor.apply(this, arguments);
      }
      Handlebars.registerHelper('navlink', function(tags) {
        var clus, lec, reclus, relec, tag, _i, _len;
        if (!_.isArray(tags)) {
          return "";
        }
        relec = new RegExp('L([0-9]+)');
        reclus = new RegExp('C([0-9]+)');
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          tag = tags[_i];
          lec = relec.exec(tag) || lec;
          clus = reclus.exec(tag) || clus;
        }
        if (!lec || !clus) {
          return '';
        }
        return "<a href='" + this.url + "../../study/lecture/" + lec[0] + "/cluster/" + clus[0] + "/'>Return to Lecture " + Number(lec[1]) + " Cluster " + Number(clus[1]) + "</a>";
      });
      Handlebars.registerHelper('comma_join', function(tags) {
        return _.isArray(tags) && (typeof tags.join === "function" ? tags.join(",") : void 0) || "";
      });
      NuggetTopView.prototype.initialize = function() {};
      NuggetTopView.prototype.events = function() {
        return _.extend(NuggetTopView.__super__.events.apply(this, arguments), {
          "click .edit-button": "edit"
        });
      };
      NuggetTopView.prototype.render = function() {
        this.$el.html(templates.nugget_top(this.context()));
        this.add_subview("probetoggle", new ProbeToggleRouterView({
          model: this.model
        }), ".probetoggle");
        return this.bind_data();
      };
      NuggetTopView.prototype.edit = function() {
        return this.parent.edit();
      };
      return NuggetTopView;
    })();
    NuggetTopEditView = (function() {
      __extends(NuggetTopEditView, baseviews.BaseView);
      function NuggetTopEditView() {
        this.cancel = __bind(this.cancel, this);
        this.save = __bind(this.save, this);
        this.render = __bind(this.render, this);
        NuggetTopEditView.__super__.constructor.apply(this, arguments);
      }
      NuggetTopEditView.prototype.initialize = function() {
        return this.mementoStore();
      };
      NuggetTopEditView.prototype.render = function() {
        this.$el.html(templates.nugget_top_edit(this.context()));
        Backbone.ModelBinding.bind(this);
        return this.enablePlaceholders();
      };
      NuggetTopEditView.prototype.events = {
        "click button.save": "save",
        "click button.cancel": "cancel"
      };
      NuggetTopEditView.prototype.save = function() {
        this.$("input").blur();
        this.$(".save.btn").button("loading");
        if (_.isString(this.model.get("tags"))) {
          this.model.set({
            tags: this.model.get("tags").split(",")
          });
        }
        return this.model.save().success(__bind(function() {
          return this.parent.editDone();
        }, this));
      };
      NuggetTopEditView.prototype.cancel = function() {
        this.mementoRestore();
        return this.parent.editDone();
      };
      return NuggetTopEditView;
    })();
    return {
      StudyRouterView: StudyRouterView,
      NuggetRouterView: NuggetRouterView,
      NuggetListView: NuggetListView,
      NuggetView: NuggetView,
      NuggetTopView: NuggetTopView,
      NuggetTopEditView: NuggetTopEditView
    };
  });
}).call(this);

define('less!grade/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!grade/views',["cs!base/views", "cs!./models", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, templates, styles) {
    var GradesView;
    GradesView = (function() {
      __extends(GradesView, baseviews.BaseView);
      function GradesView() {
        this.render = __bind(this.render, this);
        GradesView.__super__.constructor.apply(this, arguments);
      }
      GradesView.prototype.initialize = function() {
        this.collection = new models.GradeCollection;
        return this.collection.fetch().success(this.render);
      };
      GradesView.prototype.render = function() {
        return this.$el.html(templates.grades(this.context()));
      };
      return GradesView;
    })();
    return {
      GradesView: GradesView
    };
  });
}).call(this);

define('less!auth/styles', function() { return; });
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!auth/views',["cs!base/views", "cs!./models", "cs!./utils", "hb!./templates.handlebars", "less!./styles"], function(baseviews, models, utils, templates, styles) {
    var LoginView;
    LoginView = (function() {
      __extends(LoginView, baseviews.BaseView);
      function LoginView() {
        this.submitOnEnter = __bind(this.submitOnEnter, this);
        this.submitLogout = __bind(this.submitLogout, this);
        this.submitLogin = __bind(this.submitLogin, this);
        this.checkLoginStatus = __bind(this.checkLoginStatus, this);
        this.render = __bind(this.render, this);
        this.loginStatusChanged = __bind(this.loginStatusChanged, this);
        this.events = __bind(this.events, this);
        LoginView.__super__.constructor.apply(this, arguments);
      }
      LoginView.prototype.events = function() {
        return _.extend(LoginView.__super__.events.apply(this, arguments), {
          "click .login-button": "submitLogin",
          "keypress input": "submitOnEnter",
          "click .logout-button": "submitLogout"
        });
      };
      LoginView.prototype.initialize = function() {
        this.model.bind("change:loggedIn", this.loginStatusChanged);
        this.checkLoginStatus();
        return setInterval(this.checkLoginStatus, 60000 * 15);
      };
      LoginView.prototype.loginStatusChanged = function() {
        this.render();
        return require("app").trigger("loginChanged");
      };
      LoginView.prototype.render = function() {
        if (this.model.get("loggedIn") === true) {
          return this.$el.html(templates.logout(this.context()));
        } else if (this.model.get("loggedIn") === false) {
          return this.$el.html(templates.login(this.context()));
        }
      };
      LoginView.prototype.checkLoginStatus = function() {
        return utils.check(this.model);
      };
      LoginView.prototype.submitLogin = function() {
        var login;
        login = utils.login(this.model, this.$(".email").val(), this.$(".password").val());
        return login.error(__bind(function() {
          return alert("There was an error logging you in. Please try again.");
        }, this));
      };
      LoginView.prototype.submitLogout = function() {
        var logout;
        logout = utils.logout(this.model);
        return logout.error(__bind(function() {
          return alert("There was an error logging you out.");
        }, this));
      };
      LoginView.prototype.submitOnEnter = function(ev) {
        if (ev.which === 13) {
          this.submitLogin();
          return false;
        }
      };
      return LoginView;
    })();
    return {
      LoginView: LoginView
    };
  });
}).call(this);

(function() {
  define('cs!analytics/utils',[], function() {
    var ga_initialize, ga_log_error, ga_track_pageview;
    window._gaq = window._gaq || [];
    _gaq.push(['_setAccount', 'UA-4950843-6']);
    ga_initialize = function() {
      var ga, s;
      ga = document.createElement("script");
      ga.type = "text/javascript";
      ga.async = true;
      ga.src = ("https:" === document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
      s = document.getElementsByTagName("script")[0];
      return s.parentNode.insertBefore(ga, s);
    };
    ga_track_pageview = function(url) {
      if (environ === "DEPLOY") {
        return _gaq.push(["_trackPageview", url]);
      }
    };
    ga_log_error = function(message, category) {
      if (category == null) {
        category = "Global";
      }
      if (environ === "DEPLOY") {
        return _gaq.push(['_trackEvent', 'Errors', category, message, null, true]);
      }
    };
    if (environ === "DEPLOY") {
      window.onerror = function(message, file, line) {
        var formattedMessage;
        formattedMessage = '[' + file + ' (' + line + ')] ' + message.toString();
        return ga_log_error(formattedMessage);
      };
    }
    return {
      ga_initialize: ga_initialize,
      ga_track_pageview: ga_track_pageview,
      ga_log_error: ga_log_error
    };
  });
}).call(this);

(function() {
  define('cs!utils/urls',[], function() {
    var getUrlParams;
    getUrlParams = function(url) {
      var key, param, params, query, val, _i, _len, _ref, _ref2, _ref3;
      query = ((_ref = /(^[^?]*\?)?(.*)/g.exec(url)) != null ? _ref[2] : void 0) || "";
      params = {};
      _ref2 = query.split("&");
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        param = _ref2[_i];
        _ref3 = param.split("="), key = _ref3[0], val = _ref3[1];
        params[key] = val || "";
      }
      return params;
    };
    return {
      getUrlParams: getUrlParams
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!glossary/models',["cs!base/models"], function(basemodels) {
    var GlossaryCollection, GlossaryModel;
    GlossaryModel = (function() {
      __extends(GlossaryModel, basemodels.LazyModel);
      function GlossaryModel() {
        GlossaryModel.__super__.constructor.apply(this, arguments);
      }
      return GlossaryModel;
    })();
    GlossaryCollection = (function() {
      __extends(GlossaryCollection, basemodels.LazyCollection);
      function GlossaryCollection() {
        GlossaryCollection.__super__.constructor.apply(this, arguments);
      }
      GlossaryCollection.prototype.model = GlossaryModel;
      return GlossaryCollection;
    })();
    return {
      GlossaryModel: GlossaryModel,
      GlossaryCollection: GlossaryCollection
    };
  });
}).call(this);

(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!course/models',["cs!base/models", "cs!lecture/models", "cs!assignment/models", "cs!nugget/models", "cs!content/models", "cs!page/models", "cs!glossary/models", "cs!file/models"], function(basemodels, lecturemodels, assignmentmodels, nuggetmodels, contentmodels, pagemodels, glossarymodels, filemodels) {
    var CourseCollection, CourseModel;
    CourseModel = (function() {
      __extends(CourseModel, basemodels.LazyModel);
      function CourseModel() {
        CourseModel.__super__.constructor.apply(this, arguments);
      }
      CourseModel.prototype.apiCollection = "course";
      CourseModel.prototype.relations = function() {
        return {
          lectures: {
            collection: lecturemodels.LectureCollection,
            includeInJSON: ["title", "description", "scheduled", "page"]
          },
          assignments: {
            collection: assignmentmodels.AssignmentCollection,
            includeInJSON: ["title", "description", "due", "page"]
          },
          content: {
            model: contentmodels.ContentModel,
            includeInJSON: true
          },
          nuggets: {
            collection: nuggetmodels.NuggetCollection,
            includeInJSON: true
          },
          glossary: {
            collection: glossarymodels.GlossaryCollection,
            includeInJSON: true
          }
        };
      };
      return CourseModel;
    })();
    CourseCollection = (function() {
      __extends(CourseCollection, basemodels.LazyCollection);
      function CourseCollection() {
        CourseCollection.__super__.constructor.apply(this, arguments);
      }
      CourseCollection.prototype.model = CourseModel;
      return CourseCollection;
    })();
    return {
      CourseModel: CourseModel,
      CourseCollection: CourseCollection
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!course/views',["cs!base/views", "cs!home/views", "cs!lecture/views", "cs!assignment/views", "cs!nugget/views", "cs!chat/views", "cs!analytics/views", "cs!file/views", "cs!probe/views", "cs!grade/views", "cs!./models"], function(baseviews, homeviews, lectureviews, assignmentviews, nuggetviews, chatviews, analyticsviews, fileviews, probeviews, gradeviews, models) {
    var CourseView;
    CourseView = (function() {
      __extends(CourseView, baseviews.RouterView);
      function CourseView() {
        this.updateTitle = __bind(this.updateTitle, this);
        this.initialize = __bind(this.initialize, this);
        this.routes = __bind(this.routes, this);
        CourseView.__super__.constructor.apply(this, arguments);
      }
      CourseView.prototype.routes = function() {
        return {
          "": __bind(function() {
            return {
              view: homeviews.HomeView,
              datasource: "model"
            };
          }, this),
          "lecture/": __bind(function() {
            return {
              view: lectureviews.LectureRouterView,
              datasource: "model",
              key: "lectures"
            };
          }, this),
          "assignment/": __bind(function() {
            return {
              view: assignmentviews.AssignmentRouterView,
              datasource: "model",
              key: "assignments"
            };
          }, this),
          "study/": __bind(function() {
            return {
              view: nuggetviews.StudyRouterView,
              datasource: "model",
              key: "nuggets"
            };
          }, this),
          "nuggets/": __bind(function() {
            return {
              view: nuggetviews.NuggetRouterView,
              datasource: "model",
              key: "nuggets"
            };
          }, this),
          "chat/": __bind(function() {
            return {
              view: chatviews.ChatView
            };
          }, this),
          "final/": __bind(function() {
            return {
              view: probeviews.FinalView
            };
          }, this),
          "posttest/": __bind(function() {
            return {
              view: probeviews.PostTestView
            };
          }, this),
          "grades/": __bind(function() {
            return {
              view: gradeviews.GradesView
            };
          }, this),
          "analytics/": __bind(function() {
            return {
              view: analyticsviews.AnalyticsView
            };
          }, this),
          "filebrowse/": __bind(function() {
            return new fileviews.FileBrowserView;
          }, this)
        };
      };
      CourseView.prototype.initialize = function() {
        this.model.bind("change:title", this.updateTitle);
        document.title = "thisCourse";
        return this.updateTitle();
      };
      CourseView.prototype.updateTitle = function() {
        var title;
        title = "thisCourse";
        if (this.model.has("title")) {
          title += " | " + this.model.get("title");
        }
        return document.title = title;
      };
      return CourseView;
    })();
    return {
      CourseView: CourseView
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!app/views',["cs!base/views", "cs!course/views", "cs!auth/views", "hb!./templates.handlebars", "less!libs/bootstrap/bootstrap", "less!./styles"], function(baseviews, courseviews, authviews, templates, bootstrap, styles) {
    var AppView, TopTabsView;
    AppView = (function() {
      __extends(AppView, baseviews.BaseView);
      function AppView() {
        this.render = __bind(this.render, this);
        this.listenForWindowBlur = __bind(this.listenForWindowBlur, this);
        this.loginChanged = __bind(this.loginChanged, this);
        AppView.__super__.constructor.apply(this, arguments);
      }
      AppView.prototype.initialize = function() {
        $("body").append(this.$el);
        this.model.get("user").bind("change:loggedIn", this.loginChanged);
        this.loginChanged();
        return this.listenForWindowBlur();
      };
      AppView.prototype.loginChanged = function() {
        var is_editor, is_logged_in;
        is_logged_in = this.model.get("user").get("loggedIn");
        this.$el.toggleClass("logged-in", is_logged_in);
        this.$el.toggleClass("logged-out", !is_logged_in);
        is_editor = is_logged_in && this.model.get("user").get("email") === "admin";
        this.$el.toggleClass("editable", is_editor);
        return this.$el.toggleClass("uneditable", !is_editor);
      };
      AppView.prototype.listenForWindowBlur = function() {
        var timer;
        timer = 0;
        $(window).blur(__bind(function() {
          clearTimeout(timer);
          return timer = setTimeout((__bind(function() {
            return this.model.trigger("windowBlur");
          }, this)), 1000);
        }, this));
        return $(window).focus(__bind(function() {
          return clearTimeout(timer);
        }, this));
      };
      AppView.prototype.render = function() {
        this.$el.html(templates.root(this.context()));
        this.add_subview("courseview", new courseviews.CourseView({
          model: this.model.get("course")
        }), "#content");
        this.add_subview("toptabsview", new TopTabsView({
          collection: this.model.get("tabs")
        }), "#toptabs");
        return this.add_subview("loginview", new authviews.LoginView({
          model: this.model.get("user")
        }), "#authbar");
      };
      return AppView;
    })();
    TopTabsView = (function() {
      __extends(TopTabsView, baseviews.BaseView);
      function TopTabsView() {
        this.navigate = __bind(this.navigate, this);
        this.render = __bind(this.render, this);
        TopTabsView.__super__.constructor.apply(this, arguments);
      }
      TopTabsView.prototype.tagName = "ul";
      TopTabsView.prototype.className = "pills";
      TopTabsView.prototype.initialize = function() {
        return this.collection.bind("all", this.render);
      };
      TopTabsView.prototype.render = function() {
        return this.$el.html(templates.top_tabs(this.context({
          root_url: this.url
        })));
      };
      TopTabsView.prototype.navigate = function(fragment) {
        var slug;
        this.$("li.active").removeClass("active");
        slug = fragment.split("/")[0];
        return this.$("#toptab_" + slug).addClass("active");
      };
      return TopTabsView;
    })();
    return {
      AppView: AppView
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!app/router',["cs!./views", "cs!analytics/utils", "cs!utils/urls"], function(views, analyticsutils, urlutils) {
    var BaseRouter;
    BaseRouter = (function() {
      __extends(BaseRouter, Backbone.Router);
      function BaseRouter(options) {
        this.start = __bind(this.start, this);        this.root_url = options.root_url;
        Handlebars.registerHelper('root_url', __bind(function() {
          return this.root_url;
        }, this));
        this.app = options.app;
        this.app.bind("change:url", __bind(function(app, url, navoptions) {
          return this.navigate(url, _.extend({
            trigger: true
          }, navoptions || {}));
        }, this));
        analyticsutils.ga_initialize();
        BaseRouter.__super__.constructor.apply(this, arguments);
      }
      BaseRouter.prototype.start = function() {
        this.appview = new views.AppView({
          url: this.root_url,
          model: this.app
        });
        this.appview.render();
        return this.route("*splat", "delegate_navigation", __bind(function(splat) {
          var path, query, splitsplat;
          splitsplat = splat.split("?");
          path = splitsplat[0];
          query = urlutils.getUrlParams(splitsplat.slice(1).join("?") || "");
          if (path.length > 0 && path.slice(-1) !== "/") {
            return this.app.set({
              url: splat.replace(/(\?|$)/, "/$1")
            });
          } else {
            analyticsutils.ga_track_pageview();
            return this.appview.navigate(path, query);
          }
        }, this));
      };
      return BaseRouter;
    })();
    return {
      BaseRouter: BaseRouter
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define('cs!app/models',["cs!base/models", "cs!course/models", "cs!auth/models", "cs!./router"], function(basemodels, coursemodels, authmodels, router) {
    var AppModel, TabCollection, TabModel;
    AppModel = (function() {
      __extends(AppModel, basemodels.LazyModel);
      function AppModel() {
        this.navigate = __bind(this.navigate, this);
        AppModel.__super__.constructor.apply(this, arguments);
      }
      AppModel.prototype.relations = function() {
        return {
          course: {
            model: coursemodels.CourseModel,
            includeInJSON: false
          },
          tabs: {
            collection: TabCollection,
            includeInJSON: true
          },
          user: {
            model: authmodels.UserModel
          }
        };
      };
      AppModel.prototype.initialize = function(options) {
        if (options == null) {
          options = {};
        }
        return this.router = new router.BaseRouter({
          root_url: this.get("root_url"),
          app: this
        });
      };
      AppModel.prototype.navigate = function(url, options) {
        var link, pathname, root;
        if (!url) {
          return;
        }
        if (url instanceof Function) {
          url = url();
        }
        link = $("<a href='" + url + "'>")[0];
        pathname = link.pathname.replace(/^\/+/, "");
        if (pathname.slice(-1) !== "/") {
          pathname += "/";
        }
        url = "/" + pathname + link.search;
        root = this.get("root_url");
        if (url.slice(0, root.length) === root) {
          url = url.slice(root.length);
        }
        this.set({
          url: url
        }, {
          silent: true
        });
        return this.trigger("change:url", this, url, options);
      };
      AppModel.prototype.start = function() {
        this.router.start();
        return Backbone.history.start({
          pushState: true,
          root: this.get("root_url")
        });
      };
      return AppModel;
    })();
    TabModel = (function() {
      __extends(TabModel, basemodels.LazyModel);
      function TabModel() {
        TabModel.__super__.constructor.apply(this, arguments);
      }
      TabModel.prototype.initialize = function() {
        var _base;
        if ((typeof (_base = this.get("slug")).slice === "function" ? _base.slice(-1) : void 0) === "/") {
          return this.set({
            slug: this.get("slug").slice(0, -1)
          });
        }
      };
      return TabModel;
    })();
    TabCollection = (function() {
      __extends(TabCollection, basemodels.LazyCollection);
      function TabCollection() {
        this.comparator = __bind(this.comparator, this);
        TabCollection.__super__.constructor.apply(this, arguments);
      }
      TabCollection.prototype.model = TabModel;
      TabCollection.prototype.comparator = function() {
        return this.get("priority");
      };
      return TabCollection;
    })();
    return {
      AppModel: AppModel
    };
  });
}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define('cs!app/app',["cs!utils/handlebars", "cs!./models", "cs!course/models"], function(handlebars, models, coursemodels) {
    $.ajaxSetup({
      cache: false
    });
    console.log("starting app");
    window.app = new models.AppModel({
      root_url: (window.root_url != null) || ("/" + window.location.pathname.split("/")[1] + "/")
    });
    app.set({
      course: new coursemodels.CourseModel({
        _id: course_id
      })
    });
    app.get("tabs").add({
      title: "Home",
      slug: "",
      priority: 0
    });
    app.get("tabs").add({
      title: "Study",
      slug: "study",
      priority: 1
    });
    app.get("tabs").add({
      title: "Nuggets",
      slug: "nuggets",
      priority: 2
    });
    app.get("tabs").add({
      title: "Chat",
      slug: "chat",
      priority: 3
    });
    app.get("tabs").add({
      title: "Analytics",
      slug: "analytics",
      priority: 4,
      classes: "editor-only"
    });
    app.get("course").fetch().success(__bind(function() {
      return console.log("fetched!");
    }, this));
    return app;
  });
}).call(this);

define('app',["cs!app/app"], function(app) {
	return app;
});
config = {
    paths: {
        cs: 'libs/requirejs/cs',
        domReady: 'libs/requirejs/domReady',
        hb: 'libs/requirejs/hb',
        less: 'libs/requirejs/less',
        order: 'libs/requirejs/order',
        text: 'libs/requirejs/text',
        backbone: 'libs/backbone/backbone',
        underscore: 'libs/underscore'
    },
    waitSeconds: 5,
    baseUrl: "."
}

// from http://code.google.com/p/fbug/source/browse/branches/firebug1.5/lite/firebugx.js (to prevent cases, e.g. FF, with no console)
if (!window.console) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}

if (environ==="DEPLOY") {
	config.baseUrl = "/require/build"
} else {
	config.baseUrl = "/require/src"
}

if (window.less) less.env = "production"

require.config(config)

function clog() {
    if (window.document) console.log.apply(console, arguments)
}

// require all the non-AMD libraries, in order, to be bundled with the AMD modules
define('bootloader',[
        // "order!libs/fancybox/jquery.fancybox-1.3.4",
		"order!libs/jquery/jquery-ui",
		"order!libs/jquery/jquery.jeditable",
		"order!libs/jquery/jquery.watermark",
		"order!libs/json2",
		"order!libs/backbone/backbone",
		"order!libs/backbone/backbone-relational",
		"order!libs/backbone/backbone.memento",
		"order!libs/backbone/backbone.modelbinding",
		"order!libs/handlebars/wrapper",
		//"order!libs/bootstrap/bootstrap-button",
        // "order!libs/bootstrap/bootstrap-tab",
		//"order!libs/ckeditor/ckeditor",
		"order!libs/ckeditor/adapters/jquery",
		"app"
	], function() {
		require("app").start()
        // window.c = new (require("cs!course/models").CourseModel);
        // c.get("page").get("contents").add({test: 55});
        // c.get("page").get("contents").at(0).save()
	}
)
;