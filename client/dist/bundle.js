!function(n){var t={};function e(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}e.m=n,e.c=t,e.d=function(n,t,r){e.o(n,t)||Object.defineProperty(n,t,{enumerable:!0,get:r})},e.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},e.t=function(n,t){if(1&t&&(n=e(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var o in n)e.d(r,o,function(t){return n[t]}.bind(null,o));return r},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},e.p="",e(e.s=5)}([function(n,t){n.exports=function(n){var t="undefined"!=typeof window&&window.location;if(!t)throw new Error("fixUrls requires window.location");if(!n||"string"!=typeof n)return n;var e=t.protocol+"//"+t.host,r=e+t.pathname.replace(/\/[^\/]*$/,"/");return n.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(n,t){var o,i=t.trim().replace(/^"(.*)"$/,function(n,t){return t}).replace(/^'(.*)'$/,function(n,t){return t});return/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(i)?n:(o=0===i.indexOf("//")?i:0===i.indexOf("/")?e+i:r+i.replace(/^\.\//,""),"url("+JSON.stringify(o)+")")})}},function(n,t,e){var r,o,i={},a=(r=function(){return window&&document&&document.all&&!window.atob},function(){return void 0===o&&(o=r.apply(this,arguments)),o}),s=function(n){var t={};return function(n){if("function"==typeof n)return n();if(void 0===t[n]){var e=function(n){return document.querySelector(n)}.call(this,n);if(window.HTMLIFrameElement&&e instanceof window.HTMLIFrameElement)try{e=e.contentDocument.head}catch(n){e=null}t[n]=e}return t[n]}}(),l=null,u=0,c=[],d=e(0);function f(n,t){for(var e=0;e<n.length;e++){var r=n[e],o=i[r.id];if(o){o.refs++;for(var a=0;a<o.parts.length;a++)o.parts[a](r.parts[a]);for(;a<r.parts.length;a++)o.parts.push(v(r.parts[a],t))}else{var s=[];for(a=0;a<r.parts.length;a++)s.push(v(r.parts[a],t));i[r.id]={id:r.id,refs:1,parts:s}}}}function p(n,t){for(var e=[],r={},o=0;o<n.length;o++){var i=n[o],a=t.base?i[0]+t.base:i[0],s={css:i[1],media:i[2],sourceMap:i[3]};r[a]?r[a].parts.push(s):e.push(r[a]={id:a,parts:[s]})}return e}function h(n,t){var e=s(n.insertInto);if(!e)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var r=c[c.length-1];if("top"===n.insertAt)r?r.nextSibling?e.insertBefore(t,r.nextSibling):e.appendChild(t):e.insertBefore(t,e.firstChild),c.push(t);else if("bottom"===n.insertAt)e.appendChild(t);else{if("object"!=typeof n.insertAt||!n.insertAt.before)throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");var o=s(n.insertInto+" "+n.insertAt.before);e.insertBefore(t,o)}}function m(n){if(null===n.parentNode)return!1;n.parentNode.removeChild(n);var t=c.indexOf(n);t>=0&&c.splice(t,1)}function g(n){var t=document.createElement("style");return void 0===n.attrs.type&&(n.attrs.type="text/css"),b(t,n.attrs),h(n,t),t}function b(n,t){Object.keys(t).forEach(function(e){n.setAttribute(e,t[e])})}function v(n,t){var e,r,o,i;if(t.transform&&n.css){if(!(i=t.transform(n.css)))return function(){};n.css=i}if(t.singleton){var a=u++;e=l||(l=g(t)),r=x.bind(null,e,a,!1),o=x.bind(null,e,a,!0)}else n.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(e=function(n){var t=document.createElement("link");return void 0===n.attrs.type&&(n.attrs.type="text/css"),n.attrs.rel="stylesheet",b(t,n.attrs),h(n,t),t}(t),r=function(n,t,e){var r=e.css,o=e.sourceMap,i=void 0===t.convertToAbsoluteUrls&&o;(t.convertToAbsoluteUrls||i)&&(r=d(r));o&&(r+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var a=new Blob([r],{type:"text/css"}),s=n.href;n.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}.bind(null,e,t),o=function(){m(e),e.href&&URL.revokeObjectURL(e.href)}):(e=g(t),r=function(n,t){var e=t.css,r=t.media;r&&n.setAttribute("media",r);if(n.styleSheet)n.styleSheet.cssText=e;else{for(;n.firstChild;)n.removeChild(n.firstChild);n.appendChild(document.createTextNode(e))}}.bind(null,e),o=function(){m(e)});return r(n),function(t){if(t){if(t.css===n.css&&t.media===n.media&&t.sourceMap===n.sourceMap)return;r(n=t)}else o()}}n.exports=function(n,t){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");(t=t||{}).attrs="object"==typeof t.attrs?t.attrs:{},t.singleton||"boolean"==typeof t.singleton||(t.singleton=a()),t.insertInto||(t.insertInto="head"),t.insertAt||(t.insertAt="bottom");var e=p(n,t);return f(e,t),function(n){for(var r=[],o=0;o<e.length;o++){var a=e[o];(s=i[a.id]).refs--,r.push(s)}n&&f(p(n,t),t);for(o=0;o<r.length;o++){var s;if(0===(s=r[o]).refs){for(var l=0;l<s.parts.length;l++)s.parts[l]();delete i[s.id]}}}};var y,w=(y=[],function(n,t){return y[n]=t,y.filter(Boolean).join("\n")});function x(n,t,e,r){var o=e?"":r.css;if(n.styleSheet)n.styleSheet.cssText=w(t,o);else{var i=document.createTextNode(o),a=n.childNodes;a[t]&&n.removeChild(a[t]),a.length?n.insertBefore(i,a[t]):n.appendChild(i)}}},function(n,t){n.exports=function(n){var t=[];return t.toString=function(){return this.map(function(t){var e=function(n,t){var e=n[1]||"",r=n[3];if(!r)return e;if(t&&"function"==typeof btoa){var o=(a=r,"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(a))))+" */"),i=r.sources.map(function(n){return"/*# sourceURL="+r.sourceRoot+n+" */"});return[e].concat(i).concat([o]).join("\n")}var a;return[e].join("\n")}(t,n);return t[2]?"@media "+t[2]+"{"+e+"}":e}).join("")},t.i=function(n,e){"string"==typeof n&&(n=[[null,n,""]]);for(var r={},o=0;o<this.length;o++){var i=this[o][0];"number"==typeof i&&(r[i]=!0)}for(o=0;o<n.length;o++){var a=n[o];"number"==typeof a[0]&&r[a[0]]||(e&&!a[2]?a[2]=e:e&&(a[2]="("+a[2]+") and ("+e+")"),t.push(a))}},t}},function(n,t,e){(n.exports=e(2)(!1)).push([n.i,"html,\nbody {\n  height: 100%;\n  width: 100%; }\n\nbody {\n  padding: 0;\n  margin: 0;\n  background: #fff;\n  font-family: Verdana, sans; }\n\n#main {\n  height: 100%;\n  width: 70%; }\n\n#sidebar {\n  height: 100%;\n  width: 30%;\n  position: absolute;\n  top: 0;\n  right: 0;\n  overflow-y: scroll;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden; }\n\n#bottomright {\n  width: 100%;\n  height: 25em;\n  margin-top: auto; }\n\n.route-icon {\n  margin-left: -0.85em;\n  margin-top: -0.85em;\n  width: 1.7em;\n  height: 1.7em;\n  line-height: 1.7em;\n  font-weight: bold; }\n\n.icon {\n  width: 1.5em;\n  height: 1.5em;\n  display: inline-block;\n  line-height: 1.5em;\n  margin-top: -0.35em;\n  margin-bottom: -0.15em;\n  font-size: 90%;\n  font-weight: normal;\n  color: #fff !important;\n  text-decoration: none;\n  cursor: default; }\n\na.icon:hover {\n  text-decoration: none;\n  font-weight: bold;\n  cursor: pointer; }\n\n.route-icon,\n.icon {\n  color: #fff;\n  border-radius: 50%;\n  border: 0.1em solid white;\n  text-align: center;\n  vertical-align: middle;\n  text-shadow: -0.05em 0.05em 0 rgba(0, 0, 0, 0.2), 0.05em 0.05em 0 rgba(0, 0, 0, 0.2), 0.05em -0.05em 0 rgba(0, 0, 0, 0.2), -0.05em -0.05em 0 rgba(0, 0, 0, 0.2); }\n\n/* icon1 to 14 colors are set through JS reading routes.js. TODO: set through build step; */\n.icon0,\n.route-icon0 {\n  background: #bbb; }\n\n.cols {\n  display: flex; }\n\n.cols ol {\n  list-style-position: inside;\n  padding: 0 1em; }\n\n.leaflet-overlay-pane {\n  z-index: 656 !important;\n  /* above the ones for the routes and the route markers */ }\n\n#map,\n.mapillary {\n  width: 100%;\n  height: 100%; }\n\n#toggle,\n#quality {\n  background: #ddd;\n  border-top-right-radius: 0.1em;\n  vertical-align: middle;\n  line-height: 2em;\n  height: 2em;\n  padding: 0.1em 0.4em;\n  display: block;\n  margin-top: -2.2em;\n  width: 5em;\n  text-align: center; }\n\n#quality {\n  float: right; }\n\na {\n  color: #0366d6;\n  text-decoration: none;\n  cursor: pointer; }\n\na:hover {\n  text-decoration: underline; }\n\n#sidebar > div:not(#bottomright) {\n  padding: 0 1em; }\n\ntable.routing {\n  border-collapse: collapse;\n  border-spacing: 0;\n  table-layout: fixed;\n  width: 100%; }\n  table.routing a {\n    color: #000; }\n  table.routing tr,\n  table.routing td,\n  table.routing th {\n    padding: 0; }\n  table.routing td {\n    height: 1.2em;\n    white-space: nowrap; }\n  table.routing td:first-child {\n    text-align: right;\n    width: calc(50% - 3em / 2); }\n  table.routing td:last-child {\n    width: calc(50% - 3em / 2); }\n  table.routing td.i {\n    background-size: 1.2em 100%, 1.2em 100%;\n    background-repeat: no-repeat, no-repeat;\n    background-position: 1em;\n    width: 3em;\n    text-align: center; }\n    table.routing td.i .icon {\n      margin-left: 0.15em;\n      font-size: 120%; }\n  table.routing td.dual {\n    background-position: 0.4em 0, 1.59em 0;\n    /* work around rounding errors */ }\n  table.routing td.right {\n    background-position: -10em, 1.59em; }\n  table.routing td.left {\n    background-position: 1.6em, 10em; }\n  table.routing td.dir {\n    opacity: 0.3; }\n\n.desc {\n  display: none; }\n",""])},function(n,t,e){var r=e(3);"string"==typeof r&&(r=[[n.i,r,""]]);var o={hmr:!0,transform:void 0,insertInto:void 0};e(1)(r,o);r.locals&&(n.exports=r.locals)},function(n,t,e){"use strict";e.r(t);e(4);console.log("a test")}]);